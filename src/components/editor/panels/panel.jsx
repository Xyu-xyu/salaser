import { observer } from "mobx-react-lite";
import React, { useState, useRef, useEffect } from "react";
import panelStore from "./../../../store/panelStore";
//import { toJS } from "mobx";


const Panel = observer (({ element, index }) => {
	const id =element.id

	useEffect(()=>{
		panelStore.getInitialPositions()
	},[])
	
	
	const [zIndex, setZIndex] = useState(index+1);
	const panelRef = useRef(null);
	const startPos = useRef({ x: 0, y: 0 });
	const startWidth = useRef(0);
	const startHeight = useRef(0);
	const startY = useRef(0);
	const startX = useRef(0);
	const move = useRef(0);

 	const toggleMinified = () => {
		let positions = {
			style:{
				width: panelStore.positions[id].style.width,
				height:panelStore.positions[id].style.height,
				top:   panelStore.positions[id].style.top,
				left:  panelStore.positions[id].style.left				
			}
		}
		positions.mini = Boolean(!Number( panelStore.positions[id].mini ))
		panelStore.setPosition(id, positions)
		savePanelPosition()
	};

 	const handleMouseDown = (e) => {
		handleIncreaseZIndex()
		e.preventDefault();
		e.stopPropagation();
		startPos.current = {
			x: e.clientX - panelRef.current.offsetLeft,
			y: e.clientY - panelRef.current.offsetTop,
		};

		move.current = 'move'

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	};

	const initDrag =(e)=>{
		startX.current = e.clientX;
        startY.current = e.clientY;

		startWidth.current = panelStore.positions[id].style.width
		startHeight.current = panelStore.positions[id].style.height

		move.current = 'resize'
			
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
	}
	
	const handleMouseMove = (e) => {
		if (move.current === 'move') {
			const newLeft = e.clientX - startPos.current.x;
			const newTop = e.clientY - startPos.current.y;
			/* setPosition({
				top: newTop,
				left: newLeft,
			}); */
			let positions = {
				style:{
					top:newTop,
					left:newLeft,
					width:panelStore.positions[id].style.width,
					height:panelStore.positions[id].style.height,
				}
			}
			positions.mini = panelStore.positions[id].mini
			panelStore.setPosition(id, positions)


		} else {
			let w = startWidth.current + e.clientX - startX.current ;
			let h = startHeight.current + e.clientY - startY.current;
			/* setSize ({
				width:w,
				height:h
			}) */
			
            let positions = {
				style:{
					top:panelStore.positions[id].style.top,
					left:panelStore.positions[id].style.left,
					width:w,
					height:h,
				}
			}
			positions.mini = panelStore.positions[id].mini
			panelStore.setPosition(id, positions)

		}
	};

	const handleMouseUp = () => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
		move.current= ''
		savePanelPosition()
	};

	const findHighestZIndex = () => {
		let currentMaxZIndex = 0;
		const popups = document.querySelectorAll('.window.popup');
		popups.forEach((popup) => {
			const zIndex = getComputedStyle(popup).getPropertyValue('z-index');
			const parsedZIndex = parseInt(zIndex, 10);

			if (!isNaN(parsedZIndex) && parsedZIndex > currentMaxZIndex) {
				currentMaxZIndex = parsedZIndex;
			}
		});
		return currentMaxZIndex;
	};

	const handleIncreaseZIndex = () => {
		const currentMaxZIndex = findHighestZIndex();
		setZIndex(currentMaxZIndex + 1);
		console.log ('Set Z')
	};

	const  savePanelPosition =(id)=>{
		console.log("SavePositions")
		let ppp = localStorage.getItem('ppp')
		if (!ppp) {
            let ppp = {}
            ppp.positions = panelStore.positions
            localStorage.setItem('ppp', JSON.stringify(panelStore.positions))
        } else {
 			localStorage.setItem('ppp', JSON.stringify(panelStore.positions))
        }
	}   


	return (
		<div
			ref={panelRef}
			id={element.id}
			className={`window popup ${panelStore.positions[id].mini ? " mini h45" : ""}`}
			style={{
				zIndex: zIndex,
				top: `${panelStore.positions[id].style.top}px`,
				left: `${panelStore.positions[id].style.left}px`,
				width: `${panelStore.positions[id].style.width}px`,
				height: `${panelStore.positions[id].mini ? 45 : panelStore.positions[id].style.height}px`,
			}}			
		>
			<div className="window-top popup-header" 
				onMouseDown={handleMouseDown}>
				<div className="d-flex align-items-center justify-content-between">
					<div className="nav-link">
						<div className="d-flex align-items-center">
							{element.fa}
						</div>
					</div>
					<div className="minify_wrapper d-flex align-items-center justify-content-center">
						<div
							className={`minify ${panelStore.positions[id].mini ? "minified" : ""}`}
							onClick={(e) => {
								e.stopPropagation();
								toggleMinified();
							}}
						></div>
					</div>
				</div>
			</div>
			<div className={`window-content ${panelStore.positions[id].mini ? "mini" : ""}`}>
				{element.content}
			</div>
			<div 
				className={`resizer-right ${panelStore.positions[id].mini ? "mini" : ""}`}
				onMouseDown={initDrag}				
				onMouseUp={handleMouseUp}
			></div>
			<div 
				className={`resizer-bottom ${panelStore.positions[id].mini ? "mini" : ""}`}
				onMouseDown={initDrag}
				onMouseUp={handleMouseUp}
			></div>
			<div 
				className={`resizer-both ${panelStore.positions[id].mini ? "mini" : ""}`}
				onMouseDown={initDrag}
				onMouseUp={handleMouseUp}
			></div>
		</div>
	);
});

export default Panel;