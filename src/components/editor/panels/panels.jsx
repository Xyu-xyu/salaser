import React from 'react';
import { observer } from 'mobx-react-lite';
import SheetToolsPanel from './sheetToolsPanel.jsx'
import SheetPanel from './sheetPanel.jsx'
import FormsPanel from './formsPanel.jsx'
import ExitButtonSheetEditor from '../../navbar/ExitButtonSheetEditor.jsx';
import SheetAlignPanel from './sheetAlignPanel.jsx';
import SheetLogPanel from './sheetLogPanel.jsx';
import SheetCutPanel from './sheetCutPanel.jsx';
import SheetResidualCutPanel from './sheetResidualCutPanel.jsx';
import panelStore from '../../../store/panelStore.jsx';
 

const Panels = observer(() => {
	const dockablePanels = (
		<>
			<SheetPanel />	
			<FormsPanel />
			<SheetAlignPanel />
			<SheetCutPanel /> 
			<SheetResidualCutPanel />
			<SheetLogPanel />
		</>
	);

 	return (
		<div className={`editor-panels-root ${panelStore.dockMode ? "editor-panels-root-docked" : ""}`}>
			<SheetToolsPanel />	
			{panelStore.dockMode ? (
				<div className="editor-dock-sidebar-scroll">
					{dockablePanels}
				</div>
			) : dockablePanels}
			<ExitButtonSheetEditor />
 		</div>
	);
});
 export default Panels;
