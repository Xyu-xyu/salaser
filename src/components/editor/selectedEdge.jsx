import React from 'react';
import { observer } from 'mobx-react-lite';
import partStore from './../../store/partStore';


const SelectedEdge = observer(() => {
	const {
		selectedEdgePath,
	} = partStore

	return (
		<path
			d={selectedEdgePath}
			id="selectedEdge"
		/>

	);
});

export default SelectedEdge;