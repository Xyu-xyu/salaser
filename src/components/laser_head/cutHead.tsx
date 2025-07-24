import  { useRef, useState } from "react";
import { observer } from 'mobx-react-lite';
//import { useTranslation } from 'react-i18next';
//import utils from '../../scripts/util';
import viewStore from '../../store/viewStore';



const CutHead = observer (() => {
	const { technology, selectedPiercingStage, selectedPiercingMacro  } =  viewStore
	const bs:number=175.0;

	const getValue = (param:string)=> {
		let val = 10;
		if (selectedPiercingStage === 0) {
			val = technology.piercingMacros[selectedPiercingMacro]['initial_'+param]
		} else {
			val = technology.piercingMacros[selectedPiercingMacro].stages[selectedPiercingStage-1][param]
		} 
		return val;
	}
	const focusPosition = getValue('focus')
	const headOffset = getValue ('height')
	const [lenseOffset, setLenseOffset] = useState(0);
	//const [focusOffset, setFocusOffset] = useState(0);
	//const [sheetOffset, setSheetOffset] = useState(0);

	const laserRef = useRef<SVGGElement>(null);
	const laserPathRef = useRef<SVGPathElement>(null);
	const lenseRef = useRef<SVGSVGElement>(null);
	const cuttingHeadRef = useRef<SVGSVGElement>(null);


	// --- обновление лазера
/* 	useEffect(() => {
		if (!laserRef.current || !laserPathRef.current || !lenseRef.current) return;

		const lp = parseFloat(lenseRef.current.getAttribute("y") || "0");
		const d = laserPathRef.current.getAttribute("d") || "";
		const dd = d.split(" ");

		const pl: string[][] = [];
		let i = 0;
		while (i < dd.length) {
			if (dd[i] === "M") {
				pl.push(["M", dd[i + 1], dd[i + 2]]);
				i += 3;
			} else if (dd[i] === "Z") {
				pl.push(["Z"]);
				i += 1;
				break;
			} else if (dd[i] === "L") {
				pl.push(["L", dd[i + 1], dd[i + 2]]);
				i += 3;
			} else if (dd[i] === "C") {
				pl.push([
					"C",
					dd[i + 1],
					dd[i + 2],
					dd[i + 3],
					dd[i + 4],
					dd[i + 5],
					dd[i + 6],
				]);
				i += 7;
			} else {
				console.log("UNKNOWN SYMBOL:" + dd[i]);
				break;
			}
		}

		const bs = 175.0;
		pl[8][4] = pl[8][6] = pl[1][2] = pl[2][2] = `${89 + lp}`;
		pl[7][6] = pl[2][6] = `${bs + focusPosition - 9}`;
		pl[7][4] = pl[3][2] = `${bs + focusPosition - 4}`;
		pl[7][2] = pl[3][4] = `${bs + focusPosition}`;
		pl[6][6] = pl[3][6] = `${bs + focusPosition + 4}`;
		pl[6][4] = pl[4][2] = `${bs + focusPosition + 11}`;
		pl[6][2] = pl[4][4] = `${bs + focusPosition + 83}`;
		pl[4][6] = `${bs + focusPosition + 83}`;
		pl[5][2] = `${bs + focusPosition + 83}`;

		const newD = pl.flat().join(" ");
		laserPathRef.current.setAttribute("d", newD);

		if (cuttingHeadRef.current) {
			cuttingHeadRef.current.setAttribute(
				"y",
				`${28 - headOffset * 5}`
			);
		}
	}, [focusPosition, headOffset, lenseOffset]);

 */

	return (
		<div
			className={selectedPiercingMacro + "_cuthead"}
			style={{ width: 500, height: 500, position: "absolute", top: 1000, left: 250 }}
		>

			<svg
				id={`hd_${selectedPiercingMacro}_${selectedPiercingStage}_cutheadview`}
				viewBox="0 40 150 230"
				xmlns="http://www.w3.org/2000/svg"
			>


				<svg id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutmaterial`}>
					<rect
						y={195}
						width={150}
						height={20}
						style={{
							stroke: "rgb(0, 0, 0)",
							strokeWidth: 0,
							fill: "rgb(121, 121, 121)"
						}}
					/>
				</svg>


				<g id={`${selectedPiercingMacro}_${selectedPiercingStage}_laser`} ref={laserRef}>
					<path
						id={`${selectedPiercingMacro}_${selectedPiercingStage}_laserpath`}
						ref={laserPathRef}
						d="M 55 0 L 55 89.733 C 55 89.733 69.987 161.318 73 201.781 C 73.312 205.966 73 210.3 73 214.39 C 71.626 221.321 70 233.3 70 233.3 L 80 233.3 C 80 233.3 78.4 221.3 77 214.39 C 77 210.3 76.688 205.966 77 201.781 C 80.013 161.318 95 89.733 95 89.733 L 95 0 Z"
						fill="red"
					/>
				</g>
				<svg
					id={`${selectedPiercingMacro}_${selectedPiercingStage}_lense`}
					ref={lenseRef}
					style={{ opacity: 0.7 }}
					y="0.0"
				>
					<ellipse
						cx="75"
						cy="80"
						rx="25"
						ry="7.511"
						fill="rgb(97, 217, 217)"
						stroke="black"
						strokeOpacity={0.05}
					/>
					<rect
						x="50"
						y="80"
						width="50"
						height="10"
						fill="rgb(97, 217, 217)"
						stroke="black"
						strokeOpacity={0.08}
					/>
				</svg>
				<svg id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutting_head`} ref={cuttingHeadRef}>
					<g id={`${selectedPiercingMacro}_${selectedPiercingStage}_headbody`}>
						<rect
							x="55.292"
							y="139.549"
							width="40.024"
							height="25.97"
							style={{
								stroke: "rgb(0, 0, 0)",
								strokeWidth: 0,
								fill: "url(#color-0-2)"
							}}
						/>
						<rect
							x="48.283"
							y="77.469"
							width="52.79"
							height="62.768"
							style={{
								stroke: "rgb(0, 0, 0)",
								strokeWidth: 0,
								fill: "url(#color-0-1)"
							}}
						/>
						<rect
							x="40.558"
							y="-0.107"
							width="68.884"
							height="79.829"
							style={{
								stroke: "rgb(0, 0, 0)",
								fill: "url(#color-0-0)",
								strokeWidth: 0
							}}
						/>
						<path
							style={{ stroke: "rgb(0, 0, 0)", fill: "rgb(56, 56, 56)" }}
							d="M 29.999 9.76 L 30 100 L 35 100 L 35 140 L 55 140 L 55 132 L 49 132 L 49 80 L 40 80 L 40 3 L 30 3 L 30 10 L 29.999 9.76 Z"
						/>
						<path
							style={{ stroke: "rgb(0, 0, 0)", fill: "rgb(56, 56, 56)" }}
							d="M 93.027 132.596 L 93.028 42.356 L 98.028 42.356 L 98.028 2.356 L 118.028 2.356 L 118.028 10.356 L 112.028 10.356 L 112.028 62.356 L 103.028 62.356 L 103.028 139.356 L 93.028 139.356 L 93.028 132.356 L 93.027 132.596 Z"
							transform="matrix(-1, 0, 0, -1, 213.028029, 142.3559)"
/* 		bx:origin="0.539459 0.50235"
 */	  />
						<path
							style={{ fill: "rgb(216, 216, 216)", stroke: "rgb(0, 0, 0)" }}
							d="M 40 140 L 55 140 L 62 160 L 62 165 L 55 165 L 40 140 Z"
						/>
						<path
							style={{ fill: "rgb(216, 216, 216)", stroke: "rgb(0, 0, 0)" }}
							d="M 88 165 L 103 165 L 110 145 L 110 140 L 103 140 L 88 165 Z"
							transform="matrix(-1, 0, 0, -1, 198, 305)"
						/>
					</g>
					<g id={`${selectedPiercingMacro}_${selectedPiercingStage}_laser`} /* focus_position={5} */>
						<path
							id={`${selectedPiercingMacro}_${selectedPiercingStage}_laserpath`}
							style={{ stroke: "rgb(0, 0, 0)", strokeWidth: 0, fill: "red" }}
							d="M 55 0 L 55 91 C 55 91 69.987 161.318 73 171 C 73.312 176 73 180 73 184 C 71.626 191 70 263 70 263 L 80 263 C 80 263 78.4 191 77 184 C 77 180 76.688 176 77 171 C 80.013 161.318 95 91 95 91 L 95 0 Z"
						/>
					</g>
					<svg id={`${selectedPiercingMacro}_${selectedPiercingStage}_lense`} style={{ opacity: "0.7" }} y={2}>
						<ellipse
							style={{
								stroke: "rgb(0, 0, 0)",
								fill: "rgb(97, 217, 217)",
								strokeOpacity: "0.05"
							}}
							cx={75}
							cy={80}
							rx={25}
							ry="7.511"
						/>
						<rect
							x={50}
							y={80}
							width={50}
							height={10}
							style={{
								stroke: "rgb(0, 0, 0)",
								fill: "rgb(97, 217, 217)",
								strokeOpacity: "0.08"
							}}
						/>

					</svg>

					<g id={`${selectedPiercingMacro}_${selectedPiercingStage}_protective_glass`}>
						<rect
							x={50}
							y={120}
							width={50}
							height={10}
							style={{
								stroke: "rgb(0, 0, 0)",
								fill: "rgba(189, 234, 192, 0.77)",
								strokeOpacity: "0.05"
							}}
						/>
					</g>
				</svg>
				<line
					style={{
						fill: "rgb(216, 216, 216)",
						strokeDasharray: 4,
						stroke: "rgb(54, 201, 24)"
					}}
					x1={0}
					y1={195}
					x2={150}
					y2={195}
				/>
				<line
					style={{
						fill: "rgb(216, 216, 216)",
						strokeDasharray: 4,
						stroke: "rgb(255, 255, 255)"
					}}
					x1={75}
					y1={0}
					x2={75}
					y2={250}
				/>

				<g id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutheadoffset_dim`}>
					<line
						className="hd_3_0_lhor"
						style={{ stroke: "rgb(244, 155, 155)", fill: "rgb(244, 155, 155)" }}
						x1={85}
						y1={ bs-headOffset*5+18 }
						x2={125}
						y2={ bs-headOffset*5+18}
					/>
					<svg className="hd_3_0_tri" y={ -headOffset*5+28}>
						<path
							d="M 122.012 -164.024 L 124.024 -160 L 120 -160 L 122.012 -164.024 Z"
							style={{ stroke: "rgb(244, 155, 155)", fill: "rgb(244, 155, 155)" }}
							transform="matrix(1, 0, 0, -1, 0, 0)"
						/>
					</svg>
					<line
						className="hd_3_0_lver"
						style={{ stroke: "rgb(244, 155, 155)", fill: "rgb(244, 155, 155)" }}
						x1={122}
						y1={195}
						x2={122}
						y2={ bs-headOffset*5+18}
					/>
					<path
						d="M 122.012 195 L 124.024 199.024 L 120 199.024 L 122.012 195 Z"
						style={{ stroke: "rgb(244, 155, 155)", fill: "rgb(244, 155, 155)" }}
					/>
					<text
						style={{
							fill: "rgb(244, 155, 155)",
							fontFamily: "Arial, sans-serif",
							fontSize: 10,
							whiteSpace: "pre"
						}}
						transform="matrix(1, 0, 0, 1, -2.258228, 4.100466)"
					>
						<tspan x="127.682" y="159.235" id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutheadoffset_val`}>
							{ headOffset }
						</tspan>
						<tspan x="127.682" dy="1em">

						</tspan>
					</text>
				</g>

				<g id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutheadfocus_dim`}>
					<line
						className="hd_3_0_lhor"
						style={{ fill: "rgb(155, 167, 244)", stroke: "rgb(155, 167, 244)" }}
						x1={75}
						y1={ bs+focusPosition-headOffset*5+20}
						x2="35.408"
						y2={bs+focusPosition-headOffset*5+20}
					/>
					<line
						className="hd_3_0_lver"
						style={{ fill: "rgb(155, 167, 244)", stroke: "rgb(155, 167, 244)" }}
						x1="37.987"
						y1={ bs + focusPosition - headOffset*5+20 }
						x2="37.987"
						y2={190}
					/>
					<path
						d="M 37.962 -193.858 L 39.974 -189.834 L 35.95 -189.834 L 37.962 -193.858 Z"
						style={{ fill: "rgb(155, 167, 244)", stroke: "rgb(155, 167, 244)" }}
						transform="matrix(1, 0, 0, -1, 0, 0)"
					/>
					<svg className="hd_3_0_tri" y={ focusPosition - headOffset*5-12}>
						<path
							d="M 37.999 208.197 L 40.011 212.221 L 35.987 212.221 L 37.999 208.197 Z"
							style={{ fill: "rgb(155, 167, 244)", stroke: "rgb(155, 167, 244)" }}
						/>
					</svg>
					<text
						style={{
							fill: "rgb(155, 167, 244)",
							fontFamily: "Arial, sans-serif",
							fontSize: 10,
							whiteSpace: "pre"
						}}
						transform="matrix(1, 0, 0, 1, -113.229256, 34.604759)"
						origin="-0.137 0.929"
					>
						<tspan x="120.682" y="155.235" id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutheadfocus_val`}>
							{ focusPosition }
						</tspan>
						<tspan x="127.682" dy="1em">

						</tspan>
					</text>
				</g>
			</svg>
		</div >
	);
});

export default CutHead;
/*
    $('#{{ head_id}}_cutheadoffset_dim .{{ head_id}}_lhor').attr({
		
		
		y1:bs-{{ head_id}}_c_headoffset*5+18,
		
		y2:bs-{{ head_id}}_c_headoffset*5+18})


      $('#{{ head_id}}_cutheadoffset_dim .{{ head_id}}_lver').attr({
		
		
		y2:bs-{{ head_id}}_c_headoffset*5+18})


      $('#{{ head_id}}_cutheadoffset_dim .{{ head_id}}_tri').attr({
		
		y:-{{ head_id}}_c_headoffset*5+28})
     
	 



	  $('#{{ head_id}}_cutheadfocus_dim .{{ head_id}}_lhor')
	 
	  .attr({
		y1:bs+foc-{{ head_id}}_c_headoffset*5+20,
		y2:bs+foc-{{ head_id}}_c_headoffset*5+20})


      $('#{{ head_id}}_cutheadfocus_dim .{{ head_id}}_lver').
	  
	  attr({
		
		y1:bs+foc-{{ head_id}}_c_headoffset*5+20})


      $('#{{ head_id}}_cutheadfocus_dim .{{ head_id}}_tri').attr({
		
		y:foc-{{ head_id}}_c_headoffset*5-12})


*/