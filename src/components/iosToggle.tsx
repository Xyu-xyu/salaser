import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';

const IosToggle = observer(() => {
	const { mode } = viewStore
	const setChecked = () => {
		if (mode === 'main') {
			viewStore.setMode('main1')
		} else {
			viewStore.setMode('main')
		}
	}

	return (
		<div id="toggles" className='mx-4'>
			<input
				type="checkbox"
				id="checkbox1"
				className="ios-toggle"
				onChange={ setChecked }
			/>
			<label
				htmlFor="checkbox1"
				className="checkbox-label"
				data-off=""
				data-on=""
			/>
		</div>
	);
});

export default IosToggle;
