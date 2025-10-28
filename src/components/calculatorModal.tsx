import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import functionStore from '../store/functionStore';

interface CalculatorModalProps {
	min: number;
	max: number;
	defaultValue?: number;
	label: string;
	aKey: string;
	bKey: string;

}

const CalculatorModal: React.FC<CalculatorModalProps> = ({
	min,
	max,
	defaultValue = 0,
	label,
	aKey,
	bKey,

}) => {
	const [input, setInput] = useState<string>(defaultValue.toString());
	const [display, setDisplay] = useState<string>(defaultValue.toString());

	useEffect(() => {
		setInput(defaultValue.toString());
		setDisplay(defaultValue.toString());
	}, [defaultValue]);

	const handleNumber = (num: string) => {
		if (input === '0' && num !== '.') {
			setInput(num);
			setDisplay(num);
		} else {
			const newInput = input + num;
			setInput(newInput);
			setDisplay(newInput);
		}
	};

	const handleOperator = (op: string) => {
		if (/[+\-x÷]$/.test(input)) return;
		const newInput = input + op;
		setInput(newInput);
		setDisplay(newInput);
	};

	const handleClear = () => {
		setInput('0');
		setDisplay('0');
	};

	const handleBackspace = () => {
		if (input.length <= 1) {
			setInput('0');
			setDisplay('0');
		} else {
			const newInput = input.slice(0, -1);
			setInput(newInput);
			setDisplay(newInput);
		}
	};

	const handleToggleSign = () => {
		const currentValue = parseFloat(input);
		const toggledValue = -currentValue;
		const newInput = toggledValue.toString();
		setInput(newInput);
		setDisplay(newInput);
	};

	const calculate = (): number => {
		try {
			const expression = input
				.replace(/x/g, '*')
				.replace(/÷/g, '/')
				.replace(/\+/g, '+')
				.replace(/-/g, '-');

			const result = Function('"use strict"; return (' + expression + ')')();
			const num = parseFloat(result.toFixed(6));

			if (isNaN(num)) return defaultValue;
			return Math.max(min, Math.min(max, num));
		} catch {
			return defaultValue;
		}
	};

	const handleEquals = () => {
		const result = calculate();
		const resultStr = result % 1 === 0 ? result.toString() : result.toFixed(2).replace(/\.?0+$/, '');
		setInput(resultStr);
		setDisplay(resultStr);
	};

	const handleConfirm = () => {
		const result = calculate();
		functionStore.updateValue(`${aKey}.${bKey}`, result)
	};


	return (

		<div className='p-1'>
			<h6>{label}</h6>
			<InputGroup className="mb-3">
				<FormControl
					value={display}
					readOnly
					className="text-right fs-3"
					aria-label="Calculator display"
				/>
			</InputGroup>

			{/* Info */}
			<div className="mb-3">
				<div className="d-flex justify-content-between">
					<span>Minimum:</span>
					<span>{min}</span>
				</div>
				<div className="d-flex justify-content-between">
					<span>Maximum:</span>
					<span>{max}</span>
				</div>
				<div className="d-flex justify-content-between">
					<span>Default:</span>
					<span>{defaultValue}</span>
				</div>
			</div>

			{/* Keypad */}
			<div className="d-flex flex-column mt-1">
 				<div className='d-flex w-100'>

					<div className='col-9'>
						<div className="d-flex flex-wrap justify-content-between  w-100">
							<div className="d-flex w-100 ">

							</div>
							{/* Первая строка */}
							<div className="d-flex w-100 ">
								<Button variant="light" onClick={handleBackspace} className='col-4'>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
									</svg>
								</Button>
								<Button variant="light" onClick={handleClear} className='col-4'>
									C
								</Button>
								<Button variant="light" onClick={handleToggleSign} className='col-4'>
									±
								</Button>
							</div>


							<div className="d-flex w-100 ">
		 						<Button variant="light" onClick={() => handleNumber('7')} className="flex-fill">
									7
								</Button>
								<Button variant="light" onClick={() => handleNumber('8')} className="flex-fill">
									8
								</Button>
								<Button variant="light" onClick={() => handleNumber('9')} className="flex-fill">
									9
								</Button>
							</div>

							{/* Вторая строка */}
							<div className="d-flex w-100 ">
								<Button variant="light" onClick={() => handleNumber('4')} className="flex-fill">
									4
								</Button>
								<Button variant="light" onClick={() => handleNumber('5')} className="flex-fill">
									5
								</Button>
								<Button variant="light" onClick={() => handleNumber('6')} className="flex-fill">
									6
								</Button>
							</div>

							{/* Третья строка */}
							<div className="d-flex w-100 ">
								<Button variant="light" onClick={() => handleNumber('1')} className="flex-fill">
									1
								</Button>
								<Button variant="light" onClick={() => handleNumber('2')} className="flex-fill">
									2
								</Button>
								<Button variant="light" onClick={() => handleNumber('3')} className="flex-fill">
									3
								</Button>
							</div>

							{/* Четвертая строка */}
							<div className="d-flex w-100 ">
								<Button variant="light" onClick={() => handleNumber('0')} className="flex-fill">
									0
								</Button>
								<Button variant="light" onClick={() => handleNumber('.')} className="flex-fill">
									.
								</Button>
							</div>
						</div>
					</div>

					<div className='d-flex flex-column col-3'>
						<Button variant="warning" onClick={() => handleOperator('/')}>
							/
						</Button>
						<Button variant="warning" onClick={() => handleOperator('x')}>
							x
						</Button>
						<Button variant="warning" onClick={() => handleOperator('-')}>
							-
						</Button>
						<Button variant="warning" onClick={() => handleOperator('+')}>
							+
						</Button>

						<Button variant="success" onClick={handleEquals} className="col-span-2">
							=
						</Button>
					</div>
				</div>
			</div>

			{/* Footer */}

			<Button variant="secondary" className="w-100 mt-1" onClick={() => { }}>Cancel</Button>
			<Button variant="primary" className="w-100 mt-1" onClick={handleConfirm}>OK</Button>



		</div>

	);
};

export default CalculatorModal;
