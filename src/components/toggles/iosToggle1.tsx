import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import IosToggleForm from './iosToggleForm';
import laserStore from '../../store/laserStore';

const IosToggle1 = observer(() => {
	const { knobMode } = laserStore
	const setChecked = () => {
		if ( knobMode === true) {
			laserStore.setVal('knobMode', false);
		} else {
 			laserStore.setVal('knobMode', true);
		}
	}

	return (
		<IosToggleForm id={'1'} checked={Boolean(knobMode)} onChange={setChecked} dataOff={''}  dataOn={''}/> 
	);
});

export default IosToggle1;



