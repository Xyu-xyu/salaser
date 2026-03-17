import React from 'react';
import SheetToolsPanel from './sheetToolsPanel.jsx'
import SheetPanel from './sheetPanel.jsx'
import FormsPanel from './formsPanel.jsx'
import ExitButtonSheetEditor from '../../navbar/ExitButtonSheetEditor.jsx';
import SheetAlignPanel from './sheetAlignPanel.jsx';
 

const Panels = () => {
 	return (
		<>
			<SheetToolsPanel />	
			<SheetPanel />	
			<FormsPanel />
			<SheetAlignPanel />
			<ExitButtonSheetEditor />			
 		</>
	);
};
 export default Panels;
