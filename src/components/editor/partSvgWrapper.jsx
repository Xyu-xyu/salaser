import { useState, useEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import coordsStore from '../../store/coordStore.jsx';
import editorStore from '../../store/editorStore.jsx';
import partStore from '../../store/partStore.jsx';
import jointStore from '../../store/jointStore.jsx';
import inlet from '../../scripts/inlet.jsx';
import util from '../../scripts/util.jsx';
import PartSvgComponent from './partSvgComponent.jsx';
import Part from "./../../scripts/part.jsx";


const PartSvgWrapper = observer(() => {
	const {
		matrix,  
        groupMatrix,
        offset, 
        rectParams,
        gridState,
        svgParams, 
		selectedText,
		pointInMove
	} =  partStore

	const { jointPositions } = jointStore
	const { a, b, c, d, e, f } = matrix
	const [wrapperClass, setWrapperClass] = useState('')
	const inMoveRef = useRef(0); 
    const wrapperSVG = useRef(null);
			
	const handleMouseWheel = (event) => {
		var svg = document.getElementById("svg")
		var gTransform = svg.createSVGMatrix()
		var group = document.getElementById("group").transform.baseVal.consolidate().matrix
		let coords = util.convertScreenCoordsToSvgCoords  (event.clientX, event.clientY);
		let scale = 1.0 + (-event.deltaY * 0.001);

		gTransform = gTransform.translate(coords.x, coords.y);
		gTransform = gTransform.scale(scale, scale);
		gTransform = gTransform.translate(-coords.x, -coords.y);

		let comboMatrix = util.multiplyMatrices(group, gTransform)
		partStore.setMatrix({
			a: comboMatrix.a,
			b: comboMatrix.b,
			c: comboMatrix.c,
			d: comboMatrix.d,
			e: comboMatrix.e,
			f: comboMatrix.f
		});
		let attr = calculateRectAttributes()
		partStore.setRectParams( attr)
	};

	const touchZoom = (event, curDiff, prevDiff) =>{
		//console.log ('** touchZoom **')
		var svg = document.getElementById("svg")
        let scale = curDiff / prevDiff;
		var group = document.getElementById("group").transform.baseVal.consolidate().matrix

        let x = (evCache[0].clientX + evCache[1].clientX) / 2;
        let y = (evCache[0].clientY + evCache[1].clientY) / 2;
        let coords = util.convertScreenCoordsToSvgCoords  (x, y);
    
		var gTransform = svg.createSVGMatrix()
        gTransform = gTransform.translate(coords.x, coords.y);
        gTransform = gTransform.scale(scale, scale);
        gTransform = gTransform.translate(-coords.x, -coords.y);
		let comboMatrix = util.multiplyMatrices(group, gTransform)
		
		partStore.setMatrix({
			a: comboMatrix.a,
			b: comboMatrix.b,
			c: comboMatrix.c,
			d: comboMatrix.d,
			e: comboMatrix.e,
			f: comboMatrix.f
		});

        let attr = calculateRectAttributes()
		partStore.setRectParams( attr)
    
     	/*Применение трансформации к элементу SVG
        let transform = part.svg.createSVGTransform();
        transform.setMatrix(part.gTransform);
        part.group.transform.baseVal.initialize(transform);
        */
    }

    let evCache = []; // Список активных касаний
    let prevDiff = -1; // Предыдущее расстояние между пальцами
    
    // Обработчик начала касания
    const handleTouchStart =(event)=> {
		//console.log ('handleTouchStart')
		if ( editorStore.mode== 'drag') {
			let ee = event.touches[0]	
 			startDrag( ee )
		} else {
			evCache = []; 
        	prevDiff = -1; 
        	evCache.push(event);
		}        
    }
    
    // Обработчик движения пальцев
    const handleTouchMove =(event)=> {
        //console.log ('handleTouchMove')
		if ( editorStore.mode == 'drag' || editorStore.mode == 'dragging' || pointInMove) {
			let ee = event.touches[0]	
			drag ( ee , true)
		} else if ( editorStore.inletMode === 'inletInMoving' ){
			let ee = event.touches[0]	
			drag ( ee , true)
		} else {
			for (let i = 0; i < event.touches.length; i++) {
				evCache[i] = event.touches[i];
			}
		
			if (evCache.length === 2) {
				let curDiff = getDistance(evCache[0], evCache[1]);
		
				if (prevDiff > 0) {
					touchZoom(event, curDiff, prevDiff);
				}
				prevDiff = curDiff;
			}
		}
    }
    
    // Обработчик окончания касания
    const handleTouchEnd =(event) =>{
        //console.log ('handleTouchEnd')
		if ( editorStore.mode== 'dragging'|| pointInMove) {
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
    
    const getDistance = (touch1, touch2)=> {
        let dx = touch1.clientX - touch2.clientX;
        let dy = touch1.clientY - touch2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

	const startDrag = (e) =>{
		//console.log ('startDrag' )
		inMoveRef.current = 1;	
		if (e.target && (e.buttons === 4  || editorStore.mode== 'drag')) {    

			let off = util.getMousePosition(e);
			let transforms = groupMatrix //document.getElementById("group1").transform.baseVal.consolidate().matrix
            off.x -= transforms.e;
            off.y -= transforms.f;
			partStore.setOffset({x:off.x,y:off.y})

        } else if (e.button === 0 && editorStore.mode === 'selectPoint') {

			//console.log ("editorStore.mode   "+editorStore.mode)
			let searchResult = util.findNearesPoint(e)
			partStore.setSelectedPointOnEdge(searchResult)
	
			
		} else if (e.button === 0 && editorStore.mode === 'addPoint') {
			
			//console.log ("editorStore.mode   "+editorStore.mode)
			let contours = partStore.getFiltered('contour')
			let coords = util.convertScreenCoordsToSvgCoords (e.clientX, e.clientY);			
			let min = Infinity
			let point;

			contours.forEach((contour)=>{
				let path = contour.path
				let nearest = util.findNearestPointOnPath (path, { x: coords.x, y: coords.y })
				let distance = util.distance(coords.x, coords.y, nearest.x, nearest.y )
				if (distance < min) {
					min=distance
					point=nearest
					point.cid = contour.cid
					point.path= contour.path
					point.command = nearest.command
				}		
			})
			partStore.setSelectedPointOnPath(point)

		} else if (e.button === 0 && editorStore.mode === 'addJoint') {

			//console.log ('Adding joint')
			let contours = partStore.getFiltered('contour')
			let coords = util.convertScreenCoordsToSvgCoords (e.clientX, e.clientY);			
			let min = Infinity
			let point;
			contours.forEach((contour)=>{
				let path = contour.path
				let nearest = util.findNearestPointOnPath (path, { x: coords.x, y: coords.y })
				let distance = util.distance(coords.x, coords.y, nearest.x, nearest.y )
				if (distance < min) {
					min=distance
					point=nearest
 					point.path= contour.path
					point.cid = contour.cid
 				}		
			})
			let manualDp = util.calculatePathPercentageOptimized (point.cid, point.x, point.y)
			jointStore.updJointVal(point.cid, 'manual', manualDp);	
			addToLog("Added joint")				
			
			
		} else if (e.button === 0 && editorStore.mode === 'removeJoint') {

			let coords = util.convertScreenCoordsToSvgCoords (e.clientX, e.clientY);			
			let min = Infinity
			let nearest;

			jointPositions.forEach((j)=>{
				let distance = util.distance(coords.x, coords.y, j.x, j.y )
				if (distance < min) {
  					min=distance;
					nearest= j; 					 					
 				}					
			})
			//console.log ("TRY TO DELETE THIS" + JSON.stringify(nearest))
			if (nearest) jointStore.removeJoint( nearest )
			addToLog("Removed joint")

		} else if (e.button === 2) {

			let selectedEdge = util.selectEdge(e)
			//console.log ( selectedEdge )
			partStore.setSelectedEdge ( selectedEdge )
			
		} 
	}

	const endDrag =(e) =>{
		inMoveRef.current = 0;	
		if ( pointInMove ) {
			util.setGuidesPositionForPoint (e)
			addToLog("Contour was changed")
		}
		if (editorStore.mode === 'dragging') {
			if (partStore.selectedPointOnEdge) {
				editorStore.setMode('selectPoint')
			} else if (partStore.selectedPointOnPath) {
				editorStore.setMode('addPoint')
			} else if (partStore.selectedPath) {
				editorStore.setMode('resize')
			} else {
				editorStore.setMode('resize')
			}
		}
	}

	const leave =(e)=>{	
		coordsStore.setCoords({ x:0,y:0});
	}

	const drag =(e, force=false ) =>{

 		let coords= util.convertScreenCoordsToSvgCoords  (e.clientX, e.clientY)
		coordsStore.setCoords({ x: Math.round( coords.x*100) / 100, y: Math.round( coords.y*100) / 100 });
		if (e.target && 
				(
					(e.buttons === 4)  || 
					(editorStore.mode== 'drag' && e.buttons === 1) || 
					(editorStore.mode== 'drag' && force) || 
					(editorStore.mode== 'dragging' && e.buttons === 1) ||
					(editorStore.mode== 'dragging' && force)
				)
			) 
		{
			if (!inMoveRef.current) return;
			var coord = util.getMousePosition(e);
			if (e.target && (e.buttons === 4 || e.buttons === 1 || force)){
				let e = (coord.x - offset.x)
				let f = (coord.y - offset.y) 
				partStore.setGroupMatrix({
					a: groupMatrix.a,
					b: groupMatrix.b,
					c: groupMatrix.c,
					d: groupMatrix.d,
					e: e,
					f: f,
				})

				let attr = calculateRectAttributes()
				partStore.setRectParams( attr)
			}
			editorStore.setMode('dragging')
		} else if ( 
			(e.buttons === 1  &&   editorStore.inletMode === 'inletInMoving') ||
			(force  &&   editorStore.inletMode === 'inletInMoving') 
		) {
			inlet.getNewPathsInMove (coords)				
		} else if (
				( e.button === 0 && pointInMove ) ||
				( force && pointInMove )
			) {
			util.pointMoving(e, coords)			
		}		
	}
 
	useEffect(() => {
		let rr = Part.getSvgParams()
		partStore.setSvgParams( rr )
 		const timeoutId = setTimeout(() => {
			//console.log ('Delayed message after 2 seconds!');
 			fitToPage()
			coordsStore.setPreloader(false)
			let attr = calculateRectAttributes()
			partStore.setRectParams( attr)
		}, 500);
	  		
		const handleKeyDown = (e) => {
				console.log ('handleKeyDown')
				if (!selectedText && e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === 'z' || e.key.toLowerCase() === 'я')) { 
					e.preventDefault();
					console.log('Ctrl+Z was pressed!');
					logStore.setNext()
					log.restorePoint()
	
				} else if (!selectedText && e.ctrlKey && (e.key.toLowerCase() === 'z'|| e.key.toLowerCase() === 'я')) {
					e.preventDefault();
					console.log('Ctrl+Z was pressed!');
					logStore.setPrev()	
					log.restorePoint()			
				} else if (!selectedText && e.key === 'Delete') {
					e.preventDefault();
					console.log('Delete was pressed!');	
				} /* else if (!selectedText && e.key === ' ') {
					e.preventDefault();
					console.log('Space was pressed!');
				}  else if (!selectedText && e.ctrlKey && e.key.toLowerCase() === 'c') {
					e.preventDefault();
				} else if (!selectedText && e.ctrlKey && e.key.toLowerCase() === 'v') {
					e.preventDefault();
				}  */
			}
	
		window.addEventListener('keydown', handleKeyDown);
		return () => {
		  window.removeEventListener('keydown', handleKeyDown);
		  clearTimeout(timeoutId); 
		};

	}, []); 

	useEffect(() => { 
		if (coordsStore.needeToFit) {
 			fitToPage()		 
		}		
	}, [coordsStore.needeToFit]); 

	const fitToPage =() => {
		//console.log (coordsStore.fittedPosition)

		if (!coordsStore.fittedPosition) {
			//console.log('calculate without store')

			partStore.setRectParams({x:0, y:0, width: 0, height: 0})
			partStore.setMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
			partStore.setGroupMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
 
			let box = document.querySelector('#group').getBoundingClientRect()
			const wBox = wrapperSVG.current.getBoundingClientRect();
			
			let scaleW = wBox.width/ box.width
			let scaleH = wBox.height / box.height
			let scale = scaleW < scaleH ? scaleW : scaleH

			let xd = (box.x + box.width * 0.5)
			let yd = (box.y + box.height * 0.5)

			let coords1 = util.convertScreenCoordsToSvgCoords (xd, yd);
			let center = util.convertScreenCoordsToSvgCoords (wBox.x+wBox.width*0.5, wBox.y+wBox.height*0.5)
		
			let outerBox = document.querySelector('#contours').getBoundingClientRect()
			let oxd = (outerBox.x + outerBox.width * 0.5)
			let oyd = (outerBox.y + outerBox.height * 0.5)

			let dif = util.convertScreenCoordsToSvgCoords (oxd, oyd)
			let ydif = dif.y - center.y
			let xdif = dif.x - center.x

			let matrixN = { a: scale, b: 0, c: 0, d: scale, e: coords1.x - coords1.x * scale-xdif, f: coords1.y - coords1.y * scale-ydif }
			//TODO ЗДЕСЬ в некоторых случаях вылезает ошибка и матрица  получает неверные значения
			////TODOTODO//TDOD  потестить где баг есть!!!
			let allNumbersAreValid = Object.values(matrixN).every(value => Number.isFinite(value));
			if ( allNumbersAreValid ) {
				partStore.setGroupMatrix (matrixN)
			}		
			
 			coordsStore.setNeedToFit(false)
			coordsStore.setFittedPosition ({matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }, 'groupMatrix': matrixN , 'rectParams':rectParams})

		} else {
			//console.log('from store')
			partStore.setMatrix(coordsStore.fittedPosition.matrix)
			partStore.setGroupMatrix(coordsStore.fittedPosition.groupMatrix)
			partStore.setRectParams(coordsStore.fittedPosition.rectParams)
			coordsStore.setNeedToFit(false)
 
		/*	TODO: доделть смещение e f.
			масштаб поучаем из мм1
			а вот смещение надо рпассчитать как отклонение центра swgWrapper от центра outer при том что это  постоянное 
			соотношение... от соотношение рахмеров окна и svg
			//console.log ("matrix  " + JSON.stringify(toJS(coordsStore.fittedPosition.matrix)))
			//console.log ( "groupMatrix  " + JSON.stringify(toJS(coordsStore.fittedPosition.groupMatrix)))

			
			let mm1 = document.querySelector('#group1').transform.baseVal.consolidate().matrix
			//console.log(mm1)
			partStore.setMatrix( { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
			partStore.setGroupMatrix(mm1)
			coordsStore.setNeedToFit(false)		
  			*/
		}	
    }

	useEffect(() => {
		//console.log ('UseEffect in Matrix')
		const updatedState = JSON.parse(JSON.stringify(gridState));
		if (matrix.a < 0.25) {
			updatedState.xsGrid.visibility = "hidden";
			updatedState.smallGrid.fill = "var(--gridColorFill)";
		} else {
			updatedState.xsGrid.visibility = "visible";
			updatedState.smallGrid.fill = "none";
		}

		if (matrix.a < 0.125) {
			updatedState.smallGrid.visibility = "hidden";
			updatedState.grid.fill = "var(--gridColorFill)";
		} else {
			updatedState.smallGrid.visibility = "visible";
			updatedState.grid.fill = "none";
		}

		if (matrix.a > 85) {
			updatedState.grid.visibility = "hidden";
		} else {
			updatedState.grid.visibility = "visible";
		}
		partStore.setGridState(updatedState);
	}, [a, b, c , d, e, f]);

	useEffect(()=>{
		console.log (editorStore.mode)
		if (editorStore.mode === 'resize') {
			setWrapperClass('cursorArrow')
		} else if (editorStore.mode === 'drag') {
			setWrapperClass('cursorGrab')
		} else if (editorStore.mode === 'dragging') {
			setWrapperClass('cursorGrabbing')
		} else if (editorStore.mode === 'addPoint') {
			setWrapperClass('cursorCustomPlus')
		} else if (editorStore.mode === 'selectPoint') {
			setWrapperClass('cursorSelecPoint')
		} else if (editorStore.mode === 'text') {
			setWrapperClass('cursorText')
		} else if (editorStore.mode === 'addJoint') {
			setWrapperClass('cursorAddJoint')
		} else if (editorStore.mode === 'removeJoint') {
			setWrapperClass('cursorRemoveJoint')
		} else {
			setWrapperClass('cursorArrow')
		}
	},
	[editorStore.mode])

	const calculateRectAttributes = () => {
		//debugger
		const widthSVG = svgParams.width
		const heightSVG = svgParams.height
	
        // Ширина и высота исходя из scale
        const combinedMatrix = util.multiplyMatrices(groupMatrix, matrix);
        const scaleX = combinedMatrix.a;
        const scaleY = combinedMatrix.d;

        const width = widthSVG/ scaleX;
        const height = heightSVG / scaleY;

        // Координаты x и y исходя из translate
        const x = -combinedMatrix.e / scaleX;
        const y = -combinedMatrix.f / scaleY;

        return { x:x, y:y, width:width, height:height }
    };

	return (
		<main className="container-fluid h-100 overflow-hidden" id="parteditor">
			<div className="row  align-items-center h-100">
				<div className="w-100 h-100">
					<div className="d-flex" id="editor_main_wrapper">
						<div id="wrapper_svg" 
							ref={wrapperSVG}
							className={ wrapperClass }		 
		 					onWheel = {handleMouseWheel} 
							onMouseDown = {startDrag}
							onMouseMove = {drag} 
							onMouseUp = {endDrag}
							onMouseLeave = {leave}
							onTouchStart = {handleTouchStart}
                			onTouchMove = {handleTouchMove}
                			onTouchEnd = {handleTouchEnd}
                			onTouchCancel = {handleTouchEnd}
							>
								<PartSvgComponent />	 
						</div>
					</div>
				</div>	
			</div>
		</main>

	);
});

export default PartSvgWrapper;