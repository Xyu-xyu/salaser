import React, { useState, useEffect } from 'react';
import { Button, InputGroup, FormControl } from 'react-bootstrap';
import functionStore from '../store/functionStore';
import { showToast } from './toast';
import { useTranslation } from 'react-i18next';
import CustomIcon from '../icons/customIcon';

interface CalculatorModalProps {
	min: number;
	max: number;
	defaultValue?: number;
	label: string;
	aKey: string;
	bKey: string;
	def: number;

}

const CalculatorModal: React.FC<CalculatorModalProps> = ({
	min,
	max,
	defaultValue = 0,
	label,
	aKey,
	bKey,
	def

}) => {
	const [input, setInput] = useState<string>(defaultValue.toString());
	const [display, setDisplay] = useState<string>(defaultValue.toString());
	const { t } = useTranslation()


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

			if (isNaN(num)) {
				showToast({
					type: 'error',
					message: "Invalid value.",
					position: 'bottom-right',
					autoClose: 2500
				});
				return defaultValue;
			}

			if (min > num || num > max) {
				showToast({
					type: 'error',
					message: "Invalid value.",
					position: 'bottom-right',
					autoClose: 2500
				});
			}

			return Math.max(min, Math.min(max, num));
		} catch {
			showToast({
				type: 'error',
				message: "Invalid value.",
				position: 'bottom-right',
				autoClose: 2500
			});
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

		<div className='p-1'
			style={{ width: "300px" }}
			id="CalculatorModal"
		>
			<div className='d-flex align-items-center mb-2'>
				<div className='me-1'>
					<CustomIcon icon="bytesize:edit" width="18" height="18" style={{ color: "black" }} />
				</div>
				<div>
					<h6 className='m-0 p-0'>{t(label)}</h6>
				</div>
			</div>

			<div className='d-flex'>
			</div>
			<InputGroup className="mb-3">
				<FormControl
					value={display}
					readOnly
					className="text-end fs-3"
					aria-label="Calculator display"
				/>
			</InputGroup>


			{/* Info */}
			{[
				{ label: "Minimum", value: min },
				{ label: "Maximum", value: max },
				{ label: "Default", value: def }
			].map((item, index) => (
				<div key={index} className="w-100" style={{ height: "48px" }}>
					<div className="col-9 h-100">
						<div className="d-flex w-100 align-items-center h-100">
							<Button className='col-8 m-0 p-0 h-100'>
								{t(item.label)}
							</Button>
							<div className="calculatorItem d-flex align-items-center justify-content-center col-4 text-center h-100">
								<div>{item.value}</div>
							</div>
						</div>
					</div>
				</div>
			))}

			{/* Keypad */}
			<div className="d-flex flex-column mt-1">
				<div className='d-flex w-100'>

					<div className='col-9'>
						<div className="d-flex flex-wrap justify-content-between  w-100">
							<div className="d-flex w-100 ">

							</div>
							{/* Первая строка */}
							<div className="d-flex w-100 ">
								<Button onClick={handleBackspace} className='col-4'>
									<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z" />
									</svg>
								</Button>
								<Button onClick={handleClear} className='col-4'>
									C
								</Button>
								<Button onClick={handleToggleSign} className='col-4'>
									±
								</Button>
							</div>

							{[
								{ numbers: ['7', '8', '9'], classes: ['flex-fill', 'flex-fill', 'flex-fill'] },
								{ numbers: ['4', '5', '6'], classes: ['flex-fill', 'flex-fill', 'flex-fill'] },
								{ numbers: ['1', '2', '3'], classes: ['flex-fill', 'flex-fill', 'flex-fill'] },
								{ numbers: ['0', '.'], classes: ['col-8 flex-fill', 'col-4 flex-fill'] }
							].map((row, rowIndex) => (
								<div key={rowIndex} className="d-flex w-100">
									{row.numbers.map((number, index) => (
										<Button
											key={number}
											onClick={() => handleNumber(number)}
											className={row.classes[index]}
										>
											{number}
										</Button>
									))}
								</div>
							))}
						</div>
					</div>

					<div className='d-flex flex-column col-3'>
						<Button className='rightButton' onClick={() => handleOperator('/')}>
							/
						</Button>
						<Button className='rightButton' onClick={() => handleOperator('x')}>
							x
						</Button>
						<Button className='rightButton' onClick={() => handleOperator('-')}>
							-
						</Button>
						<Button className='rightButton' onClick={() => handleOperator('+')}>
							+
						</Button>

						<Button className='rightButton col-span-2' onClick={handleEquals}>
							=
						</Button>
					</div>
				</div>
			</div>

			{/* Footer */}

			<Button
				className="w-100 mt-1 downButton"
				onClick={ handleClear }
				style={{ backgroundColor: "var(--grey-progress)" }}
			>{t("Cancel")}</Button>
			<Button
				className="w-100 mt-1 downButton"
				onClick={handleConfirm}
				style={{ backgroundColor: "var(--grey-progress)" }}
			>OK</Button>
		</div>

	);
};

export default CalculatorModal;
