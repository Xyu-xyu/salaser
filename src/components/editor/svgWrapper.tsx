import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import coordsStore from './../../store/coordStore.tsx';
import editorStore from './../../store/editorStore.tsx';
import svgStore from './../../store/svgStore.tsx';
import util from './../../scripts/util.js';
import SvgComponent from './svgComponent.tsx';
//import SvgComponent from './svg';
//import Part from '../../scripts/part.tsx';
//import SvgComponent from './svgComponent.tsx';
//import Part from '../scripts/part.js';
//import inlet from './../scripts/inlet.js'
//import { addToLog } from '../scripts/addToLog.js';
//import jointStore from './stores/jointStore.js';
//import logStore from './stores/logStore.js';
//import log from '../scripts/log.js'


const SvgWrapper = observer(() => {
	const {
		matrix,
		groupMatrix,
		offset,
		//rectParams,
		gridState,
		svgParams,
		selectedText,
		pointInMove,
	} = svgStore;

	const { a, b, c, d, e, f } = matrix;
	const [wrapperClass, setWrapperClass] = useState<string>('');
	const inMoveRef = useRef<number>(0);
	const wrapperSVG = useRef<HTMLDivElement>(null);

	// Touch gesture state
	const evCache = useRef<Touch[]>([]);
	const prevDiff = useRef<number>(-1);

	// Mouse wheel zoom
	const handleMouseWheel = (event: React.WheelEvent) => {
		//event.preventDefault();
		const svg = document.getElementById('svg') as unknown as SVGSVGElement;
		if (!svg) return;

		const groupSvg = document.getElementById('group') as unknown as SVGSVGElement;
		const group = groupSvg.transform.baseVal.consolidate()?.matrix;

		if (!group) return;

		const coords = util.convertScreenCoordsToSvgCoords(event.clientX, event.clientY);
		const scale = 1.0 + (-event.deltaY * 0.001);

		let gTransform = svg.createSVGMatrix();
		gTransform = gTransform.translate(coords.x, coords.y);
		gTransform = gTransform.scale(scale);
		gTransform = gTransform.translate(-coords.x, -coords.y);

		const comboMatrix = util.multiplyMatrices(group, gTransform);

		svgStore.setMatrix({
			a: comboMatrix.a,
			b: comboMatrix.b,
			c: comboMatrix.c,
			d: comboMatrix.d,
			e: comboMatrix.e,
			f: comboMatrix.f,
		});

		const attr = calculateRectAttributes();
		svgStore.setRectParams(attr);
	};

	// Touch zoom (pinch)
	const touchZoom = (curDiff: number, prevDiff: number) => {
		const svg = document.getElementById('svg') as unknown as SVGSVGElement;
		if (!svg) return;

		const groupSvg = document.getElementById('group') as unknown as SVGSVGElement;
		const group = groupSvg.transform.baseVal.consolidate()?.matrix;
		if (!group) return;

		const scale = curDiff / prevDiff;
		const x = (evCache.current[0].clientX + evCache.current[1].clientX) / 2;
		const y = (evCache.current[0].clientY + evCache.current[1].clientY) / 2;
		const coords = util.convertScreenCoordsToSvgCoords(x, y);

		let gTransform = svg.createSVGMatrix();
		gTransform = gTransform.translate(coords.x, coords.y);
		gTransform = gTransform.scale(scale);
		gTransform = gTransform.translate(-coords.x, -coords.y);

		const comboMatrix = util.multiplyMatrices(group, gTransform);

		svgStore.setMatrix({
			a: comboMatrix.a,
			b: comboMatrix.b,
			c: comboMatrix.c,
			d: comboMatrix.d,
			e: comboMatrix.e,
			f: comboMatrix.f,
		});

		const attr = calculateRectAttributes();
		svgStore.setRectParams(attr);
	};

	const getDistance = (t1: Touch, t2: Touch): number => {
		const dx = t1.clientX - t2.clientX;
		const dy = t1.clientY - t2.clientY;
		return Math.hypot(dx, dy);
	};

	// Touch handlers
	const handleTouchStart = (event: React.TouchEvent) => {

		if (editorStore.mode === 'drag' || true) {
			startDrag(event.touches[0] as unknown as MouseEvent);
		} else {
			//evCache.current = Array.from(event.touches);
			//prevDiff.current = -1;
		}
	};

	const handleTouchMove = (event: React.TouchEvent) => {
		
		//event.preventDefault();
		console.log (evCache.current.length)

		//if (editorStore.mode === 'drag' || editorStore.mode === 'dragging' || pointInMove) {

		if (evCache.current.length === 1) {
			drag(event.touches[0] as unknown as MouseEvent, true);
		} else if (editorStore.inletMode === 'inletInMoving') {
			// drag(event.touches[0] as unknown as MouseEvent, true);
		} else {
			evCache.current = Array.from(event.touches);

			if (evCache.current.length === 2) {
				const curDiff = getDistance(evCache.current[0], evCache.current[1]);
				if (prevDiff.current > 0) {
					touchZoom(curDiff, prevDiff.current);
				}
				prevDiff.current = curDiff;
			}
		}
	};

	const handleTouchEnd = (event: React.TouchEvent) => {
		/*    if (editorStore.mode === 'dragging' || pointInMove) {
			 endDrag(event as unknown as MouseEvent);
		   } */

		// Remove ended touches
		for (const touch of event.changedTouches) {
			const index = evCache.current.findIndex(t => t.identifier === touch.identifier);
			if (index > -1) evCache.current.splice(index, 1);
		}

		if (evCache.current.length < 2) {
			prevDiff.current = -1;
		}
	};

	const startDrag = (e: MouseEvent | Touch) => {
		inMoveRef.current = 1;

		/*     if ('button' in e && e.button === 2) {
			  const selectedEdge = util.selectEdge(e);
			  svgStore.setSelectedEdge(selectedEdge);
			  return;
			} */

		if (
			('buttons' in e && (e.buttons === 4 || editorStore.mode === 'drag')) ||
			('touches' in e && editorStore.mode === 'drag') || true
		) {
			const off = util.getMousePosition(e);
			const transforms = groupMatrix;
			svgStore.setOffset({
				x: off.x - transforms.e,
				y: off.y - transforms.f,
			});
		}
	};

	const drag = (e: MouseEvent | Touch, force = false) => {
		const coords = util.convertScreenCoordsToSvgCoords(
			('clientX' in e ? e.clientX : e.touches[0].clientX),
			('clientY' in e ? e.clientY : e.touches[0].clientY)
		);

		coordsStore.setCoords({
			x: Math.round(coords.x * 100) / 100,
			y: Math.round(coords.y * 100) / 100,
		});

		const isDragging =
			('buttons' in e && (e.buttons === 4 || e.buttons === 1)) ||
			force ||
			editorStore.mode === 'dragging';

		if (isDragging && inMoveRef.current) {
			const coord = util.getMousePosition(e);
			const newE = coord.x - offset.x;
			const newF = coord.y - offset.y;

			svgStore.setGroupMatrix({
				a: groupMatrix.a,
				b: groupMatrix.b,
				c: groupMatrix.c,
				d: groupMatrix.d,
				e: newE,
				f: newF,
			});

			const attr = calculateRectAttributes();
			svgStore.setRectParams(attr);
			editorStore.setMode('dragging');
		}
	};

	const endDrag = () => {
		inMoveRef.current = 0;

		if (pointInMove) {
			// util.setGuidesPositionForPoint(e);
		}

		if (editorStore.mode === 'dragging') {
			editorStore.setMode('resize');
		}
	};

	const leave = () => {
		coordsStore.setCoords({ x: 0, y: 0 });
	};

	const calculateRectAttributes = () => {
		const combinedMatrix = util.multiplyMatrices(groupMatrix, matrix);
		const scaleX = combinedMatrix.a;
		const scaleY = combinedMatrix.d;

		const width = svgParams.width / scaleX;
		const height = svgParams.height / scaleY;
		const x = -combinedMatrix.e / scaleX;
		const y = -combinedMatrix.f / scaleY;

		return { x, y, width, height };
	};

	const fitToPage = () => {
		if (!coordsStore.fittedPosition) {
			svgStore.setMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
			svgStore.setGroupMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
			svgStore.setRectParams({ x: 0, y: 0, width: 0, height: 0 });

			const groupEl = document.querySelector('#group') as SVGGraphicsElement;
			const wrapperEl = wrapperSVG.current;
			if (!groupEl || !wrapperEl) return;

			const box = groupEl.getBoundingClientRect();
			const wBox = wrapperEl.getBoundingClientRect();

			const scaleW = wBox.width / box.width;
			const scaleH = wBox.height / box.height;
			const scale = Math.min(scaleW, scaleH);

			const centerX = wBox.x + wBox.width / 2;
			const centerY = wBox.y + wBox.height / 2;
			const svgCenter = util.convertScreenCoordsToSvgCoords(centerX, centerY);

			const outerBox = document.querySelector('#contours')?.getBoundingClientRect();
			const outerCenter = outerBox
				? util.convertScreenCoordsToSvgCoords(
					outerBox.x + outerBox.width / 2,
					outerBox.y + outerBox.height / 2
				)
				: svgCenter;

			const xdif = outerCenter.x - svgCenter.x;
			const ydif = outerCenter.y - svgCenter.y;

			const matrixN = {
				a: scale,
				b: 0,
				c: 0,
				d: scale,
				e: svgCenter.x - svgCenter.x * scale - xdif,
				f: svgCenter.y - svgCenter.y * scale - ydif,
			};

			if (Object.values(matrixN).every(v => Number.isFinite(v))) {
				svgStore.setGroupMatrix(matrixN);
			}

			coordsStore.setNeedToFit(false);
			coordsStore.setFittedPosition({
				matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
				groupMatrix: matrixN,
				rectParams: calculateRectAttributes(),
			});
		} else {
			svgStore.setMatrix(coordsStore.fittedPosition.matrix);
			svgStore.setGroupMatrix(coordsStore.fittedPosition.groupMatrix);
			svgStore.setRectParams(coordsStore.fittedPosition.rectParams);
			coordsStore.setNeedToFit(false);
		}
	};

	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fitToPage();
			coordsStore.setPreloader(false);
			svgStore.setRectParams(calculateRectAttributes());
		}, 500);

		const handleKeyDown = (e: KeyboardEvent) => {
			if (selectedText) return;

			if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'z' || e.key === 'Я')) {
				e.preventDefault();
				// Undo
			} else if (e.ctrlKey && (e.key.toLowerCase() === 'z' || e.key === 'Я')) {
				e.preventDefault();
				// Redo
			} else if (e.key === 'Delete') {
				e.preventDefault();
				// Delete selected
			}
		};

		window.addEventListener('keydown', handleKeyDown);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			clearTimeout(timeoutId);
		};
	}, []);

	// Fit when requested
	useEffect(() => {
		if (coordsStore.needToFit) {
			fitToPage();
		}
	}, [coordsStore.needToFit]);

	// Grid visibility based on zoom
	useEffect(() => {
		const updatedState = { ...gridState };

		if (matrix.a < 0.25) {
			updatedState.xsGrid.visibility = 'hidden';
			updatedState.smallGrid.fill = 'var(--gridColorFill)';
		} else {
			updatedState.xsGrid.visibility = 'visible';
			updatedState.smallGrid.fill = 'none';
		}

		if (matrix.a < 0.125) {
			updatedState.smallGrid.visibility = 'hidden';
			updatedState.grid.fill = 'var(--gridColorFill)';
		} else {
			updatedState.smallGrid.visibility = 'visible';
			updatedState.grid.fill = 'none';
		}

		if (matrix.a > 85) {
			updatedState.grid.visibility = 'hidden';
		} else {
			updatedState.grid.visibility = 'visible';
		}

		svgStore.setGridState(updatedState);
	}, [a, b, c, d, e, f]);

	// Cursor class based on mode
	useEffect(() => {
		const mode = editorStore.mode;
		const classes: Record<string, string> = {
			resize: 'cursorArrow',
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

	return (
		<main className="container-fluid h-100 overflow-hidden" id="parteditor">
			<div className="row align-items-center h-100">
				<div className="w-100 h-100">
					<div className="d-flex" id="editor_main_wrapper">
						<div
							id="wrapper_svg"
							ref={wrapperSVG}
							className={wrapperClass}
							onWheel={handleMouseWheel}
							onMouseDown={startDrag}
							onMouseMove={drag}
							onMouseUp={endDrag}
							onMouseLeave={leave}
							onTouchStart={handleTouchStart}
							onTouchMove={handleTouchMove}
							onTouchEnd={handleTouchEnd}
							onTouchCancel={handleTouchEnd}
							onContextMenu={(e) => e.preventDefault()}
							style={{ touchAction: 'none' }} // Critical for pinch/zoom
						>
							<SvgComponent />
						</div>
					</div>
				</div>
			</div>
		</main>
	);
});

export default SvgWrapper;