import  { useState, useEffect } from "react";
import { observer } from 'mobx-react-lite';
import viewStore from '../../store/viewStore';
import { Icon } from "@iconify/react/dist/iconify.js";
import utils from "../../scripts/util";

interface PiercingStage {
	pressure: number;
	power: number;
	enabled: boolean;
	delay_s: number;
	power_W_s: number;
	focus: number;
	height: number;
	modulationFrequency_Hz: number;
	cross_blow: boolean;
	modulationMacro: number;
  }

  type ResultItem = {
	name: string;
	'focus, mm'?: number,
	'height, mm'?: number,
	'pressure, bar'?: number,
	'power, kWt'?: number,
	'enabled': boolean;
	'power': number,
	'power_W_s': number,
	'delay_s':number
};


interface ComponentInt {
	keyInd: number;
}

export const CutHead: React.FC<ComponentInt> = observer(({ keyInd }) => {

    const { technology, selectedPiercingStage, selectedPiercingMacro, animProgress, isVertical } = viewStore;
    const bs: number = 175.0;
    const [isAnimating, setIsAnimating] = useState(false);
	const [isPaused, setPaused] = useState(false);
	const [atEnd, setAtEnd] = useState(false);

 	const macro: PiercingStage[] = technology.piercingMacros[selectedPiercingMacro]['stages'];
	//const macro: PiercingStage[] = macroEnabled.filter((s: PiercingStage) => s.enabled !== false);
 
    const toggleAnimation = () => {
		if (!atEnd) {
			if (!isAnimating && !isPaused) {
				setIsAnimating( true );
		   } else if ( !isAnimating && isPaused) {
			   setPaused(false)
			   setIsAnimating( true );
		   } else if ( isAnimating && !isPaused) {
			   setPaused( true )
			   setIsAnimating( false );
		   }			
		} else {
			setAtEnd(!atEnd)
			rewind()
			setIsAnimating( true );
		}        
    };

 	const getValue = (param: string, stage = animProgress.stage, progress = animProgress.progress) => {
		
 		if (!isAnimating && !isPaused) {
            if (selectedPiercingStage === 0) {
                return technology.piercingMacros[selectedPiercingMacro]['initial_' + param];
            } else {
				try {
					return technology.piercingMacros[selectedPiercingMacro].stages[selectedPiercingStage - 1][param];
				} catch (e) {
					if ( technology.piercingMacros[selectedPiercingMacro].stages.length < selectedPiercingStage ) {
						let length = technology.piercingMacros[selectedPiercingMacro].stages.length - 1
						viewStore.setselectedPiercingStage ( length )
						return technology.piercingMacros[selectedPiercingMacro].stages[selectedPiercingStage - 1][param];
					}
				}
            }
        } 
 		const from = stage === 0 ? technology.piercingMacros[selectedPiercingMacro][`initial_${param}`] : macro[stage - 1][param as keyof PiercingStage] as number;
		if (stage >= macro.length) return from;
		const to = macro[stage][param as keyof PiercingStage] as number;
		const currentStage:number = stage+1
		const currentTime:number = data[currentStage].power_W_s / data[currentStage].power  ||0;
		return from + (to - from) * progress/currentTime;
	}; 

	const rewind = () => {
		setIsAnimating( false );
		setPaused(false)
 		viewStore.setAnimProgress(0, 0)
	}

	const stageTime: number[] = [];
	const data: ResultItem[] = utils.getChartData(keyInd);
	data.forEach(a => {
		stageTime.push(a.power_W_s / a.power || 0 );
	});

	useEffect(() => {
		if (!isAnimating) return;
		if (animProgress.stage >= macro.length) {
			setIsAnimating(false);
			setPaused(false)
			viewStore.setselectedPiercingStage(macro.length);
			setAtEnd(!atEnd)
			return;
		}
	
		const currentStage = macro[animProgress.stage];
		const duration = 1000;
		let animationFrameId: number | null = null;
 		let start: number | null = null;
	
		// --- Обработка задержки перед этапом ---
		if (currentStage.delay_s && 
			currentStage.delay_s > 
			0 && animProgress.progress === 0) {
			const timer = setTimeout(() => 
				startStageAnimation(animProgress.progress), currentStage.delay_s * 1000);
				return () => clearTimeout(timer);
		} else {
			startStageAnimation(animProgress.progress);
		}
	
		// --- Функция анимации этапа ---
		function startStageAnimation(initialProgress: number) {
			console.log ( initialProgress )

			const step = (timestamp: number) => {
				if (isPaused) {
					// Сохраняем текущий прогресс и выходим
					viewStore.setAnimProgress(animProgress.stage,  animProgress.progress );
					return;
				}	

				if (!currentStage.enabled) {
					viewStore.setAnimProgress(animProgress.stage + 1, 0);
				} else {
					if (!start) start = timestamp - initialProgress * duration;;
					const progress = (timestamp - start) / duration;

					if (progress  <  stageTime[animProgress.stage + 1] ) {
						viewStore.setAnimProgress(animProgress.stage, progress);
						animationFrameId = requestAnimationFrame(step);
					} else {
						viewStore.setAnimProgress(animProgress.stage + 1, 0);
					}
				} 
			};
			animationFrameId = requestAnimationFrame(step);
		}
	
		return () => {
			if (animationFrameId) cancelAnimationFrame(animationFrameId);
		};
	}, [isAnimating, isPaused, animProgress.stage]);


	let focusPosition = getValue('focus');
    let headOffset = getValue('height')
	let foc = focusPosition*5+ headOffset*5


	const degeneratePath =() =>{
		let d:string  = "M 55 0 L 55 89.733 C 55 89.733 69.987 161.318 73 201.781 C 73.312 205.966 73 210.3 73 214.39 C 71.626 221.321 70 233.3 70 233.3 L 80 233.3 C 80 233.3 78.4 221.3 77 214.39 C 77 210.3 76.688 205.966 77 201.781 C 80.013 161.318 95 89.733 95 89.733 L 95 0 Z"
		var foc= focusPosition*5+ headOffset*5//focusPosition * 5 ; 
		var lp = focusPosition*2 + headOffset*2 //parseFloat($('#{{ head_id}}_lense').attr('y'));
		var dd=d.split(' ');
		var pl=[];
		var i=0;
		while (i<dd.length){
			if ('M'==dd[i]){
			  pl.push(['M',dd[i+1],dd[i+2]])
			  i+=3;
			}else
			if ('Z'==dd[i]){
			  pl.push(['Z'])
			  i+=1;
			  break
			}else
			if ('L'==dd[i]){
			  pl.push(['L',dd[i+1],dd[i+2]])
			  i+=3;
			}else
			if ('C'==dd[i]){
			  pl.push(['C',dd[i+1],dd[i+2],dd[i+3],dd[i+4],dd[i+5],dd[i+6]])
			  i+=7;
			}else{
			  console.log('UNKNOWN SYMBOL:'+dd[i]);
			  break
			}
		}
		//console.log(pl);
		var bs=175.0;
		pl[8][4]=pl[8][6]=pl[1][2]=pl[2][2]=''+(89+lp);//lense position
		pl[7][6]=pl[2][6]=''+(bs+foc-9)
		pl[7][4]=pl[3][2]=''+(bs+foc-4)
		pl[7][2]=pl[3][4]=''+(bs+foc)
		pl[6][6]=pl[3][6]=''+(bs+foc+4)
		pl[6][4]=pl[4][2]=''+(bs+foc+11)
		pl[6][2]=pl[4][4]=''+(bs+foc+83)
		pl[4][6]=''+(bs+foc+83)
		pl[5][2]=''+(bs+foc+83)
		i=0;
		dd=[]
		while(i<pl.length){
		  for (let j in pl[i]) { dd.push(pl[i][j]); }
		  i+=1;
		}
		return dd.join(' ');
	}

	return (
		<div
			className={selectedPiercingMacro + "_cuthead"}
			style={{
				width: 200,
				height: 300,
				position: "absolute",
				top: isVertical ? 50 : 50,
				left: isVertical ? 850 : 1492
			}}
		>
			<svg
				id={`hd_${selectedPiercingMacro}_${selectedPiercingStage}_cutheadview`}
				viewBox="0 40 150 300"
				xmlns="http://www.w3.org/2000/svg"
			>


				<svg id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutmaterial`}>
					<rect
						y={195}
						width={150}
						height={7.65}
						style={{
							stroke: "rgb(0, 0, 0)",
							strokeWidth: 0,
							fill: "rgb(121, 121, 121)"
						}}
					/>
				</svg>

				<svg id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutting_head`} 
					y={28-headOffset*5} >
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
							d={ degeneratePath() }
						/>
					</g>
					<svg id={`${selectedPiercingMacro}_${selectedPiercingStage}_lense`} style={{ opacity: "0.7" }} y={ focusPosition*2 + headOffset*2 }>
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
							{ headOffset.toFixed(1) }
						</tspan>
						<tspan x="127.682" dy="1em">

						</tspan>
					</text>
				</g>

				<g id={`${selectedPiercingMacro}_${selectedPiercingStage}_cutheadfocus_dim`}>
					<line
						className="hd_3_0_lhor"
						x1={75}
						y1={ bs+foc/* usPosition*5 */ - headOffset*5+20}
						x2="35.408"
						y2={bs+foc/* usPosition*5 */ - headOffset*5+20}
						style={{ fill: "rgb(155, 167, 244)", stroke: "rgb(155, 167, 244)" }}
					/>
					<line
						className="hd_3_0_lver"
						x1="37.987"
						y1={ bs + foc /* usPosition*5 */ - headOffset*5+20 }
						x2="37.987"
						y2={190}
						style={{ fill: "rgb(155, 167, 244)", stroke: "rgb(155, 167, 244)" }}
					/>
					<path
						d="M 37.962 -193.858 L 39.974 -189.834 L 35.95 -189.834 L 37.962 -193.858 Z"
						style={{ fill: "rgb(155, 167, 244)", stroke: "rgb(155, 167, 244)" }}
						transform="matrix(1, 0, 0, -1, 0, 0)"
					/>
					<svg className="hd_3_0_tri" y={ foc /* usPosition*5 */ - headOffset*5-12}>
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
							{ focusPosition.toFixed(1) }
						</tspan>
					</text>
				</g>
			</svg>
			<button className="m-2"
				onPointerDown={toggleAnimation}
				style={{
					position: 'absolute',
					bottom: -50,
					right: 150,
					padding: '4px 8px',
					color: 'white',
					border: '1px solid black',
					borderRadius: '4px',
					cursor: 'pointer',
				}}>
					<div className="d-flex align-items-center justify-content-center"
						   >
						{	!isAnimating ?
							<Icon icon="fluent:play-24-filled" width="24" height="24"  style={{color: "var(--knobMainText)"}} /> :
							<Icon icon="fluent:pause-24-filled" width="24" height="24"  style={{color: "var(--knobMainText)"}} />

						}
					</div>
				</button>
		</div >
	);
});

export default CutHead;