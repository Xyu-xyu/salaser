import React, { useEffect, useRef, useState } from "react";
import svgPanZoom, { zoom } from "svg-pan-zoom";
import SampleSvg from "../store/sampleSvg";
import { Icon } from "@iconify/react/dist/iconify.js";


const ZoomableSVG: React.FC = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const panZoomRef = useRef(null); // 🔹 Храним инстанс
	const [svg, setSvg] = useState("");


	// Загружаем SVG по сети
	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			//setSvg(SampleSvg);
		}, 2000);

		fetch("http://192.168.11.250/gcore/0/preview.svg", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId);
				if (data) {
					setSvg(data);
				} else {
					setSvg(SampleSvg);
				}
			})
			.catch((e) => {
				//console.error("Ошибка загрузки SVG:", e);
				clearTimeout(timeoutId);
				setSvg(SampleSvg);
			});

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	}, []);

	// Подключаем svg-pan-zoom, когда svg обновляется
	useEffect(() => {
		if (!containerRef.current || !svg) return;

		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;

	/* 	if (panZoomRef.current) {
			panZoomRef.current.destroy();
			panZoomRef.current = null;
		} */

		var panZoomInstance = svgPanZoom(svgElement, {
 			zoomEnabled: true,
			controlIconsEnabled: false,
			fit: true,
			center: true,
			minZoom: 0.25,
			maxZoom: 10,
		});

		panZoomRef.current = panZoomInstance;

		return () => {
			panZoomInstance.destroy();
		};
	}, [svg]);

	const fit =()=>{
 		if (panZoomRef.current) {
			panZoomRef.current.fit();
			panZoomRef.current.center();
		}
	}


	const zoom =(str:string)=>{
 		if (panZoomRef.current) {
			if (str === '+') {
				panZoomRef.current.zoomIn();
			} else {
				panZoomRef.current.zoomOut();
			}
		}
	}

	const  removeCirclesFromSvg =(svgText: string): string =>{
		let out = svgText.replace(/<circle\b[^>]*\/\s*>/gi, '');
		out = out.replace(/<circle\b[^>]*>[\s\S]*?<\/circle>/gi, '');
		out = out.replace(/width="[\d]+(\.[\d]+)?\s*"\s*height="[\d]+(\.[\d]+)?\s*"\s*viewBox="0\s*0\s*[\d]+(\.[\d]+)?\s*[\d]+(\.[\d]+)?"/gi, ' width="1300px" height="650px" ');
		out = out.replace('transform: scale(1,-1);', '')

		return out;
	}

	return (
		<div style={{ border: "2px solid grey", borderRadius: '10px', width: "1300px", height: "650px" }}>
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
			<div
				ref={containerRef}
				className="svg-pan-zoom_viewport"
				style={{ border: "none", width: "1300px", height: "650px", display:'flex', alignItems:"center", justifyContent:	"center" }}
				dangerouslySetInnerHTML={{ __html: removeCirclesFromSvg(svg) }}

		/>
		</div>
	);
};

export default ZoomableSVG;
