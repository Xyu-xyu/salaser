import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef } from 'react';
import MacrosEditModalButton from './macrosEditModalButton';
import utils from '../scripts/util';


interface CustomKnobProps {
	param: string;
}

const CustomKnob: React.FC<CustomKnobProps> = observer(({ param }) => {
	const svgRef = useRef<SVGGElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const { knobs, knobStep, selectedMacros, macrosProperties, knobRound, isVertical } = viewStore

	const knob = knobs[selectedMacros]
	const knobStp = knobStep[param]
	
	let val = Number(knob.cutting[param as keyof typeof knob.cutting]);
	if (param === 'piercingMacro') {
		val = Number(knob[param as keyof typeof knob]);
	}

	let property 
	if (param === 'piercingMacro') {
		property = macrosProperties[param as keyof typeof macrosProperties];
	} else {
		property = macrosProperties.cutting.properties[param as keyof typeof macrosProperties.cutting.properties];
	}

	const { title  } = property;

	// Безопасно получаем minimum и maximum, если они есть fuck the TSX
	const minimum = 'minimum' in property ? property.minimum : 0;
	const maximum = 'maximum' in property ? property.maximum : 1;
	const isArray = '$wvEnumRef' in property ? property.$wvEnumRef : false;

	const step = Number(maximum - minimum) / 50 > 50 ? 50 : Number(knobStp)
	const stepBig = Number(maximum - minimum) / Number(knobStp) > 50 ? Number(maximum - minimum) / 50 : Number(knobStp)

	const {
		x1, x2, x4,
		y1, y2, y3,
 		r1, r2, 
		startAngle, sweepAngle
	  } = utils.getKnobLayout(isVertical);

	let fontSize = utils.calculateFontSize(minimum, maximum, step);

	const handleMouseDown = (callback: () => void) => {
		callback();
		intervalRef.current = setInterval(callback, 50);
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	useEffect(() => {
		const path = utils.getPath(val, minimum, maximum, sweepAngle, r1, r2, startAngle);
		viewStore.setKnobPath(param, path)

	}, [selectedMacros, val]);


	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			const currentVal = Number(knob.cutting[param as keyof typeof knob.cutting]);
			viewStore.setVal(param, currentVal + (e.deltaY < 0 ? step : -step), minimum, maximum);
		};

		svg.addEventListener('wheel', handleWheel);
		return () => {
			svg.removeEventListener('wheel', handleWheel);
		};
	}, [selectedMacros]);

	const increase = () => {
		let newval = Number(knob.cutting[param as keyof typeof knob.cutting]) + stepBig
		if (param === 'piercingMacro') {
			newval = Number(knob[param as keyof typeof knob]) + stepBig
		}
		viewStore.setVal(param, newval, minimum, maximum);
	}

	const decrease = () => {
		let newval = Number(knob.cutting[param as keyof typeof knob.cutting]) - stepBig
		if (param === 'piercingMacro') {
			newval = Number(knob[param as keyof typeof knob]) - stepBig
		}		
		viewStore.setVal(param, newval, minimum, maximum);
	}
	

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
							d={ viewStore.getKnobPath(param) }
							fill="var(--knobMainText)"
							stroke="var(--knobMainText)"
							strokeWidth="2"
							style={{
								filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
								transition: "none"
							}}
						/>
						<text x={83} y={60} textAnchor="end" fontSize={fontSize} className='segments14' fill="var(--knobMainText)">
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
					<text x="95" y="130" textAnchor="end" className='moderat' fontSize={8} fill="var(--paleColor)">
						min:{minimum} max:{maximum}
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

export default CustomKnob;
