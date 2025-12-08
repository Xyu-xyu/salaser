import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import coordsStore from './../../store/coordStore.jsx';
import editorStore from './../../store/editorStore.jsx';
import svgStore from './../../store/svgStore.jsx';
import util from './../../scripts/util.jsx';
import SvgComponent from './svgComponent.jsx';
//import SvgComponent from './svg';
//import Part from '../../scripts/part.jsx';
//import SvgComponent from './svgComponent.jsx';
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
		selectedText,
		pointInMove,
	} = svgStore;


	const { a, b, c, d, e, f } = matrix;
	const [wrapperClass, setWrapperClass] = useState('');
	const inMoveRef = useRef(0);
	const wrapperSVG = useRef(null);

	// Touch gesture state
	const evCache = useRef([]);
	const prevDiff = useRef(-1);

	// Mouse wheel zoom
	const handleMouseWheel = (event) => {
		//event.preventDefault();
		const svg = document.getElementById('svg')
		if (!svg) return;

		const groupSvg = document.getElementById('group');
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
	
	};

	// Touch zoom (pinch)
	const touchZoom = (curDiff, prevDiff) => {
		console.log("TouchZOOM")
		const svg = document.getElementById('svg');
		if (!svg) return;

		const groupSvg = document.getElementById('group');
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
	};

	const getDistance = (t1, t2)=> {
		const dx = t1.clientX - t2.clientX;
		const dy = t1.clientY - t2.clientY;
		return Math.hypot(dx, dy);
	};

	// Touch handlers
	const TouchStart = (event) => {
		console.log("TouchStart");
		//const nativeTouches = event.nativeEvent.touches;

		if (editorStore.mode === 'drag' || true) {
			if (evCache.current.length > 0) {
				TouchStartDrag(event.touches[0]); // Pass the real Touch object
			}
		} else {
			//evCache.current = Array.from(event.touches);
			//prevDiff.current = -1;
		}
	};
 
	const TouchStartDrag = (touch) => {
		console.log("TouchStartDrag");
		console.log("TouchStartDrag");
		inMoveRef.current = 1;
		const off = util.getMousePosition(touch);
		console.log( off , groupMatrix);

		const transforms = groupMatrix;
		svgStore.setOffset({
			x: off.x - transforms.e,
			y: off.y - transforms.f,
		}); 

	}; 

	const TouchDrag = (event) => {
		const nativeTouches = event.nativeEvent.touches;
		//console.log ( evCache.current.length)
		if (evCache.current.length === 1 && inMoveRef.current ) {
			//console.log("TouchDrag");
			const touch = evCache.current[0];
			const clientX = touch.clientX;
			const clientY = touch.clientY;
			const coords = util.convertScreenCoordsToSvgCoords(clientX, clientY);

			coordsStore.setCoords({
				x: Math.round(coords.x * 100) / 100,
				y: Math.round(coords.y * 100) / 100,
				width: 500,
				height: 500,
			});

			// Update matrix transformation logic
			const coord = util.getMousePosition(touch);
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
			editorStore.setMode('dragging');
		}
		evCache.current = Array.from(event.touches);

		if (nativeTouches.length === 2) {
			const curDiff = getDistance(nativeTouches[0], nativeTouches[1]);
			if (prevDiff.current > 0) {
				touchZoom(curDiff, prevDiff.current);
			}
			prevDiff.current = curDiff;
		}
	};

	const handleTouchEnd = (event) => {
		if (editorStore.mode === 'dragging' || pointInMove) {
			endDrag();
		}

		for (const touch of event.changedTouches) {
			const index = evCache.current.findIndex(t => t.identifier === touch.identifier);
			if (index > -1) evCache.current.splice(index, 1);
		}

		if (evCache.current.length === 0) {
			prevDiff.current = -1;
		}
	};

	const MouseStartDrag = (e) => {
		inMoveRef.current = 1;
		const off = util.getMousePosition(e);
		const transforms = groupMatrix;
		svgStore.setOffset({
			x: off.x - transforms.e,
			y: off.y - transforms.f,
		});

	};

	const MouseDrag = (e, force = false) => {

		const clientX = e.clientX;
		const clientY = e.clientY;
		const coords = util.convertScreenCoordsToSvgCoords(clientX, clientY);
		coordsStore.setCoords({
			x: Math.round(coords.x * 100) / 100,
			y: Math.round(coords.y * 100) / 100,
			width: 500,
			height: 500
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
		coordsStore.setCoords({ x: 0, y: 0, width: 500, height: 500 });
	};

	const calculateRectAttributes = () => {
		const groupMatrix1 = new DOMMatrix([groupMatrix.a, groupMatrix.b, groupMatrix.c, groupMatrix.d, groupMatrix.e, groupMatrix.f]);
		const localMatrix = new DOMMatrix([matrix.a, matrix.b, matrix.c, matrix.d, matrix.e, matrix.f]);
		const combinedMatrix = util.multiplyMatrices(groupMatrix1, localMatrix);
		const scaleX = combinedMatrix.a;
		const scaleY = combinedMatrix.d;

		const width = svgData.width / scaleX;
		const height = svgData.height / scaleY;
		const x = -combinedMatrix.e / scaleX;
		const y = -combinedMatrix.f / scaleY;

		return { x, y, width, height };
	};

	
	
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			svgStore.fitToPage();
			coordsStore.setPreloader(false);
		}, 500);

		const handleKeyDown = (e) => {
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
			svgStore.fitToPage();
		}
	}, [coordsStore.needToFit]);

	// Grid visibility based on zoom
	useEffect(() => {
		// xsGrid
		if (matrix.a < 0.25) {
			svgStore.setVal("gridState", ["xsGrid", "visibility"], "hidden");
			svgStore.setVal("gridState", ["smallGrid", "fill"], "var(--gridColorFill)");
		} else {
			svgStore.setVal("gridState", ["xsGrid", "visibility"], "visible");
			svgStore.setVal("gridState", ["smallGrid", "fill"], "none");
		}
	
		// smallGrid
		if (matrix.a < 0.125) {
			svgStore.setVal("gridState", ["smallGrid", "visibility"], "hidden");
			svgStore.setVal("gridState", ["grid", "fill"], "var(--gridColorFill)");
		} else {
			svgStore.setVal("gridState", ["smallGrid", "visibility"], "visible");
			svgStore.setVal("gridState", ["grid", "fill"], "none");
		}
	
		// grid
		if (matrix.a > 85) {
			svgStore.setVal("gridState", ["grid", "visibility"], "hidden");
		} else {
			svgStore.setVal("gridState", ["grid", "visibility"], "visible");
		}
	}, [matrix.a, a, b, c, d, e, f]);
	

	// Cursor class based on mode
	useEffect(() => {
		const mode = editorStore.mode;
		const classes = {
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
							onMouseDown={MouseStartDrag}
							onMouseMove={MouseDrag}
							onTouchMove={TouchDrag}
							onMouseUp={endDrag}
							onMouseLeave={leave}
							onTouchStart={TouchStart}
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