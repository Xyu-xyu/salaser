import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef, useState } from 'react';
import MacrosEditModalButton from './macrosEditModalButton';
import utils from '../scripts/util';


interface CustomKnobProps {
	index: number;
	param: string;
}

const CustomKnob: React.FC<CustomKnobProps> = observer(({ index, param }) => {
	const svgRef = useRef<SVGGElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const rect = svgRef.current?.getBoundingClientRect();

	const { knobs, knobPath, knobStep, selectedMacros, macrosProperties, knobRound, isVertical } = viewStore
	const [isDragging, setIsDragging] = useState(false);

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

	const x1 = isVertical ? 17 : -10
	const x2 = isVertical ? 83 : 110
	const x3 = isVertical ? 5 : -30

	const y1 = isVertical ? 105 : 80
	const y3 = isVertical ? -15 : 10


	const r1 = 37.5;
	const r2 = 38.5;
	const center = { x: 50, y: 50 };
	const startAngle = 225;
	const sweepAngle = 270;

	let fontSize = 80 / Math.max((`${minimum - step}`).length, (`${minimum + step}`).length, (`${maximum - step}`).length, (`${maximum + step}`).length)
	fontSize = fontSize > 22.5 ? 22.5 : fontSize
	fontSize = fontSize < 10 ? 10 : fontSize

	const handleMouseDown = (callback: () => void) => {
		callback();
		intervalRef.current = setInterval(callback, 50);
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	const startMove = () => setIsDragging(true)
	const endMove = () => setIsDragging(false);

	const move = (e: React.PointerEvent<SVGElement>) => {
		if (!rect || !isDragging) return;

		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;

		// Координаты в системе viewBox
		const svgX = (x / rect.width) * 100;
		const svgY = (y / rect.height) * 100;

		const dx = svgX - center.x;
		const dy = svgY - center.y;

		let angle = Math.atan2(dy, dx) * (180 / Math.PI); // угол в градусах
		angle = (angle + 360) % 360;

		let normalizedAngle = (angle - 225 + 360) % 360;
		const newValue = Math.round((normalizedAngle / 270) * (maximum - minimum) + minimum);
		viewStore.setVal(param, newValue, minimum, maximum);

	};

	useEffect(() => {
		const path = utils.getPath(val, minimum, maximum, sweepAngle, r1, r2, startAngle);
		viewStore.setKnobPath(index, path)

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
							onPointerDown={startMove}
							onPointerUp={endMove}
							onPointerLeave={endMove}
							onPointerCancel={endMove}
							onPointerMove={move}

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
							d={`${knobPath[index]}`}
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
							x={x3}
							y={y3 + i * 9}
							className="moderat"
							fill="var(--knobMainText)"
							fontSize={isVertical ? 10 : 7}
						>
							{a}
						</text>
					))}
					<text x="30" y="80" className='moderat' 
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
