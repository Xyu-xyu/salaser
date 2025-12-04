import { observer } from 'mobx-react-lite';
import macrosStore from '../store/macrosStore';
import { useEffect, useRef } from 'react';
import utils from '../scripts/util';
import cut_settings from '../store/cut_settings';
import { useTranslation } from 'react-i18next';


const piercingMacroSelector = observer(() => {
	const param =  "piercingMacros"
	const svgRef = useRef(null);
	const intervalRef = useRef(null);
	const { selectedMacros, isVertical, selectedPiercingMacro, technology } = macrosStore
	const { t } = useTranslation()

 	let minimum = 0 
	let maximum = 0
	let title = "Врезка";	
	const settings = utils.findByKey(cut_settings, param)[0];

	if ( settings ) {
		maximum = settings.length-1
	}
	const step = 1
	const stepBig = 1

	const {
		x1, x2, x4,
		y1, y2, y3,
 		r1, r2, 
		startAngle, sweepAngle
	  } = utils.getKnobLayout(isVertical);

	let fontSize = utils.calculateFontSize(minimum, maximum, step);

	const handleMouseDown = (callback) => {
		callback();
		intervalRef.current = setInterval(callback, 50);
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	useEffect(() => {
		const knob = technology.macros[selectedMacros]
		let val = knob['piercingMacro']
		const path = utils.getPath( val, minimum, maximum, sweepAngle, r1, r2, startAngle);
		macrosStore.setKnobPath( param, path)
		//macrosStore.setSelectedPiercingMacro( val )		

	}, []);


	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const path = utils.getPath( selectedPiercingMacro, minimum, maximum, sweepAngle, r1, r2, startAngle);
		macrosStore.setKnobPath( param, path)

		const handleWheel = (e) => {
			e.preventDefault();
			const newValue = selectedPiercingMacro + (e.deltaY < 0 ? step : -step)
			console.log (newValue)
			//macrosStore.setSelectedPiercingMacro( newValue );			
		};

		svg.addEventListener('wheel', handleWheel);
		return () => {
			svg.removeEventListener('wheel', handleWheel);
		};
	}, [ selectedPiercingMacro ]);

	const increase = () => {
		let newval = selectedPiercingMacro + stepBig
		console.log (newval)
		//macrosStore.setSelectedPiercingMacro( newval );
	}

	const decrease = () => {
		let newval = selectedPiercingMacro - stepBig
		console.log (newval)
		//macrosStore.setSelectedPiercingMacro( newval );
	}

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center'>
				<svg id="svgChart"
					className="svgChart" version="1.1"
					width="100%" height="100%"
					viewBox="0 0 100 100" overflow="hidden"
				>
					<g ref={svgRef}>
						<circle
							cx="50"
							cy="50"
							r="45"
							fill={"url(#circleGradient)"}
							stroke="gray"
							strokeWidth=".25"
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
							d={ macrosStore.getKnobPath(param)}
							fill="var(--knobMainText)"
							stroke="var(--knobMainText)"
							strokeWidth="2"
							style={{
								transition: "none"
							}}
						/>
						<text x={83} y={60} textAnchor="end" fontSize={fontSize} className='segments14' fill="var(--knobMainText)">
							{ selectedPiercingMacro }
						</text>
					</g>
					{title.split(', ')[0].split(' ').map((a, i) => (
						<text
							key={i}
							x={x4}
							y={y3 + i * 9}
							className="moderat"
							fill="var(--knobMainText)"
							fontSize={isVertical ? 10 : 9 }
						>
							{t(a)}
						</text>
					))}
					<text x={30} y={y2} className='moderat' 
						fontSize={isVertical ? 10 : 9}
						fill="var(--knobMainText)">
						{ t(title.split(', ')[1])}
					</text>

					<circle
						cx={x1}
						cy={y1}
						r="15"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth=".25"
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
						strokeWidth=".25"
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

export default piercingMacroSelector;

