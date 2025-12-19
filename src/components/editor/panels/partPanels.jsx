import React from 'react';
import ToolsPanel from './toolsPanel.jsx'
import ContourPanel from './contourPanel.jsx';
import InletPanel from './inletPanel.jsx';
import OutletPanel from './outletPanel.jsx';
import TecnologyPanel from './tecnologyPanel.jsx';
import TextPanel from './textPanel.jsx';
import LogPanel from './logPanel.jsx';
import PointPanel from './pointPanel .jsx';
import EdgePanel from './edgePanel.jsx';
import CutPanel from './cutPanel.jsx';
import ExitButton from '../../navbar/ExirButton.jsx';


const PartPanels = () => {

	return (
		<>
			<ToolsPanel />
			<ContourPanel />
			<InletPanel />	
			<OutletPanel />
			<TecnologyPanel />
			<TextPanel />
			<LogPanel />
			<PointPanel />
			<EdgePanel />
			<CutPanel />
			<ExitButton />

		</>
	);
};

export default PartPanels;
