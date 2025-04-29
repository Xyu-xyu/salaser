import IosToggleForm from "./iosToggleForm";
import viewStore from "../store/viewStore";
import { observer } from 'mobx-react-lite';

const IosToggle0 = observer(() => {
	const { mode } = viewStore
	const setChecked = () => {
		if (mode === 'main') {
			viewStore.setMode('main1')
		} else {
			viewStore.setMode('main')
		}
	}
	return (
		<IosToggleForm id={'0'} checked={(mode === 'main1')} onChange={setChecked} dataOff={''}  dataOn={''}/> 
	);
});

export default IosToggle0;

