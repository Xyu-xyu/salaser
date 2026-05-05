import { observer } from 'mobx-react-lite';
import macrosStore from '../../store/macrosStore';
import IosToggleGeneric from './iosToggleGeneric';
import utils from '../../scripts/util';
const iosToggleBlowInPiercing = observer(() => {

	if (macrosStore.cutSettingsSchemaStatus !== 'ready' || !macrosStore.schema) {
		return null;
	}

	const { isVertical, selectedPiercingMacro, technology, schema } = macrosStore
	const param = "initial_cross_blow"
	const keyParam  = "piercingMacros"
	const found = utils.findByKey(schema, param);
	const property = found[0];
	if (!property) return null;
	let { title } = property
	let val=technology.piercingMacros[selectedPiercingMacro][param]

	const setVal = () => {
		macrosStore.setTecnologyValueBoolean (!val, param, keyParam)
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
