import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { runInAction } from 'mobx';
import coordsStore from './../../store/coordStore.jsx';
import editorStore from './../../store/editorStore.jsx';
import svgStore from './../../store/svgStore.jsx';
import sheetLog from './../../scripts/sheetLog.jsx';
import sheetLogStore from './../../store/sheetLogStore.jsx';
import { addToSheetLog } from './../../scripts/addToSheetLog.jsx';
import util from './../../scripts/util.jsx';
import SvgComponent from './svgComponent.jsx';

const SvgWrapper = observer(() => {
	const TOUCH_SHEET_SAFETY_MOVE_EPSILON = 0.1;
	const TOUCH_SHEET_SAFETY_MIN_INTERVAL_MS = 32;
	const { matrix, groupMatrix } = svgStore;
 	const wrapperRef = useRef(null);
	const inMoveRef = useRef(false);
	const startOffset = useRef({ x: 0, y: 0 });

	const dragState = useRef({
		isDragging: false,
		startX: 0,
		startY: 0,
		initialMatrices: new Map(), // part_id → { e, f }
		hasMoved: false,
		lastTouchPreviewSvgX: null,
		lastTouchPreviewSvgY: null,
		lastTouchPreviewTs: 0,
	});
	const selectionState = useRef({
		isSelecting: false,
		startSvgX: 0,
		startSvgY: 0,
		currentSvgX: 0,
		currentSvgY: 0,
	});
	const safetyPreviewFrameRef = useRef(null);
	const touchDragHandlerRef = useRef(null);
	const touchEndHandlerRef = useRef(null);
	const hasActiveTouchInteractionRef = useRef(() => false);

	// Touch state
	const evCache = useRef([]);                         // массив Touch
	const prevDiff = useRef(-1);                        // расстояние между пальцами

	const [wrapperClass, setWrapperClass] = useState('');

	const getSelectedPartIds = () => (
		svgStore.svgData.positions
			.filter(part => part.selected)
			.map(part => part.part_id)
	);

	const cancelSheetSafetyPreview = () => {
		if (safetyPreviewFrameRef.current !== null) {
			window.cancelAnimationFrame(safetyPreviewFrameRef.current);
			safetyPreviewFrameRef.current = null;
		}
	};

	const runSheetSafetyPreview = () => {
		cancelSheetSafetyPreview();
		const selectedPartIds = getSelectedPartIds();
		svgStore.recalculateSheetSafety({
			partIds: selectedPartIds.length ? selectedPartIds : null,
		});
	};

	const scheduleSheetSafetyPreview = () => {
		if (safetyPreviewFrameRef.current !== null) {
			return;
		}

		safetyPreviewFrameRef.current = window.requestAnimationFrame(() => {
			safetyPreviewFrameRef.current = null;
			runSheetSafetyPreview();
		});
	};

	const hasActiveTouchInteraction = () => (
		selectionState.current.isSelecting ||
		dragState.current.isDragging ||
		inMoveRef.current ||
		evCache.current.length > 0
	);

	const shouldScheduleTouchSheetSafetyPreview = (currentSvg) => {
		if (!currentSvg) {
			return false;
		}

		const lastX = Number(dragState.current.lastTouchPreviewSvgX);
		const lastY = Number(dragState.current.lastTouchPreviewSvgY);
		const movedEnough = !Number.isFinite(lastX) ||
			!Number.isFinite(lastY) ||
			Math.hypot(currentSvg.x - lastX, currentSvg.y - lastY) >= TOUCH_SHEET_SAFETY_MOVE_EPSILON;
		if (!movedEnough) {
			return false;
		}

		const now = performance.now();
		if (now - dragState.current.lastTouchPreviewTs < TOUCH_SHEET_SAFETY_MIN_INTERVAL_MS) {
			return false;
		}

		dragState.current.lastTouchPreviewSvgX = currentSvg.x;
		dragState.current.lastTouchPreviewSvgY = currentSvg.y;
		dragState.current.lastTouchPreviewTs = now;
		return true;
	};

	const buildSelectionRect = (startX, startY, currentX, currentY) => ({
		x: Math.min(startX, currentX),
		y: Math.min(startY, currentY),
		width: Math.abs(currentX - startX),
		height: Math.abs(currentY - startY),
	});

	const startSelection = (clientX, clientY) => {
		const startSvg = util.convertScreenCoordsToSvgCoords(clientX, clientY);
		selectionState.current = {
			isSelecting: true,
			startSvgX: startSvg.x,
			startSvgY: startSvg.y,
			currentSvgX: startSvg.x,
			currentSvgY: startSvg.y,
		};
		svgStore.setSelectionRect(
			buildSelectionRect(startSvg.x, startSvg.y, startSvg.x, startSvg.y)
		);
	};

	const updateSelection = (clientX, clientY) => {
		if (!selectionState.current.isSelecting) {
			return;
		}

		const currentSvg = util.convertScreenCoordsToSvgCoords(clientX, clientY);
		selectionState.current.currentSvgX = currentSvg.x;
		selectionState.current.currentSvgY = currentSvg.y;
		svgStore.setSelectionRect(
			buildSelectionRect(
				selectionState.current.startSvgX,
				selectionState.current.startSvgY,
				currentSvg.x,
				currentSvg.y
			)
		);
	};

	const clearSelectionRect = () => {
		selectionState.current = {
			isSelecting: false,
			startSvgX: 0,
			startSvgY: 0,
			currentSvgX: 0,
			currentSvgY: 0,
		};
		svgStore.setSelectionRect(null);
	};

	const finishSelection = () => {
		if (!selectionState.current.isSelecting) {
			return false;
		}

		const rect = buildSelectionRect(
			selectionState.current.startSvgX,
			selectionState.current.startSvgY,
			selectionState.current.currentSvgX,
			selectionState.current.currentSvgY
		);
		svgStore.selectIntersecting(rect);
		clearSelectionRect();
		return true;
	};

	// =============== WHEEL ZOOM ===============
	const handleMouseWheel = (e) => {
		//e.preventDefault();
		const svg = document.getElementById('svg');
		if (!svg) return;

		const groupEl = document.getElementById('group');
		const current = groupEl.transform.baseVal.consolidate()?.matrix;
		if (!current) return;

		const point = util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
		const scale = e.deltaY > 0 ? 0.9 : 1.1;

		let t = svg.createSVGMatrix()
			.translate(point.x, point.y)
			.scale(scale)
			.translate(-point.x, -point.y);

		const newMatrix = current.multiply(t);

		svgStore.setMatrix({
			a: newMatrix.a, b: newMatrix.b,
			c: newMatrix.c, d: newMatrix.d,
			e: newMatrix.e, f: newMatrix.f,
		});
	};

	// =============== PINCH ZOOM ===============
	const touchZoom = (scale, centerX, centerY) => {
		const svg = document.getElementById('svg');
		if (!svg) return;

		const groupEl = document.getElementById('group');
		const current = groupEl.transform.baseVal.consolidate()?.matrix;
		if (!current) return;

		const point = util.convertScreenCoordsToSvgCoords(centerX, centerY);

		let t = svg.createSVGMatrix()
			.translate(point.x, point.y)
			.scale(scale)
			.translate(-point.x, -point.y);

		const newMatrix = current.multiply(t);

		svgStore.setMatrix({
			a: newMatrix.a, b: newMatrix.b,
			c: newMatrix.c, d: newMatrix.d,
			e: newMatrix.e, f: newMatrix.f,
		});
	};

	const getDistance = (t1, t2) => {
		const dx = t1.clientX - t2.clientX;
		const dy = t1.clientY - t2.clientY;
		return Math.hypot(dx, dy);
	};

	// =============== TOUCH HANDLERS ===============
	const TouchStart = (e) => {
		const touches = e.touches;

		if (editorStore.mode === "selector" && touches.length === 1) {
			startSelection(touches[0].clientX, touches[0].clientY);
			return;
		}

		if (editorStore.mode === "resize" || editorStore.mode === "selector") {
			evCache.current = Array.from(touches);

			if (inMoveRef.current) return;
			if (touches.length === 1) {
				inMoveRef.current = true;
				const touch = touches[0];
				const pos = util.getMousePosition(touch);

				startOffset.current = {
					x: pos.x - groupMatrix.e,
					y: pos.y - groupMatrix.f,
				};
			}

		} else if (editorStore.mode === "dragging") {
			const selected = svgStore.svgData.positions.filter(p => p.selected);
			if (selected.length === 0) return;
			const touch = e.touches[0]
			const startSvg = util.convertScreenCoordsToSvgCoords(touch.clientX, touch.clientY);

			dragState.current = {
				isDragging: true,
				startSvgX: startSvg.x,
				startSvgY: startSvg.y,
				initialMatrices: new Map(
					selected.map(part => [
						part.part_id,
						{ e: part.positions.e, f: part.positions.f }
					])
				),
				hasMoved: false,
				lastTouchPreviewSvgX: startSvg.x,
				lastTouchPreviewSvgY: startSvg.y,
				lastTouchPreviewTs: performance.now(),
			};
			e.stopPropagation();
			//e.preventDefault()			

		}

	};

	const TouchDrag = (e) => {
		if (!hasActiveTouchInteraction()) {
			return;
		}
		e.preventDefault();
		const touches = e.touches;
		evCache.current = Array.from(touches);
		///console.log ("TouchStart mode: " + editorStore.mode)
		
		if (selectionState.current.isSelecting) {
			const touch = touches[0];
			if (!touch) return;
			updateSelection(touch.clientX, touch.clientY);
			return;
		}

		if (editorStore.mode === "resize" || editorStore.mode === "selector") {

			if (touches.length === 1 && inMoveRef.current) {

				const touch = touches[0];
				const pos = util.getMousePosition(touch);
				const newE = pos.x - startOffset.current.x;
				const newF = pos.y - startOffset.current.y;

				svgStore.setGroupMatrix({
					a: groupMatrix.a, b: groupMatrix.b,
					c: groupMatrix.c, d: groupMatrix.d,
					e: newE, f: newF,
				});

			}	else if (touches.length === 2) {

				inMoveRef.current = true;
				const t1 = touches[0];
				const t2 = touches[1];
				const curDiff = getDistance(t1, t2);

				if (prevDiff.current > 0) {
					const scale = curDiff / prevDiff.current;
					const centerX = (t1.clientX + t2.clientX) / 2;
					const centerY = (t1.clientY + t2.clientY) / 2;

					touchZoom(scale, centerX, centerY);
				}

				prevDiff.current = curDiff;
			}
		} else if (editorStore.mode === "dragging") {

			const touch = e.touches[0]
			if (!dragState.current.isDragging) return;

			// Текущая позиция мыши в координатах SVG
			const currentSvg = util.convertScreenCoordsToSvgCoords(touch.clientX, touch.clientY);
			const dx = currentSvg.x - dragState.current.startSvgX;
			const dy = currentSvg.y - dragState.current.startSvgY;
			dragState.current.hasMoved = dragState.current.hasMoved || dx !== 0 || dy !== 0;

			runInAction(() => {
				svgStore.svgData.positions.forEach(part => {
					if (part.selected) {
						const initial = dragState.current.initialMatrices.get(part.part_id);
						if (initial) {
							part.positions.e = initial.e + dx;
							part.positions.f = initial.f + dy;
						}
					}
				});
			});
			if (shouldScheduleTouchSheetSafetyPreview(currentSvg)) {
				scheduleSheetSafetyPreview();
			}

		}

	}

	const handleTouchEnd = (e) => {
		if (!hasActiveTouchInteraction()) {
			return;
		}
		e.preventDefault();
		// Удаляем ушедшие пальцы
 		for (let i = 0; i < e.changedTouches.length; i++) {
			const idx = evCache.current.findIndex(t => t.identifier === e.changedTouches[i].identifier);
			if (idx >= 0) evCache.current.splice(idx, 1);
		}
		if ((e.touches?.length || 0) > 0) {
			evCache.current = Array.from(e.touches);
			if (e.touches.length < 2) {
				prevDiff.current = -1;
			}
			return;
		}

		if (!finishSelection()) {
			endDrag();
		}
		inMoveRef.current = false;
		prevDiff.current = -1;
		evCache.current = [];
		
 	};

	// =============== MOUSE DRAG ===============
	const MouseStartDrag = (e) => {

		if (e.button === 1) {// mid button
			inMoveRef.current = true;
			const pos = util.getMousePosition(e);
			startOffset.current = {
				x: pos.x - groupMatrix.e,
				y: pos.y - groupMatrix.f,
			};
			//editorStore.setMode('drag');
		} else if (e.button === 0 && editorStore.mode === 'selector') {
			startSelection(e.clientX, e.clientY);
			return;
		} else if (e.buttons === 1 /*&& editorStore.mode === "dragging"*/) {
			const selected = svgStore.svgData.positions.filter(p => p.selected);
			if (selected.length === 0) return;

			// Ключевое: сохраняем позицию мыши в координатах SVG!
			const startSvg = util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);

			dragState.current = {
				isDragging: true,
				startSvgX: startSvg.x,
				startSvgY: startSvg.y,
				initialMatrices: new Map(
					selected.map(part => [
						part.part_id,
						{ e: part.positions.e, f: part.positions.f }
					])
				),
				hasMoved: false,
				lastTouchPreviewSvgX: null,
				lastTouchPreviewSvgY: null,
				lastTouchPreviewTs: 0,
			};
			e.stopPropagation();
		};

	};

	const MouseDrag = (e) => {
		if (selectionState.current.isSelecting) {
			updateSelection(e.clientX, e.clientY);
			return;
		}

		if (e.button === 0 && inMoveRef.current) {
			
			const pos = util.getMousePosition(e);
			const newE = pos.x - startOffset.current.x;
			const newF = pos.y - startOffset.current.y;

			svgStore.setGroupMatrix({
				a: groupMatrix.a, b: groupMatrix.b,
				c: groupMatrix.c, d: groupMatrix.d,
				e: newE, f: newF,
			});

		} else if (editorStore.mode === 'dragging') {
			
			if (!dragState.current.isDragging) return;

			// Текущая позиция мыши в координатах SVG
			const currentSvg = util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);

			const dx = currentSvg.x - dragState.current.startSvgX;
			const dy = currentSvg.y - dragState.current.startSvgY;
			dragState.current.hasMoved = dragState.current.hasMoved || dx !== 0 || dy !== 0;

			runInAction(() => {
				svgStore.svgData.positions.forEach(part => {
					if (part.selected) {
						const initial = dragState.current.initialMatrices.get(part.part_id);
						if (initial) {
							part.positions.e = initial.e + dx;
							part.positions.f = initial.f + dy;
						}
					}
				});
			});
			scheduleSheetSafetyPreview();
		}
	};

	const endDrag = () => {
		if (finishSelection()) {
			inMoveRef.current = false;
			return;
		}

		inMoveRef.current = false;
		cancelSheetSafetyPreview();
		console.log ("END DRAG")
		const shouldLogMove = dragState.current.isDragging && dragState.current.hasMoved;
		if (editorStore.mode === 'dragging') {
			editorStore.setMode('resize');
			svgStore.deleteOutParts({ recalculate: false })
		}
		svgStore.recalculateSheetSafety();
		if (dragState.current.isDragging) {
			dragState.current.isDragging = false;
			dragState.current.hasMoved = false;
			dragState.current.lastTouchPreviewSvgX = null;
			dragState.current.lastTouchPreviewSvgY = null;
			dragState.current.lastTouchPreviewTs = 0;
			dragState.current.initialMatrices.clear();
			//editorStore.setMode('resize');
		}
		if (shouldLogMove) {
			addToSheetLog('Part position updated');
		}
	};

	const leave = () => {
		endDrag()
	};

	useEffect(() => {
		touchDragHandlerRef.current = TouchDrag;
		touchEndHandlerRef.current = handleTouchEnd;
		hasActiveTouchInteractionRef.current = hasActiveTouchInteraction;
	});

	// =============== EFFECTS ===============
	useEffect(() => {
		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const handleWheel = (e) => {
			e.preventDefault(); // теперь можно!
			handleMouseWheel(e);
		};

		wrapper.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			wrapper.removeEventListener('wheel', handleWheel);
		};
	}, []);

	useEffect(() => {
		const touchListenerOptions = { passive: false };
		const handleWindowTouchMove = (e) => {
			if (!hasActiveTouchInteractionRef.current()) {
				return;
			}
			touchDragHandlerRef.current?.(e);
		};
		const handleWindowTouchEnd = (e) => {
			if (!hasActiveTouchInteractionRef.current()) {
				return;
			}
			touchEndHandlerRef.current?.(e);
		};

		window.addEventListener('touchmove', handleWindowTouchMove, touchListenerOptions);
		window.addEventListener('touchend', handleWindowTouchEnd, touchListenerOptions);
		window.addEventListener('touchcancel', handleWindowTouchEnd, touchListenerOptions);

		return () => {
			window.removeEventListener('touchmove', handleWindowTouchMove, touchListenerOptions);
			window.removeEventListener('touchend', handleWindowTouchEnd, touchListenerOptions);
			window.removeEventListener('touchcancel', handleWindowTouchEnd, touchListenerOptions);
		};
	}, []);

	useEffect(() => {
		svgStore.recalculateSheetSafety();
		return () => {
			cancelSheetSafetyPreview();
			clearSelectionRect();
		};
	}, []);

	useEffect(() => {
		if (coordsStore.needToFit) {
			svgStore.fitToPage();
		}
	}, [coordsStore.needToFit]);

	useEffect(() => {
		const handleKeyDown = (e) => {
			const tagName = e.target?.tagName?.toLowerCase();
			const isEditable = e.target?.isContentEditable || ['input', 'textarea', 'select'].includes(tagName);
			if (isEditable) return;

			const key = e.key.toLowerCase();

			if (e.ctrlKey && e.shiftKey && (key === 'z' || key === 'я')) {
				e.preventDefault();
				sheetLogStore.setNext();
				sheetLog.restorePoint();
			} else if (e.ctrlKey && (key === 'z' || key === 'я')) {
				e.preventDefault();
				sheetLogStore.setPrev();
				sheetLog.restorePoint();
			}
		};

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	}, []);

	useEffect(() => {
		const mode = editorStore.mode;
		if (mode !== 'selector' && selectionState.current.isSelecting) {
			clearSelectionRect();
		}
		const classes = {
			resize: 'cursorArrow',
			selector: 'cursorSelector',
			drag: 'cursorGrab',
			dragging: 'cursorGrabbing',
			addPoint: 'cursorCustomPlus',
			selectPoint: 'cursorSelecPoint',
			text: 'cursorText',
			addJoint: 'cursorAddJoint',
			removeJoint: 'cursorRemoveJoint',
		};
		setWrapperClass(classes[mode] || 'cursorArrow');
	}, [editorStore.mode]);

	// Grid visibility (оставил как было, но можно упростить)
	useEffect(() => {
		const zoom = matrix.a;
		if (zoom < 0.25) {
			svgStore.setVal("gridState", ["xsGrid", "visibility"], "hidden");
			svgStore.setVal("gridState", ["smallGrid", "fill"], "var(--gridColorFill)");
		} else {
			svgStore.setVal("gridState", ["xsGrid", "visibility"], "visible");
			svgStore.setVal("gridState", ["smallGrid", "fill"], "none");
		}
		if (zoom < 0.125) {
			svgStore.setVal("gridState", ["smallGrid", "visibility"], "hidden");
			svgStore.setVal("gridState", ["grid", "fill"], "var(--gridColorFill)");
		} else {
			svgStore.setVal("gridState", ["smallGrid", "visibility"], "visible");
			svgStore.setVal("gridState", ["grid", "fill"], "none");
		}
		if (zoom > 85) {
			svgStore.setVal("gridState", ["grid", "visibility"], "hidden");
		} else {
			svgStore.setVal("gridState", ["grid", "visibility"], "visible");
		}
	}, [matrix.a]);


	return (
		<main className="container-fluid h-100 overflow-hidden" id="planeditor">
					<div className="rotated d-flex w-100 h-100" id="editor_main_wrapper_2">
						<div
							ref={wrapperRef}
							id="wrapper_svg"
							className={wrapperClass}
							style={{ touchAction: 'none' }} // обязательно!

							//onWheel={handleMouseWheel}
							onMouseDown={MouseStartDrag}
							onMouseMove={MouseDrag}
							onMouseUp={endDrag}
							onMouseLeave={leave}

							//onTouchMove={TouchDrag}
							onTouchStart={TouchStart}
							onContextMenu={e => e.preventDefault()}
						>
							<SvgComponent />
						</div>
			</div>
		</main>
	);
});

export default SvgWrapper;