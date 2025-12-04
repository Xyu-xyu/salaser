import React from 'react';
import './IosToggle.css';


const IosToggleForm = ({ id, checked, onChange, dataOn = "", dataOff = "" }) => {
	return (
		<div id={`toggles${id}`} className='mx-4 toggles'>
			<input
				id={`checkbox${id}`}
				type="checkbox"
				className="ios-toggle"
				checked={checked}
				onChange={onChange}
			/>
			<label
				htmlFor={`checkbox${id}`}
				className="checkbox-label"
				data-off={dataOff}
				data-on={dataOn}
			/>
		</div>
	);
};

export default IosToggleForm;
