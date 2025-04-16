import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';

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
		<div id="toggles1" className='mx-4'>
			<input
				id="checkbox2"
				type="checkbox"
				className="ios-toggle"
				onChange={ setChecked }
			/>
			<label
				htmlFor="checkbox2"
				className="checkbox-label"
				data-off=""
				data-on=""
			/>
		</div>
	);
});

export default IosToggle1;
