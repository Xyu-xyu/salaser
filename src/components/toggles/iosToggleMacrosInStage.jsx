// IosToggle4.tsx
import { observer } from 'mobx-react-lite';
import macrosStore from '../../store/macrosStore';
import IosToggleGeneric from './iosToggleGeneric';

const iosToggleMacrosInStage = observer(() => {
	const { isVertical  } = macrosStore;
	const param = 'enabled';
 	const val = macrosStore.getTecnologyValue (param, 'stages')
	 const setVal = () => macrosStore.setTecnologyValueBoolean( !val, param, 'stages');

	return (
		<IosToggleGeneric
			title="Enabled"
			checked={val}
			onChange={setVal}
			isVertical={isVertical}
		/>
	);
});

export default iosToggleMacrosInStage;
