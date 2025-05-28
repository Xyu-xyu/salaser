// IosToggle4.tsx
import { observer } from 'mobx-react-lite';
import viewStore from '../../store/viewStore';
import IosToggleGeneric from './iosToggleGeneric';

const iosToggleMacrosInStage = observer(() => {
	const { isVertical  } = viewStore;
	const param = 'enabled';
 	const val = viewStore.getTecnologyValue (param, 'stages')
	 const setVal = () => viewStore.setTecnologyValueBoolean( !val, param, 'stages');

	return (
		<IosToggleGeneric
			title="Stage"
			checked={val}
			onChange={setVal}
			isVertical={isVertical}
		/>
	);
});

export default iosToggleMacrosInStage;
