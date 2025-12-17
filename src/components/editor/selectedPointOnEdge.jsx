import React from 'react';
import { observer } from 'mobx-react-lite';
import partStore from './../../store/partStore';
import Util from './../../scripts/util';


const SelectedPointOnEdge = observer(() => {
	const {
		selectedPointOnEdge
	} = partStore

	if (!selectedPointOnEdge) {
		return null;
	}

	const onMouseUp =()=>{
		addToLog("Contour was changed")
		partStore.setBoundsList(false)
	}

	const onMouseDown =()=>{
		partStore.setPointInMove(true)
		partStore.setBoundsList (Util.createBoundsList())
	}

	return (
		<circle
			fill="red"
			r="1"
			strokeWidth="0.25"
			pointerEvents="all"
			cx={selectedPointOnEdge.point.x}
			cy={selectedPointOnEdge.point.y}
			onMouseDown = { onMouseDown }
			onMouseUp ={ onMouseUp }
			onTouchStart={ onMouseDown }
			onTouchEnd={ onMouseUp }
		/>
	);
});

export default SelectedPointOnEdge;