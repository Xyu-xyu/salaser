import { makeAutoObservable, runInAction } from "mobx";
import SVGPathCommander from 'svg-path-commander';
import { toJS } from "mobx";
import utils from "../scripts/util";
import arc from "../scripts/arc";
import { showToast } from "../components/toast.jsx";
import constants from "./constants";
import jobStore from "./jobStore";
import {
	SHEET_CUT_DEFAULT_SECTOR_SIZE,
	SHEET_CUT_ORDER_MODES,
	SHEET_SAFETY_DEFAULT_CLEARANCE,
	clampSheetCutSectorSize,
	getSheetSafetyEvaluation,
	getMaxSheetCutSectorSize,
	normalizeSheetSafetyClearance,
} from "../scripts/sheetCutUtils.jsx";
import {
	RESIDUAL_CUT_DEFAULT_STEP,
	RESIDUAL_CUT_PART_CODE,
	RESIDUAL_CUT_SOURCE_NCP,
	RESIDUAL_CUT_SOURCE_NONE,
	RESIDUAL_CUT_SOURCE_USER,
	buildResidualCutAreasFromLegacyPart,
	buildResidualCutGeometry,
	buildResidualCutPartLines,
	buildResidualCutPlanPlacement,
	clampResidualCutStep,
	createEmptyResidualCutState,
	normalizeResidualCutArea,
	normalizeResidualCutPoint,
	normalizeResidualCutSource,
} from "../scripts/residualCutUtils.jsx";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const roundResidualCoordinate = (value) => (
	Math.round((Number(value) || 0) * 1000) / 1000
);
const normalizeResidualSimulationPoint = (point) => {
	const x = Number(point?.x);
	const y = Number(point?.y);

	if (!Number.isFinite(x) || !Number.isFinite(y)) {
		return null;
	}

	return {
		x: roundResidualCoordinate(x),
		y: roundResidualCoordinate(y),
	};
};
const sameIdOrder = (left = [], right = []) =>
	left.length === right.length && left.every((item, index) => item === right[index]);

const sortNumericIds = (values = []) => (
	[...new Set(values.map(value => Number(value)).filter(Number.isFinite))]
		.sort((left, right) => left - right)
);

const normalizeSheetSafetyPairs = (pairs = []) => {
	const pairKeySet = new Set();
	const normalizedPairs = [];

	(Array.isArray(pairs) ? pairs : []).forEach(pair => {
		if (!Array.isArray(pair) || pair.length < 2) return;

		const leftPartId = Number(pair[0]);
		const rightPartId = Number(pair[1]);
		if (!Number.isFinite(leftPartId) || !Number.isFinite(rightPartId)) return;
		if (leftPartId === rightPartId) return;

		const normalizedPair = [
			Math.min(leftPartId, rightPartId),
			Math.max(leftPartId, rightPartId),
		];
		const pairKey = normalizedPair.join(":");
		if (pairKeySet.has(pairKey)) return;

		pairKeySet.add(pairKey);
		normalizedPairs.push(normalizedPair);
	});

	return normalizedPairs.sort((left, right) => (
		left[0] !== right[0]
			? left[0] - right[0]
			: left[1] - right[1]
	));
};

const buildSheetSafetyReasonsById = (edgePartIds = [], collisionPairs = []) => {
	const reasonsById = {};

	sortNumericIds(edgePartIds).forEach(partId => {
		reasonsById[partId] = {
			edge: true,
			collisionIds: [],
		};
	});

	normalizeSheetSafetyPairs(collisionPairs).forEach(([leftPartId, rightPartId]) => {
		if (!reasonsById[leftPartId]) {
			reasonsById[leftPartId] = {
				edge: false,
				collisionIds: [],
			};
		}
		if (!reasonsById[rightPartId]) {
			reasonsById[rightPartId] = {
				edge: false,
				collisionIds: [],
			};
		}

		reasonsById[leftPartId].collisionIds.push(rightPartId);
		reasonsById[rightPartId].collisionIds.push(leftPartId);
	});

	Object.values(reasonsById).forEach(reason => {
		reason.collisionIds = sortNumericIds(reason.collisionIds);
	});

	return reasonsById;
};

const buildSheetSafetyState = (state = {}) => {
	const edgePartIds = sortNumericIds(state.edgePartIds || []);
	const collisionPairs = normalizeSheetSafetyPairs(state.collisionPairs || []);

	return {
		dangerPartIds: sortNumericIds([
			...edgePartIds,
			...collisionPairs.flat(),
		]),
		edgePartIds,
		collisionPairs,
		reasonsById: buildSheetSafetyReasonsById(edgePartIds, collisionPairs),
		candidatePairsCount: Math.max(0, Number(state.candidatePairsCount) || 0),
		candidateCellSize: Math.max(0, Number(state.candidateCellSize) || 0),
	};
};

const createEmptySheetSafetyState = () => buildSheetSafetyState();

const mergeSheetSafetyState = (currentState = {}, evaluation = {}) => {
	const scopedPartIds = sortNumericIds(evaluation?.partIds || []);
	const nextState = buildSheetSafetyState(evaluation);

	if (!scopedPartIds.length) {
		return nextState;
	}

	const scopedIdSet = new Set(scopedPartIds);
	const keptEdgePartIds = (Array.isArray(currentState?.edgePartIds) ? currentState.edgePartIds : [])
		.filter(partId => !scopedIdSet.has(partId));
	const keptCollisionPairs = (Array.isArray(currentState?.collisionPairs) ? currentState.collisionPairs : [])
		.filter(([leftPartId, rightPartId]) => (
			!scopedIdSet.has(leftPartId) &&
			!scopedIdSet.has(rightPartId)
		));

	return buildSheetSafetyState({
		edgePartIds: [...keptEdgePartIds, ...nextState.edgePartIds],
		collisionPairs: [...keptCollisionPairs, ...nextState.collisionPairs],
		candidatePairsCount: nextState.candidatePairsCount,
		candidateCellSize: nextState.candidateCellSize,
	});
};

export const LASER_SHOW_PART_COMPLETED = 1;
export const LASER_SHOW_PART_ACTIVE = 1 << 1;
export const LASER_SHOW_PART_HOVERED = 1 << 2;

export const getLaserShowCompletedCount = (laserShow, totalParts = 0) => {
	const safeTotalParts = Math.max(0, Number(totalParts) || 0);
	const explicitCompletedCount = Number(laserShow?.completedCount);

	if (Number.isFinite(explicitCompletedCount)) {
		return Math.max(
			0,
			Math.min(Math.trunc(explicitCompletedCount), safeTotalParts)
		);
	}

	const rawCurrentOrder = Math.max(0, Number(laserShow?.currentOrder) || 0);
	const activePartId = laserShow?.activePartId ?? null;

	if (!safeTotalParts) {
		return 0;
	}

	return activePartId === null && rawCurrentOrder > safeTotalParts
		? safeTotalParts
		: Math.max(Math.min(rawCurrentOrder - 1, safeTotalParts), 0);
};


class SvgStore {
	tooltips = false;
	Show_dangers = true;
	laserShowPlayback = {
		on: false,
		paused: false,
		speed: 50,
	};
	laserShowTimeline = {
		progress: 0,
		seek: 0,
		currentOrder: 0,
	};
	laserShowVisual = {
		activePartId: null,
		hoverPartId: null,
		completedCount: 0,
	};
	residualCutDraft = {
		points: [],
		cursorPoint: null,
	};
	residualCutSimulation = {
		on: false,
		sequence: [],
		segmentIndex: 0,
		segmentProgress: 0,
	};
	residualCutSelection = {
		areaIndexes: [],
	};
	laserShowPartFlags = new Map();
	laserShowOrderIndexById = new Map();
	laserShowOrderDirty = true;
	highLighted = false;
	sheetSafetySettings = {
		clearance: normalizeSheetSafetyClearance(
			constants.defaultIntend ?? SHEET_SAFETY_DEFAULT_CLEARANCE
		),
		allowPartInPart: true,
	};
	sheetSafetyState = createEmptySheetSafetyState();
	selectionRect = null;

	svgData = {
		"file":"",
		"name": "undefined.ncp",
		"thickness":1,
		"jobcode":"",
		"width": 500,
		"height": 500,
		"quantity": 1,
		"presetId": 55,
		"presetName": "any_preset",
		"positions": [
			/*{
				"part_id": 1,
				"part_code_id": 1,
				"positions": {
					"a": -1,
					"b": -1.2246467991473532e-16,
					"c": 1.2246467991473532e-16,
					"d": -1,
					"e": 112.99999999999999,
					"f": 120.65419999999995
				},
				"cx": 113,
				"cy": 65.65419999999995,
				"selected": false
			}*/
		],
		"part_code": [
			/*{
				"id": 1,
				"uuid": 1,
				"name": "31715200",
				"height": 55,
				"width": 113
				"code": [
					{
						"cid": 0,
						"class": "contour outer  macro0 ",
						"path": "M8 27.5 L8 51 A4 4 0 0 0 12 55 L109 55 A4 4 0 0 0 113 51 L113 4 A4 4 0 0 0 109 0 L12 0 A4 4 0 0 0 8 4 L8 27.5",
						"stroke": "red",
						"strokeWidth": 0.2,
						"selected": false,
						"joints":[- значения длины от начала пути -]
					},
					{
						"cid": 0,
						"class": " inlet inner  macro0 ",
						"path": "M0 27.5 L5.333333 25.614382 A2 2 0 0 1 8 27.5",
						"stroke": "red",
						"strokeWidth": 0.2,
						"selected": false
						"joints":[] - тут будет пусто
					},
					{
						"cid": 0,
						"class": " outlet inner macro0   groupEnd ",
						"path": "",
						"stroke": "red",
						"strokeWidth": 0.2,
						"selected": false
						"joints":[] - тут будет пусто иоб нет смысла 
					}
				],
				// такое будем делать уже только в Джойнтсторе
				"joints": 
				[
					{
						"cid": 1,
						"atEnd": true/false
						"quantity": number,
						"distance": number,
						"manual":[]					
					},
					{
						"cid": 2,
						"atEnd": true/false
						"quantity": number,
						"distance": number,
						"manual":[]					
					}
					
				]
			} */      
		],
		"cutOrder": {
			"mode": "current",
			"sectorSize": SHEET_CUT_DEFAULT_SECTOR_SIZE,
			"orders": {
				"current": [],
				"auto": [],
				"manual": [],
			},
		},
		"residualCut": createEmptyResidualCutState(RESIDUAL_CUT_DEFAULT_STEP),
	}

	matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	groupMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
	offset = { x: 0, y: 0 }
	gridState = {
		xsGrid: {
			visibility: "visible",
			fill: "var(--gridColorFill)",
		},
		smallGrid: {
			visibility: "visible",
			fill: "none",
		},
		grid: {
			visibility: "visible",
			fill: "none",
		},
	};


	constructor() {
		makeAutoObservable(this, {
			laserShowOrderIndexById: false,
			laserShowOrderDirty: false,
		});
	}

	get selectedPosition() {
		//console.log (this.svgData.positions.find(pos => pos.selected))
		return this.svgData.positions.find(pos => pos.selected) || false;
	}

	get nextPosId() {
		const positions = this.svgData.positions;
		if (!positions || positions.length === 0) {
			return 1;
		}

		// Находим максимальный part_id
		const maxId = Math.max(...positions.map(p => p.part_id || 0));
		return maxId + 1;
	}

	setMatrix(val) {
		Object.assign(this.matrix, val)
	}

	setGroupMatrix(val) {
		Object.assign(this.groupMatrix, val)
	}

	setOffset(val) {
		Object.assign(this.offset, val)
	}

	setGridState(val) {
		Object.assign(this.gridState, val);
	}
	setTooltips(val) {
		this.tooltips = val
	}

	setLaserShow(val) {
		if (!val || typeof val !== "object") {
			return;
		}

		if ("on" in val) {
			this.laserShowPlayback.on = Boolean(val.on);
		}
		if ("paused" in val) {
			this.laserShowPlayback.paused = Boolean(val.paused);
		}
		if ("speed" in val) {
			this.laserShowPlayback.speed = Number(val.speed) || 50;
		}
		if ("progress" in val) {
			this.laserShowTimeline.progress = Number(val.progress) || 0;
		}
		if ("seek" in val) {
			this.laserShowTimeline.seek = Number(val.seek) || 0;
		}
		if ("currentOrder" in val) {
			this.laserShowTimeline.currentOrder = Number(val.currentOrder) || 0;
		}
		if ("activePartId" in val) {
			this.laserShowVisual.activePartId = val.activePartId ?? null;
		}
		if ("hoverPartId" in val) {
			this.laserShowVisual.hoverPartId = val.hoverPartId ?? null;
		}
		if ("completedCount" in val) {
			this.laserShowVisual.completedCount = Math.max(
				0,
				Number(val.completedCount) || 0
			);
		}
	}

	markLaserShowOrderDirty() {
		this.laserShowOrderDirty = true;
	}

	ensureLaserShowOrderIndex() {
		if (!this.laserShowOrderDirty) {
			return this.laserShowOrderIndexById;
		}

		this.laserShowOrderIndexById = new Map(
			(Array.isArray(this.svgData?.positions) ? this.svgData.positions : [])
				.map((pos, index) => [pos?.part_id, index])
		);
		this.laserShowOrderDirty = false;
		return this.laserShowOrderIndexById;
	}

	getLaserShowPartFlags(partId) {
		if (partId === null || partId === undefined) {
			return 0;
		}

		const orderIndex = this.ensureLaserShowOrderIndex().get(partId);
		if (orderIndex === undefined) {
			return 0;
		}

		const totalParts = Array.isArray(this.svgData?.positions)
			? this.svgData.positions.length
			: 0;
		const completedCount = getLaserShowCompletedCount(this.laserShowVisual, totalParts);
		let flags = 0;

		if (orderIndex < completedCount) {
			flags |= LASER_SHOW_PART_COMPLETED;
		}
		if (this.laserShowVisual.activePartId === partId) {
			flags |= LASER_SHOW_PART_ACTIVE;
		}
		if (this.laserShowVisual.hoverPartId === partId) {
			flags |= LASER_SHOW_PART_HOVERED;
		}

		return flags;
	}

	setLaserShowPartFlag(partId, flag, enabled) {
		if (partId === null || partId === undefined) return;

		const currentFlags = this.getLaserShowPartFlags(partId);
		const nextFlags = enabled
			? currentFlags | flag
			: currentFlags & ~flag;

		if (nextFlags) {
			this.laserShowPartFlags.set(partId, nextFlags);
			return;
		}

		this.laserShowPartFlags.delete(partId);
	}

	syncLaserShowPartFlags(
		previousState = {},
		nextState = { ...this.laserShowTimeline, ...this.laserShowVisual }
	) {
		const positions = Array.isArray(this.svgData?.positions) ? this.svgData.positions : [];
		const totalParts = positions.length;

		if (this.laserShowOrderDirty) {
			this.laserShowPartFlags.clear();
		}

		this.ensureLaserShowOrderIndex();

		const previousCompletedCount = getLaserShowCompletedCount(previousState, totalParts);
		const nextCompletedCount = getLaserShowCompletedCount(nextState, totalParts);

		if (nextCompletedCount > previousCompletedCount) {
			for (let index = previousCompletedCount; index < nextCompletedCount; index += 1) {
				const partId = positions[index]?.part_id;
				this.setLaserShowPartFlag(partId, LASER_SHOW_PART_COMPLETED, true);
			}
		} else if (nextCompletedCount < previousCompletedCount) {
			for (let index = nextCompletedCount; index < previousCompletedCount; index += 1) {
				const partId = positions[index]?.part_id;
				this.setLaserShowPartFlag(partId, LASER_SHOW_PART_COMPLETED, false);
			}
		}

		if (previousState.activePartId !== nextState.activePartId) {
			this.setLaserShowPartFlag(
				previousState.activePartId,
				LASER_SHOW_PART_ACTIVE,
				false
			);
			this.setLaserShowPartFlag(
				nextState.activePartId,
				LASER_SHOW_PART_ACTIVE,
				true
			);
		}

		if (previousState.hoverPartId !== nextState.hoverPartId) {
			this.setLaserShowPartFlag(
				previousState.hoverPartId,
				LASER_SHOW_PART_HOVERED,
				false
			);
			this.setLaserShowPartFlag(
				nextState.hoverPartId,
				LASER_SHOW_PART_HOVERED,
				true
			);
		}
	}

	getSheetSafetyClearance() {
		return normalizeSheetSafetyClearance(this.sheetSafetySettings.clearance);
	}

	isSheetPartInPartEnabled() {
		return this.sheetSafetySettings.allowPartInPart !== false;
	}

	getSheetSafetyDangerCount() {
		return Array.isArray(this.sheetSafetyState.dangerPartIds)
			? this.sheetSafetyState.dangerPartIds.length
			: 0;
	}

	getSheetSafetyCollisionCount() {
		return Array.isArray(this.sheetSafetyState.collisionPairs)
			? this.sheetSafetyState.collisionPairs.length
			: 0;
	}

	isSheetDangerPart(partId) {
		return Array.isArray(this.sheetSafetyState.dangerPartIds) &&
			this.sheetSafetyState.dangerPartIds.includes(partId);
	}

	resetSheetSafetyState() {
		runInAction(() => {
			this.sheetSafetyState = createEmptySheetSafetyState();
		});
	}

	getShowDangersDefaultValue(totalParts = Array.isArray(this.svgData?.positions)
		? this.svgData.positions.length
		: 0) {
		return totalParts <= 500;
	}

	isShowDangersEnabled() {
		return this.Show_dangers !== false;
	}

	initializeShowDangersByPositionsCount() {
		const nextValue = this.getShowDangersDefaultValue();
		if (this.Show_dangers !== nextValue) {
			runInAction(() => {
				this.Show_dangers = nextValue;
			});
		}

		return this.Show_dangers;
	}

	setShowDangers(enabled) {
		const nextValue = Boolean(enabled);
		if (this.Show_dangers !== nextValue) {
			runInAction(() => {
				this.Show_dangers = nextValue;
			});
		}

		this.recalculateSheetSafety();
		return this.Show_dangers;
	}

	setSheetSafetyClearance(clearance) {
		const nextClearance = normalizeSheetSafetyClearance(clearance);
		if (this.sheetSafetySettings.clearance !== nextClearance) {
			runInAction(() => {
				this.sheetSafetySettings.clearance = nextClearance;
			});
			this.recalculateSheetSafety();
		}

		return this.sheetSafetySettings.clearance;
	}

	setSheetPartInPart(enabled) {
		const nextEnabled = Boolean(enabled);
		if (this.sheetSafetySettings.allowPartInPart !== nextEnabled) {
			runInAction(() => {
				this.sheetSafetySettings.allowPartInPart = nextEnabled;
			});
			this.recalculateSheetSafety();
		}

		return this.sheetSafetySettings.allowPartInPart;
	}

	recalculateSheetSafety(options = {}) {
		if (!this.isShowDangersEnabled()) {
			const nextState = createEmptySheetSafetyState();
			runInAction(() => {
				this.sheetSafetyState = nextState;
			});

			return nextState;
		}

		const evaluation = getSheetSafetyEvaluation(this.svgData, {
			partIds: Array.isArray(options.partIds) && options.partIds.length
				? options.partIds
				: null,
			clearance: options.clearance ?? this.getSheetSafetyClearance(),
			allowPartInPart: options.allowPartInPart ?? this.isSheetPartInPartEnabled(),
		});
		const nextState = mergeSheetSafetyState(this.sheetSafetyState, evaluation);

		runInAction(() => {
			this.sheetSafetyState = nextState;
		});

		return nextState;
	}

	getPositionIds() {
		return Array.isArray(this.svgData?.positions)
			? this.svgData.positions.map(pos => pos?.part_id)
			: [];
	}

	getSheetCutMode() {
		const mode = this.svgData?.cutOrder?.mode;
		return SHEET_CUT_ORDER_MODES.includes(mode) ? mode : "current";
	}

	getSheetCutSectorMax() {
		return getMaxSheetCutSectorSize(this.svgData);
	}

	getSheetCutSectorSize() {
		return clampSheetCutSectorSize(
			this.svgData,
			this.svgData?.cutOrder?.sectorSize
		);
	}

	normalizeSheetCutOrderIds(orderIds, fallbackIds = this.getPositionIds()) {
		const currentIds = Array.isArray(fallbackIds) ? fallbackIds : this.getPositionIds();
		const validIds = new Set(currentIds);
		const seen = new Set();
		const normalized = Array.isArray(orderIds)
			? orderIds.filter(partId => {
				if (!validIds.has(partId) || seen.has(partId)) return false;
				seen.add(partId);
				return true;
			})
			: [];

		currentIds.forEach(partId => {
			if (!seen.has(partId)) {
				normalized.push(partId);
			}
		});

		return normalized;
	}

	getSheetCutOrderIds(mode = this.getSheetCutMode()) {
		const orders = this.svgData?.cutOrder?.orders;
		return this.normalizeSheetCutOrderIds(orders?.[mode]);
	}

	getPositionsByPartIds(orderIds) {
		const normalizedIds = this.normalizeSheetCutOrderIds(orderIds);
		const positionMap = new Map(
			(Array.isArray(this.svgData?.positions) ? this.svgData.positions : [])
				.map(pos => [pos?.part_id, pos])
		);

		return normalizedIds
			.map(partId => positionMap.get(partId))
			.filter(Boolean);
	}

	ensureSheetCutState() {
		const positionIds = this.getPositionIds();
		const previousState = this.svgData?.cutOrder || {};
		const previousOrders = previousState.orders || {};
		const nextState = {
			mode: this.getSheetCutMode(),
			sectorSize: this.getSheetCutSectorSize(),
			orders: {
				current: this.normalizeSheetCutOrderIds(previousOrders.current, positionIds),
				auto: this.normalizeSheetCutOrderIds(previousOrders.auto, positionIds),
				manual: this.normalizeSheetCutOrderIds(previousOrders.manual, positionIds),
			},
		};
		const hasChanged = (
			previousState.mode !== nextState.mode ||
			previousState.sectorSize !== nextState.sectorSize ||
			!sameIdOrder(previousOrders.current, nextState.orders.current) ||
			!sameIdOrder(previousOrders.auto, nextState.orders.auto) ||
			!sameIdOrder(previousOrders.manual, nextState.orders.manual)
		);

		if (hasChanged) {
			runInAction(() => {
				this.svgData.cutOrder = nextState;
			});
		}

		return nextState;
	}

	setSheetCutMode(mode) {
		if (!SHEET_CUT_ORDER_MODES.includes(mode)) {
			return this.getSheetCutMode();
		}

		this.ensureSheetCutState();

		if (this.svgData.cutOrder.mode !== mode) {
			runInAction(() => {
				this.svgData.cutOrder.mode = mode;
			});
		}

		return this.svgData.cutOrder.mode;
	}

	setSheetCutSectorSize(sectorSize) {
		this.ensureSheetCutState();
		const nextSectorSize = clampSheetCutSectorSize(this.svgData, sectorSize);

		if (this.svgData.cutOrder.sectorSize !== nextSectorSize) {
			runInAction(() => {
				this.svgData.cutOrder.sectorSize = nextSectorSize;
			});
		}

		return this.svgData.cutOrder.sectorSize;
	}

	setSheetCutOrderIds(mode, orderIds) {
		if (!SHEET_CUT_ORDER_MODES.includes(mode)) {
			return [];
		}

		this.ensureSheetCutState();
		const nextIds = this.normalizeSheetCutOrderIds(orderIds);

		if (!sameIdOrder(this.svgData.cutOrder.orders[mode], nextIds)) {
			runInAction(() => {
				this.svgData.cutOrder.orders[mode] = nextIds;
			});
		}

		return nextIds;
	}

	ensureResidualCutState() {
		const previousState = this.svgData?.residualCut || {};
		const normalizedAreas = (Array.isArray(previousState.areas) ? previousState.areas : [])
			.map(area => normalizeResidualCutArea(
				area,
				this.svgData?.width,
				this.svgData?.height
			))
			.filter(Boolean);
		const nextState = {
			step: clampResidualCutStep(previousState.step),
			areas: normalizedAreas,
			source: normalizeResidualCutSource(previousState.source, normalizedAreas.length > 0),
		};
		const previousAreas = Array.isArray(previousState.areas) ? previousState.areas : [];
		const areasChanged = JSON.stringify(previousAreas) !== JSON.stringify(nextState.areas);
		const hasChanged = (
			previousState.step !== nextState.step ||
			areasChanged ||
			previousState.source !== nextState.source
		);

		if (hasChanged) {
			runInAction(() => {
				this.svgData.residualCut = nextState;
				if (areasChanged) {
					this.residualCutSelection.areaIndexes = [];
				}
			});
		}

		return this.svgData.residualCut || nextState;
	}

	getResidualCutStep() {
		return this.ensureResidualCutState().step;
	}

	getResidualCutAreas() {
		return this.ensureResidualCutState().areas;
	}

	getSelectedResidualCutAreaIndexes() {
		const areaCount = this.getResidualCutAreas().length;
		return sortNumericIds(
			Array.isArray(this.residualCutSelection.areaIndexes)
				? this.residualCutSelection.areaIndexes
				: []
		).filter(index => index >= 0 && index < areaCount);
	}

	clearResidualCutAreaSelection() {
		if (!this.residualCutSelection.areaIndexes.length) {
			return [];
		}

		runInAction(() => {
			this.residualCutSelection.areaIndexes = [];
		});

		return this.residualCutSelection.areaIndexes;
	}

	setResidualCutAreaSelection(indexes = []) {
		const areaCount = this.getResidualCutAreas().length;
		const nextIndexes = sortNumericIds(
			Array.isArray(indexes) ? indexes : [indexes]
		).filter(index => index >= 0 && index < areaCount);
		const currentIndexes = this.getSelectedResidualCutAreaIndexes();

		if (sameIdOrder(currentIndexes, nextIndexes)) {
			return currentIndexes;
		}

		runInAction(() => {
			this.residualCutSelection.areaIndexes = nextIndexes;
		});

		return this.residualCutSelection.areaIndexes;
	}

	toggleResidualCutAreaSelection(index, additive = false) {
		const nextIndex = Math.trunc(Number(index));
		if (!Number.isFinite(nextIndex)) {
			return this.getSelectedResidualCutAreaIndexes();
		}

		const currentIndexes = this.getSelectedResidualCutAreaIndexes();
		const isSelected = currentIndexes.includes(nextIndex);
		if (additive) {
			return this.setResidualCutAreaSelection(
				isSelected
					? currentIndexes.filter(item => item !== nextIndex)
					: [...currentIndexes, nextIndex]
			);
		}

		if (isSelected && currentIndexes.length === 1) {
			return this.clearResidualCutAreaSelection();
		}

		return this.setResidualCutAreaSelection([nextIndex]);
	}

	setResidualCutStep(step) {
		this.ensureResidualCutState();
		const nextStep = clampResidualCutStep(step);

		if (this.svgData.residualCut.step !== nextStep) {
			runInAction(() => {
				this.svgData.residualCut.step = nextStep;
			});
		}

		return this.svgData.residualCut.step;
	}

	setResidualCutAreas(areas = [], source = RESIDUAL_CUT_SOURCE_USER) {
		this.ensureResidualCutState();
		const nextAreas = (Array.isArray(areas) ? areas : [])
			.map(area => normalizeResidualCutArea(
				area,
				this.svgData?.width,
				this.svgData?.height
			))
			.filter(Boolean);
		const nextSource = normalizeResidualCutSource(source, nextAreas.length > 0);

		runInAction(() => {
			this.svgData.residualCut.areas = nextAreas;
			this.svgData.residualCut.source = nextSource;
			this.residualCutSelection.areaIndexes = [];
		});
		this.stopResidualCutSimulation();

		return this.svgData.residualCut.areas;
	}

	deleteSelectedResidualCutAreas() {
		this.ensureResidualCutState();
		const selectedIndexes = new Set(this.getSelectedResidualCutAreaIndexes());

		if (!selectedIndexes.size) {
			return this.svgData.residualCut.areas;
		}

		const nextAreas = this.svgData.residualCut.areas.filter(
			(_, index) => !selectedIndexes.has(index)
		);

		runInAction(() => {
			this.svgData.residualCut.areas = nextAreas;
			this.svgData.residualCut.source = normalizeResidualCutSource(
				RESIDUAL_CUT_SOURCE_USER,
				nextAreas.length > 0
			);
			this.residualCutSelection.areaIndexes = [];
		});
		this.stopResidualCutSimulation();

		return this.svgData.residualCut.areas;
	}

	clearResidualCut() {
		this.ensureResidualCutState();
		runInAction(() => {
			this.svgData.residualCut.areas = [];
			this.svgData.residualCut.source = RESIDUAL_CUT_SOURCE_NONE;
			this.residualCutSelection.areaIndexes = [];
		});
		this.stopResidualCutSimulation();
		this.resetResidualCutDraft();
	}

	setResidualCutDraftPoints(points = []) {
		const nextPoints = (Array.isArray(points) ? points : [])
			.map(point => normalizeResidualCutPoint(
				point,
				this.svgData?.width,
				this.svgData?.height
			))
			.filter(Boolean);

		runInAction(() => {
			this.residualCutDraft.points = nextPoints;
		});

		return this.residualCutDraft.points;
	}

	setResidualCutCursor(point = null) {
		runInAction(() => {
			this.residualCutDraft.cursorPoint = normalizeResidualCutPoint(
				point,
				this.svgData?.width,
				this.svgData?.height
			);
		});

		return this.residualCutDraft.cursorPoint;
	}

	resetResidualCutDraft() {
		runInAction(() => {
			this.residualCutDraft.points = [];
			this.residualCutDraft.cursorPoint = null;
		});
	}

	setResidualCutSimulation(nextState = {}) {
		const sequence = Array.isArray(nextState.sequence)
			? nextState.sequence
				.map(segment => ({
					kind: segment?.kind === "move" ? "move" : "cut",
					start: normalizeResidualSimulationPoint(segment?.start),
					end: normalizeResidualSimulationPoint(segment?.end),
				}))
				.filter(segment => segment.start && segment.end)
			: null;

		runInAction(() => {
			if ("on" in nextState) {
				this.residualCutSimulation.on = Boolean(nextState.on);
			}
			if (sequence !== null) {
				this.residualCutSimulation.sequence = sequence;
			}
			if ("segmentIndex" in nextState) {
				this.residualCutSimulation.segmentIndex = Math.max(
					0,
					Math.trunc(Number(nextState.segmentIndex) || 0)
				);
			}
			if ("segmentProgress" in nextState) {
				this.residualCutSimulation.segmentProgress = clamp(
					Number(nextState.segmentProgress) || 0,
					0,
					1
				);
			}
		});
	}

	stopResidualCutSimulation() {
		this.setResidualCutSimulation({
			on: false,
			sequence: [],
			segmentIndex: 0,
			segmentProgress: 0,
		});
	}

	reorderPositions(newOrder) {
		if (!Array.isArray(newOrder)) return;

		runInAction(() => {
			this.svgData.positions = [...newOrder];
		});
		this.markLaserShowOrderDirty();
		this.recalculateSheetSafety();
	}

	setVal(objectKey, pathOrKey, newValue) {
		const target = this[objectKey];
		if (!target) throw new Error(`Object ${objectKey} not found in store`);

		// если передан просто ключ (string), конвертируем в массив
		const path = Array.isArray(pathOrKey) ? pathOrKey : [pathOrKey];

		let current = target;
		for (let i = 0; i < path.length - 1; i++) {
			if (!(path[i] in current)) {
				throw new Error(`Key ${path[i]} does not exist in ${objectKey}`);
			}
			current = current[path[i]];
		}

		const lastKey = path[path.length - 1];
		if (!(lastKey in current)) {
			throw new Error(`Key ${lastKey} does not exist in ${objectKey}`);
		}

		current[lastKey] = newValue;

		if (objectKey === "svgData" && (lastKey === "width" || lastKey === "height")) {
			this.ensureResidualCutState();
			this.stopResidualCutSimulation();
			this.recalculateSheetSafety();
		}
	}

	fitToPage() {
		console.log("FIT TO PAGE");
	}

	addPosition(position) {
		this.svgData.positions = [...this.svgData.positions, position]
		this.markLaserShowOrderDirty();
		this.recalculateSheetSafety();
	}

	addForm(form) {

		const box = this.findBox(form.code)
		form.width = 0
		form.height = 0
		if (box) {
			form.width = box.width
			form.height = box.height
			form.x = box.x
			form.y = box.y 
		}

		console.log(form)
		this.svgData.part_code.push(form)
		this.recalculateSheetSafety();
	}

	findBox(code) {
		let commonPath = ''
		code.map(a => commonPath += a.path)
		return SVGPathCommander.getPathBBox(commonPath)
	}
	
	selectPlus = (partId) => {
		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				if (pos.part_id === partId) {
					pos.selected = true;
				}
			});
		});
	};
	
	selectMinus = (partId) => {
		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				if (pos.part_id === partId) {
					pos.selected = false;
				}
			});
		});
	};

	selectDeselect = (partId) => {
		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				if (pos.part_id === partId) {
					pos.selected = !pos.selected;
				}
			});
		});
	};


	selectOnly = (partId) => {
		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				pos.selected = pos.part_id === partId;
			});
		});
	};

	inverSelection = () => {
		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				pos.selected = !pos.selected
			});
		});
	};

	deselect = (id = false) => {
		runInAction(() => {
			if (id === false || id === null || id === undefined) {
				// Снимаем выделение со ВСЕХ деталей
				this.svgData.positions.forEach(part => {
					part.selected = false;
				});
			} else {
				// Снимаем выделение только с конкретной детали
				const part = this.svgData.positions.find(p => p.part_id === id);
				if (part) {
					part.selected = false;
				}
			}
		});
	};

	setSelectionRect(rect = null) {
		this.selectionRect = rect ? { ...rect } : null;
	}

	selectIntersecting(rect) {
		if (!rect) {
			this.deselect();
			return [];
		}

		const normalizedRect = {
			x: Number(rect.x) || 0,
			y: Number(rect.y) || 0,
			width: Math.max(0, Number(rect.width) || 0),
			height: Math.max(0, Number(rect.height) || 0),
		};
		const selectedIds = [];

		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				const bbox = this.getPositionWorldBBox(pos);
				const isIntersecting = bbox
					? !this.isOutOfRect(bbox, normalizedRect)
					: false;
				pos.selected = isIntersecting;

				if (isIntersecting) {
					selectedIds.push(pos.part_id);
				}
			});
		});

		return selectedIds;
	}

	deleteAll = (uuid) => {
		if (!uuid) {
			console.warn('deleteAll: uuid не передан');
			return;
		}

		runInAction(() => {
			svgStore.svgData.positions = svgStore.svgData.positions.filter(
				(part) => part.part_code_id !== uuid
			);
		});
		this.markLaserShowOrderDirty();
		this.recalculateSheetSafety();
	};

	isOutOfRect(bbox, rect) {
		return (
			bbox.maxX < rect.x ||
			bbox.maxY < rect.y ||
			bbox.minX > rect.x + rect.width ||
			bbox.minY > rect.y + rect.height
		);
	}


	getOuterPath(partCode) {
		return partCode.code.find(p =>
			p.class?.split(' ').includes('outer') &&
			p.class?.split(' ').includes('contour')
		);
	}

	transformPoint(x, y, m) {
		return {
			x: m.a * x + m.c * y + m.e,
			y: m.b * x + m.d * y + m.f,
		};
	}


	transformBBox(bbox, matrix) {
		const points = [
			this.transformPoint(bbox.x, bbox.y, matrix),
			this.transformPoint(bbox.x + bbox.width, bbox.y, matrix),
			this.transformPoint(bbox.x, bbox.y + bbox.height, matrix),
			this.transformPoint(bbox.x + bbox.width, bbox.y + bbox.height, matrix),
		];

		const xs = points.map(p => p.x);
		const ys = points.map(p => p.y);

		return {
			minX: Math.min(...xs),
			maxX: Math.max(...xs),
			minY: Math.min(...ys),
			maxY: Math.max(...ys),
		};
	}

	getPositionWorldBBox(position) {
		if (!position) {
			return null;
		}

		const partCode = this.svgData.part_code.find(
			part => part.uuid === position.part_code_id || part.id === position.part_code_id
		);
		if (!partCode) {
			return null;
		}

		const outer = this.getOuterPath(partCode);
		if (!outer?.path) {
			return null;
		}

		const outerBBox = SVGPathCommander.getPathBBox(outer.path);
		if (!outerBBox) {
			return null;
		}

		return this.transformBBox(outerBBox, position.positions || {});
	}


	deleteOutParts = ({ recalculate = true } = {}) => {
		
		const rect = { x: 0, y: 0, width: this.svgData.width, height: this.svgData.height };

		runInAction(() => {
			this.svgData.positions = this.svgData.positions.filter(pos => {
				if (!pos.selected) return true;

				// 1️⃣ найти part_code
				const partCode = this.svgData.part_code.find(
					p => p.uuid === pos.part_code_id || p.id === pos.part_code_id
				);
				if (!partCode) return true;

				// 2️⃣ найти внешний контур
				const outer = this.getOuterPath(partCode);
				if (!outer) return true;

				// 3️⃣ bbox пути
				const outerBBox = SVGPathCommander.getPathBBox(outer.path);

				// 4️⃣ применить matrix
				const worldBBox = this.transformBBox(outerBBox, pos.positions);

				// 5️⃣ проверить выход за пределы
				return !this.isOutOfRect(worldBBox, rect);
			});
		});
		this.markLaserShowOrderDirty();
		if (recalculate) {
			this.recalculateSheetSafety();
		}
	};

	escapeNcpAttr(val) {
		return String(val ?? "").replace(/"/g, "'");
	}

	/**
	 * Фрагмент NCP для одной детали (как в generateParts): Part, MaterialInfo из модалки/объекта, G-код контуров.
	 */
	generateStandalonePartNcp(part, progNum = 1) {
		const encName = this.escapeNcpAttr(part?.name ?? "part");
		const res = [];
		let lineNumber = 4;
		res.push(`(<Part PartCode="${encName}" Debit="1">)`);

		const mat = part?.material && typeof part.material === "object" ? part.material : {};
		const matLabel = this.escapeNcpAttr(mat.label ?? "");
		const matCode = this.escapeNcpAttr(mat.name ?? "");
		const th = part?.thickness;
		const hasMat =
			matLabel !== "" ||
			matCode !== "" ||
			(th !== undefined && th !== null && String(th).trim() !== "");
		if (hasMat) {
			res.push(
				`(<MaterialInfo Label="${matLabel}" MaterialCode="${matCode}" Thickness="${th ?? ""}" FormatType="Part" DimX="${part?.width ?? 0}" DimY="${part?.height ?? 0}"/>)`
			);
		}

		const contours = this.generateSinglePart(part?.code || [], progNum);
		res.push(contours);
		lineNumber += contours.length;
		res.push(`N${lineNumber}G98`);
		lineNumber++;
		res.push("(</Part>)");
		return res;
	}

	updateForm(uuid, newPartCodeObject) {
		//console.log( arguments );
		if (!this.svgData || !Array.isArray(this.svgData.part_code)) {
			console.error("svgData или svgData.part_code не определены или не являются массивом");
			return;
		}

		const index = this.svgData.part_code.findIndex(item => item.uuid === uuid);

		if (index === -1) {
			console.warn(`Объект с uuid "${uuid}" не найден в part_code`);
			return;
		}

		//console.log (JSON.stringify(this.svgData))
		this.svgData.part_code[index] = Object.assign({}, newPartCodeObject);
		//console.log(`Объект с uuid "${uuid}" успешно обновлён`);
		//console.log (JSON.stringify(this.svgData))
		this.recalculateSheetSafety();
	};

	generateParts() {
		const data = this.svgData;
		const res = [];
		let lineNumber = 4; // начинаем с N4, как в примере

		// Собираем уникальные детали по part_code_id
		const uniqueParts = new Map(); // part_code_id → { partInfo, contours }

		for (const part of data.part_code) {
			const partCodeId = part.uuid || part.id;

			uniqueParts.set(partCodeId, {
				name: part.name,
				width: part.width,
				height: part.height,
				code: part.code,
				thickness: part.thickness,
				material: part.material,
				material_id: part.material_id,
 			});
		}
		let progNum = 1

		for (const [partCodeId, partInfo ] of uniqueParts) {
			const { name, code, thickness, material, width, height } = partInfo;
			const instancesCount = data.positions.filter(p => p.part_code_id === partCodeId).length;
			const encName = this.escapeNcpAttr(name);
			res.push(`(<Part PartCode="${encName}" Debit="${instancesCount}">)`);

			const mat = material && typeof material === "object" ? material : {};
			const matLabel = this.escapeNcpAttr(mat.label ?? "");
			const matCode = this.escapeNcpAttr(mat.name ?? "");
			const hasMat =
				matLabel !== "" ||
				matCode !== "" ||
				(thickness !== undefined && thickness !== null && String(thickness).trim() !== "");
			if (hasMat) {
				const th = thickness ?? "";
				res.push(
					`(<MaterialInfo Label="${matLabel}" MaterialCode="${matCode}" Thickness="${th}" FormatType="Part" DimX="${width ?? 0}" DimY="${height ?? 0}"/>)`
				);
			}

			const contours = this.generateSinglePart(code, progNum)
			res.push(contours);

			progNum++
			lineNumber += contours.length;

			//
			res.push(`N${lineNumber}G98`);
			lineNumber++;
			res.push('(</Part>)');
		}

		const residualCutGeometry = buildResidualCutGeometry(
			this.getResidualCutAreas(),
			this.svgData?.width,
			this.svgData?.height
		);
		const residualDisplayPaths = residualCutGeometry.displayPaths;
		const residualProgramNumber = residualDisplayPaths.length
			? data.part_code.length + 1
			: null;
		const residualPart = buildResidualCutPartLines({
			displayPaths: residualDisplayPaths,
			programNumber: residualProgramNumber,
			sheetWidth: this.svgData?.width,
			sheetHeight: this.svgData?.height,
		});

		if (residualPart.length) {
			res.push(residualPart);
		}

		return res;
	}

	findByCidAndClass(array, cid, classSubstring, caseSensitive = false) {
		if (!Array.isArray(array)) return null;
		if (typeof classSubstring !== 'string') classSubstring = '';

		const searchStr = caseSensitive ? classSubstring : classSubstring.toLowerCase();

		return array.find(item => {
			if (item.cid !== cid) return false;
			if (typeof item.class !== 'string') return false;

			const classValue = caseSensitive ? item.class : item.class.toLowerCase();
			return classValue.includes(searchStr);
		}) || null;
	}

	getMacro(cls) {
		const m = cls.match(/macro(\d+)/)
		return m ? Number(m[1]) : null
	}
	
	svgToGcode(contour, inlet, outlet, height) {
		const res = []
		const tol = 0.01
		const c = contour?.path.length ? new SVGPathCommander(contour.path).toAbsolute() : {segments:[]}
		const i = inlet?.path.length ? new SVGPathCommander(inlet.path).toAbsolute() : {segments:[]}
		const o = outlet?.path.length ? new SVGPathCommander(outlet.path).toAbsolute() : {segments:[]}
		const direction = SVGPathCommander.getDrawDirection(contour.path)//true G41 false 42
		const joints = contour?.joints || []
		const jointPoints = joints
		.map(len => SVGPathCommander.getPointAtLength( contour.path, len))
		.filter(p => p && Number.isFinite(p.x) && Number.isFinite(p.y));

		const splittedPath = utils.splitPathByJointPoints( contour.path, joints);

		let currentMacro = false
		let currentCompensation = false

		let X, Y, G, I, J = null
		let needLaserOn = true
		let needLaserOff = false
		let needStart = true
		let g = null 

		let needG40 = false

		i?.segments.forEach(seg => {
			const cmd = seg[0]
			if (cmd === 'M') {

				const [, x, y] = seg				
				if (needStart) {
					g = 'G0'
					let line = ''
					if (g !== G) line += g
					if (x !== X) line += "X" + utils.smartRound(x)
					if (y !== Y) line += "Y" + utils.smartRound(height- y)
					needStart =  false	
					G = g
					X = x
					Y = y
					line.length ? res.push(line) : false
				}				

			}

			if (cmd === 'L') {

				const [, x, y] = seg
				needG40 =true
				g = 'G1'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound(x)
				if (y !== Y) line += "Y" + utils.smartRound(height- y)
				if (needLaserOn) {
					
					const macro = this.getMacro(inlet.class)
					if (macro !== null && macro !== currentMacro) {
						res.push(`G10S${macro}`)
						currentMacro = macro
						G = 'G10'
					}

					if (!line.endsWith("M4")) line +="M4"
					needLaserOn = false
					needLaserOff = true
				}

				G = g
				X = x
				Y = y
				line.length ? res.push(line) : false

			}

			if (cmd === 'A') {

				const [, rx, ry, xAxis, largeArc, sweep, x, y] = seg
				needG40 =true
				// старт и конец в координатах станка
				const x1 = X
				const y1 = height - Y
				const x2 = x
				const y2 = height - y
			  
				const r = rx // у тебя всегда rx === ry
			  
				// восстановление центра дуги
				const mx = (x1 + x2) / 2
				const my = (y1 + y2) / 2
			  
				const dx = x2 - x1
				const dy = y2 - y1
				const q = Math.hypot(dx, dy)
			  
				const h = Math.sqrt(Math.max(0, r * r - (q * q) / 4))
			  
				const nx = -dy / q
				const ny = dx / q
			  
				// ВАЖНО: инверсия sweep → G2 / G3
				const isCCW = sweep === 0   // ← это ключ
				const sign = isCCW ? 1 : -1
			  
				const cx = mx + sign * nx * h
				const cy = my + sign * ny * h
			  
				// ❗ I / J — АБСОЛЮТНЫЕ
				const i = utils.smartRound (cx) 
				const j = utils.smartRound (cy)
			  
				g = isCCW ? 'G3' : 'G2'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound (x2)
				if (y !== Y) line += "Y" + utils.smartRound (y2)
				if (i !== I) line += "I" + i
				if (j !== J) line += "J" + j
				  
			  
				G = g
				X = x
				Y = y
				I = i
				J = j
			  

				const inner = contour.class.includes("inner");
				let neededComp;

				if (needLaserOn) {

					const macro = this.getMacro(inlet.class)
					if (macro !== null && macro !== currentMacro) {
						res.push(`G10S${macro}`)
						currentMacro = macro
						G = 'G10'
					}

					if (!line.endsWith("M4")) line +="M4"
					needLaserOn = false
					needLaserOff = true
				}
				
				if (
					(direction === true && inner === false) ||
					(direction === false && inner === true)
				) {
					neededComp = 'G41';
				}
				else {
					neededComp = 'G42';
				}

				if (currentCompensation !== neededComp) {
					currentCompensation = neededComp;
					res.push(neededComp);
				}
				res.push(line)


			}
		})


		if (contour.class.includes("contour") && 
			!contour.class.includes("engraving") &&
			splittedPath.length > 2 && 
			i.segments.length !== 0 ) { 
				// есть врезка
				res.push('(<Contour>)');
		}

 		splittedPath.forEach((seg, ind) => {
			const cmd = seg[0]
			if (cmd === 'M') {

				const [, x, y] = seg				
				
				if (needStart) {
					g = 'G0'
					let line = ''
					if (g !== G) line += g
					if (x !== X) line += "X" + utils.smartRound ( x )
					if (y !== Y) line += "Y" + utils.smartRound ( height - y )
					needStart = false
					G = g
					X = x
					Y = y
					line.length ? res.push(line) : false
				}				

			}

			if (needLaserOn && splittedPath === 2) {
				const macro = this.getMacro(contour.class)
				if (macro !== null && macro !== currentMacro) {
					res.push(`G10S${macro}`)
					G = 'G10'
					currentMacro = macro
				}
			}

			const inner = contour.class.includes("inner");
			let neededComp;

			if (
				(direction === true && inner === false) ||
				(direction === false && inner === true)
			) {
				neededComp = 'G41';
			}
			else {
				neededComp = 'G42';
			}

			if (currentCompensation !== neededComp) {
				currentCompensation = neededComp;
				res.push(neededComp);
			}

			if (cmd === 'L') {

				const [, x2, y2] = seg
				g = 'G1'
			
			
				let line = ""
			
				if (G !== "G1") {
					line += "G1"
					G = 'G1'
				}
			
				if (X !== x2) line += "X" + utils.smartRound(x2)
				if (Y !== y2) line += "Y" + utils.smartRound(height - y2)

				if (needLaserOn && c.segments.length == 2 ) line +="M14M4M5M15";
				if (needLaserOn && c.segments.length > 2) {
					line +="M4"
					needLaserOn = false
				}

				if (needLaserOn && !line.endsWith("M4")) {
					line += 'M4'
					needLaserOn = false			  
				}
			
				if (line) res.push(line)
			
				X = x2
				Y = y2
				G = g
			}

			if (cmd === 'A') {

				const [, rx, ry, xAxis, largeArc, sweep, x, y] = seg
				needG40 =true

				const x1 = X
				const y1 = height - Y
			
				const x2 = x
				const y2 = height - y
			
				const r = rx
			
				// --- центр дуги ---
				const mx = (x1 + x2) / 2
				const my = (y1 + y2) / 2
			
				const dx = x2 - x1
				const dy = y2 - y1
				const q = Math.hypot(dx, dy)
			
				const h = Math.sqrt(Math.max(0, r*r - (q*q)/4))
			
				const nx = -dy / q
				const ny = dx / q
			
				const isCCW = sweep === 0
				const sign = isCCW ? 1 : -1
			
				const cx = mx + sign * nx * h
				const cy = my + sign * ny * h
			
				const i = utils.smartRound(cx)
				const j = utils.smartRound(cy)
			
				g = isCCW ? "G3" : "G2"
			
				// --- углы ---
				let startAngle = Math.atan2(y1 - cy, x1 - cx)
				let endAngle   = Math.atan2(y2 - cy, x2 - cx)
			
				if (isCCW && endAngle < startAngle) endAngle += Math.PI * 2
				if (!isCCW && endAngle > startAngle) endAngle -= Math.PI * 2
			
						
				let line = ""
			
				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound(x2)
				if (y !== Y) line += "Y" + utils.smartRound(y2)
				if (i !== I) line += "I" + i
				if (j !== J) line += "J" + j

				if (needLaserOn && c.segments.length == 2 ) line +="M14M4M5M15";
				if (needLaserOn && c.segments.length > 2) {
					line +="M4"
					needLaserOn = false
				}
							
				if (needLaserOn && !line.endsWith("M4")) {
					line += 'M4'
					needLaserOn = false			  
				}
				res.push(line)			
		
				G = g
				X = x
				Y = y
				I = i
				J = j
			}	
						
			if (i.segments.length === 0 && ind === 0) {
				const macro = this.getMacro(contour.class)
				if (macro !== null && macro !== currentMacro) {
					res.push(`G10S${macro}`)
					G = 'G10'
					currentMacro = macro
				}
			}

			if (i.segments.length === 0	&& 
				ind === 1 &&
				splittedPath.length > 2 ) {
				// нет врезки
				if(!res[res.length-1].endsWith("M4")) res[res.length-1]+= "M4"	
				needLaserOn = false
				needLaserOff = true
				res.push('(<Contour>)');
			}

			for (let j of jointPoints) {
				if(cmd === 'A' || cmd === 'L') {
					let dist = utils.distance(j.x, j.y, X, Y)
					if (dist < tol) {
						res.push(`G4M80`)
						G = "G4"
					}
				}
			}
		})

		if (needLaserOff && (!outlet ||o.segments.length ===0 ) && splittedPath.length > 2) {
			res[res.length-1]+="M5"
			needLaserOff = false
		}


		if (needG40 && (!outlet || o.segments.length ===0 )) {
			res.push(`G40`)
			G="G40"
			needG40 = false
		}

		if (contour.class.includes("contour") 
			&& !contour.class.includes("engraving")
			&& splittedPath.length > 2

		) {
			res.push('(</Contour>)');
		}

		o?.segments.forEach(seg => {
			const cmd = seg[0]
			if (cmd === 'M') {

				const [, x, y] = seg				
				g = 'G0'
				let line = ''
				if (needStart) {
					let line = ''
					if (g !== G) line += g
					if (x !== X) line += "X" + utils.smartRound (x)
					if (y !== Y) line += "Y" + utils.smartRound (height- y)
					needLaserOn = true
					G = g
					X = x
					Y = y
					line.length ? res.push(line) : false
				}
			}

			if (cmd === 'L') {

				const [, x, y] = seg
				g = 'G1'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound (x)
				if (y !== Y) line += "Y" + utils.smartRound (height- y)

				const macro = this.getMacro(inlet.class)
					if (macro !== null && macro !== currentMacro) {
						res.push(`G10S${macro}`)
						G = 'G10'
						currentMacro = macro
				}

				if (needLaserOn && !line.endsWith("M4")) {
					line +="M4"
					needLaserOn = false
				}

				G = g
				X = x
				Y = y
				line.length ? res.push(line) : false

			}

			if (cmd === 'A') {

				const [, rx, ry, xAxis, largeArc, sweep, x, y] = seg
				needG40 =true
				// старт и конец в координатах станка
				const x1 = X
				const y1 = height - Y
				const x2 = x
				const y2 = height - y
			  
				const r = rx // у тебя всегда rx === ry
			  
				// восстановление центра дуги
				const mx = (x1 + x2) / 2
				const my = (y1 + y2) / 2
			  
				const dx = x2 - x1
				const dy = y2 - y1
				const q = Math.hypot(dx, dy)
			  
				const h = Math.sqrt(Math.max(0, r * r - (q * q) / 4))
			  
				const nx = -dy / q
				const ny = dx / q
			  
				// ВАЖНО: инверсия sweep → G2 / G3
				const isCCW = sweep === 0   // ← это ключ
				const sign = isCCW ? 1 : -1
			  
				const cx = mx + sign * nx * h
				const cy = my + sign * ny * h
			  
				// ❗ I / J — АБСОЛЮТНЫЕ
				const i = utils.smartRound (cx)
				const j = utils.smartRound (cy)
			  
				g = isCCW ? 'G3' : 'G2'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound(x2)
				if (y !== Y) line += "Y" + utils.smartRound(y2)
				if (i !== I) line += "I" + i
				if (j !== J) line += "J" + j
				  
				//line += `X${x2}Y${y2}I${i}J${j}`
			  
				G = g
				X = x
				Y = y
				I = i
				J = j

				const macro = this.getMacro(inlet.class|| "")
				if (macro !== null && macro !== currentMacro) {
					res.push(`G10S${macro}`)
					currentMacro = macro
					G = "G10"
				}

				const inner = contour.class.includes("inner");
				let neededComp;

				if (
					(direction === true  && inner === false) ||
					(direction === false && inner === true)
				) {
					neededComp = 'G41';
				}
				else {
					neededComp = 'G42';
				}

				if (currentCompensation !== neededComp) {
					currentCompensation = neededComp;
					res.push(neededComp);
				}

				if (needLaserOn && !line.endsWith("M4")) {
					line += 'M4'
					needLaserOn = false			  
				}
				res.push(line)			  
				
			}
		})

		if (needLaserOff || !outlet  || o?.segments?.length) {
			res[res.length-1]+="M5"
			needLaserOff = false
		}

		if (needG40 ) res.push(`G40`)
		return res
	}

	generateSinglePart(code, progNum ) {
		let res = []
 		let commonPath = ''
		code.forEach(a => commonPath += a.path || ' ')
		const box = SVGPathCommander.getPathBBox(commonPath)
		res.push(`N${0}G28X${utils.smartRound(box.width)}Y${utils.smartRound(box.height)}L${progNum}P1`)

		const sorted = [...code].sort((a, b) =>
			b.class.includes('inner') - a.class.includes('inner')
	  	);


		sorted.forEach((item) => {

			if (!item.class.includes('contour')) return
			let outer = item.class.includes('outer')

			const inlet = this.findByCidAndClass(code, item.cid, 'inlet')
			const outlet = this.findByCidAndClass(code, item.cid, 'outlet')
			const contour = item
			let CP = SVGPathCommander.normalizePath(contour.path)

			let rx, ry, x1, y1, x2, y2, flag1, flag2, flag3;
			if (contour.path.length) {
				CP.forEach((seg, i) => {
					if (seg.includes('A')) {
						flag1 = seg[3]
						flag2 = seg[4]
						flag3 = seg[5]
						rx = seg[1]
						ry = seg[2]
						x2 = seg[6]
						y2 = seg[7]
						if (rx !== ry) {
							let nArc = arc.converting (`M${x1} ${y1}` + seg.join(" ")) 
							CP[i] = SVGPathCommander
								.normalizePath(nArc)
								.slice(1)
								.join(" ");
						}
						x1 = x2
						y1 = y2
					}
					if (seg.includes('M')) {
						x1 = seg[1]
						y1 = seg[2]
					}

					if (seg.includes('L')) {
						x1 = seg[1]
						y1 = seg[2]
					}
				})
			}

			contour.path = CP.join(" ").replaceAll(',', ' ');

			// ---- MACRO ----

			if (contour.path?.length) {
				this.svgToGcode(
					contour, 
					inlet,
					outlet, 
					box.height, 
					)
					.forEach(cmd =>
					res.push(`N${0}${cmd}`)
				)
			}
		})

		return res
	}

	deleteSelectedPosition () {		
		runInAction(() => {
			this.svgData.positions = this.svgData.positions.filter(pos => !pos.selected);
		})
		this.markLaserShowOrderDirty();
		this.recalculateSheetSafety();
	}

	rotateSelectedPosition(angle = 45) {
		runInAction(() => {
			const rad = angle * Math.PI / 180;
			const cos = Math.cos(rad);
			const sin = Math.sin(rad);
	
			const multiply = (m1, m2) => ([
				[
					m1[0][0] * m2[0][0] + m1[0][1] * m2[1][0],
					m1[0][0] * m2[0][1] + m1[0][1] * m2[1][1],
					m1[0][0] * m2[0][2] + m1[0][1] * m2[1][2] + m1[0][2]
				],
				[
					m1[1][0] * m2[0][0] + m1[1][1] * m2[1][0],
					m1[1][0] * m2[0][1] + m1[1][1] * m2[1][1],
					m1[1][0] * m2[0][2] + m1[1][1] * m2[1][2] + m1[1][2]
				],
				[0, 0, 1]
			]);
	
			// =========================
			// 1. Вычисляем общий bbox выделенных объектов
			// =========================
			let minX = Infinity, minY = Infinity;
			let maxX = -Infinity, maxY = -Infinity;
	
			this.svgData.positions.forEach(pos => {
				if (!pos.selected) return;
				const part = this.svgData.part_code.find(p => p.id === pos.part_code_id);
				if (!part) return;
	
				const { a, b, c, d, e, f } = pos.positions;
	
				try {
					const outer = Array.isArray(part?.code)
						? part.code.find(a => typeof a?.class === "string" && a.class.includes("contour") && a.class.includes("outer"))
						: null;
					if (!outer?.path) return;
	
					const box = SVGPathCommander.getPathBBox(outer.path);
					if (!box) return;
	
					// трансформируем 4 угла bbox через матрицу объекта
					const points = [
						[box.x, box.y],
						[box.x + box.width, box.y],
						[box.x + box.width, box.y + box.height],
						[box.x, box.y + box.height]
					];
	
					points.forEach(([x, y]) => {
						const tx = a * x + c * y + e;
						const ty = b * x + d * y + f;
						minX = Math.min(minX, tx);
						minY = Math.min(minY, ty);
						maxX = Math.max(maxX, tx);
						maxY = Math.max(maxY, ty);
					});
				} catch (err) {
					console.warn("BBox error:", err);
				}
			});
	
			if (!isFinite(minX) || !isFinite(minY)) return;
	
			const px = (minX + maxX) / 2; // глобальный центр группы
			const py = (minY + maxY) / 2;
	
			// =========================
			// 2. Вращаем каждый объект вокруг общего центра
			// =========================
			this.svgData.positions.forEach(pos => {
				if (!pos.selected) return;
				const { a, b, c, d, e, f } = pos.positions;
	
				const oldM = [
					[a, c, e],
					[b, d, f],
					[0, 0, 1]
				];
	
				// создаём матрицы: смещение к центру → поворот → смещение обратно
				const translateToCenter = [
					[1, 0, px],
					[0, 1, py],
					[0, 0, 1]
				];
				const rotate = [
					[cos, -sin, 0],
					[sin,  cos, 0],
					[0, 0, 1]
				];
				const translateBack = [
					[1, 0, -px],
					[0, 1, -py],
					[0, 0, 1]
				];
	
				const rotM = multiply(multiply(translateToCenter, rotate), translateBack);
	
				const m = multiply(rotM, oldM); // применяем глобальный поворот
	
				pos.positions = {
					a: m[0][0],
					b: m[1][0],
					c: m[0][1],
					d: m[1][1],
					e: m[0][2],
					f: m[1][2]
				};
			});
		});
		this.recalculateSheetSafety();
	}

	generatePositions() {
		const data = this.svgData;
		const res = [];
		// fix need workinfg area
		//res.push(`N1G29X${this.svgData.height}Y${this.svgData.width}P1H1A1`);
		let contBox = document.querySelector("#contours").getBBox()
		res.push(`N1G29X${ utils.smartRound(contBox.width + contBox.x)}Y${ utils.smartRound(contBox.height+ + contBox.y)}P1H1A1`);
		let lineNumber = 2;
		let x, y, c, g, l = 0

		for (const pos of data.positions) {

			let matrix = pos.positions
			// высота листа по оси Y в системе станка
			let sheetHeight = this.svgData.height
			let L = pos.part_code_id
			let G = 52
			let part = svgStore.svgData.part_code.filter(a => a.id == L)[0].code
			let partHeight = svgStore.findBox(part).height
			let XYC = this.matrixToG52(matrix, sheetHeight, partHeight, pos.cx, pos.cy)
			let X = utils.smartRound(XYC.X)
			let Y = utils.smartRound(XYC.Y)
			let C = utils.smartRound(XYC.C)

			let g52Line = `N${lineNumber}`;
			if (g !== G) g52Line += `G${G}`
			if (x !== X) g52Line += `X${X}`
			if (y !== Y) g52Line += `Y${Y}`
			if (l !== L) g52Line += `L${L}`
			if (c !== C) g52Line += `C${C}`

			res.push(g52Line);
			g = G, l = L, x = X, y = Y, c = C;
			lineNumber++;

		}

		const residualCutGeometry = buildResidualCutGeometry(
			this.getResidualCutAreas(),
			this.svgData?.width,
			this.svgData?.height
		);
		const residualDisplayPaths = residualCutGeometry.displayPaths;
		const residualProgramNumber = residualDisplayPaths.length
			? data.part_code.length + 1
			: null;
		const residualPlanPlacement = buildResidualCutPlanPlacement({
			displayPaths: residualDisplayPaths,
			programNumber: residualProgramNumber,
			sheetHeight: this.svgData?.height,
		});

		if (residualPlanPlacement) {
			const { g: residualG, x: residualX, y: residualY, l: residualL, c: residualC } = residualPlanPlacement;
			let residualLine = `N${lineNumber}`;
			if (g !== residualG) residualLine += `G${residualG}`;
			if (x !== residualX) residualLine += `X${residualX}`;
			if (y !== residualY) residualLine += `Y${residualY}`;
			if (l !== residualL) residualLine += `L${residualL}`;
			if (c !== residualC) residualLine += `C${residualC}`;

			res.push(residualLine);
			g = residualG, l = residualL, x = residualX, y = residualY, c = residualC;
			lineNumber++;
		}

		res.push(`N${lineNumber}G99`);
		res.push('(</Plan>)');
		return res;
	}

	// Крест с поворотом
	cross = (x, y, size, h) => {
		const [rx, ry] = this.rotatePoint(x, y, 0, 0, 0);
		const yInv = h -ry;
		return `M${rx - size} ${yInv - size} L${rx + size},${yInv + size} M${rx - size} ${yInv + size}L${rx + size} ${yInv - size}`;
	};

	line = (x2, y2, c, h) => {
		const [rx2, ry2] = this.rotatePoint(x2, y2, 0, 0, 0);;
		return ` L${rx2} ${h - ry2}`;
	};

	start = (x1, y1, c, h) => {
		const [rx2, ry2] = this.rotatePoint(x1, y1, 0, 0, 0);
		return `M${rx2} ${h - ry2}`;
	};

	// Арка с поворотом
	arcPath = (
		ex,
		ey,
		r,
		large,
		sweep,
		c,
		h
	) => {
		const [rxEnd, ryEnd] = this.rotatePoint(ex, ey, 0, 0, 0);
		return ` A${r} ${r} 0 ${large} ${1 - sweep} ${rxEnd} ${h - ryEnd}`;
	};

	rotatePoint = (
		x,
		y,
		cx,
		cy,
		angleDeg
	) => {
		const theta = (angleDeg * Math.PI) / 180; // переводим угол в радианы
		const dx = x - cx;
		const dy = y - cy;

		const xRot = cx + dx * Math.cos(theta) - dy * Math.sin(theta);
		const yRot = cy + dx * Math.sin(theta) + dy * Math.cos(theta);

		return [xRot, yRot];
	};

	startToEdit(ncp) {
		if (!ncp) {
			ncp = constants.lines
		}
		const lines = ncp.trim()
			.split(/\n+/)
			.map(line => line.trim())

		const result = {
			file:"",
			name: "undefined.ncp",
			thickness:1,
			jobcode:'',
			width: 0,
			height: 0,
			quantity: 1,
			presetId: 55,
			presetName: "any_preset",
			positions: [],
			part_code: [],
			residualCut: createEmptyResidualCutState(RESIDUAL_CUT_DEFAULT_STEP),
		};


		/* ---------------- DIMENSIONS ---------------- */
		const dimLine = lines.find(l => l.includes("DimX") && l.includes("DimY"));
		let height = 0;
		let width = 0;
		if (dimLine) {
			const dimX = dimLine.match(/DimX="([\d.]+)"/);
			const dimY = dimLine.match(/DimY="([\d.]+)"/);
			const Thickness = dimLine.match(/Thickness="([\d.]+)"/);

			// Используем DimX как ширину, DimY как высоту,
			// чтобы не менять их местами при повороте -90°
			result.width = Number(dimX?.[1] || 0);
			result.height = Number(dimY?.[1] || 0);
			result.thickness = Number(Thickness?.[1] || 0);

			width = result.width;
			height = result.height;
		}

		const JobCodeLine = lines.find(l => l.includes("JobCode"));
 		if (dimLine && JobCodeLine) {
			const JobCode = JobCodeLine.match(/JobCode="([\d\D]+)"/);
			result.jobcode = (JobCode?.[1] || "no_description");
		} else {
			result.jobcode =  "no_description";
		}

		/* ---------------- PLAN (POSITIONS) ---------------- */
		const parseGcodeLine = utils.makeGcodeParser();
		let cmds = lines.map(parseGcodeLine);


		let inPlan = false;
		let partPositionId = 1;


		/* ---------------- PART CODE ---------------- */
 		let currentPart = null;
		let cid = -1;
		let cx = 0, cy = 0;
		let partOpen = false
		let contourOpen = "before"
		let res = []; // массив путей
		let laserOn = false
		let macros = ''
		let HW = [0]
		let partHeight = 0		
		let partWidth = 0
		const hasMCode = (cmd, ...codes) =>
			Array.isArray(cmd?.m) && codes.some(code => cmd.m.includes(code))
		

		for (const c of cmds) {
			//console.log(JSON.stringify(c))

			if (c?.comment?.includes('PartCode')) {
				//console.log('Part code start')
				cx = 0;
				cy = 0;
				laserOn = false;
				contourOpen = "before";
				macros = '';
				const name = c.comment.match(/PartCode="([^"]+)"/)[1];

				currentPart = {
					id: result.part_code.length + 1,
					uuid: result.part_code.length + 1,
					name: name,
					code: [],
					height: 0,
					width: 0,
				};
				res = []

				partOpen = true
				continue;

			} else if (c?.comment?.includes('</Part>')) {

				//console.log('Part End')
				partOpen = false
				if (res.length) {
					res[res.length - 1].class += " groupEnd "
				}

				for (let i = res.length - 1; i >= 0; i--) {
					const item = res[i];

					// Проверяем наличие отдельных слов 'contour' и 'inner'
					// \b означает границу слова, чтобы не находить части слов
					const hasContour = /\bcontour\b/i.test(item.class);
					const hasInner = /\binner\b/i.test(item.class);

					if (hasContour && hasInner) {
						item.class = item.class.replace(/\binner\b/i, 'outer');
						break;
					}
				}

				let commonPath = ''
				res.map(a => a.path ? commonPath += a.path : commonPath += " ")
				let box = SVGPathCommander.getPathBBox(commonPath)
				currentPart.width = box.width
				currentPart.height = box.height
				currentPart.x = box.x
				currentPart.y = box.y
 
				const order = ['outer', 'contour', 'engraving', 'inlet', 'outlet', 'joint'].reverse();
				res = res.sort((a, b) => {
					let ac = a.class.split(' ')
						.map(cls => order.indexOf(cls))
						.sort((a, b) => b - a)[0] || -1;

					let bc = b.class.split(' ')
						.map(cls => order.indexOf(cls))
						.sort((a, b) => b - a)[0] || -1;

					return bc - ac;
				});

				res.map(a => currentPart.code.push(a))
				result.part_code.push(currentPart)
				continue;

			} else if (c?.comment?.includes('<Contour>')) {

				//console.log('Contour Start')
				contourOpen = "open"

				const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
				const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;

				if (res.length && !res[res.length - 1].class.includes("inlet")) {
					cid += 1
				}

				res.push({
					"cid": cid,
					"class": "contour inner " + macros,
					"path": "",
					"stroke": "red",
					"strokeWidth": 0.2,
					"selected": false,
					"joints":[]
				})

				res[res.length - 1].path = this.start(cx, cy, c, partHeight);
				cx = tx; cy = ty;
				continue;


			} else if (c?.comment?.includes('</Contour>')) {

				//console.log('Contour Start')
				//contourOpen = "after"

				res.push({
					"cid": cid,
					"class": " outlet inner" + macros + " ",
					"path": "",
					"stroke": "red",
					"strokeWidth": 0.2,
					"selected": false,
					"joints":[]
				})
				if (laserOn) res[res.length - 1].path = this.start(cx, cy, c, partHeight);
				if (hasMCode(c, 5, 15)) {
					laserOn = false;
					contourOpen = "before"
				}
				continue;
			}

			if (Array.isArray(c.m)) {

				const m = new Set(c.m);
			  
				const only = (...vals) =>
				vals.length === m.size && vals.every(v => m.has(v));
			  
				if (only(4) || only(4, 14) ) {
					//console.log('laser on')
					laserOn = true;
					res[res.length - 1].path = this.start(cx, cy, c, partHeight);
				}	else if (only(5) || only(5, 15) ) {

					//console.log('laser off')
					laserOn = false;
					contourOpen = "before"
				  
				} else if (only(5, 15, 4, 14) || only(5, 4)) {
				  // только M5 M15
				  	//console.log('laser on')
					laserOn = true;
					res[res.length - 1].class = 
					res[res.length - 1].class
						.replace('inlet', 'contour')
						.replace('outlet', 'contour')

					res[res.length - 1].path = this.start(cx, cy, c, partHeight);

					contourOpen = "before"
					laserOn = false;

				}
			  
			}

			if (typeof c.g === 'number') {
				const g = Math.floor(c.g);
				if (g === 0) {

					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;

					if (contourOpen === "before") {
						cid += 1
						res.push({
							"cid": cid,
							"class": " inlet inner" + macros + " ",
							"path": "",
							"stroke": "red",
							"strokeWidth": 0.2,
							"selected": false,
							"joints":[]
						})
					}

					if (!res.length) {
						cid += 1
						res.push({
							"cid": cid,
							"class": " inlet inner" + macros + " ",
							"path": "",
							"stroke": "red",
							"strokeWidth": 0.2,
							"selected": false,
							"joints":[]
						})
					}

					res[res.length - 1].path = this.start(cx, cy, c, partHeight);
					cx = tx; cy = ty;

				} else if (g === 1) {

					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;
					res[res.length - 1].path += this.line(tx, ty, c, partHeight);
					cx = tx; cy = ty;

				} else if (g === 2 || g === 3) {

					// console.log(`g === 2 || g === 3`)
					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;
					const ci = (c.params.I !== undefined) ? (c.params.I) : 0;
					const cj = (c.params.J !== undefined) ? (c.params.J) : 0;
					const dxs = cx - (cx + ci);
					const dys = cy - (cy + cj);
					const dxe = tx - (cx + ci);
					const dye = ty - (cy + cj);
					let r = Math.round((Math.hypot(tx - ci, ty - cj)) * 1000) / 1000;
					const a1 = Math.atan2(dys, dxs);
					const a2 = Math.atan2(dye, dxe);
					let d = utils.normalizeAngle(a2 - a1);
					const ccw = (g === 3);
					if (ccw && d < 0) d += 2 * Math.PI;
					if (!ccw && d > 0) d -= 2 * Math.PI;
					const large = 0;
					const sweep = ccw ? 1 : 0;
					res[res.length - 1].path += this.arcPath(tx, ty, r, large, sweep, c, partHeight);

					cx = tx; cy = ty;
				} else if (g === 4) {
					let pathLength = SVGPathCommander.getTotalLength(
						res[res.length - 1].path
					);
					res[res.length - 1].joints.push( pathLength )
					//continue;

				} else if (g === 10) {
					macros = ' macro' + c.params.S + ' '
					try {

						 res[res.length - 1].class = (
							( res[res.length - 1].class || '')
								.replace(/\bmacro\d+\b/g, '')
								+ macros
						)

					} catch (error) {
						console.log("catch in macros");
					}
 
				} else if (g === 29) {
				} else if (g === 28) {
					partHeight = c.params.Y
					partWidth = c.params.X
					HW.push([partHeight, partWidth])

				} else if (g === 52) {
				}

			}
		}

		lines.forEach(line => {
			if (line.includes("<Plan")) {
				inPlan = true;
				return;
			}

			if (line.includes("</Plan")) {
				inPlan = false;
				return;
			}

			if (!inPlan) return;

			// обрабатываем только G-code строки
			if (!/^N\d+/i.test(line)) return;

			// 👉 stateful G-code парсинг
			const g = parseGcodeLine(line);
			if (g.g === 28 || g.params.g === 28) {

			}
			if (g.g === 52 || g.params.g === 52) {
				// высота детали (bounding box с incut!)
				const { X = 0, Y = 0, C = 0, L = 1 } = g.params;
				const rad = ((-C) * Math.PI) / 180;
				//const cos = Math.cos(rad);
				//const sin = Math.sin(rad);
				const partHeight = HW[L][0]
				// высота листа по оси Y (DimY)
				const sheetHeight = height;

				const cx = X;
				const cy = sheetHeight - Y;

				const tx = X;
				const ty = sheetHeight - Y - partHeight;

				const dx = tx - cx;
				const dy = ty - cy;

				//const transform = `rotate(${-C} ${cx} ${cy}) translate(${tx} ${ty})`;
				//console.log ( transform )
				//const position = this.svgTransformToMatrix ( transform)
				const position = this.rotateTranslateToMatrix(C, cx, cy, tx, ty)

				result.positions.push(
					{
						part_id: partPositionId++,
						part_code_id: Number(L),
						positions: position,
						cx,
						cy
					}
				);
			}
		});

		const residualPart = result.part_code.find(part => part?.name === RESIDUAL_CUT_PART_CODE);
		if (residualPart && !result.residualCut?.areas?.length) {
			const nextAreas = buildResidualCutAreasFromLegacyPart(result);
			result.residualCut = {
				...(result.residualCut || createEmptyResidualCutState(RESIDUAL_CUT_DEFAULT_STEP)),
				areas: nextAreas,
				source: nextAreas.length ? RESIDUAL_CUT_SOURCE_NCP : RESIDUAL_CUT_SOURCE_NONE,
			};

			if (!nextAreas.length) {
				showToast({
					type: "error",
					message: "Current residual cut is not detected.",
				});
			}
		}

		if (residualPart) {
			const residualPartId = residualPart.id ?? residualPart.uuid;
			result.part_code = result.part_code.filter(part => part !== residualPart);
			result.positions = result.positions.filter(pos => pos?.part_code_id !== residualPartId);
		}

		svgStore.setGroupMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		svgStore.setMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		let result1 = this.defineInlets (result)
		const positionIds = Array.isArray(result1?.positions)
			? result1.positions.map(pos => pos?.part_id)
			: [];

		result1.cutOrder = {
			mode: "current",
			sectorSize: clampSheetCutSectorSize(result1, SHEET_CUT_DEFAULT_SECTOR_SIZE),
			orders: {
				current: [...positionIds],
				auto: [...positionIds],
				manual: [...positionIds],
			},
		};

		svgStore.svgData = Object.assign({}, result1)
		this.markLaserShowOrderDirty();
		this.laserShowPartFlags.clear();
		this.resetResidualCutDraft();
		this.stopResidualCutSimulation();
		this.resetSheetSafetyState();
		this.initializeShowDangersByPositionsCount();
		this.setLaserShow({
			on: false,
			paused: false,
			progress: 0,
			seek: 0,
			activePartId: null,
			hoverPartId: null,
			currentOrder: 0,
			completedCount: 0,
		});
		this.recalculateSheetSafety();

	}

	defineInlets(result) {
	
	  const EPS = 0.001
	
	  const pointsEqual = (a, b) =>
		Math.abs(a[0] - b[0]) < EPS &&
		Math.abs(a[1] - b[1]) < EPS
	
	
	  const getStartPoint = (segments) => {
		const [, x, y] = segments[0] // M x y
		return [x, y]
	  }
	
	
	  // безопасно для любых команд (A/C/Q/...)
	  const getEndPoint = (cmd) => {
		const len = cmd.getTotalLength()
		const { x, y } = cmd.getPointAtLength(len)
		return [x, y]
	  }
	
	
	  const removeFirstMove = (segments) =>
		segments[0][0] === 'M' ? segments.slice(1) : segments
	
	
	  // =====================================================
	
	  for (const part of result.part_code) {
	
		const contours = part.code.filter(c => c.class.includes('contour'))
	
		// ⚡ быстрее чем find каждый раз
		const inletMap = new Map(
		  part.code
			.filter(c => c.class.includes('inlet') && c.path)
			.map(i => [i.cid, i])
		)
	
	
		for (const contour of contours) {
	
		  if (
			!contour.path ||
			contour.class.includes('macro2') ||
			utils.isPathClosed(contour.path)
		  ) continue
	
	
		  const inlet = inletMap.get(contour.cid)
		  if (!inlet) continue
	
	
		  // ✅ normalize обязателен
		  const contourCmd = new SVGPathCommander(contour.path).normalize()
		  const inletCmd   = new SVGPathCommander(inlet.path).normalize()

	
		  const contourSeg = contourCmd.segments
		  const inletSeg   = inletCmd.segments
	
	
		  const contourStart = getStartPoint(contourSeg)
		  const contourEnd   = getEndPoint(contourCmd)
	
		  const inletStart = getStartPoint(inletSeg)
		  const inletEnd   = getEndPoint(inletCmd)
	
	
		  let mergedSegments = null
	
	
		  // inlet -> contour
		  if (pointsEqual(inletEnd, contourStart)) {
			mergedSegments = [
			  ...inletSeg,
			  ...removeFirstMove(contourSeg)
			]
		  }
	
		  // contour -> inlet
		  else if (pointsEqual(contourEnd, inletStart)) {
			mergedSegments = [
			  ...contourSeg,
			  ...removeFirstMove(inletSeg)
			]
		  }
	
	
		  if (!mergedSegments) continue
	
	
		  // ✅ ПРАВИЛЬНАЯ сборка пути
		  contour.path = new SVGPathCommander(mergedSegments).toString()
		  // а вот тут мы фиксим начало пути для джойнтов так как при подсчете g === 4 не был в длине пути учтен инлет
		  // который мы сейча ссюда смержили .... ёёё
		  contour.joints.forEach((j, i, arr)=>{
			arr[i]+= SVGPathCommander.getTotalLength( inlet.path )||0
		  })
	
		  // очищаем inlet
		  inlet.path = ''

		}
	  }
	
	  return result
	}

	rotateTranslateToMatrix(C, cx, cy, tx, ty) {
		const rad = (-C * Math.PI) / 180;

		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		// R
		const a = cos;
		const b = sin;
		const c = -sin;
		const d = cos;

		// e, f с учётом центра вращения и translate
		const e =
			cos * tx - sin * ty +
			cx - cos * cx + sin * cy;

		const f =
			sin * tx + cos * ty +
			cy - sin * cx - cos * cy;

		return { a, b, c, d, e, f };
	}

 	matrixToG52(matrix, sheetHeight, partHeight) {
		//console.log (arguments)
		const {a, b, c, d, e, f} = matrix;
		let C = -Math.atan2(b, a) * 180 / Math.PI;

		// нормализация
		if (Math.abs(C) < 1e-6) C = 0;
		if (Math.abs(C - 90) < 1e-6) C = 90;
		if (Math.abs(C - 180) < 1e-6) C = 180;
		if (Math.abs(C - 270) < 1e-6) C = 270;
		C = (C + 360) % 360
		let x = 0
		let y = partHeight

		const xNew = a * x + c * y + e;
		const yNew = b * x + d * y + f;

		// 3. вернуть координаты NCP
		const X = utils.smartRound(xNew);
		const Y = utils.smartRound ( sheetHeight - yNew );
		return { X, Y, C };
	} 

	renumberNLines(lines, start = 1) {
		let n = start

		return lines.map(line => {
			const m = line.match(/^N\d+(.*)$/i)
			if (!m) return line

			const rest = m[1].trim()

			// ❗ не нумеруем теги Contour
			if (
				rest === '(<Contour>)' ||
				rest === '(</Contour>)'
			) {
				return rest
			}

			return `N${n++}${m[1]}`
		})
	}
	  

	saveNcpFile() {
		
		const { selectedId } = jobStore;
		let ncpStart;
		//const start = performance.now(); // ⏱ конец

		if (selectedId === 'newSheet') {

			let material = "Mild steel" 
			let materialLabel = "S235JR"

			ncpStart = [
				`%`,
				`(<NcpProgram Version="1.0" Units="Metric">)`,
				`(<MaterialInfo Label="${material}" MaterialCode="${materialLabel}" Thickness="${this.svgData.thickness}" FormatType="Sheet" DimX="${this.svgData.width}" DimY="${this.svgData.height}"/>)`,
				`(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)`,
				`(<Plan JobCode="${this?.svgData.jobcode ? this.svgData.jobcode : "no_discrition"}">)`,
			]			

		} else {

			const current = jobStore.getJobById(selectedId)
			if (!current) return;
			const { material, materialLabel } = current
			const { thickness, jobcode } = svgStore.svgData
			ncpStart = [
				`%`,
				`(<NcpProgram Version="1.0" Units="Metric">)`,
				`(<MaterialInfo Label="${material}" MaterialCode="${materialLabel}" Thickness="${thickness}" FormatType="Sheet" DimX="${this.svgData.width}" DimY="${this.svgData.height}"/>)`,
				`(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)`,
				`(<Plan JobCode="${jobcode}">)`,
			]
		}

		let ncpPositons = this.generatePositions()

		//const end = performance.now(); // ⏱ конец
 		//console.log(`⏱ generatePositions took ${(end - start).toFixed(2)} ms`)

		let ncpParts = this.generateParts()
		let ncpFinish = [
			`(</NcpProgram>)`,
			`& \n`
		]

		let ncp = [...ncpStart, ...ncpPositons, ...ncpParts.flat(), ...ncpFinish]
		ncp = this.renumberNLines (ncp, 1)


		//const end1 = performance.now(); // ⏱ конец
 		//console.log(`⏱ renumberNLines took ${(end1 - end).toFixed(2)} ms`)

		if (selectedId ==='newSheet' ) {
			jobStore.saveNcpAsNewSheet(ncp)
		} else {
			jobStore.saveNcpToServer(ncp)
		}
	}

}

const svgStore = new SvgStore();
export default svgStore;