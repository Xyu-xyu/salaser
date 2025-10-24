// IosToggle4.tsx
import { observer } from 'mobx-react-lite';
import macrosStore from '../../store/macrosStore';
import IosToggleGeneric from './iosToggleGeneric';
 
const iosToggleMacrosInMacros = observer(() => {
	const { selectedMacros, macrosProperties, isVertical, technology } = macrosStore
	const param: string = "enabled"
	const knob = technology.macros[selectedMacros]
	const property = macrosProperties.cutting.properties[param as keyof typeof macrosProperties.cutting.properties];
	const { title } = property;

	let val = Boolean(knob.cutting[param as keyof typeof knob.cutting]);
	const setVal = () => {
		macrosStore.setValBoolean(param, !val)
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

export default iosToggleMacrosInMacros;
