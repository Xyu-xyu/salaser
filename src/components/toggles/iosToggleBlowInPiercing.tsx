import { observer } from 'mobx-react-lite';
import viewStore from '../../store/viewStore';
import IosToggleGeneric from './iosToggleGeneric';
import utils from '../../scripts/util';
import cutting_settings_schema from '../../store/cut_settings_schema';

const iosToggleBlowInPiercing = observer(() => {

	const { isVertical, selectedPiercingMacro, technology } = viewStore
	const param: string = "initial_cross_blow"
	const keyParam : string = "piercingMacros"
	let property = utils.findByKey(cutting_settings_schema, param)[0]
	let { title } = property
	let val=technology.piercingMacros[selectedPiercingMacro][param]

	const setVal = () => {
		viewStore.setTecnologyValueBoolean (!val, param, keyParam)
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

export default iosToggleBlowInPiercing;
