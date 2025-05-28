import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import viewStore from '../../store/viewStore';
import IosToggleForm from './iosToggleForm';

const IosToggle1 = observer(() => {
	const { knobMode } = viewStore
	const setChecked = () => {
		if ( knobMode === true) {
			viewStore.setKnobMode( false )
		} else {
			viewStore.setKnobMode( true )
		}
	}

	return (
		<IosToggleForm id={'1'} checked={Boolean(knobMode)} onChange={setChecked} dataOff={''}  dataOn={''}/> 
	);
});

export default IosToggle1;



