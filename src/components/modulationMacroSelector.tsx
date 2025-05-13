import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef, useState } from 'react';
import utils from '../scripts/util';
import cut_settings from '../store/cut_settings';


const modulationMacroSelector = observer(() => {
	const param =  "modulationMacros"
	const svgRef = useRef<SVGGElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const rect = svgRef.current?.getBoundingClientRect();
	const { knobs, selectedMacros, isVertical, selectedModulationMacro } = viewStore
	const [isDragging, setIsDragging] = useState(false);

 	let minimum:number = 0 
	let maximum:number = 0
	let title: string = "Индекс импульсного режима";	
	//const params = utils.findByKey(cutting_settings_schema, param)[0];
	const settings = utils.findByKey(cut_settings, param)[0];

	if ( settings ) {
		maximum = settings.length-1
	}
	const step = 1
	const stepBig = 1

	const {
		x1, x2, x4,
		y1, y2, y3,
 		r1, r2, center,
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
		viewStore.setSelectedModulationMacro( newValue );

	};

	useEffect(() => {
		const knob = knobs[selectedMacros]
		let val = knob.cutting['modulationMacro']
		const path = utils.getPath( val, minimum, maximum, sweepAngle, r1, r2, startAngle);
		viewStore.setKnobPath( param, path)
		viewStore.setSelectedModulationMacro( val )		

	}, []);


	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const path = utils.getPath( selectedModulationMacro, minimum, maximum, sweepAngle, r1, r2, startAngle);
		viewStore.setKnobPath( param, path)

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			const newValue = selectedModulationMacro + (e.deltaY < 0 ? step : -step)
			viewStore.setSelectedModulationMacro( newValue );			
		};

		svg.addEventListener('wheel', handleWheel);
		return () => {
			svg.removeEventListener('wheel', handleWheel);
		};
	}, [ selectedModulationMacro ]);

	const increase = () => {
		let newval = selectedModulationMacro + stepBig
		viewStore.setSelectedModulationMacro( newval );
	}

	const decrease = () => {
		let newval = selectedModulationMacro - stepBig
		viewStore.setSelectedModulationMacro( newval );
	}

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
							d={ viewStore.getKnobPath(param)}
							fill="var(--knobMainText)"
							stroke="var(--knobMainText)"
							strokeWidth="2"
							style={{
								filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
								transition: "none"
							}}
						/>
						<text x={83} y={60} textAnchor="end" fontSize={fontSize} className='segments14' fill="var(--knobMainText)">
							{ selectedModulationMacro }
						</text>
					</g>
					{title.split(', ')[0].split(' ').map((a, i) => (
						<text
							key={i}
							x={x4}
							y={y3 + i * 9}
							className="moderat"
							fill="var(--knobMainText)"
							fontSize={isVertical ? 10 : 7 }
						>
							{a}
						</text>
					))}
					<text x={30} y={y2} className='moderat' 
						fontSize={isVertical ? 10 : 7}
						fill="var(--knobMainText)">
						{title.split(', ')[1]}
					</text>
					<text x={95} y={130} textAnchor="end" className='moderat' fontSize={8} fill="var(--paleColor)">
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
			<div>
		</div>
		</div>
	);
});

export default modulationMacroSelector;

