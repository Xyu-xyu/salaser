import React, { useEffect, useRef, useState } from "react";
import SampleSvg from "./../store/sampleSvg";
import svgStore from "../store/svgStore";
import util from "../scripts/util";
import { observer } from "mobx-react-lite";


const LoadSvg: React.FC = observer (() => {
	const inMoveRef = useRef(0); 
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
	const matrixM = `${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f}`;
    const matrixG = `${groupMatrix.a} ${groupMatrix.b} ${groupMatrix.c} ${groupMatrix.d} ${groupMatrix.e} ${groupMatrix.f}`;
	 
	const [wrapperClass, setWrapperClass] = useState('')
	const wrapperSVG = useRef(null);

	let evCache = []; // Список активных касаний
    let prevDiff = -1; // Предыдущее расстояние между пальцами

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
		//let attr = calculateRectAttributes()
		//svgStore.setRectParams(attr)
	};

/* 	const calculateRectAttributes = () => {
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
 */
	const getDistance = (touch1, touch2)=> {
        let dx = touch1.clientX - touch2.clientX;
        let dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

	const startDrag = (e) =>{
		//console.log ('startDrag' )
		inMoveRef.current = 1;	
		let off = util.getMousePosition(e);
		let transforms = groupMatrix
		off.x -= transforms.e;
		off.y -= transforms.f;
		svgStore.setOffset({x:off.x,y:off.y})
          
	}

	const endDrag =()=>{
		inMoveRef.current = 0;	
	}

	const drag =(e) =>{

		if (!inMoveRef.current) return;
		var coord = util.getMousePosition(e);
		if (e.target && (e.buttons === 4 || e.buttons === 1 )){
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

			//let attr = calculateRectAttributes()
			//svgStore.setRectParams( attr)
		}
		//editorStore.setMode('dragging')
	}

    
    // Обработчик начала касания
    const handleTouchStart =(event)=> {
		//event.preventDefault()
		event.stopPropagation()
		console.log ('handleTouchStart    '+ event.target.id )
		//if (event.target.id !== 'svg') return

		if ( false /* ||editorStore.mode== 'drag' */) {
			let ee = event.touches[0]	
 			startDrag( ee )
		} else {
			evCache = []; 
        	prevDiff = -1; 
        	evCache.push(event.touches[0]);
		}        
    }

	const handleTouchMove =(event)=> {
		//event.preventDefault()
		event.stopPropagation()
		console.log ('handleTouchMove  ' + event.target.classList )
		//if (event.target.id !== 'svg') return
		if ( false ) {
			let ee = event.touches[0]	
			drag ( ee )
		} else {
			for (let i = 0; i < event.touches.length; i++) {
				evCache[i] = event.touches[i];
			}
		
			if (evCache.length === 2) {
				let curDiff = getDistance(evCache[0], evCache[1]);
		
				if (prevDiff > 0) {
					touchZoom(curDiff / prevDiff);
				}
				prevDiff = curDiff;
			}
		} 
    }
    
    // Обработчик окончания касания
    const handleTouchEnd =(event) =>{
		//event.preventDefault()
		//event.stopPropagation()
		//if (event.target.id !== 'svg') return
        console.log ('handleTouchEnd  ' + event.target.id )
		if ( false ) {
			endDrag( e )
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

	const touchZoom = ( scale:number ) =>{
		console.log ('** touchZoom **')
		var svg = document.getElementById("svg")
        //let scale = curDiff / prevDiff;
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

        //let attr = calculateRectAttributes()
		//svgStore.setRectParams( attr)
    }
    


	if (!svg) return <div>Загрузка…</div>;


	return (
		<div id="wrapper_svg"
			ref={wrapperSVG}
			className={wrapperClass}
		>
			<div
				id="workarea"
				className="planMain"
			>
				<svg
					id="svg"
					baseProfile="full"
					viewBox={`0.00 0.00 ${wh.w} ${wh.h}`}
					style={{ overflow: 'hidden', border: '1px solid var(--color)', touchAction: "none" }}
					version="1.1"
					stroke='var(--color)'
					strokeWidth="0.2"
					touch-action="none" 
					pointer-events="all"

					onWheel={handleMouseWheel}
					onMouseDown={startDrag}
					onMouseMove={drag}
					onMouseUp={endDrag}
					
					onTouchStart={handleTouchStart}
					onTouchMove={handleTouchMove}
					onTouchEnd={handleTouchEnd}
					onTouchCancel={handleTouchEnd}

				   >
					<g id="group1" transform={`matrix(${matrixG})`}>
						<g id="group" transform={`matrix(${matrixM})`} className="grab">
							<g dangerouslySetInnerHTML={{ __html: svg.replace('<svg', '<svg touch-action="none" pointer-events="all"') }} />
						</g>
					</g>
				</svg>
			</div>
		</div>

	);
});

export default LoadSvg;
