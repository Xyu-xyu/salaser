import { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import coordsStore from '../../store/coordStore.jsx';
import editorStore from '../../store/editorStore.jsx';
import partStore from '../../store/partStore.jsx';
import logStore from '../../store/logStore.jsx';
import log from "./../../scripts/log.jsx"
import jointStore from '../../store/jointStore.jsx';
import inlet from '../../scripts/inlet.jsx';
import util from '../../scripts/util.jsx';
import PartSvgComponent from './partSvgComponent.jsx';
import { addToLog } from './../../scripts/addToLog.jsx';

const NAVBAR_OFFSET = 58;
const SEGMENT_SNAP_DISTANCE_MM = 2.5;

/** Размеры viewBox и `rect` сетки: область холста `#wrapper_svg` в тех же единицах, что и после `groupMatrix` × `matrix`. */
function calculateRectParamsFromPartStore() {
	const widthSVG = partStore.svgParams.width;
	const heightSVG = partStore.svgParams.height;
	if (!widthSVG || !heightSVG) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}
	const combinedMatrix = util.multiplyMatrices(partStore.groupMatrix, partStore.matrix);
	const scaleX = combinedMatrix.a;
	const scaleY = combinedMatrix.d;
	if (!scaleX || !scaleY) {
		return { x: 0, y: 0, width: 0, height: 0 };
	}
	return {
		x: -combinedMatrix.e / scaleX,
		y: -combinedMatrix.f / scaleY,
		width: widthSVG / scaleX,
		height: heightSVG / scaleY,
	};
}

function fitPartCanvasToPage() {
	const PADDING = 50;
	const svgWidth = partStore.svgParams.width || window.innerWidth;
	const svgHeight = partStore.svgParams.height || (window.innerHeight - NAVBAR_OFFSET);

	const contentWidth = partStore?.svgData?.width;
	const contentHeight = partStore?.svgData?.height;

	if (!contentWidth || !contentHeight) return;

	const availableWidth = svgWidth - PADDING * 2;
	const availableHeight = svgHeight - PADDING * 2;

	const scaleX = availableWidth / contentWidth;
	const scaleY = availableHeight / contentHeight;

	const scale = Math.min(scaleX, scaleY);

	const scaledWidth = contentWidth * scale;
	const scaledHeight = contentHeight * scale;

	const translateX = (svgWidth - scaledWidth) / 2;
	const translateY = (svgHeight - scaledHeight) / 2;
	partStore.setGroupMatrix({
		a: scale,
		b: 0,
		c: 0,
		d: scale,
		e: translateX,
		f: translateY,
	});
}

const PartSvgWrapper = observer(() => {
	const {
		matrix,  
        groupMatrix,
        offset, 
        gridState,
		selectedText,
		pointInMove
	} =  partStore

	const { jointPositions } = jointStore
	const { a, b, c, d, e, f } = matrix
	const [wrapperClass, setWrapperClass] = useState('')
	const inMoveRef = useRef(0); 
    const wrapperSVG = useRef(null);
	const initialLayoutDoneRef = useRef(false);
	const segmentDraftRef = useRef({
		start: null,          // {x,y}
		startSnapped: false,  // boolean
		prevGuidesMode: null, // boolean|null
	});

	const clearSegmentDraft = () => {
		const prevGuidesMode = segmentDraftRef.current.prevGuidesMode;
		segmentDraftRef.current = { start: null, startSnapped: false, prevGuidesMode: null };
		if (typeof prevGuidesMode === 'boolean') {
			partStore.setGuidesMode(prevGuidesMode)
		}
		partStore.setSegmentDraftPoint(null)
		partStore.setPointInMove(false)
		partStore.setBoundsList(false)
		partStore.setSelectedPointOnEdge(false)
		partStore.updateXGuide({ x1: 0, y1: 0, x2: 0, y2: 0 })
		partStore.updateYGuide({ x1: 0, y1: 0, x2: 0, y2: 0 })
		partStore.updateAGuide({ x1: 0, y1: 0, x2: 0, y2: 0, angle: 0 })
	};

	const resolvePointFromGuidesOrSnap = (e, fallbackCoord) => {
		const { aGuide, xGuide, yGuide, useGuides } = partStore;
		const isGuideVisible = (guide) => guide && !Object.values(guide).every(v => v === 0);
		let coord = { x: fallbackCoord.x, y: fallbackCoord.y }

		const xVisible = useGuides && isGuideVisible(xGuide)
		const yVisible = useGuides && isGuideVisible(yGuide)
		const aVisible = useGuides && isGuideVisible(aGuide)

		if (xVisible || yVisible || aVisible) {
			// Важно: логика совпадает с util.setGuidesPositionForPoint (в проекте xGuide/yGuide исторически названы наоборот)
			if (yVisible) coord.x = +yGuide.x1;
			if (xVisible) coord.y = +xGuide.y1;

			if (aVisible) {
				const { x1, y1, x2, y2 } = aGuide;
				// Нет вертик/горизонт — ставим на ближайшую точку на наклонной
				if (!xVisible && !yVisible) {
					const curPos = util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
					const p = util.findNearestPointOnSegment(curPos.x, curPos.y, x1, y1, x2, y2);
					if (p) coord = { x: p.x, y: p.y };
				} else {
					// есть хотя бы одна из осевых — ставим в пересечение с наклонной
					let base = xVisible ? xGuide : yGuide;
					const edge1 = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
					const edge2 = [{ x: base.x1, y: base.y1 }, { x: base.x2, y: base.y2 }];
					const p = util.intersects(edge1, edge2);
					if (p) coord = { x: p.x, y: p.y };
				}
			}
			return coord;
		}

		// Нет направляющих — пробуем прилипание к ближайшей вершине в радиусе 2.5mm
		const clickCoord = util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
		const nearest = util.findNearesPoint(e);
		if (nearest?.point) {
			const dist = util.distance(clickCoord, nearest.point);
			if (dist <= SEGMENT_SNAP_DISTANCE_MM) {
				return { x: nearest.point.x, y: nearest.point.y };
			}
		}
		// Нет snap и нет guides → округляем до целого
		return { x: Math.round(coord.x), y: Math.round(coord.y) };
	};

	useLayoutEffect(() => {
		const el = wrapperSVG.current;
		if (!el) return;
		const ro = new ResizeObserver((entries) => {
			const cr = entries[0]?.contentRect;
			if (!cr) return;
			const w = Math.max(0, Math.round(cr.width));
			const h = Math.max(0, Math.round(cr.height));
			if (w < 1 || h < 1) return;
			partStore.setSvgParams({ width: w, height: h });
			if (!initialLayoutDoneRef.current) {
				initialLayoutDoneRef.current = true;
				fitPartCanvasToPage();
				coordsStore.setPreloader(false);
			}
			partStore.setRectParams(calculateRectParamsFromPartStore());
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, []);

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
		partStore.setRectParams(calculateRectParamsFromPartStore());
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

		partStore.setRectParams(calculateRectParamsFromPartStore());
    
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
	
			
		} else if (e.button === 0 && editorStore.mode === 'segment') {
			const clickCoord = util.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
			const draft = segmentDraftRef.current;

			// 1) Первый клик — ставим стартовую точку (по guides/snap/округлению как для второй точки)
			if (!draft.start) {
				let start = resolvePointFromGuidesOrSnap(e, clickCoord);
				let snapped = false; // для сегмента нам важно только отображение и boundsList, "snap" как флаг не обязателен

				if (partStore.useGuides) {
					if (segmentDraftRef.current.prevGuidesMode == null) {
						segmentDraftRef.current.prevGuidesMode = partStore.guidesMode
					}
					partStore.setGuidesMode(true)
					// На первом клике всегда используем generic bounds (guides активны сразу при входе в режим)
					partStore.setSelectedPointOnEdge(false)
					partStore.setBoundsList(partStore.boundsList || util.createBoundsListGeneric())
					partStore.setPointInMove(true) // guides уже активны, но на всякий
				}
				partStore.setSegmentDraftPoint(start) // показываем зеленую точку
				segmentDraftRef.current = { ...segmentDraftRef.current, start, startSnapped: snapped };
				return;
			}

			// 2) Второй клик — вычисляем финальную точку по guides/липанию/клику
			const end = resolvePointFromGuidesOrSnap(e, clickCoord);
			const start = draft.start;
			const path = `M${start.x} ${start.y} L${end.x} ${end.y}`;
			partStore.addSegmentPath(path)
			addToLog('Segment added')
			clearSegmentDraft();
			editorStore.setMode('resize')

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
		if (pointInMove && partStore.useGuides) {
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

		// Segment mode: guides активны сразу, обновляем их по курсору всегда
		if (editorStore.mode === 'segment') {
			if (!partStore.useGuides) {
				// guides выключены глобально — убедимся что линии не висят
				partStore.updateXGuide({ x1: 0, y1: 0, x2: 0, y2: 0 })
				partStore.updateYGuide({ x1: 0, y1: 0, x2: 0, y2: 0 })
				partStore.updateAGuide({ x1: 0, y1: 0, x2: 0, y2: 0, angle: 0 })
			} else {
				// на всякий случай держим guides включенными, пока мы в режиме
				if (segmentDraftRef.current.prevGuidesMode == null) {
					segmentDraftRef.current.prevGuidesMode = partStore.guidesMode
				}
				if (!partStore.guidesMode) partStore.setGuidesMode(true)
				if (!partStore.pointInMove) partStore.setPointInMove(true)

				const start = segmentDraftRef.current.start;
				const boundsList = partStore.boundsList || util.createBoundsListGeneric();

				// Включаем стартовую точку в направляющие (если уже поставлена)
				if (start && boundsList?.x && boundsList?.y) {
					boundsList.x.add(start.x)
					boundsList.y.add(start.y)
				}

				if (!partStore.boundsList) partStore.setBoundsList(boundsList)

				// anchor: если есть первая точка — работаем как для второй точки (включая наклонные guides),
				// иначе наклонные не показываем (только x/y).
				const res = util.checkGuidesGeneric(coords, { boundsList, anchor: start || null, threshold: 1 })
				if (res) {
					if (typeof res.yy === 'number') {
						partStore.updateXGuide({ x1: res.min.x, y1: res.yy, x2: res.max.x, y2: res.yy })
					} else {
						partStore.updateXGuide({ x1: 0, y1: 0, x2: 0, y2: 0 })
					}
					if (typeof res.xx === 'number') {
						partStore.updateYGuide({ x1: res.xx, y1: res.min.y, x2: res.xx, y2: res.max.y })
					} else {
						partStore.updateYGuide({ x1: 0, y1: 0, x2: 0, y2: 0 })
					}
					if (res.aa) {
						partStore.updateAGuide({ x1: res.aa.x1, y1: res.aa.y1, x2: res.aa.x2, y2: res.aa.y2, angle: res.aa.a })
					} else {
						partStore.updateAGuide({ x1: 0, y1: 0, x2: 0, y2: 0, angle: 0 })
					}
				}
			}
		}

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

				partStore.setRectParams(calculateRectParamsFromPartStore());
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
		};

	}, []); 

	useEffect(() => { 
		if (coordsStore.needeToFit) {
			fitPartCanvasToPage();
			partStore.setRectParams(calculateRectParamsFromPartStore());
		}		
	}, [coordsStore.needeToFit]); 

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
		} else if (editorStore.mode === 'segment') {
			setWrapperClass('cursorSelecPoint')
		} else {
			setWrapperClass('cursorArrow')
		}
	},
	[editorStore.mode])

	// Segment: при входе включаем guides сразу; при выходе — всё чистим (и отменяем черновик)
	useEffect(() => {
		if (editorStore.mode === 'segment') {
			if (partStore.useGuides) {
				if (segmentDraftRef.current.prevGuidesMode == null) {
					segmentDraftRef.current.prevGuidesMode = partStore.guidesMode
				}
				partStore.setGuidesMode(true)
				partStore.setPointInMove(true)
				if (!partStore.boundsList) {
					partStore.setBoundsList(util.createBoundsListGeneric())
				}
			}
			return;
		}

		if (segmentDraftRef.current.start || segmentDraftRef.current.prevGuidesMode != null) {
			clearSegmentDraft()
		}
	}, [editorStore.mode])

	return (
		<main className="container-fluid h-100 overflow-hidden" id="parteditor">
			<div className="row  align-items-center h-100">
				<div className="w-100 h-100">
					<div className="d-flex w-100 h-100" id="editor_main_wrapper_1">
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