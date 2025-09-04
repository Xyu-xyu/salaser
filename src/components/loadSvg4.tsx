import React, { useEffect, useRef, useState } from "react";
import svgPanZoom, { fit } from "svg-pan-zoom";
import SampleSvg from "../store/sampleSvg";
import { Icon } from "@iconify/react/dist/iconify.js";


const ZoomableSVG: React.FC = () => {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [svg, setSvg] = useState("");


	// Загружаем SVG по сети
	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			//setSvg(SampleSvg);
		}, 2000);

		fetch("http://192.168.11.249/gcore/0/preview.svg", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId);
				if (data) {
					setSvg(data.replace('transform: scale(1,-1);', ''));
				} else {
					setSvg(SampleSvg);
				}
			})
			.catch((e) => {
				console.error("Ошибка загрузки SVG:", e);
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

		var panZoomInstance = svgPanZoom(svgElement, {
 			zoomEnabled: true,
			controlIconsEnabled: false,
			fit: true,
			center: true,
			minZoom: 0.25,
			maxZoom: 10,
		});

		setTimeout(() => {
			panZoomInstance.resize();
			panZoomInstance.fit();
			panZoomInstance.center();
			console.log ("--------------")
		  }, 3000);

		return () => {
			panZoomInstance.destroy();
		};
	}, [svg]);

	const fit =()=>{
		console.log ( "Щука братт!!")
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
			</div>
			<div
				ref={containerRef}
				className="svg-pan-zoom_viewport"
				style={{ border: "none", width: "1300px", height: "650px", display:'flex', alignItems:"center", justifyContent:	"center" }}
				dangerouslySetInnerHTML={{ __html: svg }}
			/>
		</div>
	);
};

export default ZoomableSVG;
