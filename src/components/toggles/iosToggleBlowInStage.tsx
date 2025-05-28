import { observer } from 'mobx-react-lite';
import viewStore from '../../store/viewStore';
import IosToggleGeneric from './iosToggleGeneric';

const IosToggleBlowInStage = observer(() => {
	const { isVertical  } = viewStore;
	const param = 'cross_blow';
 	const val = viewStore.getTecnologyValue (param, 'stages')
	const setVal = () => viewStore.setTecnologyValueBoolean( !val, param, 'stages');

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
