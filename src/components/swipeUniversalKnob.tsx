import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useRef, useEffect } from 'react';
import utils from '../scripts/util';
import cutting_settings_schema from '../store/cut_settings_schema';
import MacrosEditModalButton from './macrosEditModalButton'


interface CustomKnobProps {
	param: string;
	keyParam: string;
	keyInd: number|boolean;
}

const SwipeUniversalKnob: React.FC<CustomKnobProps> = observer(({ param, keyParam, keyInd=false }) => {
	
	const svgRef = useRef<SVGGElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	let property = utils.findByKey(cutting_settings_schema, param)[0]
	let {minimum, maximum, title } = property
	const isArray = '$wvEnumRef' in property ? property.$wvEnumRef : false;
	const {isVertical, knobStep, knobRound, selectedMacros, selectedModulationMacro, technology, selectedPiercingMacro } = viewStore	

	const knobStp = knobStep[param]
	const step = Number(maximum - minimum) / 50 > 50 ? 50 : Number(knobStp)
	const stepBig = Number(maximum - minimum) / Number(knobStp) > 50 ? Number(maximum - minimum) / 50 : Number(knobStp)
	let fontSize = utils.calculateFontSize(minimum, maximum, step);
	
	const {
		x1, x2, x4,
		y1, y2, y3,
 		r1, r2, 
		startAngle, sweepAngle
	} = utils.getKnobLayout(isVertical);

	let val=0;
	if (typeof keyInd === 'number') {
		if (keyParam === 'macros') {
			let knob = technology.macros[keyInd]		
			val = Number(knob.cutting[param]);
			if (param === 'piercingMacro') {
				val = Number(knob[param]);
			}
		} else if (keyParam === 'modulationMacros') {
			val = technology.modulationMacros[keyInd][param]
		} else if (keyParam === 'piercingMacros') {
			val = technology.piercingMacros[keyInd][param]
		} else if ('piercingStages') {
			val = viewStore.getTecnologyValue (param, keyParam, keyInd)
		}

	} else {
		if (keyParam === 'macros') {
			let knob = technology.macros[selectedMacros]		
			val = Number(knob.cutting[param]);
			if (param === 'piercingMacro') {
				val = Number(knob[param]);
			}
		} else if (keyParam === 'modulationMacros') {
			val = technology.modulationMacros[selectedModulationMacro][param]
		} else if (keyParam === 'piercingMacros') {
			val = technology.piercingMacros[selectedPiercingMacro][param]
		} else if ('piercingStages') {
			val = viewStore.getTecnologyValue (param, keyParam, keyInd)
		}
	}


	const handleMouseDown = (callback: () => void) => {
		callback();
		intervalRef.current = setInterval(callback, 50);
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	const increase = () => {
		setVal( stepBig );
	}

	const decrease = () => {
		setVal( -stepBig);
	}

	const setVal =(step:number) =>{
		let currentValue= viewStore.getTecnologyValue(param, keyParam, keyInd)
		let newValue = currentValue + step
		viewStore.setTecnologyValue( newValue, param, keyParam, minimum, maximum, keyInd )
	}

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			setVal( (e.deltaY < 0 ? step : -step));
		};

		svg.addEventListener('wheel', handleWheel);
		return () => {
			svg.removeEventListener('wheel', handleWheel);
		};
	}, []);
	

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center overflow-hidden'>
				<svg id="svgChart"
					className="svgChart" version="1.1"
					width="100%" height="100%"
					viewBox="0 0 100 100" overflow="hidden"
				>
					<defs>
						<radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
							<stop offset="0%" stopColor="#ffffff" />
							<stop offset="100%" stopColor="#cccccc" />
						</radialGradient>
					</defs>
					{ isArray && <MacrosEditModalButton param={param} /> }
					<g ref={svgRef}>
						<circle
							cx="50"
							cy="50"
							r="45"
							fill={"url(#circleGradient)"}
							stroke="gray"
							strokeWidth="1"
							filter="var(--shadow)"
						/>

						{ 
							utils.getTicks(
								minimum,
								maximum,
								stepBig,
								r1,
								r2
							) 
						}

						<path
							d={ utils.getPath(val, minimum, maximum, sweepAngle, r1, r2, startAngle) }
							fill="var(--knobMainText)"
							stroke="var(--knobMainText)"
							strokeWidth="2"
							style={{
								filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
								transition: "none"
							}}
						/>
						<text x={83} y={60} 
							textAnchor="end" 
							fontSize={fontSize} 
							className='segments14 value' 
							fill="var(--knobMainText)"
							>
							{knobRound[param] !== 0 ? (Math.round(val) - val === 0 ? String(val) + '.0' : val) : val}
						</text>
					</g>
					{title.split(', ')[0].split(' ').map((a: string, i: number) => (
						<text
							key={i}
							x={x4}
							y={y3 + i * 9}
							className="moderat"
							fill="var(--knobMainText)"
							fontSize={isVertical ? 10 : 7}
						>
							{a}
						</text>
					))}
					<text x="30" y={y2} className='moderat' 
						fontSize={isVertical ? 10 : 7} 
						fill="var(--knobMainText)">
						{title.split(', ')[1]}
					</text>

					<circle
						cx={x1}
						cy={y1}
						r="15"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth="1"
						filter="var(--shadow)"
						onPointerDown={() => handleMouseDown(decrease)}
						onPointerUp={handleMouseUp}
						onPointerLeave={handleMouseUp} 
					/>
					<text
						x={x1}
						y={y1}
						textAnchor="middle"
						alignmentBaseline="middle"
						fontSize="14"
						pointerEvents="none"
						className='moderat'
						fill="var(--knobMainText)"
					>
						-
					</text>

					<circle
						cx={x2} 
						cy={y1}
						r="15"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth="1"
						filter="var(--shadow)"
						onPointerDown={() => handleMouseDown(increase)}
						onPointerUp={handleMouseUp}
						onPointerLeave={handleMouseUp}
					/>
					<text
						x={x2}
						y={y1}
						textAnchor="middle"
						alignmentBaseline="middle"
						fontSize="14"
						pointerEvents="none"
						className='moderat'
						fill="var(--knobMainText)"
					>
						+
					</text>

				</svg>
			</div>
		</div>
	);
});

export default SwipeUniversalKnob;
