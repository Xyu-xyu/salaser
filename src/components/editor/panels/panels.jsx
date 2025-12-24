import React from 'react';
import SheetToolsPanel from './sheetToolsPanel.jsx'
import FormsPanel from './formsPanel.jsx'
import ExitButtonSheetEditor from '../../navbar/ExitButtonSheetEditor.jsx';
 

const Panels = () => {
 	return (
		<>
			<SheetToolsPanel />	
			<FormsPanel />
			<ExitButtonSheetEditor />			
 		</>
	);
};
 export default Panels;
