import React from 'react';
import { observer } from 'mobx-react-lite';
import partStore from './../../store/partStore';


const SelectedPointOnPath = observer(() => {
	const {
		selectedPointOnPath
	} = partStore

	if (!selectedPointOnPath) {
		return null;
	}

	return (
		<circle
			fill="green"
			r="1"
			strokeWidth="0.25"
			pointerEvents="all"
			cx={selectedPointOnPath.x}
			cy={selectedPointOnPath.y}
		/>
	);
});

export default SelectedPointOnPath;