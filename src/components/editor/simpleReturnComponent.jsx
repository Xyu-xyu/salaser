import { observer } from "mobx-react-lite";
import svgStore from "./../../store/svgStore.jsx";
import editorStore from "./../../store/editorStore.jsx";
import Part from "./../../scripts/part.jsx";
import React, { useEffect } from 'react';
import jointStore from "./../../store/jointStore.jsx";

const SimpleReturnComponent = observer(() => {

	var url = new URL(window.location.href);
	var searchParams = new URLSearchParams(url.search);
	var handle = searchParams.get('handle') || 0;
	var partNumber = searchParams.get('part') || 0;

	const {
		selectedCid,
	} = svgStore;

	useEffect(() => {
		const fetchData = async () => {
			//const svg = await Part.getPartCode(handle, partNumber); // Получаем данные
/* 			const newSvgData = {
				width: svg.width,
				height: svg.height,
				code: svg.code,
				params: svg.params,
				positions: []
			}; */
			//svgStore.setSvgData(newSvgData); 
			//jointStore.loadJoints (svg.joints)			
		};
		fetchData();

	}, []);

	const setSelected = (e) => {
		//console.log ("Button number   "+e.button)
		if (e.button === 0 && editorStore.mode === 'resize') {
			let cid = Number(e.currentTarget.getAttribute('data-cid'));
			if (typeof cid === 'number') {
				if (cid !== selectedCid) {
					svgStore.setContourSelected(cid)
				} else {
					//console.log (e)
					let inlet = e.currentTarget.classList.contains('inlet')
					let outlet = e.currentTarget.classList.contains('outlet')
					if ((inlet || outlet) && editorStore.inletMode === 'move') {
						editorStore.setInletMode('inletInMoving')
						//console.log ('setSelected and start in mode  ' + editorStore.inlrtMode)						
					}
				}
			}
		} else if (e.button === 0 && editorStore.mode === 'text') {

			//console.log ('пиу пиу')

			if (e.currentTarget.classList.contains('skeletonText')) {
				let cid = Number(e.currentTarget.getAttribute('data-cid'));
				if (typeof cid === 'number') {
					svgStore.setTextFocus(false)
					let text = svgStore.getElementByCidAndClass(cid, 'contour')
					let newClass = text.class + ' selectedText'
					svgStore.updateElementValue(cid, 'contour', 'class', newClass)
					svgStore.setTextFocus(true)
				}

			} else {
				console.log('Create text element')
				let coords = { x: e.clientX, y: e.clientY }
				svgStore.addTextElement(coords)
				svgStore.setTextFocus(true)
			}
		}
	}

	const detectCanMove = () => {
		if (editorStore.inletMode === 'inletInMoving') {
			editorStore.setInletMode('move')
		}
	}

	return (
		<>
			{svgStore.svgData.positions.map((pos, posIndex) => {
				// находим part_code по part_id
				const part = svgStore.svgData.part_code.find(
					p => p.id === pos.part_code_id
				);

				if (!part) return null;

				const { a, b, c, d, e, f } = pos.positions;

				return (
					<g
						key={posIndex}
						data-part-id={pos.part_id}
						transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
					>
						{part.code.map((element) => (
							<g
								key={element.cid}
								data-cid={element.cid}
								className={element.class}
								onMouseDown={setSelected}
								onMouseUp={detectCanMove}
								fill={element.class.includes("inner") ? "url(#grid)" : "red"}
							>
								<path d={element.path} />
							</g>
						))}
					</g>
				);
			})}
		</>

	);
});

export default SimpleReturnComponent;