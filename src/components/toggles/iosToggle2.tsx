import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import viewStore from '../../store/viewStore';
import IosToggleForm from './iosToggleForm';

const IosToggle1 = observer(() => {
	const { theme } = viewStore
	const setTheme = () => {
		if (  theme === 'themeLight') {
			viewStore.setTheme( 'themeDark' )
		} else {
			viewStore.setTheme( 'themeLight' )
		}
	}

	return (
		<IosToggleForm id={'2'} checked={Boolean(theme=== 'themeLight')} onChange={setTheme} dataOff={''}  dataOn={''}/> 
	);
});

export default IosToggle1;