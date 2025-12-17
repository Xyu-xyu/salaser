import React from 'react';
import ToolsPanel from './toolsPanel.jsx'
import ContourPanel from './contourPanel.jsx';
import InletPanel from './inletPanel.jsx';
import OutletPanel from './outletPanel.jsx';
import TecnologyPanel from './tecnologyPanel.jsx';
import TextPanel from './textPanel.jsx';


const PartPanels = () => {

	return (
		<>
			<ToolsPanel />
			<ContourPanel />
			<InletPanel />	
			<OutletPanel />
			<TecnologyPanel />
			<TextPanel />
		</>
	);
};

export default PartPanels;
