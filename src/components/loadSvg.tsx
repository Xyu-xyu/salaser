import React, { useEffect, useRef, useState } from "react";
import SampleSvg from "./../store/sampleSvg";
import svgStore from "../store/svgStore";
import util from "../scripts/util";
import { observer } from "mobx-react-lite";
import parse from "html-react-parser";
import { Icon } from "@iconify/react/dist/iconify.js";


const LoadSvg: React.FC = observer(() => {
	const inMoveRef = useRef(0);
	const [svg, setSvg] = useState<string | null>(null);
	const [wh, setwh] = useState({ w: 0, h: 0 })
	const [ manual, setManual] = useState<boolean>(true)
	const {
		matrix,
		groupMatrix,
		offset,
	} = svgStore

	//const { a, b, c, d, e, f } = matrix
	const matrixM = `${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f}`;
	const matrixG = `${groupMatrix.a} ${groupMatrix.b} ${groupMatrix.c} ${groupMatrix.d} ${groupMatrix.e} ${groupMatrix.f}`;

	//const [wrapperClass, setWrapperClass] = useState('')
	const wrapperSVG = useRef(null);
	const SVG = useRef(null);

	let evCache = []; // Список активных касаний
	let prevDiff = -1; // Предыдущее расстояние между пальцами

	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort(); // ⏳ прерываем запрос через 2 сек
			setSvg(SampleSvg);  // fallback
			setWH(SampleSvg)
		}, 2000);

		fetch("http://192.168.11.246/gcore/0/preview.svg", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId); // ответ успел прийти → отменяем таймер
				if (data) {
					setSvg(data);
					setWH(data)
				}
			})
			.catch((e) => {
				console.error("Ошибка загрузки SVG:", e);
				clearTimeout(timeoutId);
			});

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	}, []);

	const fit = () =>{
		svgStore.setMatrix({a:1,b:0,c:0,d: 1,e: 0,f: 0});
		svgStore.setGroupMatrix({a:1,b:0,c:0,d: 1,e: 0,f: 0})
		svgStore.setOffset({ x: 0, y: 0 })		
	}

	const setWH = (text: string) => {
		const widthMatch = text.match(/width="(\d+\.\d{2})"/);
		const heightMatch = text.match(/height="(\d+\.\d{2})"/);
		const width = widthMatch ? widthMatch[1] : 0;
		const height = heightMatch ? heightMatch[1] : 0;
		setwh({ w: Number(width), h: Number(height) })
	}

	const handleMouseWheel = (event) => {
		var svg = document.getElementById("svg")
		var gTransform = svg.createSVGMatrix()
		var group = document.getElementById("group").transform.baseVal.consolidate().matrix
		let coords = util.convertScreenCoordsToSvgCoords(event.clientX, event.clientY);
		let scale = 1.0 + (-event.deltaY * 0.001);

		gTransform = gTransform.translate(coords.x, coords.y);
		gTransform = gTransform.scale(scale, scale);
		gTransform = gTransform.translate(-coords.x, -coords.y);

		let comboMatrix = util.multiplyMatrices(group, gTransform)
		svgStore.setMatrix({
			a: comboMatrix.a,
			b: comboMatrix.b,
			c: comboMatrix.c,
			d: comboMatrix.d,
			e: comboMatrix.e,
			f: comboMatrix.f
		});
	};

	const getDistance = (touch1, touch2) => {
		let dx = touch1.clientX - touch2.clientX;
		let dy = touch1.clientY - touch2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	const startDrag = (e) => {
		//console.log ('startDrag' )
		inMoveRef.current = 1;
		let off = util.getMousePosition(e);
		let transforms = groupMatrix
		off.x -= transforms.e;
		off.y -= transforms.f;
		svgStore.setOffset({ x: off.x, y: off.y })
	}

	const endDrag = () => {
		inMoveRef.current = 0;
	}

	const drag = (e) => {
		if (!inMoveRef.current) return;
		var coord = util.getMousePosition(e);
		if (true || e.target && (e.buttons === 4 || e.buttons === 1)) {
			let e = (coord.x - offset.x)
			let f = (coord.y - offset.y)
			svgStore.setGroupMatrix({
				a: groupMatrix.a,
				b: groupMatrix.b,
				c: groupMatrix.c,
				d: groupMatrix.d,
				e: e,
				f: f,
			})
		}
	}

	// Обработчик начала касания
	const handleTouchStart = (event) => {
		//console.log ('handleTouchStart    '+ event.target.id )
		if ( manual ) {
			let ee = event.touches[0]
			startDrag(ee)
		} else {
			evCache = [];
			prevDiff = -1;
			evCache.push(event.touches[0]);
		}
	}

	const handleTouchMove = (event) => {
		//console.log ('handleTouchMove  ' + event.target.classList )
		if ( manual ) {
			let ee = event.touches[0]
			drag(ee)
		} else {
			for (let i = 0; i < event.touches.length; i++) {
				evCache[i] = event.touches[i];
			}

			if (evCache.length === 2) {
				let curDiff = getDistance(evCache[0], evCache[1]);
				if (prevDiff > 0) {
					touchZoom( curDiff / prevDiff );
				}
				prevDiff = curDiff;
			}
		}
	}

	const handleTouchEnd = (event) => {
		//console.log ('handleTouchEnd  ' + event.target.id )
		if (manual) {
			endDrag(event)
		} else {
			for (let i = 0; i < event.changedTouches.length; i++) {
				let index = evCache.findIndex(t => t.identifier === event.changedTouches[i].identifier);
				if (index > -1) evCache.splice(index, 1);
			}

			// Если осталось одно или ноль касаний, сбрасываем prevDiff
			if (evCache.length < 2) {
				prevDiff = -1;
			}
		}
	}

	const touchZoom = (scale: number) => {
		//console.log ('** touchZoom **')
		var svg = document.getElementById("svg")
		var group = document.getElementById("group").transform.baseVal.consolidate().matrix

		let x = (evCache[0].clientX + evCache[1].clientX) / 2;
		let y = (evCache[0].clientY + evCache[1].clientY) / 2;
		let coords = util.convertScreenCoordsToSvgCoords(x, y);

		var gTransform = svg.createSVGMatrix()
		gTransform = gTransform.translate(coords.x, coords.y);
		gTransform = gTransform.scale(scale, scale);
		gTransform = gTransform.translate(-coords.x, -coords.y);
		let comboMatrix = util.multiplyMatrices(group, gTransform)

		svgStore.setMatrix({
			a: comboMatrix.a,
			b: comboMatrix.b,
			c: comboMatrix.c,
			d: comboMatrix.d,
			e: comboMatrix.e,
			f: comboMatrix.f
		});
	}

	if (!svg) return <div>Загрузка…</div>;


	return (
		<div id="wrapper_svg"
			ref={wrapperSVG}
			>
			<div className="d-flex flex-column position-absolute">
				<div className="mt-2 mx-2">
					<button
						onClick={() => { setManual(!manual)}}
						className={`violet_button navbar_button small_button40`}
						
						>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon={manual ? "la:hand-paper" : "heroicons:magnifying-glass-20-solid"}
								width="36"
								height="36"
								style={{ color:'white'}}
							/>
						</div>
					</button>
				</div>
				<div className="mx-2 mt-1">
					<button
						onClick={ fit }
						className={`violet_button navbar_button small_button40`} >
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="carbon:zoom-fit"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>

				</div>
			</div>
			<div
				id="workarea"
				className="planMain"
				onWheel={handleMouseWheel}

				onMouseDown={startDrag}
				onMouseMove={drag}
				onMouseUp={endDrag}

				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={handleTouchEnd}
			>
				<svg
					id="svg"
					ref={SVG}
					baseProfile="full"
					viewBox={`0.00 0.00 ${wh.w} ${wh.h}`}
					style={{ overflow: 'hidden', border: '1px solid var(--color)', touchAction: "none" }}
					version="1.1"
					stroke='var(--color)'
					strokeWidth="0.2"
					pointerEvents="all"
				>
					<g id="group1" transform={`matrix(${matrixG})`}>
						<g id="group" transform={`matrix(${matrixM})`} className="grab">
							{svg && parse(svg)}
						</g>
					</g>
				</svg>
			</div>
		</div>

	);
});

export default LoadSvg;
