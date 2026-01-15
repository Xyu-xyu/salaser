import { observer } from "mobx-react-lite";
import svgStore from "./../../store/svgStore.jsx";
import editorStore from "./../../store/editorStore.jsx";
import Part from "./../../scripts/part.jsx";
import React, { useEffect, useId } from 'react';


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

	const setSelected = (e, part_id) => {
		console.log(part_id)
		svgStore.selectOnly(part_id)
		if (e.button === 0 && editorStore.mode === 'resize') {
			/*let cid = Number(e.currentTarget.getAttribute('data-cid'));
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
			}*/
		} else if (e.button === 0 && editorStore.mode === 'text') {

			//console.log ('пиу пиу')

			/*if (e.currentTarget.classList.contains('skeletonText')) {
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
			}*/
		}
	}

	const detectCanMove = () => {
		if (editorStore.inletMode === 'inletInMoving') {
			editorStore.setInletMode('move')
		}
	}


	const  buildCompoundPath = (code) => {
		const outer = [];
		const inner = [];
		const inletOutlet = [];
		const engraving = [];


		for (const el of code) {
			if (!el.path) continue;
			if (el.class.includes("macro2") ) {
				engraving.push(el.path.trim());
			} else	if (el.class.includes("outer") && el.class.includes("contour")) {
				outer.push(el.path.trim());
			} else if (el.class.includes("inner") && el.class.includes("contour")) {
				inner.push(el.path.trim());
			} else if (el.class.includes("inlet") || el.class.includes("outlet")) {
				inletOutlet.push(el.path.trim());
			}
		}

		const res = {}
		res.contours =  [...outer, ...inner].join("z ");
		res.inletOutlet =  inletOutlet
		res.engraving =  engraving

		
		return res
	}

	return (
		<>
			{svgStore.svgData.positions.map((pos, posIndex) => {
				// находим part_code по part_id
				const part = svgStore.svgData.part_code.find(
					(p) => p.id === pos.part_code_id
				);

				if (!part) return null;

				const { a, b, c, d, e, f } = pos.positions;
				const compoundPath = buildCompoundPath(part.code);

				return (
					<g
						key={`form_${pos.part_id}_${posIndex}`}
						transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
						data-part-id={pos.part_id}

						onMouseDown={(e) => setSelected(e, pos.part_id)}
						onMouseMove={() => {
							if (editorStore.mode !== 'dragging') {
								editorStore.setMode('dragging');
							}
						}}
						onTouchStart={(e) => {
							setSelected(e, pos.part_id);
							editorStore.setMode('dragging');
						}}
					>
						<path
							d={compoundPath.contours}
							stroke="red"
							fill={ pos.selected ? "rgba(0, 255, 255, 0.7)" : "rgba(252, 126, 23, 0.7)" }
							strokeWidth={0.2}
							fillRule="evenodd"           // важно для дырок
							vectorEffect="non-scaling-stroke" // чтобы stroke не масштабировался
							pointerEvents="visiblePainted"     // клики по заливке, дырки прозрачные
						/>
						<path
							d={compoundPath.inletOutlet}
							fill="none"
							strokeWidth={2}
							stroke={ pos.selected ? "rgba(0, 255, 255, 0.7)" : "rgba(252, 126, 23, 0.7)" }
							vectorEffect="non-scaling-stroke" // чтобы stroke не масштабировался
							pointerEvents="visiblePainted"     // клики по заливке, дырки прозрачные
						/>
						<path
							d={compoundPath.engraving}
 							fill="None"
							stroke={"limegreen"}
							strokeWidth={1}
 							vectorEffect="non-scaling-stroke" // чтобы stroke не масштабировался
							pointerEvents="visiblePainted"     // клики по заливке, дырки прозрачные
						/>
					</g>
				);
			})}
		</>
	);

});

export default SimpleReturnComponent;