import { observer } from 'mobx-react-lite';
import macrosStore from '../../store/macrosStore';
import IosToggleGeneric from './iosToggleGeneric';

const IosToggleBlowInStage = observer(() => {
	const { isVertical  } = macrosStore;
	const param = 'cross_blow';
 	const val = macrosStore.getTecnologyValue (param, 'stages')
	const setVal = () => macrosStore.setTecnologyValueBoolean( !val, param, 'stages');

	return (
		<IosToggleGeneric
			title={'cross_blow'}
			checked={val}
			onChange={setVal}
			isVertical={isVertical}
		/>
	);
});

export default IosToggleBlowInStage;
