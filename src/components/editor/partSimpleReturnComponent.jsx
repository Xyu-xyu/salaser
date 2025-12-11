import { observer } from "mobx-react-lite";
import partStore from "../../store/partStore.jsx";
import editorStore from "../../store/editorStore.jsx";
import Part from "../../scripts/part.jsx";
import React, { useEffect, useRef } from 'react';
import jointStore from "../../store/jointStore.jsx";
 import constants from "../../store/constants.jsx";

const PartSimpleReturnComponent = observer(() => {

 	const pollingTimeoutRef = useRef(null);
	const {	selectedCid } = partStore;	

/* 	useEffect(()=>{
		partStore.setSvgData( constants.svg );		
	}, []); */

	const setSelectedTouch = (e) => {
		if ( editorStore.mode === 'resize') {
			let cid = Number(e.currentTarget.getAttribute('data-cid'));
			if (typeof cid === 'number') {
				if (cid !== selectedCid) {
					partStore.setContourSelected(cid)
				} else {
					//console.log (e)
					let inlet = e.currentTarget.classList.contains('inlet')
					let outlet = e.currentTarget.classList.contains('outlet')				
					if ( (inlet || outlet) && editorStore.inletMode === 'move' ) {
						editorStore.setInletMode('inletInMoving')
						//console.log ('setSelected and start in mode  ****')						
					}				
				}
			}
		} 
	}

	const setSelected = (e) => {
		//console.log ("Button number   "+e.button)
		if (e.button === 0 && editorStore.mode === 'resize') {
			let cid = Number(e.currentTarget.getAttribute('data-cid'));
			if (typeof cid === 'number') {
				if (cid !== selectedCid) {
					partStore.setContourSelected(cid)
				} else {
					//console.log (e)
					let inlet = e.currentTarget.classList.contains('inlet')
					let outlet = e.currentTarget.classList.contains('outlet')				
					if ( (inlet || outlet) && editorStore.inletMode === 'move' ) {
						editorStore.setInletMode('inletInMoving')
 					}				
				}
			}
		} else if (e.button === 0 && editorStore.mode === 'text') {
			
 			if (e.currentTarget.classList.contains('skeletonText')) {
				let cid = Number(e.currentTarget.getAttribute('data-cid'));
				if (typeof cid === 'number') {
					partStore.setTextFocus (false)
					let text = partStore.getElementByCidAndClass (cid, 'contour')
					let newClass= text.class + ' selectedText'
					partStore.updateElementValue( cid, 'contour', 'class', newClass)
					partStore.setTextFocus (true)
				}			

			} else {
				//console.log ('Create text element')
				let coords ={x:e.clientX, y:e.clientY}
				partStore.addTextElement ( coords )
				partStore.setTextFocus( true )
			}		
		}
	}

	const detectCanMove =()=>{
		if (editorStore.inletMode === 'inletInMoving') {
			editorStore.setInletMode('move')
		} 
	} 

	const primaryPolling = () => {
		

	};
	
	const setPrimaryPollingTimeout = () => {
		clearTimeout(pollingTimeoutRef.current);
		pollingTimeoutRef.current = setTimeout(() => {
			primaryPolling();
		}, 2000);
	};

	return (
		<>
			{partStore.svgData['code'].map((element, i) => (
				<g
					key={i}
					data-cid={element.cid}
					className={element.class}
					onMouseDown={setSelected}
					onMouseUp={detectCanMove}
 					onTouchStart={setSelectedTouch} 
					onTouchEnd={detectCanMove}
					fill={element.class.includes("inner") ? "url(#grid)" : ""}
				>
					<path d={element.path}></path>
				</g>
			))}
		
		</>
	);
 });

export default PartSimpleReturnComponent;