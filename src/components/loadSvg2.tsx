import React, { useEffect, useRef, useState } from "react";
import SampleSvg from "./../store/sampleSvg";
import svgStore from "../store/svgStore";
import util from "../scripts/util";
import { observer } from "mobx-react-lite";
import parse from "html-react-parser";
import { Icon } from "@iconify/react/dist/iconify.js";
import constants from "../store/constants";

const LoadSvg: React.FC = observer(() => {
	const inMoveRef = useRef(false);
	const [svg, setSvg] = useState<string | null>(null);
	const [wh, setwh] = useState({ w: 0, h: 0 });

	// refs для pan/zoom
	const panRef = useRef({ x: 0, y: 0 });
	const targetPan = useRef({ x: 0, y: 0 });
	const targetZoom = useRef(1);

	// Touch helpers
	const evCache = useRef<Touch[]>([]);
	const prevDiff = useRef<number>(-1);

	const wrapperSVG = useRef<HTMLDivElement | null>(null);

	// Загружаем SVG
	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			setSvg(SampleSvg);
			setWH(SampleSvg);
		}, 2000);

		fetch("http://"+ constants.api+"/gcore/0/preview.svg", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId);
				if (data) {
					setSvg(data);
					setWH(data);
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

	const setWH = (text: string) => {
		const widthMatch = text.match(/width="(\d+\.\d{2})"/);
		const heightMatch = text.match(/height="(\d+\.\d{2})"/);
		const width = widthMatch ? parseFloat(widthMatch[1]) : 0;
		const height = heightMatch ? parseFloat(heightMatch[1]) : 0;
		setwh({ w: width, h: height });
	};

	// === Панорамирование ===
	const startDrag = (e: React.MouseEvent | React.Touch) => {
		inMoveRef.current = true;
		const pos = util.getMousePosition(e);
		panRef.current = { x: pos.x - targetPan.current.x, y: pos.y - targetPan.current.y };
	};

	const endDrag = () => {
		inMoveRef.current = false;
	};

	const drag = (e: React.MouseEvent | React.Touch) => {
		if (!inMoveRef.current) return;
		const pos = util.getMousePosition(e);
		targetPan.current = {
			x: pos.x - panRef.current.x,
			y: pos.y - panRef.current.y,
		};
	};

	// === Масштабирование колесиком ===
	const handleMouseWheel = (event: React.WheelEvent) => {
		//event.preventDefault();
		const delta = -event.deltaY * 0.001;
		targetZoom.current = Math.max(0.1, targetZoom.current * (1 + delta));
	};

	// === Touch Events (панорамирование и pinch-to-zoom) ===
	const handleTouchStart = (e: React.TouchEvent) => {
		for (let i = 0; i < e.touches.length; i++) {
			const t = e.touches[i];
			if (!evCache.current.some((c) => c.identifier === t.identifier)) {
				evCache.current.push(t);
			}
		}
		if (e.touches.length === 1) startDrag(e.touches[0]);
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		for (let i = 0; i < e.touches.length; i++) {
			const t = e.touches[i];
			const idx = evCache.current.findIndex((c) => c.identifier === t.identifier);
			if (idx > -1) evCache.current[idx] = t;
		}

		if (evCache.current.length === 2) {
			// Pinch zoom
			const curDiff = getDistance(evCache.current[0], evCache.current[1]);
			const center = {
				x: (evCache.current[0].clientX + evCache.current[1].clientX) / 2,
				y: (evCache.current[0].clientY + evCache.current[1].clientY) / 2,
			};
			if (prevDiff.current > 0) {
				const scaleChange = curDiff / prevDiff.current;
				targetZoom.current = Math.max(0.1, targetZoom.current * scaleChange);

				// Центрируем по середине пальцев
				targetPan.current = {
					x: targetPan.current.x - (center.x - window.innerWidth / 2) * (scaleChange - 1),
					y: targetPan.current.y - (center.y - window.innerHeight / 2) * (scaleChange - 1),
				};
			}
			prevDiff.current = curDiff;
		} else if (evCache.current.length === 1) {
			// Pan
			drag(e.touches[0]);
		}
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		for (let i = 0; i < e.changedTouches.length; i++) {
			const t = e.changedTouches[i];
			const idx = evCache.current.findIndex((c) => c.identifier === t.identifier);
			if (idx > -1) evCache.current.splice(idx, 1);
		}
		if (evCache.current.length < 2) prevDiff.current = -1;
		if (evCache.current.length === 0) endDrag();
	};

	const getDistance = (t1: Touch, t2: Touch) => {
		const dx = t1.clientX - t2.clientX;
		const dy = t1.clientY - t2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	};

	// === requestAnimationFrame loop ===
	useEffect(() => {
		let frameId: number;
		const animate = () => {
			const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

			// Pan
			const currentPan = { x: svgStore.groupMatrix.e, y: svgStore.groupMatrix.f };
			const newPan = {
				x: lerp(currentPan.x, targetPan.current.x, 0.2),
				y: lerp(currentPan.y, targetPan.current.y, 0.2),
			};

			// Zoom
			const currentZoom = svgStore.matrix.a;
			const newZoom = lerp(currentZoom, targetZoom.current, 0.2);

			svgStore.setMatrix({
				a: newZoom,
				b: 0,
				c: 0,
				d: newZoom,
				e: svgStore.matrix.e,
				f: svgStore.matrix.f,
			}, { ...svgStore.groupMatrix, e: newPan.x, f: newPan.y });

			frameId = requestAnimationFrame(animate);
		};
		frameId = requestAnimationFrame(animate);
		return () => cancelAnimationFrame(frameId);
	}, []);

	const removeCirclesFromSvg = (svgText: string): string => {
		let out = svgText.replace(/<circle\b[^>]*\/\s*>/gi, "");
		out = out.replace(/<circle\b[^>]*>[\s\S]*?<\/circle>/gi, "");
		return out;
	};

	const fit = () => {
		targetPan.current = { x: 0, y: 0 };
		targetZoom.current = 1;
		svgStore.setMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }, { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
	};

	if (!svg) return <div>Загрузка…</div>;

	return (
		<div id="wrapper_svg" ref={wrapperSVG}>
			<div className="d-flex flex-column position-absolute">
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
				onWheel={handleMouseWheel}
				onMouseDown={(e) => startDrag(e)}
				onMouseMove={(e) => drag(e)}
				onMouseUp={endDrag}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={handleTouchEnd}
			>
				<svg
					id="svg"
					viewBox={`0 0 ${wh.w} ${wh.h}`}
					style={{ overflow: "hidden", border: "1px solid var(--color)", touchAction: "none" }}
					version="1.1"
					stroke="var(--color)"
					strokeWidth="0.2"
				>
					<g
						transform={`matrix(${svgStore.groupMatrix.a} ${svgStore.groupMatrix.b} ${svgStore.groupMatrix.c} ${svgStore.groupMatrix.d} ${svgStore.groupMatrix.e} ${svgStore.groupMatrix.f})`}
					>
						<g
							transform={`matrix(${svgStore.matrix.a} ${svgStore.matrix.b} ${svgStore.matrix.c} ${svgStore.matrix.d} ${svgStore.matrix.e} ${svgStore.matrix.f})`}
						>
							{svg && parse(removeCirclesFromSvg(svg))}
						</g>
					</g>
				</svg>
			</div>
		</div>
	);
});

export default LoadSvg;