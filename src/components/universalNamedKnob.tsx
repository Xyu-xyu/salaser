import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useRef, useEffect } from 'react';
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
	console.log ('keyInd +' + keyInd)
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
		let currentValue= viewStore.getTecnologyValue(param, keyParam, keyInd)
		let newValue = currentValue + step
		viewStore.setTecnologyValue( newValue, param, keyParam, minimum, maximum, keyInd )		
	}

	const createNote =()=>{
		console.log ("Creating mod macro param "+ param )
		let note:string=''
		if ( param  === 'modulationMacro' || param === 'initial_modulationMacro') {
		
			 note+=viewStore.getTecnologyValue('name', 'modulationMacros', val )+ ": "
			 note+=viewStore.getTecnologyValue('pulseFill_percent', 'modulationMacros', val)+"% " 
			 note+=viewStore.getTecnologyValue('pulseFrequency_Hz', 'modulationMacros', val)+"Hz"

		} else if ( param === 'piercingMacro'){

			note+= viewStore.getTecnologyValue('name', 'piercingMacros',selectedPiercingMacro )+": "
			note+= viewStore.getTecnologyValue('initial_modulationFrequency_Hz', 'piercingMacros', selectedPiercingMacro)+"Hz "
			note+= viewStore.getTecnologyValue('stages', 'piercingMacros', selectedPiercingMacro).length+" stages" 

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
	

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center overflow-hidden'>
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
						<TextInCircle text={  createNote() } maxLineLength={8} fontSize={10} radius={50} />

					</g>
					{t(title).split(', ')[0].split(' ').map((a: string, i: number) => (
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
