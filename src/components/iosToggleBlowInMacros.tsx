import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import IosToggleGeneric from './iosToggleGeneric';

const IosToggleBlowInMacros = observer(() => {

	const { selectedMacros, macrosProperties, isVertical, technology } = viewStore
	const param: string = "cross_blow"
	const knob = technology.macros[selectedMacros]
	const property = macrosProperties.cutting.properties[param as keyof typeof macrosProperties.cutting.properties];
	const { title } = property;


	let val = Boolean(knob.cutting[param as keyof typeof knob.cutting]);
	const setVal = () => {
		viewStore.setValBoolean(param, !val)
	}

	return (
		<IosToggleGeneric
			title={title}
			checked={val}
			onChange={setVal}
			isVertical={isVertical}
		/>
	);
});

export default IosToggleBlowInMacros;
