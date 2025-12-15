import React from 'react';
import ToolsPanel from './toolsPanel.jsx'
import ContourPanel from './contourPanel.jsx';
import InletPanel from './inletPanel.jsx';
import OutletPanel from './outletPanel.jsx';


const PartPanels = () => {

	return (
		<>
			<ToolsPanel />
			<ContourPanel />
			<InletPanel />	
			<OutletPanel />
		</>
	);
};

export default PartPanels;
