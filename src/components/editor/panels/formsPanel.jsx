import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import svgStore from "../../../store/svgStore.jsx";
import macrosStore from "../../../store/macrosStore.jsx";
import laserStore from "../../../store/laserStore.jsx";
import panelStore from "../../../store/panelStore.jsx";
import CustomIcon from '../../../icons/customIcon.jsx';
import { useTranslation } from 'react-i18next';
import partStore from "../../../store/partStore.jsx"
import { addToSheetLog } from '../../../scripts/addToSheetLog.jsx';
import util from '../../../scripts/util.jsx';

const getEventClientPoint = (event) => {
	if (event?.touches?.length) {
		return {
			x: event.touches[0].clientX,
			y: event.touches[0].clientY,
		};
	}

	if (event?.changedTouches?.length) {
		return {
			x: event.changedTouches[0].clientX,
			y: event.changedTouches[0].clientY,
		};
	}

	if (typeof event?.clientX === 'number' && typeof event?.clientY === 'number') {
		return {
			x: event.clientX,
			y: event.clientY,
		};
	}

	return null;
};

const matrixToString = (matrix) => (
	`matrix(${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f})`
);

const isTouchLikeEvent = (event) => {
	const eventType = event?.type || event?.nativeEvent?.type || '';
	return String(eventType).startsWith('touch');
};


const FormsPanel = observer(() => {

	const { t } = useTranslation()
	const [dragPreview, setDragPreview] = useState(null);
	const dragStateRef = useRef({
		active: false,
		part: null,
		partCodeId: null,
		definitionId: null,
		bounds: null,
		lastClientPoint: null,
	});
	const dragListenersRef = useRef(null);
	const dragFrameRef = useRef(null);

	const getPartBounds = (part) => {
		const numericBounds = {
			x: Number(part?.x),
			y: Number(part?.y),
			width: Number(part?.width),
			height: Number(part?.height),
		};

		const hasStoredBounds = Object.values(numericBounds).every(Number.isFinite) &&
			numericBounds.width > 0 &&
			numericBounds.height > 0;

		if (hasStoredBounds) {
			return numericBounds;
		}

		const sourcePart = Array.isArray(part?.code)
			? part
			: svgStore.svgData.part_code.find(item =>
				item?.uuid === part?.uuid ||
				item?.id === part?.id
			);

		if (Array.isArray(sourcePart?.code)) {
			const box = svgStore.findBox(sourcePart.code);
			if (box) {
				return {
					x: Number(box.x) || 0,
					y: Number(box.y) || 0,
					width: Number(box.width) || 0,
					height: Number(box.height) || 0,
				};
			}
		}

		return { x: 0, y: 0, width: 0, height: 0 };
	};

	const getPartCodeId = (part) => part?.uuid ?? part?.id ?? null;
	const getPartDefinitionId = (part) => part?.id ?? part?.uuid ?? null;

	const buildPartMatrixFromCenterPoint = (bounds, point) => {
		const centerX = bounds.x + bounds.width / 2;
		const centerY = bounds.y + bounds.height / 2;

		return {
			a: 1,
			b: 0,
			c: 0,
			d: 1,
			e: point.x - centerX,
			f: point.y - centerY,
		};
	};

	const stopDragFrame = () => {
		if (dragFrameRef.current !== null) {
			window.cancelAnimationFrame(dragFrameRef.current);
			dragFrameRef.current = null;
		}
	};

	const removeDragListeners = () => {
		const listeners = dragListenersRef.current;
		if (!listeners) return;

		document.removeEventListener('mousemove', listeners.mousemove);
		document.removeEventListener('mouseup', listeners.mouseup);
		document.removeEventListener('touchmove', listeners.touchmove);
		document.removeEventListener('touchend', listeners.touchend);
		document.removeEventListener('touchcancel', listeners.touchcancel);
		dragListenersRef.current = null;
	};

	const resetDragState = () => {
		stopDragFrame();
		removeDragListeners();
		setDragPreview(null);
		dragStateRef.current = {
			active: false,
			part: null,
			partCodeId: null,
			definitionId: null,
			bounds: null,
			lastClientPoint: null,
		};
	};

	const updateDragPreview = (clientX, clientY) => {
		const dragState = dragStateRef.current;
		if (!dragState.active || !dragState.bounds || !dragState.definitionId) return;

		const groupEl = document.getElementById('group');
		const svgEl = document.getElementById('svg');
		if (!groupEl || !svgEl) return;

		const screenMatrix = groupEl.getScreenCTM();
		if (!screenMatrix) return;

		const point = util.convertScreenCoordsToSvgCoords(clientX, clientY);
		const previewMatrix = svgEl.createSVGMatrix();
		const partMatrix = buildPartMatrixFromCenterPoint(dragState.bounds, point);

		previewMatrix.a = partMatrix.a;
		previewMatrix.b = partMatrix.b;
		previewMatrix.c = partMatrix.c;
		previewMatrix.d = partMatrix.d;
		previewMatrix.e = partMatrix.e;
		previewMatrix.f = partMatrix.f;

		const screenPreviewMatrix = screenMatrix.multiply(previewMatrix);

		setDragPreview({
			definitionId: dragState.definitionId,
			transform: matrixToString(screenPreviewMatrix),
		});
	};

	const scheduleDragPreviewUpdate = (clientX, clientY) => {
		dragStateRef.current.lastClientPoint = { x: clientX, y: clientY };
		if (dragFrameRef.current !== null) return;

		dragFrameRef.current = window.requestAnimationFrame(() => {
			dragFrameRef.current = null;
			const point = dragStateRef.current.lastClientPoint;
			if (!point) return;
			updateDragPreview(point.x, point.y);
		});
	};

	const isPointOverSheet = (clientX, clientY) => {
		const wrapper = document.getElementById('wrapper_svg');
		const target = document.elementFromPoint(clientX, clientY);

		return Boolean(
			wrapper &&
			target &&
			(target === wrapper || wrapper.contains(target))
		);
	};

	const addAtClientPoint = (part, clientX, clientY) => {
		const partCodeId = getPartCodeId(part);
		if (partCodeId === null) return;

		const bounds = getPartBounds(part);
		const point = util.convertScreenCoordsToSvgCoords(clientX, clientY);
		const positions = buildPartMatrixFromCenterPoint(bounds, point);

		svgStore.addPosition({
			part_id: svgStore.nextPosId,
			part_code_id: partCodeId,
			selected: false,
			positions,
		});

		addToSheetLog('Part added');
	};

	const finishPartDrag = (point = dragStateRef.current.lastClientPoint) => {
		const { active, part } = dragStateRef.current;
		resetDragState();

		if (!active || !part || !point) return;
		if (!isPointOverSheet(point.x, point.y)) return;

		addAtClientPoint(part, point.x, point.y);
	};

	const startPartDrag = (event, part) => {
		if (!isTouchLikeEvent(event)) {
			event.preventDefault();
		}
		event.stopPropagation();

		const point = getEventClientPoint(event);
		const partCodeId = getPartCodeId(part);
		const definitionId = getPartDefinitionId(part);

		if (!point || partCodeId === null || definitionId === null) return;

		resetDragState();
		dragStateRef.current = {
			active: true,
			part,
			partCodeId,
			definitionId,
			bounds: getPartBounds(part),
			lastClientPoint: point,
		};

		const listeners = {
			mousemove: (moveEvent) => {
				if (!dragStateRef.current.active) return;
				scheduleDragPreviewUpdate(moveEvent.clientX, moveEvent.clientY);
			},
			mouseup: (upEvent) => {
				finishPartDrag(getEventClientPoint(upEvent));
			},
			touchmove: (moveEvent) => {
				if (!dragStateRef.current.active) return;
				moveEvent.preventDefault();
				const movePoint = getEventClientPoint(moveEvent);
				if (!movePoint) return;
				scheduleDragPreviewUpdate(movePoint.x, movePoint.y);
			},
			touchend: (endEvent) => {
				finishPartDrag(getEventClientPoint(endEvent));
			},
			touchcancel: (cancelEvent) => {
				finishPartDrag(getEventClientPoint(cancelEvent));
			},
		};

		dragListenersRef.current = listeners;
		document.addEventListener('mousemove', listeners.mousemove);
		document.addEventListener('mouseup', listeners.mouseup);
		document.addEventListener('touchmove', listeners.touchmove, { passive: false });
		document.addEventListener('touchend', listeners.touchend);
		document.addEventListener('touchcancel', listeners.touchcancel);

		scheduleDragPreviewUpdate(point.x, point.y);
	};

	const add = (part) => {
		let id = svgStore.nextPosId
		const partCodeId = part?.uuid ?? part?.id;
		if (partCodeId === undefined || partCodeId === null) return;

		const bounds = getPartBounds(part);
		const x = -bounds.x;
		const y = svgStore.svgData.height - (bounds.y + bounds.height);

		svgStore.addPosition (
			{
				"part_id": id,
				"part_code_id": partCodeId,
				"selected":false,
				"positions": { "a": 1, "b": 0, "c": 0, "d": 1, "e": x, "f": y},				
			}
		)

		addToSheetLog('Part added');
	}

	useEffect(() => {
		return () => {
			removeDragListeners();
			stopDragFrame();
		};
	}, []);

	const deleteAllWithLog = (uuid) => {
		const before = svgStore.svgData.positions.length;
		svgStore.deleteAll(uuid);
		if (svgStore.svgData.positions.length !== before) {
			addToSheetLog('All parts of this type deleted');
		}
	};

	const deleteAll = (uuid) => {
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete all parts of this type?',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			func: deleteAllWithLog,
			args: [uuid]
		})

	}

	const startEditor = (a) => {
		//console.log("Starting editor with  ")
		//console.log(JSON.stringify(a))
		//partStore.printStore()
		laserStore.setVal("centralBarMode", "partEditor")
		partStore.setSvgData(JSON.parse(JSON.stringify(a)));
		partStore.setVal( "partInEdit", a.uuid )
		partStore.setVal("savePartToDbOnExit", false);
		partStore.printStore()

	}

	const selectedPartCodeId = svgStore.selectedPosition?.part_code_id ?? null;
	const isDocked = panelStore.dockMode;

	const panelInfo =
	{
		id: "formsPopup",
		fa: (
			<>
				<CustomIcon
					icon="fa-shapes"
					width="20"
					height="20"
					fill='black'
					strokeWidth={0}
					viewBox='0 0 512 512'
					className="m-2"
				/>
				<div>{t('Part')}</div>
			</>
		),
		content: (
			<div className={`formsPanelContent ${isDocked ? "formsPanelContentDocked" : ""}`}>
				<div className={`containerTable ${isDocked ? "containerTableDocked" : ""}`}>
					<table id="partListContainer" className="table mb-0">
					<thead className="table-white formsPanelStickyHead">
						<tr>
							<th className="formsPanelHeaderCell" scope="col" style={{ textAlign: "center" }}>
								#
							</th>
							<th className="formsPanelHeaderCell longText longText5" scope="col" style={{ textAlign: "center" }}>
								{t("id")}
							</th>

							<th className="formsPanelHeaderCell" scope="col" style={{ textAlign: "center" }}>
								{t("amount")}
							</th>
							<th className="formsPanelHeaderCell" scope="col" style={{ textAlign: "center" }}>
								{t("pic")}
							</th>
							<th className="formsPanelHeaderCell" scope="col" style={{ textAlign: "center" }}>
								{t("action")}
							</th>
						</tr>
					</thead>		
						<tbody>
							{
								svgStore.svgData.part_code.map((a, index) => {
									const partCodeId = getPartCodeId(a);
									const partDefinitionId = getPartDefinitionId(a);
									const partCount = svgStore.svgData.positions.filter(
										pos => pos.part_code_id === partCodeId
									).length;
									const isSelectedPartType = selectedPartCodeId === partCodeId;

									return (
										<tr key={index}>
											<td className="  align-middle" scope="col">
												{Number(index + 1)}
											</td>
											<td className="  longText longText5 align-middle" scope="col">
												Part_{Number(index + 1)}
											</td>
											<td className="  align-middle" scope="col">
												{partCount}
											</td>
											<td scope="col" >
												<button
													type="button"
													className="white_button navbar_button small_button40 d-flex align-items-center justify-content-center"
													onMouseDown={(event) => { startPartDrag(event, a); }}
													onTouchStart={(event) => { startPartDrag(event, a); }}
													onDragStart={(event) => {
														event.preventDefault();
													}}
													style={{ touchAction: 'none', cursor: 'grab' }}
												>
													<svg
														viewBox={ `${a.x} ${a.y} ${a.width} ${a.height}`}
														xmlns="http://www.w3.org/2000/svg"
														width='28'
														height='28'
														style={{
															transform: 'rotate(-90deg)',
															transformOrigin: 'center center',
														}}
													>
														<use
															href={`#part_${partDefinitionId}`}
															fill={isSelectedPartType ? "var(--violetTransparent)" : "var(--grey-nav)"}
															stroke={isSelectedPartType ? "var(--violetTransparent)" : "var(--grey-nav)"}
															pointerEvents="visiblePainted"
														/>
													</svg>
												</button>
											</td>
											<td className=" " scope="col">
												<div className='d-flex align-items-center justify-content-center'>												
													<div className='d-flex'>
														<button
															className={`white_button navbar_button small_button40 me-2`} 
															onPointerDown={ (event) => {
																event.stopPropagation();
																add(a);
															}}>
															<div className="d-flex align-items-center justify-content-center">
																<CustomIcon icon="plus"
																	width="24"
																	height="24"
																	fill='var(--violet)'
																	color="none"
																	viewBox="0 0 24 24"
																/>
															</div>
														</button>
														<button
															className={`white_button navbar_button small_button40 me-2`} 
															onPointerDown={(event) => {
																event.stopPropagation();
																deleteAll(a.uuid);
															}}>
															<div className="d-flex align-items-center justify-content-center">
															<CustomIcon
																icon="ic:twotone-delete-outline"
																width="24"
																height="24"
																fill='var(--violet)'
																strokeWidth={0}
															/>
															</div>
														</button>
														<button
															className={`white_button navbar_button small_button40 me-2`} 
															onPointerDown={(event) => {
																event.stopPropagation();
																startEditor(a);
															}}>
															<div className="d-flex align-items-center justify-content-center">
															<CustomIcon 
																icon="bytesize:edit"
																width="20"
																height="20"
																color="var(--violet)"
																viewBox="0 0 32 32"
																strokeWidth={3}
															/>
															</div>
														</button>
													</div>
												</div>
											</td>
										</tr>
									)
								})
							}
							<tr key="final">
								<td colSpan={1}>#</td>
								<td>{t("Total")}: </td>
								<td>{ svgStore.svgData.positions.length }</td>
								<td colSpan={1}></td>
								<td colSpan={1}></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		),
	}

	return (
		<>
			<Panel key={'panel' + 14} element={panelInfo} index={14} />
			{dragPreview && createPortal(
				<div
					style={{
						position: 'fixed',
						inset: 0,
						pointerEvents: 'none',
						zIndex: 9999,
					}}
				>
					<svg
						width="100%"
						height="100%"
						aria-hidden="true"
						style={{ overflow: 'visible' }}
					>
						<use
							href={`#part_${dragPreview.definitionId}`}
							transform={dragPreview.transform}
							fill="var(--violetTransparent)"
							stroke="var(--violet)"
							color="var(--violet)"
							opacity={0.92}
						/>
					</svg>
				</div>,
				document.body
			)}
		</>
	);
})

export default FormsPanel;





