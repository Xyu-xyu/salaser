import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import coordsStore from './../../store/coordStore.jsx';
import editorStore from './../../store/editorStore.jsx';
import svgStore from './../../store/svgStore.jsx';
import util from './../../scripts/util.jsx';
import SvgComponent from './svgComponent.jsx';

const SvgWrapper = observer(() => {
	const { matrix, groupMatrix } = svgStore;
	const wrapperRef = useRef(null);
	const inMoveRef = useRef(false);                    // теперь boolean
	const startOffset = useRef({ x: 0, y: 0 });

	// Touch state
	const evCache = useRef([]);                         // массив Touch
	const prevDiff = useRef(-1);                        // расстояние между пальцами

	const [wrapperClass, setWrapperClass] = useState('');

	// =============== WHEEL ZOOM ===============
	const handleMouseWheel = (e) => {
		e.preventDefault();
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
		// если сразу 2 пальца — ничего не делаем, ждём TouchDrag
	};

	const TouchDrag = (e) => {
		e.preventDefault(); // обязательно!

		const touches = e.touches;
		evCache.current = Array.from(touches);

		// 1 палец → pan
		if (touches.length === 1 && inMoveRef.current) {
			const touch = touches[0];

			// Курсор
			const svgCoord = util.convertScreenCoordsToSvgCoords(touch.clientX, touch.clientY);
			coordsStore.setCoords({
				x: Math.round(svgCoord.x * 100) / 100,
				y: Math.round(svgCoord.y * 100) / 100,
				width: 500,
				height: 500,
			});

			// Драг
			const pos = util.getMousePosition(touch);
			const newE = pos.x - startOffset.current.x;
			const newF = pos.y - startOffset.current.y;

			svgStore.setGroupMatrix({
				a: groupMatrix.a, b: groupMatrix.b,
				c: groupMatrix.c, d: groupMatrix.d,
				e: newE, f: newF,
			});

			editorStore.setMode('dragging');
		}

		// 2 пальца → zoom
		else if (touches.length === 2) {
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
	};

	const handleTouchEnd = (e) => {
		// Удаляем ушедшие пальцы
		for (let i = 0; i < e.changedTouches.length; i++) {
			const idx = evCache.current.findIndex(t => t.identifier === e.changedTouches[i].identifier);
			if (idx >= 0) evCache.current.splice(idx, 1);
		}

		// Если пальцев не осталось
		if (e.touches.length === 0) {
			if (inMoveRef.current) {
				endDrag();
			}
			inMoveRef.current = false;
			prevDiff.current = -1;
			evCache.current = [];
		}
		// Если остался один — драг продолжится в следующем TouchDrag
	};

	// =============== MOUSE DRAG ===============
	const MouseStartDrag = (e) => {
		if (e.button !== 0) return; // только левая кнопка
		inMoveRef.current = true;

		const pos = util.getMousePosition(e);
		startOffset.current = {
			x: pos.x - groupMatrix.e,
			y: pos.y - groupMatrix.f,
		};

		editorStore.setMode('drag');
	};

	const MouseDrag = (e) => {
		if (!inMoveRef.current) return;

		const svgCoord = util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
		coordsStore.setCoords({
			x: Math.round(svgCoord.x * 100) / 100,
			y: Math.round(svgCoord.y * 100) / 100,
			width: 500,
			height: 500,
		});

		const pos = util.getMousePosition(e);
		const newE = pos.x - startOffset.current.x;
		const newF = pos.y - startOffset.current.y;

		svgStore.setGroupMatrix({
			a: groupMatrix.a, b: groupMatrix.b,
			c: groupMatrix.c, d: groupMatrix.d,
			e: newE, f: newF,
		});

		editorStore.setMode('dragging');
	};

	const endDrag = () => {
		inMoveRef.current = false;
		if (editorStore.mode === 'dragging') {
			editorStore.setMode('resize');
		}
	};

	const leave = () => {
		coordsStore.setCoords({ x: 0, y: 0, width: 500, height: 500 });
	};

	// =============== EFFECTS ===============
	useEffect(() => {
		/* const timer = setTimeout(() => {
			svgStore.fitToPage();
			//coordsStore.setPreloader(false);
			//		fitToPage();
		}, 500);
		return () => clearTimeout(timer);  */



		const wrapper = wrapperRef.current;
		if (!wrapper) return;

		const handleTouchMove = (e) => {
			TouchDrag(e);
		};

		const handleWheel = (e) => {
			e.preventDefault(); // теперь можно!
			handleMouseWheel(e);
		};

		wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });
		wrapper.addEventListener('wheel', handleWheel, { passive: false });

		return () => {
			wrapper.removeEventListener('touchmove', handleTouchMove);
			wrapper.removeEventListener('wheel', handleWheel);
		};
	}, []);

	useEffect(() => {
		if (coordsStore.needToFit) {
			svgStore.fitToPage();
		}
	}, [coordsStore.needToFit]);

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

	//svgStore.js или внутри компонента
	//const fitToPage = () => {
	//}

	return (
		<main className="container-fluid h-100 overflow-hidden" id="parteditor">
			<div className="row align-items-center h-100">
				<div className="w-100 h-100">
					<div className="d-flex" id="editor_main_wrapper">
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
							onTouchEnd={handleTouchEnd}
							onTouchCancel={handleTouchEnd}
							onContextMenu={e => e.preventDefault()}
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