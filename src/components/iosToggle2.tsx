import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';

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
		<div id="toggles2" className='mx-4'>
			<input
				id="checkbox3"
				type="checkbox"
				className="ios-toggle"
				onChange={ setTheme }
			/>
			<label
				htmlFor="checkbox3"
				className="checkbox-label"
				data-off=""
				data-on=""
			/>
		</div>
	);
});

export default IosToggle1;
