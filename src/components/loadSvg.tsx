import React, { useEffect, useRef, useState } from "react";
import SampleSvg from "./../store/sampleSvg";
import svgStore from "../store/svgStore";
import util from "../scripts/util";
import { observer } from "mobx-react-lite";


const LoadSvg: React.FC = observer (() => {
	const [svg, setSvg] = useState<string | null>(null);
	const [ wh, setwh] = useState({w:0,h:0})
	const {
		matrix,
		groupMatrix,
		offset,
		rectParams,
		gridState,
		svgParams,		 
	} = svgStore


	const { a, b, c, d, e, f } = matrix
	const [wrapperClass, setWrapperClass] = useState('')
	const wrapperSVG = useRef(null);

	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort(); // ⏳ прерываем запрос через 2 сек
			setSvg(SampleSvg);  // fallback
			setWH (SampleSvg)
		}, 2000);

		fetch("http://192.168.11.246/gcore/0/preview.svg", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId); // ответ успел прийти → отменяем таймер
				if (data) {
					setSvg(data);
					setWH (data)
				}/*  else {
          setSvg(SampleSvg);
        } */
			})
			.catch((e) => {
				console.error("Ошибка загрузки SVG:", e);
				clearTimeout(timeoutId);
				//setSvg(SampleSvg);
			});

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	}, []);

	const setWH = (text:string) =>{
		
		const widthMatch = text.match(/width="(\d+\.\d{2})"/);
		const heightMatch = text.match(/height="(\d+\.\d{2})"/);
		const width = widthMatch ? widthMatch[1] : 0;
		const height = heightMatch ? heightMatch[1] : 0;
		setwh({w:Number(width), h: Number(height)})
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
		let attr = calculateRectAttributes()
		svgStore.setRectParams(attr)
	};

	const calculateRectAttributes = () => {
		//debugger
		const widthSVG = svgParams.width
		const heightSVG = svgParams.height

		// Ширина и высота исходя из scale
		const combinedMatrix = util.multiplyMatrices(groupMatrix, matrix);
		const scaleX = combinedMatrix.a;
		const scaleY = combinedMatrix.d;

		const width = widthSVG / scaleX;
		const height = heightSVG / scaleY;

		// Координаты x и y исходя из translate
		const x = -combinedMatrix.e / scaleX;
		const y = -combinedMatrix.f / scaleY;

		return { x: x, y: y, width: width, height: height }
	};

	if (!svg) return <div>Загрузка…</div>;

	const matrixM = `${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f}`;
    const matrixG = `${groupMatrix.a} ${groupMatrix.b} ${groupMatrix.c} ${groupMatrix.d} ${groupMatrix.e} ${groupMatrix.f}`;
	

	return (
		<div id="wrapper_svg"
			ref={wrapperSVG}
			className={wrapperClass}
			onWheel={handleMouseWheel}
		/* onMouseDown={startDrag}
		onMouseMove={drag}
		onMouseUp={endDrag}
		onMouseLeave={leave}
		onTouchStart={handleTouchStart}
		onTouchMove={handleTouchMove}
		onTouchEnd={handleTouchEnd}
		onTouchCancel={handleTouchEnd} */
		>
			<div
				id="workarea"
				className="planMain"
			>
				<svg
					id="svg"
					baseProfile="full"
					viewBox={`0.00 0.00 ${wh.w} ${wh.h}`}
					style={{ overflow: 'hidden', border: '1px solid var(--color)' }}
					version="1.1"
					stroke='var(--color)'
					strokeWidth="0.2">
					<g id="group1" transform={`matrix(${matrixG})`}>
						<g id="group" transform={`matrix(${matrixM})`} className="grab">
							<g dangerouslySetInnerHTML={{ __html: svg }} />
						</g>
					</g>
				</svg>
			</div>
		</div>

	);
});

export default LoadSvg;
