import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { observer } from "mobx-react-lite";
import Panel from "./panel.jsx";
import svgStore from "./../../../store/svgStore.jsx";
import { addToSheetLog } from "./../../../scripts/addToSheetLog.jsx";
import { useTranslation } from "react-i18next";
import CustomIcon from "./../../../icons/customIcon.jsx";
import { ReactSortable } from "react-sortablejs";
import TooltipCreator from "./tooltipCreator";
import {
	getAutoSheetCutOrder,
	getPositionPreviewData,
} from "./../../../scripts/sheetCutUtils.jsx";
import panelStore from "./../../../store/panelStore.jsx";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const PLAYBACK_PART_DURATION_FACTOR = 8;
const PLAYBACK_PART_MIN_DURATION = 12;

const getPlaybackPartDuration = (speed = 50) => {
	const safeSpeed = clamp(Number(speed) || 50, 1, 100);
	return Math.max(PLAYBACK_PART_MIN_DURATION, (101 - safeSpeed) * PLAYBACK_PART_DURATION_FACTOR);
};

const getPlaybackStateByProgress = (positions, progressPercent = 0) => {
	const clampedProgress = clamp(Number(progressPercent) || 0, 0, 100);
	const totalParts = positions.length;

	if (!totalParts) {
		return {
			progress: 0,
			seek: 0,
			activePartId: null,
			currentOrder: 0,
			completedCount: 0,
		};
	}

	if (clampedProgress >= 100) {
		return {
			progress: 100,
			seek: 100,
			activePartId: null,
			currentOrder: totalParts + 1,
			completedCount: totalParts,
		};
	}

	const activeIndex = Math.min(
		totalParts - 1,
		Math.max(0, Math.floor((clampedProgress / 100) * totalParts))
	);

	return {
		progress: clampedProgress,
		seek: clampedProgress,
		activePartId: positions[activeIndex]?.part_id ?? null,
		currentOrder: activeIndex + 1,
		completedCount: activeIndex,
	};
};

const PLAYBACK_UI_UPDATE_INTERVAL = 33;
const PLAYBACK_PROGRESS_EPSILON = 0.001;
const SECTOR_SIZE_COMMIT_DELAY = 180;
const SHEET_CUT_CARD_SIZE = Object.freeze({ w: 50, h: 50 });
const SHEET_CUT_MINI_SVG = Object.freeze({ sizeX: 25, sizeY: 25 });
const SHEET_CUT_CARD_MARGIN = 12;
const SHEET_CUT_VIRTUALIZATION_MIN_ITEMS = 120;
const SHEET_CUT_VIRTUAL_OVERSCAN_ROWS = 2;
const SHEET_CUT_VIRTUAL_CARD_STYLE = Object.freeze({ margin: 0 });
const SHEET_CUT_VIRTUAL_ITEM_SIZE = Object.freeze({
	// Bootstrap applies border-box globally, so card width/height already include padding/border.
	w: SHEET_CUT_CARD_SIZE.w + SHEET_CUT_CARD_MARGIN * 2,
	h: SHEET_CUT_CARD_SIZE.h + SHEET_CUT_CARD_MARGIN * 2,
});

const getLaserShowProgress = () =>
	clamp(Number(svgStore.laserShowTimeline.progress) || 0, 0, 100);

const getRequestedLaserShowProgress = () => {
	const seek = Number(svgStore.laserShowTimeline.seek);
	return clamp(Number.isFinite(seek) ? seek : getLaserShowProgress(), 0, 100);
};

const useElementSize = (targetRef) => {
	const [size, setSize] = useState({ width: 0, height: 0 });

	useEffect(() => {
		const target = targetRef.current;
		if (!target) {
			return undefined;
		}

		const updateSize = () => {
			const nextWidth = Math.round(target.clientWidth || 0);
			const nextHeight = Math.round(target.clientHeight || 0);

			setSize(previousSize => (
				previousSize.width === nextWidth && previousSize.height === nextHeight
					? previousSize
					: { width: nextWidth, height: nextHeight }
			));
		};

		updateSize();

		if (typeof ResizeObserver !== "undefined") {
			const resizeObserver = new ResizeObserver(() => {
				updateSize();
			});
			resizeObserver.observe(target);

			return () => {
				resizeObserver.disconnect();
			};
		}

		window.addEventListener("resize", updateSize);

		return () => {
			window.removeEventListener("resize", updateSize);
		};
	}, [targetRef]);

	return size;
};

const SheetCutPlaybackController = observer(({
	orderedPositions,
	deactivateCutSimulation,
}) => {
	const playbackTimerRef = useRef(null);
	const speed = Number(svgStore.laserShowPlayback.speed) || 50;
	const isLaserOn = Boolean(svgStore.laserShowPlayback.on);
	const isPaused = Boolean(svgStore.laserShowPlayback.paused);

	const stopPlaybackLoop = useCallback(() => {
		if (playbackTimerRef.current !== null) {
			clearTimeout(playbackTimerRef.current);
			playbackTimerRef.current = null;
		}
	}, []);

	useEffect(() => () => {
		stopPlaybackLoop();
	}, [stopPlaybackLoop]);

	useEffect(() => {
		stopPlaybackLoop();

		if (!isLaserOn || isPaused) {
			return undefined;
		}

		if (!orderedPositions.length) {
			deactivateCutSimulation();
			return undefined;
		}

		const totalDuration = orderedPositions.length * getPlaybackPartDuration(speed);
		if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
			deactivateCutSimulation();
			return undefined;
		}

		const initialProgress = getLaserShowProgress();
		if (initialProgress >= 100) {
			svgStore.setLaserShow({
				on: true,
				paused: true,
				speed,
				...getPlaybackStateByProgress(orderedPositions, 100),
			});
			return undefined;
		}

		const playbackStartTime = performance.now();
		const baseElapsed = (initialProgress / 100) * totalDuration;
		let lastCommittedProgress = initialProgress;

		const step = () => {
			const elapsed = baseElapsed + (performance.now() - playbackStartTime);
			const nextProgress = clamp((elapsed / totalDuration) * 100, 0, 100);

			if (nextProgress >= 100 - PLAYBACK_PROGRESS_EPSILON) {
				svgStore.setLaserShow({
					on: true,
					paused: true,
					speed,
					...getPlaybackStateByProgress(orderedPositions, 100),
				});
				playbackTimerRef.current = null;
				return;
			}

			if (Math.abs(nextProgress - lastCommittedProgress) >= PLAYBACK_PROGRESS_EPSILON) {
				svgStore.setLaserShow({
					on: true,
					paused: false,
					speed,
					...getPlaybackStateByProgress(orderedPositions, nextProgress),
				});
				lastCommittedProgress = nextProgress;
			}

			playbackTimerRef.current = window.setTimeout(
				step,
				PLAYBACK_UI_UPDATE_INTERVAL
			);
		};

		playbackTimerRef.current = window.setTimeout(
			step,
			PLAYBACK_UI_UPDATE_INTERVAL
		);

		return stopPlaybackLoop;
	}, [
		deactivateCutSimulation,
		isLaserOn,
		isPaused,
		orderedPositions,
		speed,
		stopPlaybackLoop,
	]);

	return null;
});

const SheetCutPlaybackControls = observer(({
	runCutQue,
	pauseCutQue,
	stopCutQue,
	setShowSpeed,
}) => {
	const speed = Number(svgStore.laserShowPlayback.speed) || 50;
	const isLaserOn = Boolean(svgStore.laserShowPlayback.on);
	const isPlaying = Boolean(svgStore.laserShowPlayback.on && !svgStore.laserShowPlayback.paused);
	const isPaused = Boolean(svgStore.laserShowPlayback.on && svgStore.laserShowPlayback.paused);

	return (
		<div className="d-flex align-items-center justify-content-between">
			<TooltipCreator
				element={{
					id: "sheetSpeedPartShow",
					info: (
						<div className="ms-2 w-50">
							<input
								type="range"
								className="form-range black-range"
								id="sheetSpeedPartShow"
								step={1}
								min={1}
								max={100}
								value={speed}
								onChange={setShowSpeed}
							/>
						</div>
					),
				}}
			/>
			<div className="ms-2">
				<TooltipCreator
					element={{
						id: "playSheetCutPartOrder",
						info: (
							<button
								type="button"
								className="btn btn-sm violet_button me-2"
								id="playSheetCutPartOrder"
								onMouseDown={runCutQue}
								disabled={isPlaying}
							>
								<CustomIcon
									icon="play"
									width="24"
									height="24"
									color="white"
									fill="white"
									strokeWidth={0}
								/>
							</button>
						),
					}}
				/>
				<button
					type="button"
					className="btn btn-sm violet_button ms-1 me-2"
					id="pauseSheetCutQue"
					onMouseDown={pauseCutQue}
					disabled={!isLaserOn || isPaused}
				>
					<CustomIcon
						icon="fluent:pause-24-filled"
						width="24"
						height="24"
						color="white"
						fill="white"
						strokeWidth={0}
					/>
				</button>
				<button
					type="button"
					className="btn btn-sm violet_button ms-1 me-2"
					id="stopSheetCutQue"
					onMouseDown={stopCutQue}
				>
					<CustomIcon
						icon="stop"
						width="24"
						height="24"
						color="white"
						fill="white"
						strokeWidth={0}
					/>
				</button>
			</div>
		</div>
	);
});

const SheetCutPlaybackProgress = observer(({ totalCount, setSeekProgress }) => {
	const progress = getLaserShowProgress();
	const rawCurrentOrder = Math.max(
		0,
		Number(svgStore.laserShowTimeline.currentOrder) || 0
	);
	const currentOrder = Math.min(totalCount, rawCurrentOrder);

	return (
		<div className="d-flex align-items-center px-2 pt-2">
			<input
				type="range"
				className="form-range black-range m-0"
				min={0}
				max={100}
				step={0.1}
				value={progress}
				onChange={setSeekProgress}
			/>
			<div className="ms-2 text-nowrap" style={{ minWidth: "62px", fontSize: "12px" }}>
				{currentOrder}/{totalCount}
			</div>
		</div>
	);
});

const getPositionTransform = (position) => (
	`matrix(${position.positions?.a ?? 1} ${position.positions?.b ?? 0} ${position.positions?.c ?? 0} ${position.positions?.d ?? 1} ${position.positions?.e ?? 0} ${position.positions?.f ?? 0})`
);

const SheetCutPreviewCardStatus = memo(({
	partId,
	index,
	WH,
	title,
	setHoveredPart,
	isHovered,
	isActive,
	isCompleted,
	cardStyle,
	children,
}) => {
	const accentColor = isActive ? "#ff5a00" : "#fd7e14";
	const wrapperStyle = useMemo(() => ({
		width: `${WH.w}px`,
		height: `${WH.h}px`,
		position: "relative",
		...cardStyle,
		border: isActive
			? "2px solid #ff5a00"
			: isHovered
				? "2px solid var(--violet)"
				: isCompleted
					? "2px solid #fd7e14"
					: undefined,
		boxShadow: isActive
			? "0 0 0 2px rgba(255, 90, 0, 0.18), 0 0 18px rgba(255, 90, 0, 0.12)"
			: isHovered
				? "0 0 0 1px rgba(111, 66, 193, 0.25)"
				: isCompleted
					? "0 0 0 1px rgba(253, 126, 20, 0.18)"
					: undefined,
		backgroundColor: isActive
			? "rgba(255, 106, 0, 0.16)"
			: isCompleted
				? "rgba(253, 126, 20, 0.08)"
				: undefined,
	}), [WH.h, WH.w, cardStyle, isActive, isCompleted, isHovered]);

	return (
		<div
			className="grid-square"
			style={wrapperStyle}
			title={title}
			onMouseEnter={() => setHoveredPart(partId)}
			onMouseLeave={() => setHoveredPart(null)}
		>
			<div
				style={{
					position: "absolute",
					top: "6px",
					left: "8px",
					fontSize: "12px",
					fontWeight: 700,
					color: accentColor,
					zIndex: 1,
				}}
			>
				{index + 1}
			</div>
			{children}
		</div>
	);
});

const SheetCutPreviewGraphic = memo(({
	preview,
	previewTransform,
	positionTransform,
	miniSvg,
}) => {
	if (!preview?.bbox) {
		return (
			<svg width={0} height={0}>
				<path d="M0 0" />
			</svg>
		);
	}

	return (
		<svg width={miniSvg.sizeX} height={miniSvg.sizeY}>
			<g transform={previewTransform}>
				<g transform={positionTransform}>
					<path
						d={preview.contourPath}
						fill="rgba(253, 126, 20, 0.12)"
						fillRule="evenodd"
						stroke="#fd7e14"
						strokeWidth="1"
						vectorEffect="non-scaling-stroke"
					/>
					<path
						d={preview.inletOutletPath}
						fill="none"
						stroke="#fd7e14"
						strokeWidth="1"
						vectorEffect="non-scaling-stroke"
					/>
				</g>
			</g>
		</svg>
	);
});

const SheetCutPreviewCard = memo(({
	partId,
	position,
	index,
	partName,
	WH,
	miniSvg,
	positionTransform,
	setHoveredPart,
	isHovered,
	isActive,
	isCompleted,
	cardStyle,
}) => {
	const preview = getPositionPreviewData(svgStore.svgData, position);
	const previewTransform = useMemo(() => {
		if (!preview?.bbox) return null;

		const safeWidth = preview.bbox.width || 1;
		const safeHeight = preview.bbox.height || 1;
		const scaleX = miniSvg.sizeX / safeWidth;
		const scaleY = miniSvg.sizeY / safeHeight;
		const scale = Math.min(scaleX, scaleY);
		const translateX = (miniSvg.sizeX - safeWidth * scale) / 2 - preview.bbox.x * scale;
		const translateY = (miniSvg.sizeY - safeHeight * scale) / 2 - preview.bbox.y * scale;

		return `translate(${translateX}, ${translateY}) scale(${scale})`;
	}, [
		miniSvg.sizeX,
		miniSvg.sizeY,
		preview?.bbox?.height,
		preview?.bbox?.width,
		preview?.bbox?.x,
		preview?.bbox?.y,
	]);
	const title = `${index + 1}. ${partName || preview?.part?.name || `Part ${partId}`}`;

	return (
		<SheetCutPreviewCardStatus
			partId={partId}
			index={index}
			WH={WH}
			title={title}
			setHoveredPart={setHoveredPart}
			isHovered={isHovered}
			isActive={isActive}
			isCompleted={isCompleted}
			cardStyle={cardStyle}
		>
			<SheetCutPreviewGraphic
				preview={preview}
				previewTransform={previewTransform}
				positionTransform={positionTransform}
				miniSvg={miniSvg}
			/>
		</SheetCutPreviewCardStatus>
	);
});

const SheetCutPositionGrid = observer(({
	positions,
	activeCutOrderMode,
	setList,
	setHoveredPart,
	WH,
	miniSvg,
}) => {
	const scrollContainerRef = useRef(null);
	const { width: containerWidth, height: containerHeight } = useElementSize(scrollContainerRef);
	const [scrollTop, setScrollTop] = useState(0);
	const activePartId = svgStore.laserShowVisual.activePartId ?? null;
	const hoverPartId = svgStore.laserShowVisual.hoverPartId ?? null;
	const completedCount = clamp(
		Number(svgStore.laserShowVisual.completedCount) || 0,
		0,
		positions.length
	);
	const shouldVirtualize = (
		activeCutOrderMode === "auto" &&
		positions.length >= SHEET_CUT_VIRTUALIZATION_MIN_ITEMS
	);
	const partNameByCodeId = new Map(
		(Array.isArray(svgStore.svgData?.part_code) ? svgStore.svgData.part_code : [])
			.map(part => [part?.id ?? part?.uuid, part?.name])
	);

	const handleScroll = useCallback((event) => {
		setScrollTop(event.currentTarget.scrollTop);
	}, []);

	useEffect(() => {
		const nextScrollTop = scrollContainerRef.current?.scrollTop || 0;
		setScrollTop(nextScrollTop);
	}, [activeCutOrderMode, positions.length]);

	const virtualColumns = shouldVirtualize
		? Math.max(1, Math.floor(containerWidth / SHEET_CUT_VIRTUAL_ITEM_SIZE.w))
		: 1;
	const virtualRange = useMemo(() => {
		if (!shouldVirtualize) {
			return null;
		}

		const safeContainerHeight = Math.max(containerHeight, SHEET_CUT_VIRTUAL_ITEM_SIZE.h);
		const totalRows = Math.ceil(positions.length / virtualColumns);
		const startRow = Math.max(
			0,
			Math.floor(scrollTop / SHEET_CUT_VIRTUAL_ITEM_SIZE.h) - SHEET_CUT_VIRTUAL_OVERSCAN_ROWS
		);
		const endRow = Math.min(
			totalRows,
			Math.ceil((scrollTop + safeContainerHeight) / SHEET_CUT_VIRTUAL_ITEM_SIZE.h) + SHEET_CUT_VIRTUAL_OVERSCAN_ROWS
		);

		return {
			totalHeight: totalRows * SHEET_CUT_VIRTUAL_ITEM_SIZE.h,
			startIndex: startRow * virtualColumns,
			endIndex: Math.min(positions.length, endRow * virtualColumns),
		};
	}, [containerHeight, positions.length, scrollTop, shouldVirtualize, virtualColumns]);

	const renderCard = (position, index, cardStyle) => {
		const partId = position.part_id;

		return (
			<SheetCutPreviewCard
				key={partId}
				partId={partId}
				position={position}
				index={index}
				partName={partNameByCodeId.get(position.part_code_id)}
				WH={WH}
				miniSvg={miniSvg}
				positionTransform={getPositionTransform(position)}
				setHoveredPart={setHoveredPart}
				isHovered={hoverPartId === partId}
				isActive={activePartId === partId}
				isCompleted={index < completedCount}
				cardStyle={cardStyle}
			/>
		);
	};

	const cards = !shouldVirtualize
		? positions.map((position, index) => renderCard(position, index))
		: [];
	const virtualCards = shouldVirtualize && virtualRange
		? positions.slice(virtualRange.startIndex, virtualRange.endIndex).map((position, sliceIndex) => {
			const index = virtualRange.startIndex + sliceIndex;
			const row = Math.floor(index / virtualColumns);
			const column = index % virtualColumns;

			return (
				<div
					key={position.part_id}
					style={{
						position: "absolute",
						top: `${row * SHEET_CUT_VIRTUAL_ITEM_SIZE.h}px`,
						left: `${column * SHEET_CUT_VIRTUAL_ITEM_SIZE.w}px`,
						width: `${SHEET_CUT_VIRTUAL_ITEM_SIZE.w}px`,
						height: `${SHEET_CUT_VIRTUAL_ITEM_SIZE.h}px`,
						padding: `${SHEET_CUT_CARD_MARGIN}px`,
						boxSizing: "border-box",
					}}
				>
					{renderCard(position, index, SHEET_CUT_VIRTUAL_CARD_STYLE)}
				</div>
			);
		})
		: [];

	return (
		<div
			ref={scrollContainerRef}
			onScroll={handleScroll}
			style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
		>
			<div className="gridWrapperCommon">
				<div id="sheetCutSort" style={shouldVirtualize ? { width: "100%" } : undefined}>
					{activeCutOrderMode !== "auto" ? (
						<ReactSortable
							dragClass="sortableDrag"
							filter=".addImageButtonContainer"
							list={positions}
							setList={setList}
							animation={75}
							easing="ease-out"
							className="d-flex flex-row flex-wrap"
						>
							{cards}
						</ReactSortable>
					) : shouldVirtualize && virtualRange ? (
						<div
							style={{
								position: "relative",
								width: "100%",
								height: `${virtualRange.totalHeight}px`,
							}}
						>
							{virtualCards}
						</div>
					) : (
						<div className="d-flex flex-row flex-wrap">
							{cards}
						</div>
					)}
				</div>
			</div>
		</div>
	);
});

const SheetCutPanel = observer(() => {
	const { t } = useTranslation();
	const WH = SHEET_CUT_CARD_SIZE;
	const miniSvg = SHEET_CUT_MINI_SVG;
	const isMini = panelStore.positions.sheetCutPopup?.mini ?? true;
	const orderedPositions = svgStore.svgData.positions;
	const activeCutOrderMode = svgStore.getSheetCutMode();
	const sectorSize = svgStore.getSheetCutSectorSize();
	const maxSectorSize = svgStore.getSheetCutSectorMax();
	const sectorSizeCommitTimerRef = useRef(null);
	const [sectorSizeInput, setSectorSizeInput] = useState(() => String(sectorSize));

	useEffect(() => {
		svgStore.ensureSheetCutState();
	}, [maxSectorSize, orderedPositions]);

	useEffect(() => {
		setSectorSizeInput(String(sectorSize));
	}, [activeCutOrderMode, sectorSize]);

	const clearPendingSectorSizeCommit = useCallback(() => {
		if (sectorSizeCommitTimerRef.current !== null) {
			clearTimeout(sectorSizeCommitTimerRef.current);
			sectorSizeCommitTimerRef.current = null;
		}
	}, []);

	useEffect(() => () => {
		clearPendingSectorSizeCommit();
	}, [clearPendingSectorSizeCommit]);

	const deactivateCutSimulation = useCallback(() => {
		svgStore.setLaserShow({
			on: false,
			paused: false,
			progress: 0,
			seek: 0,
			activePartId: null,
			hoverPartId: null,
			currentOrder: 0,
			completedCount: 0,
		});
	}, []);

	useEffect(() => () => {
		deactivateCutSimulation();
	}, [deactivateCutSimulation]);

	useEffect(() => {
		const stopOnWindowHide = () => {
			if (svgStore.laserShowPlayback.on) {
				deactivateCutSimulation();
			}
		};

		const stopOnVisibilityChange = () => {
			if (document.visibilityState !== "visible" && svgStore.laserShowPlayback.on) {
				deactivateCutSimulation();
			}
		};

		window.addEventListener("blur", stopOnWindowHide);
		window.addEventListener("beforeunload", stopOnWindowHide);
		window.addEventListener("pagehide", stopOnWindowHide);
		document.addEventListener("visibilitychange", stopOnVisibilityChange);

		return () => {
			window.removeEventListener("blur", stopOnWindowHide);
			window.removeEventListener("beforeunload", stopOnWindowHide);
			window.removeEventListener("pagehide", stopOnWindowHide);
			document.removeEventListener("visibilitychange", stopOnVisibilityChange);
		};
	}, [deactivateCutSimulation]);

	const setShowSpeed = useCallback((e) => {
		const val = clamp(Number(e.currentTarget.value) || 50, 1, 100);
		svgStore.setLaserShow({
			on: svgStore.laserShowPlayback.on,
			paused: svgStore.laserShowPlayback.paused,
			speed: val,
		});
	}, []);

	const setHoveredPart = useCallback((partId = null) => {
		if ((svgStore.laserShowVisual.hoverPartId ?? null) === partId) return;
		svgStore.setLaserShow({ hoverPartId: partId });
	}, []);

	const applyCutOrder = useCallback((mode, nextPositions) => {
		if (!Array.isArray(nextPositions)) return;
		if (nextPositions.length !== svgStore.svgData.positions.length) return;

		const currentIds = svgStore.svgData.positions.map(pos => pos.part_id);
		const nextIds = nextPositions.map(pos => pos.part_id);
		const hasOrderChanged = nextIds.some((partId, index) => partId !== currentIds[index]);
		const previousMode = svgStore.getSheetCutMode();
		const hasModeChanged = previousMode !== mode;

		svgStore.setSheetCutOrderIds(mode, nextIds);
		svgStore.setSheetCutMode(mode);

		if (hasOrderChanged) {
			deactivateCutSimulation();
			svgStore.reorderPositions(nextPositions);
		}

		if (hasOrderChanged || hasModeChanged) {
			addToSheetLog("Sheet cut order was changed");
		}
	}, [deactivateCutSimulation]);

	const commitSectorSize = useCallback((rawValue, { applyAutoOrder = true } = {}) => {
		const previousSectorSize = svgStore.getSheetCutSectorSize();
		const normalizedValue = `${rawValue ?? ""}`.trim();
		const hasFiniteValue = normalizedValue.length > 0 && Number.isFinite(Number(normalizedValue));
		const nextSectorSize = svgStore.setSheetCutSectorSize(
			hasFiniteValue ? normalizedValue : previousSectorSize
		);

		setSectorSizeInput(String(nextSectorSize));

		if (
			applyAutoOrder &&
			svgStore.getSheetCutMode() === "auto" &&
			nextSectorSize !== previousSectorSize
		) {
			applyCutOrder(
				"auto",
				getAutoSheetCutOrder(svgStore.svgData, nextSectorSize)
			);
		}

		return nextSectorSize;
	}, [applyCutOrder]);

	const flushSectorSizeInput = useCallback((options) => {
		clearPendingSectorSizeCommit();
		return commitSectorSize(sectorSizeInput, options);
	}, [clearPendingSectorSizeCommit, commitSectorSize, sectorSizeInput]);

	const scheduleSectorSizeCommit = useCallback((rawValue) => {
		const normalizedValue = `${rawValue ?? ""}`.trim();
		clearPendingSectorSizeCommit();

		if (!normalizedValue.length || !Number.isFinite(Number(normalizedValue))) {
			return;
		}

		sectorSizeCommitTimerRef.current = window.setTimeout(() => {
			sectorSizeCommitTimerRef.current = null;
			commitSectorSize(rawValue);
		}, SECTOR_SIZE_COMMIT_DELAY);
	}, [clearPendingSectorSizeCommit, commitSectorSize]);

	const handleSectorSizeInputChange = useCallback((e) => {
		const nextValue = e.currentTarget.value;
		setSectorSizeInput(nextValue);
		scheduleSectorSizeCommit(nextValue);
	}, [scheduleSectorSizeCommit]);

	const handleSectorSizeBlur = useCallback((e) => {
		clearPendingSectorSizeCommit();
		commitSectorSize(e.currentTarget.value);
	}, [clearPendingSectorSizeCommit, commitSectorSize]);

	const handleSectorSizeKeyDown = useCallback((e) => {
		if (e.key === "Enter") {
			e.currentTarget.blur();
			return;
		}

		if (e.key === "Escape") {
			e.preventDefault();
			clearPendingSectorSizeCommit();
			setSectorSizeInput(String(svgStore.getSheetCutSectorSize()));
		}
	}, [clearPendingSectorSizeCommit]);

	const getCurrentOrderedPositions = useCallback(() => (
		Array.isArray(svgStore.svgData?.positions) ? svgStore.svgData.positions : []
	), []);

	const showSavedOrder = useCallback((mode) => {
		clearPendingSectorSizeCommit();
		setSectorSizeInput(String(svgStore.getSheetCutSectorSize()));
		svgStore.ensureSheetCutState();
		applyCutOrder(
			mode,
			svgStore.getPositionsByPartIds(svgStore.getSheetCutOrderIds(mode))
		);
	}, [applyCutOrder, clearPendingSectorSizeCommit]);

	const setAutoOrder = useCallback(() => {
		svgStore.ensureSheetCutState();
		const nextSectorSize = flushSectorSizeInput({ applyAutoOrder: false });
		applyCutOrder(
			"auto",
			getAutoSheetCutOrder(svgStore.svgData, nextSectorSize)
		);
	}, [applyCutOrder, flushSectorSizeInput]);

	const runCutQue = useCallback(() => {
		if (svgStore.getSheetCutMode() === "auto") {
			flushSectorSizeInput();
		}

		const nextOrderedPositions = getCurrentOrderedPositions();
		if (!nextOrderedPositions.length) return;

		const speed = Number(svgStore.laserShowPlayback.speed) || 50;
		const currentProgress = getLaserShowProgress();
		const nextProgress = currentProgress >= 100
			? 0
			: getRequestedLaserShowProgress();

		svgStore.setLaserShow({
			on: true,
			paused: false,
			speed,
			...getPlaybackStateByProgress(nextOrderedPositions, nextProgress),
		});
	}, [flushSectorSizeInput, getCurrentOrderedPositions]);

	const pauseCutQue = useCallback(() => {
		if (!svgStore.laserShowPlayback.on) return;

		const nextOrderedPositions = getCurrentOrderedPositions();
		if (!nextOrderedPositions.length) return;

		const speed = Number(svgStore.laserShowPlayback.speed) || 50;
		svgStore.setLaserShow({
			on: true,
			paused: true,
			speed,
			...getPlaybackStateByProgress(nextOrderedPositions, getLaserShowProgress()),
		});
	}, [getCurrentOrderedPositions]);

	const stopCutQue = useCallback(() => {
		deactivateCutSimulation();
	}, [deactivateCutSimulation]);

	const setSeekProgress = useCallback((e) => {
		if (svgStore.getSheetCutMode() === "auto") {
			flushSectorSizeInput();
		}

		const nextOrderedPositions = getCurrentOrderedPositions();
		if (!nextOrderedPositions.length) return;

		const value = clamp(+e.currentTarget.value, 0, 100);
		const speed = Number(svgStore.laserShowPlayback.speed) || 50;

		svgStore.setLaserShow({
			on: true,
			paused: true,
			speed,
			...getPlaybackStateByProgress(nextOrderedPositions, value),
		});
	}, [flushSectorSizeInput, getCurrentOrderedPositions]);

	const setList = useCallback((nextPositions) => {
		const activeMode = svgStore.getSheetCutMode();
		if (activeMode === "auto") return;
		if (!nextPositions.length || nextPositions.length !== svgStore.svgData.positions.length) {
			return;
		}

		const currentOrder = svgStore.svgData.positions.map(pos => pos.part_id);
		const nextOrder = nextPositions.map(pos => pos.part_id);
		const hasOrderChanged = nextOrder.some((partId, index) => partId !== currentOrder[index]);

		if (!hasOrderChanged) return;

		applyCutOrder(activeMode === "current" ? "current" : "manual", nextPositions);
	}, [applyCutOrder]);

	const getCutOrderButtonStyle = (mode) => ({
		opacity: activeCutOrderMode === mode ? 1 : 0.55,
		boxShadow: activeCutOrderMode === mode
			? "0 0 0 1px rgba(111, 66, 193, 0.35)"
			: "none",
	});

	const panelInfo = {
		id: "sheetCutPopup",
		fa: (
			<>
				<CustomIcon
					icon="route"
					width="24"
					height="24"
					color="black"
					fill="black"
					strokeWidth={0}
					viewBox="0 0 512 512"
					className={"m-2"}
				/>
				<div>{t("Cutting order")}</div>
			</>
		),
		content: isMini ? null : (
			<div className="d-flex flex-column h-100" style={{ overflow: "hidden" }}>
				<div className="px-2 pt-2 pb-1">
					<SheetCutPlaybackControls
						runCutQue={runCutQue}
						pauseCutQue={pauseCutQue}
						stopCutQue={stopCutQue}
						setShowSpeed={setShowSpeed}
					/>
					<div
						className="d-flex align-items-center justify-content-between flex-wrap px-2 pt-2"
						style={{ gap: "8px" }}
					>
						<div className="btn-group btn-group-sm" role="group" aria-label="sheet cut order mode">
							<button
								type="button"
								className="btn btn-sm violet_button text-white"
								style={getCutOrderButtonStyle("current")}
								onMouseDown={() => showSavedOrder("current")}
							>
								{t("current")}
							</button>
							<button
								type="button"
								className="btn btn-sm violet_button text-white"
								style={getCutOrderButtonStyle("auto")}
								onMouseDown={setAutoOrder}
							>
								{t("auto")}
							</button>
						</div>
						<div className="d-flex align-items-center">
							<label
								htmlFor="sheetCutSectorSize"
								className="me-2 mb-0 text-nowrap"
								style={{ fontSize: "12px" }}
							>
								sectorSize
							</label>
							<input
								id="sheetCutSectorSize"
								type="number"
								className="form-control form-control-sm"
								style={{ width: "96px" }}
								step={1}
								min={1}
								max={maxSectorSize}
								value={sectorSizeInput}
								onChange={handleSectorSizeInputChange}
								onBlur={handleSectorSizeBlur}
								onKeyDown={handleSectorSizeKeyDown}
							/>
						</div>
						<div className="text-nowrap" style={{ fontSize: "12px" }}>
							order: <strong>{activeCutOrderMode}</strong>
						</div>
					</div>
					<SheetCutPlaybackProgress
						totalCount={orderedPositions.length}
						setSeekProgress={setSeekProgress}
					/>
					<div className="d-flex flex-column" id="editSheetCutPartSquare" />
					<div className="d-flex flex-column" id="sheetCutPartModel" />
				</div>
				<div
					className="px-2 pb-2"
					style={{ flex: 1, minHeight: 0, overflow: "hidden" }}
				>
					<SheetCutPositionGrid
						positions={orderedPositions}
						activeCutOrderMode={activeCutOrderMode}
						setList={setList}
						setHoveredPart={setHoveredPart}
						WH={WH}
						miniSvg={miniSvg}
					/>
				</div>
			</div>
		),
	};

	return (
		<>
			<SheetCutPlaybackController
				orderedPositions={orderedPositions}
				deactivateCutSimulation={deactivateCutSimulation}
			/>
			<Panel key={"panelSheetCut"} element={panelInfo} index={14} />
		</>
	);
});

export default SheetCutPanel;
