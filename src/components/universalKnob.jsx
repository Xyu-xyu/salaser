import { observer } from 'mobx-react-lite';
import macrosStore from '../store/macrosStore';
import { useRef, useState, useEffect, useId } from 'react';
import utils from '../scripts/util';
import MacrosEditModalButton from './macrosEditModalButton'
import { useTranslation } from 'react-i18next';
import { Modal, Form, Button } from 'react-bootstrap';



const UniversalKnob = observer(({ param, keyParam, keyInd = false }) => {

	const svgRef = useRef(null);
	const intervalRef = useRef(null);
	const { t } = useTranslation()

	let minimum = utils.deepFind(false, [keyParam, param, 'minimum'])
	let title = utils.deepFind(false, [keyParam, param, 'title'])
	let maximum = utils.deepFind(false, [keyParam, param, 'maximum'])
	let isArray = utils.deepFind(false, [keyParam, param, '$wvEnumRef'])

	const { isVertical, knobStep, knobRound, selectedMacros, selectedModulationMacro, technology, selectedPiercingMacro } = macrosStore

	if (isArray) {
		let paramName = isArray.split('/').reverse()[0]
		maximum = utils.deepFind(technology, [paramName]).length - 1
	}
	const knobStp = knobStep[param]
	const step = Number(maximum - minimum) / 50 > 50 ? 50 : Number(knobStp)
	const stepBig = Number(maximum - minimum) / Number(knobStp) > 50 ? Number(maximum - minimum) / 50 : Number(knobStp)
	let fontSize = utils.calculateFontSize(minimum, maximum, step);
	const {
		x1, x2, x4,
		y1, y2, y3,
		r1, r2,
	} = utils.getKnobLayout(isVertical);

	let val = 0;
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
		} else if (keyParam === 'stages') {
			val = macrosStore.getTecnologyValue(param, keyParam, keyInd)
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
			val = macrosStore.getTecnologyValue(param, keyParam, keyInd)
		}
	}

	const handleMouseDown = (callback) => {
		callback();
		intervalRef.current = setInterval(callback, 50);
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	const increase = () => {
		setVal(step);
	}

	const decrease = () => {
		setVal(-step);
	}

	const setVal = (step) => {
		let currentValue = macrosStore.getTecnologyValue(param, keyParam, keyInd)
		let newValue = currentValue + step
		macrosStore.setTecnologyValue(newValue, param, keyParam, minimum, maximum, keyInd)
		if (newValue >= minimum && newValue <= maximum) {
			const rotStep = 270 / (maximum - minimum);
			setRotation(prev => prev + (newValue - currentValue) * rotStep);
		}
	}

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;

		const handleWheel = (e) => {
			e.preventDefault();
			setVal((e.deltaY < 0 ? stepBig : -stepBig));
		};

		svg.addEventListener('wheel', handleWheel);
		return () => {
			svg.removeEventListener('wheel', handleWheel);
		};
	}, []);

	const [rotation, setRotation] = useState(0);

	const onHover = () => {
		console.log(param)
		macrosStore.setDiagActive(param)
	}

	const onLeave = () => {
		console.log('onLeave')
		macrosStore.setDiagActive('false')
	}

	const [show, setShow] = useState(false);
	const [inputValue, setInputValue] = useState('');
	const [error, setError] = useState('');

	// Открыть модалку
	const showModal = () => {
		setInputValue('');
		setError('');
		setShow(true);
	};

	// Закрыть модалку
	const handleClose = () => setShow(false);

	// Подтверждение ввода
	const handleChange = (value) => {
		setInputValue(value);
		const num = parseFloat(value);
	
		if (isNaN(num)) {
			setError( t("Enter a number"));
			return;
		}
	
		// Валидация step
		if (knobStp === 0.1) {
			// допускаем только значения с максимум одним знаком после запятой
			if (!/^-?\d+(\.\d)?$/.test(value)) {
				setError( t("Only single decimal place values are allowed"));
				return;
			}
		} else {
			// только целые
			if (!/^\d+$/.test(value)) {
				setError( t('Only whole numbers are allowed'));
				return;
			}
		}
	
		// Проверка диапазона
		if (num < minimum) {
			setError( t("Value cannot be less than")+' '+minimum);
		} else if (num > maximum) {
			setError( t('Value cannot be greater than')+' '+maximum );
		} else {
			setError('');
		}
	};


	// Подтверждение
	const handleSubmit = () => {
		const num = parseFloat(inputValue);
		if (!isNaN(num) && !error) {
			macrosStore.setTecnologyValue(num, param, keyParam, minimum, maximum, keyInd);
			setShow(false);
		}
	};
	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'
			onPointerOver={onHover}
			onPointerLeave={onLeave}
		>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center'>
				<svg id="svgChart"
					className="svgChart" version="1.1"
					width="100%" height="100%"
					viewBox="0 0 100 100" overflow="hidden"
				>
					{isArray && keyParam === 'macros' && <MacrosEditModalButton param={param} />}
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
							utils.getLampLine(
								minimum,
								maximum,
								val,
								stepBig,
								r1,
								r2,
							)
						}


						<text x={83} y={60}
							textAnchor="end"
							fontSize={fontSize}
							className='segments14 value'
							fill="var(--knobMainText)"
							onDoubleClick={showModal}
						>
							{knobRound[param] !== 0 ? (Math.round(val) - val === 0 ? String(val) + '.0' : val) : val}
						</text>)


					</g>
					{t(title).split(', ')[0].split(' ').map((a, i) => (
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
					<g style={{
						transform: `rotate(${rotation}deg)`,
						transformOrigin: '50% 50%',
						transition: 'transform 0.1s linear',
					}}>
						{utils.getSticks(60, 44, 1)}
						{/*                             {utils.getTicks(0, 2, 1, 30, 30, 1, 120, 240)}
 */}					</g>
				</svg>
			</div>
			<Modal show={show} 
				onHide={handleClose} 
				centered 
				className="with-inner-backdrop" 
				id={useId}>
				<Modal.Header closeButton>
					<Modal.Title>
						<div className='font18'>
						{t('Введите значение')}: {t(title)}
						</div>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form
						onSubmit={(e) => {
							e.preventDefault();
							handleSubmit();
						}}
					>
						<Form.Control
							value={inputValue}
							onChange={(e) => handleChange(e.target.value)}
							autoFocus
						/>
						{error && (
							<Form.Text className="text-danger">
								{error}
							</Form.Text>
						)}
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						{t('Cancel')}
					</Button>
					<Button variant="primary" onClick={handleSubmit}>
						OK
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
});

export default UniversalKnob;
