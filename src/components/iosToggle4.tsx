import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import IosToggleForm from './iosToggleForm';

const IosToggle4 = observer(() => {
	const { selectedMacros, knobs, isVertical/* macrosProperties */ } = viewStore
	const param:string = "enabled"
	const knob = knobs[selectedMacros]
 	//const property = macrosProperties.cutting.properties[param as keyof typeof macrosProperties.cutting.properties];
	const title  = "Макрос";
	
	let val = Boolean(knob.cutting[param as keyof typeof knob.cutting]);
	const setVal = () => {
		viewStore.setValBoolean(param, !val)
	}

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
		<div className='col-12 h-100 d-flex align-items-center justify-content-center'>

			<svg id="svgChart"
				className="svgChart" version="1.1"
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
			<IosToggleForm id={'4'} checked={val} onChange={setVal} dataOff={'Выкл'} dataOn={'Вкл'} />
		</div>
	</div>
	);
});

export default IosToggle4;