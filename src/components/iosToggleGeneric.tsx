import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import React, { useId } from 'react';
import IosToggleForm from './iosToggleForm';

interface IosToggleGenericProps {
	title: string;
	checked: boolean;
	onChange: () => void;
	isVertical?: boolean;
}

const IosToggleGeneric: React.FC<IosToggleGenericProps> = observer(({
	title,
	checked,
	onChange,
	isVertical = false,
}) => {
	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center'>
				<svg
					id={ useId() }
					className="svgChart"
					version="1.1"
					width="100%" height="100%"
					viewBox="0 0 100 100" overflow="hidden"
				>
					{title.split(', ')[0].split(' ').map((a: string, i: number) => (
						<text
							key={i}
							x="5"
							y={-15 + i * 9}
							className="moderat"
							fill="var(--knobMainText)"
							fontSize={isVertical ? 10 : 7}
						>
							{a}
						</text>
					))}
				</svg>

				<IosToggleForm
					id={ useId()}
					checked={checked}
					onChange={onChange}
					dataOff="Выкл"
					dataOn="Вкл"
				/>
			</div>
		</div>
	);
});

export default IosToggleGeneric;
