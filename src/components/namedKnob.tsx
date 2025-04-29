import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef, useState } from 'react';
import utils from '../scripts/util';

/*
"cross_blow": {
	"title": "Охлаждение",
	"type": "boolean",
	"default": false
},
"type": {
	"default": "CW",
	"type": "string",
	"enum": [
		"CW",
		"PULSE",
		"ENGRAVEING",
		"VAPOR",
		"EDGING"
	],
	"title": "Тип"
},*/
interface NamedKnobProps {
	param: string;
	index: number;
}

const NamedKnob: React.FC<NamedKnobProps> = observer(({  param, index }) => {
	const svgRef = useRef<SVGGElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const rect = svgRef.current?.getBoundingClientRect();

	const { knobs, knobPath, selectedMacros, macrosProperties } = viewStore
	const [isDragging, setIsDragging] = useState(false);

	const knob = knobs[selectedMacros]
	const val = knob.cutting[param as keyof typeof knob.cutting];
	const property = macrosProperties.cutting.properties[param as keyof typeof macrosProperties.cutting.properties];

	console.log( Object.keys(property));
	console.log( Object.values(property));
	

	const { title } = property
	const values = 'enum' in property ? property.enum : [];
	
	// Безопасно получаем minimum и maximum, если они есть fuck the TSX
	const minimum = 0
	const maximum = values.length-1

	const step = 1
	const stepBig = 1

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

	/* useEffect(() => {
		const path = utils.getPath(2, minimum, maximum, sweepAngle, r1, r2, startAngle);
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
		viewStore.setVal(param, newval, minimum, maximum);
	}

	const decrease = () => {
		let newval = Number(knob.cutting[param as keyof typeof knob.cutting]) - stepBig
		viewStore.setVal(param, newval, minimum, maximum);
	}

 */
	

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center'>

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

					<g ref={svgRef}>
					<text
							x="5"
							y={-15}
							className="moderat"
							fill="var(--knobMainText)"
							fontSize={10}
						>
							{title}
						</text>
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
						<text x="83" y="60" 
							textAnchor="end" 
							fontSize="22.5" 
							className="segments14" 
							fill="var(--knobMainText)">{ val }</text>
				 
					</g>

						<circle
						cx="17"
						cy="105"
						r="15"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth="1"
						filter="var(--shadow)"
 					/> 
				 
					<text
						x="17"
						y="105"
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
						cx="83" 
						cy="105"
						r="15"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth="1"
						filter="var(--shadow)"
						 
					/>
					<text
						x="83"
						y="105"
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

export default NamedKnob;
