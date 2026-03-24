import React from 'react';
import { observer } from 'mobx-react-lite';
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
import ExitButton from '../../navbar/ExitButton.jsx';
import JointPanel from './jointPanel.jsx';
import panelStore from '../../../store/panelStore.jsx';


const PartPanels = observer(() => {
	const dockablePanels = (
		<>
			<ContourPanel />
			<InletPanel />	
			<OutletPanel />
			<TecnologyPanel />
			<TextPanel />
			<LogPanel />
			<PointPanel />
			<EdgePanel />
			<CutPanel />
			<JointPanel />
		</>
	);

	return (
		<div className={`editor-panels-root ${panelStore.dockMode ? "editor-panels-root-docked" : ""}`}>
			<ToolsPanel />
			{panelStore.dockMode ? (
				<div className="editor-dock-sidebar-scroll">
					{dockablePanels}
				</div>
			) : dockablePanels}
			<ExitButton />
		</div>
	);
});

export default PartPanels;
