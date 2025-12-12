import { observer } from "mobx-react-lite";
import partStore from "./../../store/partStore.jsx";
import editorStore from "./../../store/editorStore.jsx";
import Util from "./../../scripts/util.jsx";
import inlet from "./../../scripts/inlet.jsx";
import { useEffect, useState } from "react";
//import { addToLog } from './../scripts/addToLog.js';
import SVGPathCommander from "svg-path-commander";

const PartSelector = observer(() => {

	const { selectedPath, selectedCid, selectorCoords } = partStore;
	const [visibility, setVisibility] = useState( false )
	const [ inMove, setInmove] = useState( false ) 
	useEffect(()=>{
		if (!selectedPath) {
			partStore.setSelectorCoords({ x: 0, y: 0, width: 0, height: 0 })
			setVisibility(false)
		} else {
			setVisibility(true)
			if (!inMove) {
				//const box = SVGPathCommander.getPathBBox(selectedPath);
				const box = Util.fakeBox(selectedPath);
				//console.log (box)
				partStore.setSelectorCoords({ x: box.x, y: box.y, width: box.width, height: box.height })
			}		
		}
	},[ selectedCid, selectedPath ])


	let circleSize =  (selectorCoords.width + selectorCoords.height) / 40;
	circleSize = circleSize > 3 ? 3 : (circleSize < 0.5 ? 0.5 : circleSize)
	let part = {};
	part.svg = document.getElementById("svg")

	const handleMouseDown = (e) => {
		//console.log (e.type)
		setInmove(true)
		if (editorStore.mode !== "resize") return;
		part.resizingHandle = e.currentTarget.id;
		part.start = Util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
		part.dif = {}
		part.dif.x = selectorCoords.x +selectorCoords.width*0.5 - part.start.x
		part.dif.y = selectorCoords.y - part.start.y

		//const cbox = SVGPathCommander.getPathBBox(selectedPath);
		const cbox = Util.fakeBox(selectedPath);
		part.initialRectLeft = cbox.x;
        part.initialRectTop = cbox.y;
		part.initialHeight = cbox.height
		part.initialWidth = cbox.width

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);

		document.addEventListener('touchmove', handleMouseMove);
		document.addEventListener('touchend', handleMouseUp);

	}
	const handleMouseMove = (e) => {
		let newCoords;
		//console.log (e.type)

		if (e.type === 'touchmove') {
			part.current = Util.convertScreenCoordsToSvgCoords(e.touches[0].clientX, e.touches[0].clientY);

		} else {
			part.current = Util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
		}
		
		switch (part.resizingHandle) {
			case 'selectorGrip_resize_n':                
				newCoords = {
					x: selectorCoords.x,
					y: part.current.y,
					width: selectorCoords.width,
					height: selectorCoords.y - part.current.y + selectorCoords.height,
				};
				break;
	
			/*case 'selectorGrip_resize_nw':
				newCoords = {
					x: part.current.x,
					y: part.current.y,
					width: selectorCoords.x + selectorCoords.width - part.current.x,
					height: selectorCoords.y - part.current.y + selectorCoords.height,
				};
				break; */
			case 'selectorGrip_resize_nw':
				let width_nw = selectorCoords.x + selectorCoords.width - part.current.x;
				let height_nw = selectorCoords.y - part.current.y + selectorCoords.height;
				let currentAspectRatio_nw = part.initialWidth / part.initialHeight;
				let newAspectRatio_nw = width_nw / height_nw;
			
				if (newAspectRatio_nw > currentAspectRatio_nw) {
 					width_nw = height_nw * currentAspectRatio_nw;
				} else {
 					height_nw = width_nw / currentAspectRatio_nw;
				}
			
				newCoords = {
					x: selectorCoords.x + selectorCoords.width - width_nw,
					y: selectorCoords.y + selectorCoords.height - height_nw,
					width: width_nw,
					height: height_nw
				};
				break;
				
	
			case 'selectorGrip_resize_w':
				newCoords = {
					x: part.current.x,
					y: selectorCoords.y,
					width: selectorCoords.x + selectorCoords.width - part.current.x,
					height: selectorCoords.height,
				};
				break;
	
			/*case 'selectorGrip_resize_sw':
				newCoords = {
					x: part.current.x,
					y: selectorCoords.y,
					width: selectorCoords.x + selectorCoords.width - part.current.x,
					height: part.current.y - selectorCoords.y,
				};
				break; */
			case 'selectorGrip_resize_sw':
				let width_sw = selectorCoords.x + selectorCoords.width - part.current.x;
				let height_sw = part.current.y - selectorCoords.y;
				let currentAspectRatio_sw = part.initialWidth / part.initialHeight;
				let newAspectRatio_sw = width_sw / height_sw;
			
				if (newAspectRatio_sw > currentAspectRatio_sw) {
 					width_sw = height_sw * currentAspectRatio_sw;
				} else {
 					height_sw = width_sw / currentAspectRatio_sw;
				}
			
				newCoords = {
					x: selectorCoords.x + selectorCoords.width - width_sw,
					y: selectorCoords.y,
					width: width_sw,
					height: height_sw
				};
				break;
				
	
			case 'selectorGrip_resize_s':
				newCoords = {
					x: selectorCoords.x,
					y: selectorCoords.y,
					width: selectorCoords.width,
					height: part.current.y - selectorCoords.y,
				};
				break;
	
			/*case 'selectorGrip_resize_se':
				newCoords = {
					x: selectorCoords.x,
					y: selectorCoords.y,
					width: part.current.x - selectorCoords.x,
					height: part.current.y - selectorCoords.y,
				};
				break;*/
			case 'selectorGrip_resize_se':
				let width_se = part.current.x - selectorCoords.x;
				let height_se = part.current.y - selectorCoords.y;
				let currentAspectRatio_se = part.initialWidth / part.initialHeight;
				let newAspectRatio_se = width_se / height_se;
			
				if (newAspectRatio_se > currentAspectRatio_se) {
 					width_se = height_se * currentAspectRatio_se;
				} else {
 					height_se = width_se / currentAspectRatio_se;
				}
			
				newCoords = {
					x: selectorCoords.x,
					y: selectorCoords.y,
					width: width_se,
					height: height_se
				};
				break;
				
	
			case 'selectorGrip_resize_e':
				newCoords = {
					x: selectorCoords.x,
					y: selectorCoords.y,
					width: part.current.x - selectorCoords.x,
					height: selectorCoords.height,
				};
				break;
	

			/*case 'selectorGrip_resize_ne':
				newCoords = {
					x: selectorCoords.x,
					y: part.current.y,
					width: part.current.x - selectorCoords.x,
					height: selectorCoords.y - part.current.y + selectorCoords.height,
				};
				break;*/
			case 'selectorGrip_resize_ne':
				let width_ne = part.current.x - selectorCoords.x;
				let height_ne = selectorCoords.y - part.current.y + selectorCoords.height;
				let currentAspectRatio_ne = part.initialWidth / part.initialHeight;
				let newAspectRatio_ne = width_ne / height_ne;
			
				if (newAspectRatio_ne > currentAspectRatio_ne) {
					height_ne = width_ne / currentAspectRatio_ne;
				} else {
					width_ne = height_ne * currentAspectRatio_ne;
				}
			
				newCoords = {
					x: selectorCoords.x,
					y: selectorCoords.y + selectorCoords.height - height_ne,
					width: width_ne,
					height: height_ne
				};
				break;
				
	
			case 'selectorGrip_central':
				newCoords = {
					x: part.current.x - selectorCoords.width / 2,
					y: part.current.y - selectorCoords.height / 2,
					width: selectorCoords.width,
					height: selectorCoords.height,
				};
				break;
		}

		if (newCoords.height <= 0 || newCoords.width <= 0 ) return;
		//partStore.setSelectorCoords(newCoords);

 		let scaleX = newCoords.width / part.initialWidth
        let scaleY = newCoords.height / part.initialHeight
        let translateX = newCoords.x - newCoords.x * scaleX
        let translateY = newCoords.y - newCoords.y * scaleY

        translateX = newCoords.x - newCoords.x * scaleX - (part.initialRectLeft - newCoords.x) * scaleX
        translateY = newCoords.y - newCoords.y * scaleY - (part.initialRectTop - newCoords.y) * scaleY

		let newPath = Util.applyTransform (partStore.selectedPath, scaleX, scaleY, translateX, translateY)
		let cid =  partStore.getSelectedElement('cid') 
		let resp = inlet.getNewInletOutlet(cid, 'contour', 'path', newPath )	
		let result = inlet.applyNewPaths (resp )
		if ((partStore.safeMode.mode && result) || !partStore.safeMode.mode) {
 				let classes = partStore.getElementByCidAndClass ( cid, 'contour', 'class')
				partStore.setSelectorCoords(newCoords);
				//console.log ('classes' + classes)
				if (classes.includes('outer')) {
					partStore.setNewPartSize(newCoords.width, newCoords.height)
				}
				part.initialHeight = newCoords.height
				part.initialWidth = newCoords.width 
				part.initialRectLeft = newCoords.x
				part.initialRectTop = newCoords.y	
		}

		//UPDATE SKELETON TEXT PARAMS
		let classes =  partStore.getSelectedElement('class')
		if ( classes && classes.includes('skeletonText') && result) {
			let textStart=  partStore.getElementByCidAndClass( cid, 'contour', 'coords')
			let curScaleX = partStore.getElementByCidAndClass( cid, 'contour', 'scaleX')
			let curScaleY = partStore.getElementByCidAndClass( cid, 'contour', 'scaleY')
			curScaleX *= scaleX
			curScaleY *= scaleY

			let fakePath = 'M '+textStart.x +' '+textStart.y
			let fuckPath = Util.applyTransform (fakePath, scaleX, scaleY, translateX, translateY)
			fuckPath = SVGPathCommander.normalizePath( fuckPath )
			let newStart = { x: fuckPath[0][1], y: fuckPath[0][2] };
			
			partStore.updateElementValues(cid, 'contour', {
				coords: newStart,
				scaleX: curScaleX,
				scaleY: curScaleY
			});					
		}
	};

	const handleMouseUp = (e) => {
		part = {};
		document.removeEventListener('mousemove', handleMouseMove);
		document.removeEventListener('mouseup', handleMouseUp);

		document.removeEventListener('touchmove', handleMouseMove);
		document.removeEventListener('touchend', handleMouseUp);

		setInmove(false)
		//addToLog('Contour changed by selector')
	}

	return (
		<>
			<g id="selectorPart" className={visibility ? '' : ''}>
				<rect
					x={selectorCoords.x}
					y={selectorCoords.y}
					width={selectorCoords.width}
					height={selectorCoords.height}
					fill="none"
					stroke="black"
					strokeWidth={circleSize / 10}>
				</rect>
				<circle
					onMouseDown={handleMouseDown}
                    onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_nw"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "nwResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x}
					cy={selectorCoords.y}>
				</circle>
				<circle
					onMouseDown={handleMouseDown}
                    onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_ne"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "neResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x + selectorCoords.width}
					cy={selectorCoords.y}>
				</circle>
				<circle
					onMouseDown={handleMouseDown}
                    onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_sw"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "swResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x}
					cy={selectorCoords.y + selectorCoords.height}>
				</circle>
				<circle
					onMouseDown={handleMouseDown}
                    onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_se"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "seResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x + selectorCoords.width}
					cy={selectorCoords.y + selectorCoords.height}>
				</circle>
				<circle
					onMouseDown={ handleMouseDown }
					onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_n"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "nResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x + selectorCoords.width * 0.5}
					cy={selectorCoords.y}>
				</circle>
				<circle
					onMouseDown={handleMouseDown}
					onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_w"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "wResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x}
					cy={selectorCoords.y + selectorCoords.height * 0.5}>
				</circle>
				<circle
					onMouseDown={handleMouseDown}
					onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_s"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "sResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x + selectorCoords.width * 0.5}
					cy={selectorCoords.y + selectorCoords.height}>
				</circle>
				<circle
					onMouseDown={handleMouseDown}
					onTouchStart={ handleMouseDown }
					id="selectorGrip_resize_e"
					fill="black" stroke="white"
					r={circleSize}
					style={{ cursor: "eResize" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x + selectorCoords.width}
					cy={selectorCoords.y + selectorCoords.height * 0.5}>
				</circle>
				<circle
					onMouseDown={handleMouseDown}
					onTouchStart={ handleMouseDown }
					id="selectorGrip_central"
					fill="white" stroke="black"
					r={circleSize}
					style={{ cursor: "move" }}
					strokeWidth={circleSize / 10}
					pointerEvents="all"
					cx={selectorCoords.x + selectorCoords.width * 0.5}
					cy={selectorCoords.y + selectorCoords.height * 0.5}>
				</circle>
			</g>
		</>
	);
})

export default PartSelector;
