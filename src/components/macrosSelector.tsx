import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef } from 'react';
import MacrosEditModalButton from './macrosEditModalButton';
import utils from '../scripts/util';


const MacrosSelector = observer(() => {
	const param = 'macros'
	const svgRef = useRef<SVGGElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const { technology, selectedMacros, macrosModalEdit, isVertical } = viewStore
 
	const minimum = 0 
	const maximum = technology.macros.length-1  
	const title = "Выбранный макрос, index"
	const step = 1
	const stepBig = 1
	
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

		const path = utils.getPath(selectedMacros, minimum, maximum, sweepAngle, r1, r2, startAngle);
		viewStore.setKnobPath('macros', path)

	}, [ selectedMacros]);


	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			const newValue = selectedMacros + (e.deltaY < 0 ? step : -step)
			viewStore.setVal('selector', newValue, minimum, maximum);
		};

		svg.addEventListener('wheel', handleWheel);
		return () => {
			svg.removeEventListener('wheel', handleWheel);
		};
	}, [selectedMacros]);

	const increase = () => {
		let newval = selectedMacros + stepBig
		viewStore.setVal('selector', newval, minimum, maximum);
	}

	const decrease = () => {
		let newval = selectedMacros - stepBig
		viewStore.setVal('selector', newval, minimum, maximum);
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
					{ !macrosModalEdit && <MacrosEditModalButton param={"macros"} /> }

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
							d={viewStore.getKnobPath(param) }
							fill="var(--knobMainText)"
							stroke="var(--knobMainText)"
							strokeWidth="2"
							style={{
								filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
								transition: "none"
							}}
						/>
						<text x={83} y={60} textAnchor="end" fontSize={fontSize} className='segments14' fill="var(--knobMainText)">
							{ selectedMacros }
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
{/* 					<text x={95} y={130} textAnchor="end" className='moderat' fontSize={8} fill="var(--paleColor)">
						min:{minimum} max:{maximum}
					</text> */}

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

export default MacrosSelector;
