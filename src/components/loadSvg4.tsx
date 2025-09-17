import React, { useEffect, useRef, useState } from "react";
import svgPanZoom from "svg-pan-zoom";
import SampleSvg from "../store/sampleSvg";
import { Icon } from "@iconify/react";
import parse from "html-react-parser";
import constants from "../store/constants";

const ZoomableSVG: React.FC = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const panZoomRef = useRef(null);
	const [svg, setSvg] = useState("");

	// === Загрузка SVG ===
	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			setSvg(SampleSvg);
		}, 2000);

		fetch("http://"+ constants.api+"/gcore/0/preview.svg", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId);
				setSvg(data || SampleSvg);
			})
			.catch(() => {
				clearTimeout(timeoutId);
				setSvg(SampleSvg);
			});

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	}, []);

	// === Инициализация svg-pan-zoom с кастомным pinch ===
	useEffect(() => {
		if (!containerRef.current || !svg) return;
		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;

		// Удаляем старый инстанс
		if (panZoomRef.current) {
			try {
				panZoomRef.current.destroy();
			} catch (e) {
				console.warn("Ошибка destroy:", e);
			}
			panZoomRef.current = null;
		}

 		const panZoomInstance = svgPanZoom(svgElement, {
			zoomEnabled: true,
			controlIconsEnabled: false,
			fit: true,
			center: true,
			minZoom: 0.25,
			maxZoom: 10,
		});

		panZoomRef.current = panZoomInstance;

		setTimeout(() => {
			panZoomInstance.resize();
			panZoomInstance.fit();
			panZoomInstance.center();
		}, 0);

		return () => {
			try {
				panZoomInstance.destroy();
			} catch (e) {
				console.warn("Ошибка destroy:", e);
			}
		};
	}, [svg]);

	// === Кнопки управления ===
	const fit = () => {
		if (!panZoomRef.current) return;
		panZoomRef.current.fit();
		panZoomRef.current.center();
	};

	const zoom = (dir: string) => {
		if (!panZoomRef.current) return;
		dir === "+" ? panZoomRef.current.zoomIn() : panZoomRef.current.zoomOut();
	};

	// === Очистка SVG ===
	const cleanSvg = (svgText: string): string => {
		let out = svgText.replace(/<circle\b[^>]*\/\s*>/gi, "");
		out = out.replace(/<circle\b[^>]*>[\s\S]*?<\/circle>/gi, "");
		out = out.replace(
			/width="[\d]+(\.[\d]+)?\s*"\s*height="[\d]+(\.[\d]+)?\s*"\s*viewBox="0\s*0\s*[\d]+(\.[\d]+)?\s*[\d]+(\.[\d]+)?"/gi,
			'width="1300px" height="650px"'
		);
		out = out.replace('transform: scale(1,-1);', "");
		return out;
	};

	return (
		<div
			style={{
				border: "2px solid grey",
				borderRadius: "10px",
				width: "1300px",
				height: "650px",
				touchAction: "none", // 🔥 обязательно для pinch
				position: "relative",
			}}
		>
			{/* Кнопки */}
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
				<div className="mx-2 mt-1">
					<button
						onClick={()=>zoom('-')}
						className={`violet_button navbar_button small_button40`} >
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="carbon:zoom-out"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
				<div className="mx-2 mt-1">
					<button
						onClick={()=>zoom('+')}
						className={`violet_button navbar_button small_button40`} >
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="carbon:zoom-in"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
			</div>

			{/* SVG */}
			<div
				id="workarea"
				ref={containerRef}
				style={{
					border: "none",
					width: "1300px",
					height: "650px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{parse(cleanSvg(svg))}
			</div>
		</div>
	);
};

export default ZoomableSVG;
