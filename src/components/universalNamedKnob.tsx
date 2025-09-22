import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useRef, useEffect, useState } from 'react';
import utils from '../scripts/util';
import MacrosEditModalButton from './macrosEditModalButton'
import { useTranslation } from 'react-i18next';
import TextInCircle from './textInCircle';

interface CustomKnobProps {
	param: string;
	keyParam: string;
	keyInd?: number|boolean;
}

const UniversalNamedKnob: React.FC<CustomKnobProps> = observer(({ param, keyParam, keyInd=false }) => {
	
	const svgRef = useRef<SVGGElement>(null);
	const { t } = useTranslation()

	let minimum = utils.deepFind ( false, [keyParam, param, 'minimum'])
	let title   = utils.deepFind ( false, [keyParam, param, 'title'])
	let maximum = utils.deepFind ( false, [keyParam, param, 'maximum'])
	let isArray = utils.deepFind ( false, [keyParam, param, '$wvEnumRef'])

	const { knobStep, selectedMacros, selectedModulationMacro, technology, selectedPiercingMacro, isVertical} = viewStore	

	if (isArray) {
		let paramName = isArray.split('/').reverse()[0]		
		maximum =utils.deepFind(technology, [paramName]).length-1
	}

	const knobStp = knobStep[param]
	const step = Number(maximum - minimum) / 50 > 50 ? 50 : Number(knobStp)
	const stepBig = Number(maximum - minimum) / Number(knobStp) > 50 ? Number(maximum - minimum) / 50 : Number(knobStp)
	//let fontSize = utils.calculateFontSize(minimum, maximum, step);
	
	const {
		x1, x2, x4,
		y1, y2, y3,
 		//r1, r2, 
		//startAngle, sweepAngle
	} = utils.getKnobLayout(isVertical);



	let val=0;
	//console.log ('keyInd +' + keyInd)
	if (typeof keyInd === 'number') {
		if (keyParam === 'macros') {
			let knob = technology.macros[keyInd]		
			val = Number(knob.cutting[param]);
			if (param === 'piercingMacro') {
				val = Number(knob[param]);
			}
		} else if (keyParam === 'modulationMacro') {
			val = technology.modulationMacros[keyInd][param]
		} else if (keyParam === 'piercingMacros') {
			val = technology.piercingMacros[keyInd][param]
		} else if (keyParam === 'stages') {
			console.log ("stages stages stages stages stages !!!")
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
		} else if (keyParam === 'stages') {
			val = viewStore.getTecnologyValue (param, keyParam, keyInd)
		}
	}

	const increase = () => {
		setVal( step );
	}

	const decrease = () => {
		setVal( -step );
	}

	const setVal =(step:number) =>{
		console.log('step  ' + step )
		let currentValue= viewStore.getTecnologyValue(param, keyParam, keyInd)
		const range = maximum - minimum +1 // количество элементов
		let newValue = ((currentValue - minimum + step) % range + range) % range + minimum;
		//console.log (newValue, maximum, minimum )
		viewStore.setTecnologyValue( newValue, param, keyParam, minimum, maximum, keyInd )
		step > 0 ? setRotation(prev => prev + (360/(maximum+1))) : setRotation(prev => prev - (360/(maximum+1)));
	
	}

	const createNote =()=>{
		let note: Array<string> = [];
		if ( param  === 'modulationMacro' || param === 'initial_modulationMacro') {
		
			 note.push(viewStore.getTecnologyValue('name', 'modulationMacros', val )+ ": ")
			 note.push(viewStore.getTecnologyValue('pulseFill_percent', 'modulationMacros', val)+"% ") 
			 note.push(viewStore.getTecnologyValue('pulseFrequency_Hz', 'modulationMacros', val)+"Hz")



		} else if ( param === 'piercingMacro'){

			note.push( viewStore.getTecnologyValue('name', 'piercingMacros',selectedPiercingMacro )+": ")
			note.push(viewStore.getTecnologyValue('initial_modulationFrequency_Hz', 'piercingMacros', selectedPiercingMacro)+"Hz ")
			note.push( viewStore.getTecnologyValue('stages', 'piercingMacros', selectedPiercingMacro).length+" stages" )

		} 
		return note
	}

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			setVal( (e.deltaY < 0 ? stepBig : -stepBig));
		};

		svg.addEventListener('wheel', handleWheel);
		return () => {
			svg.removeEventListener('wheel', handleWheel);
		};
	}, []);

	const [rotation, setRotation] = useState(0);
	

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column UniversalNamedKnob'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center'>
				<svg id="svgChart"
					className="svgChart" version="1.1"
					width="100%" height="100%"
					viewBox="0 0 100 100" overflow="hidden"
				>
					{ isArray && keyParam === 'macros' && <MacrosEditModalButton param={param} /> }
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

						 <text x={50} y={45} 
							textAnchor="middle" 
							fontSize={10} 
							className=''							 
							fill="var(--knobMainText)"
							>
						</text>
						<TextInCircle text={  createNote() } maxLineLength={8} fontSize={8} radius={50} />
					</g>
					{t(title).split(', ')[0].split(' ').map((a: string, i: number) => (
						<text
							key={i}
							x={x4}
							y={y3 + i * 12}
							className="moderat"
							fill="var(--knobMainText)"
							fontSize={isVertical ? 10 : 12}
						>
							{a}
						</text>
					))}
					<text x="30" y={y2} className='moderat' 
						fontSize={isVertical ? 10 : 12} 
						fill="var(--knobMainText)">
						{t(title).split(', ')[1]}
					</text>

					<circle
						cx={x1}
						cy={y1}
						r="15"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth=".25"
						filter="var(--shadow)"
						onPointerDown={ decrease }
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
					<g style={{
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: '50% 50%',
                            transition: 'transform 0.25s linear',
                        }}>
					{ utils.getSticks( (maximum+1) * 6 , 38, 2) }
                    { utils.getTicks(0,maximum+1, 1, 38, 38, 1, 0, 360) }
					</g>
					<circle
						cx={x2} 
						cy={y1}
						r="15"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth=".25"
						filter="var(--shadow)"
						onPointerDown={ increase }
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

export default UniversalNamedKnob;
