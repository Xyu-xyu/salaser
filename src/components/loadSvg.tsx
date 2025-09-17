import React, { useEffect, useRef, useState } from "react";
import SampleSvg from "./../store/sampleSvg";
import svgStore from "../store/svgStore";
import util from "../scripts/util";
import { observer } from "mobx-react-lite";
import parse from "html-react-parser";
import { Icon } from "@iconify/react/dist/iconify.js";
import constants from "../store/constants";


const LoadSvg: React.FC = observer(() => {
	const inMoveRef = useRef(0);
	const [svg, setSvg] = useState<string | null>(null);
	const [wh, setwh] = useState({ w: 0, h: 0 })
	const [manual, setManual] = useState<boolean>(true)
	const {
		matrix,
		groupMatrix,
		offset,
	} = svgStore

	const matrixM = `${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f}`;
	const matrixG = `${groupMatrix.a} ${groupMatrix.b} ${groupMatrix.c} ${groupMatrix.d} ${groupMatrix.e} ${groupMatrix.f}`;

	const wrapperSVG = useRef(null);
	const SVG = useRef(null);

	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort(); // ⏳ прерываем запрос через 2 сек
			setSvg(SampleSvg);  // fallback
			setWH(SampleSvg)
		}, 2000);

		fetch("http://"+ constants.api +"/gcore/0/preview.svg", {
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

	const fit = () => {
		svgStore.setMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		svgStore.setGroupMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
		svgStore.setOffset({ x: 0, y: 0 })
	}

	const setWH = (text: string) => {
		const widthMatch = text.match(/width="(\d+\.\d{2})"/);
		const heightMatch = text.match(/height="(\d+\.\d{2})"/);
		const width = widthMatch ? widthMatch[1] : 0;
		const height = heightMatch ? heightMatch[1] : 0;
		setwh({ w: Number(width), h: Number(height) })
	}

	const handleMouseWheel = (event: React.WheelEvent) => {
		const svg = document.getElementById("svg") as SVGSVGElement | null;
		const groupNode = document.getElementById("group") as SVGGElement | null;

		if (!svg || !groupNode) return;

		const baseVal = groupNode.transform.baseVal.consolidate();
		if (!baseVal) return;

		const group = baseVal.matrix;

		let gTransform = svg.createSVGMatrix();
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

	const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
		let dx = touch1.clientX - touch2.clientX;
		let dy = touch1.clientY - touch2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	}

	const startDrag = (e: React.MouseEvent | React.TouchEvent | React.Touch) => {
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

	const drag = (e: React.MouseEvent | React.TouchEvent | React.Touch) => {
		if (!inMoveRef.current) return;
		var coord = util.getMousePosition(e);
		if (true /*|| e.target && (e.buttons === 4 || e.buttons === 1)*/) {
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

	let evCache: React.Touch[] = [];
	let prevDiff: number = -1;

	const handleTouchStart = (event: React.TouchEvent) => {

		if (manual) {
			if ('touches' in event) {
				const ee = event.touches[0];
				startDrag(ee);
			}
		} else {
			// Добавляем все тачи в кэш
			for (let i = 0; i < event.touches.length; i++) {
				const t = event.touches[i];
				// Чтобы не дублировать
				if (!evCache.some(c => c.identifier === t.identifier)) {
					evCache.push(t);
				}
			}
			prevDiff = -1;
		}
	};

	const handleTouchMove = (event: React.TouchEvent | React.MouseEvent | React.Touch) => {
		if (manual) {
			if ('touches' in event) {
				const ee = event.touches[0];
				drag(ee);
			}

		} else {
			// Обновляем кэш по identifier
			if ('touches' in event) {
				for (let i = 0; i < event.touches.length; i++) {
					const t = event.touches[i];
					const idx = evCache.findIndex(c => c.identifier === t.identifier);
					if (idx > -1) {
						evCache[idx] = t;
					} else {
						evCache.push(t);
					}
				}

				if (evCache.length === 2) {
					const curDiff = getDistance(evCache[0], evCache[1]);
					if (prevDiff > 0) {
						touchZoom(curDiff / prevDiff);
					}
					prevDiff = curDiff;
				}
			}

		}
	};

	const handleTouchEnd = (event: React.TouchEvent) => {
		if (manual) {
			endDrag();
		} else {
			// Убираем завершившиеся тачи
			for (let i = 0; i < event.changedTouches.length; i++) {
				const t = event.changedTouches[i];
				const idx = evCache.findIndex(c => c.identifier === t.identifier);
				if (idx > -1) {
					evCache.splice(idx, 1);
				}
			}
			// Если осталось меньше 2 касаний → сбрасываем зум
			if (evCache.length < 2) {
				prevDiff = -1;
			}
		}
	};

	const touchZoom = (scale: number) => {
		const svg = document.getElementById("svg") as SVGSVGElement | null;
		const groupNode = document.getElementById("group") as SVGGElement | null;

		if (!svg || !groupNode) return;

		const baseVal = groupNode.transform.baseVal.consolidate();
		if (!baseVal) return;

		const groupMatrix = baseVal.matrix;

		// Проверяем, что есть два пальца
		if (evCache.length < 2) return;

		const x = (evCache[0].clientX + evCache[1].clientX) / 2;
		const y = (evCache[0].clientY + evCache[1].clientY) / 2;
		const coords = util.convertScreenCoordsToSvgCoords(x, y);

		// Создаём новую матрицу трансформации
		let gTransform = svg.createSVGMatrix();
		gTransform = gTransform.translate(coords.x, coords.y);
		gTransform = gTransform.scale(scale, scale);
		gTransform = gTransform.translate(-coords.x, -coords.y);

		const comboMatrix = util.multiplyMatrices(groupMatrix, gTransform);

		svgStore.setMatrix({
			a: comboMatrix.a,
			b: comboMatrix.b,
			c: comboMatrix.c,
			d: comboMatrix.d,
			e: comboMatrix.e,
			f: comboMatrix.f
		});
	};

	const  removeCirclesFromSvg =(svgText: string): string =>{
		let out = svgText.replace(/<circle\b[^>]*\/\s*>/gi, '');
		out = out.replace(/<circle\b[^>]*>[\s\S]*?<\/circle>/gi, '');
		return out;
	}

	if (!svg) return <div>Загрузка…</div>;


	return (
		<div id="wrapper_svg"
			ref={wrapperSVG}
		>
			<div className="d-flex flex-column position-absolute">
				<div className="mt-2 mx-2">
					<button
						onClick={() => { setManual(!manual) }}
						className={`violet_button navbar_button small_button40`}
					>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon={manual ? "la:hand-paper" : "heroicons:magnifying-glass-20-solid"}
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
				<div className="mx-2 mt-1">
					<button
						onClick={fit}
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

				onWheel={(e) => handleMouseWheel(e)}

				onMouseDown={(e) => startDrag(e)}
				onMouseMove={(e) => drag(e)}
				onMouseUp={endDrag}

				onTouchStart={(e) => handleTouchStart(e)}
				onTouchMove={(e) => handleTouchMove(e)}
				onTouchEnd={(e) => handleTouchEnd(e)}
				onTouchCancel={(e) => handleTouchEnd(e)}
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
							{svg && parse(removeCirclesFromSvg(svg))}
						</g>
					</g>
				</svg>
			</div>
		</div>

	);
});

export default LoadSvg;
