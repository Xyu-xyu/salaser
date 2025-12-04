import { Icon } from '@iconify/react';
import Panel from './panel.jsx';
//import '@fortawesome/fontawesome-free/css/all.css'
import { observer } from 'mobx-react-lite';  
import svgStore from "./../../../store/svgStore.jsx";
import editorStore from "./../../../store/editorStore.jsx";;
import inlet from './../../../scripts/inlet.jsx'
import ShapeModalComponent from './../shapeModalComponent.jsx';
import { addToLog } from './../../../scripts/addToLog.jsx';
import util from './../../../scripts/util.jsx';


const ToolsPanel = observer(() => {
	const deleteContour =()=>{
		if  (svgStore.getSelectedElement()){
			svgStore.deleteSelected()
			addToLog('Contour deleted')
		}
	}

	const setMode =(mode)=>{
		editorStore.setMode(mode)
		svgStore.setSelectedPointOnEdge(false)
		svgStore.setSelectedPointOnPath(false)
		svgStore.setContourSelected(false)
		svgStore.setSelectedEdge(false)
		svgStore.setTextFocus(false)
	}

	const copyContour =()=>{
		console.log  ( svgStore.selectedCid )
		if (typeof svgStore.selectedCid === 'number') {
			svgStore.setCopiedCid ( svgStore.selectedCid )
		}		
	}

	const pasteContour =()=>{
		if (typeof svgStore.copiedCid !== 'number') return;
		svgStore.addElementWithCid ( svgStore.copiedCid )
		svgStore.setCopiedCid ( false )
		addToLog("Contour pasted")
	}

	const reverse =()=>{
		inlet.reversePath ()
	}

	const addPointToPath =()=>{
		let newPathData = util.addPointToPath()
		if (newPathData) {
			svgStore.updateElementValue(svgStore.selectedPointOnPath.cid, 'contour', 'path', newPathData) 
			svgStore.setSelectedPointOnPath(false)
			addToLog('Added new point to path') 
		}		
	}

	const deletePoint =()=>{
		let newPathData = util.deletePoint()
		if (newPathData) {
			svgStore.updateElementValue(svgStore.selectedPointOnEdge.cid, 'contour', 'path', newPathData) 
			svgStore.setSelectedPointOnEdge(false)
			addToLog('Point deleted from path') 
		} else {
			console.log ('No cut signor!')
		}
	}

	const roundEdge =()=>{
		let newPathData = util.createFilletArc()
		if (newPathData) {
			svgStore.updateElementValue(svgStore.selectedPointOnEdge.cid, 'contour', 'path', newPathData) 
			svgStore.setSelectedPointOnEdge(false)
			addToLog('Edge rounded') 
		} else {
			console.log ('No cut signor!')
		}
	}

	const panelInfo = [
		{
			id: "toolsPopup",
			fa: (<Icon icon="heroicons:wrench-screwdriver-20-solid" />),
 			content: (
				<div className="d-flex align-items-center btn_block flex-wrap">
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_tool btn_resize_mode"
					onMouseDown={()=> setMode('resize')}
				  >
					<i className="fa-solid fa-arrow-pointer"></i>
				  </button>
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_tool btn_drag_mode"
					onMouseDown={()=> setMode('drag')}
				  >
					<i className="fa-solid fa-hand"></i>
				  </button>
				 
					{svgStore.selectedPointOnPath ? 
						<button
							type="button"
							className="btn text-white mt-1 ms-2 btn_mode btn_tool btn_add_point"
							onMouseDown={addPointToPath}>
							<Icon icon="gridicons:add" width="24" height="24" />
						</button>
						:
						<button
							type="button"
							className="btn text-white mt-1 ms-2 btn_mode btn_tool btn_add_point"
							onMouseDown={()=> setMode('addPoint')}							>
							<div className="d-flex flex-row align-items-center justify-content-center">
							<i className="fa-solid fa-arrow-pointer"></i>
							<div style={{ marginTop: 11 }}>+</div>
							</div>
						</button>
					}					
					
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_copy btn_tool" 
					onMouseDown={copyContour}
				  >
					<i className="fa-solid fa-copy"></i>
				  </button>
					{ svgStore.selectedPointOnEdge ?

						<button
							type="button"
							className="btn text-white mt-1 ms-2 btn_tool btn_selectPoint_mode"
							onMouseDown={ deletePoint }
						>
						<Icon icon="gridicons:cross-circle" width="24" height="24" />
						</button>						
						:
						<button
							type="button"
							className="btn text-white mt-1 ms-2 btn_tool btn_selectPoint_mode"
							onMouseDown={()=> setMode('selectPoint')}
						>
							<Icon icon="mage:mouse-pointer" width="24" height="24" style={{color: 'white'}}/>
						</button>
					}
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_rounding btn_tool"
					onMouseDown={roundEdge}
				  >
					<Icon icon="proicons:arc" width="24" height="24" style={{color: 'white'}} />
				  </button>
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_paste btn_tool" 
					onMouseDown={pasteContour}
				  >
					<i className="fa-solid fa-file-import"></i>
				  </button>
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_reverse_path btn_tool"
					onMouseDown={reverse}
				  >
					<i className="fa-solid fa-rotate"></i>
				  </button>
  				 <ShapeModalComponent />
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_text btn_tool"
					onMouseDown={()=> setMode('text')}
				  >
					<Icon icon="tabler:text-size" width="24" height="24" />
				  </button>
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_new_outer btn_tool"
					onClick={() => svgStore.setNewOuter()}
				  >
					<Icon icon="material-symbols:settings-applications-outline" width="24" height="24"  style={{color: 'white'}} />				  </button>
				  <button
					type="button"
					className="btn text-white mt-1 ms-2 btn_delete btn_tool" onMouseDown={deleteContour}
				  >
					<i className="fa-solid fa-trash"></i>
				  </button>
				</div>
			  ),
		  },   
	]

return (
	<>
		{panelInfo.map((element, index) => (
			<Panel key={'panel' + index+8} element={element} index={index+8} />
		))}
	</>
	);
})

export default ToolsPanel; 