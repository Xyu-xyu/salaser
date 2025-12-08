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
import CustomIcon from './../../../icons/customIcon.jsx';


const ToolsPanel = observer(() => {
	const deleteContour = () => {
		if (svgStore.getSelectedElement()) {
			svgStore.deleteSelected()
			addToLog('Contour deleted')
		}
	}

	const setMode = (mode) => {
		editorStore.setMode(mode)
		svgStore.setSelectedPointOnEdge(false)
		svgStore.setSelectedPointOnPath(false)
		svgStore.setContourSelected(false)
		svgStore.setSelectedEdge(false)
		svgStore.setTextFocus(false)
	}

	const copyContour = () => {
		console.log(svgStore.selectedCid)
		if (typeof svgStore.selectedCid === 'number') {
			svgStore.setCopiedCid(svgStore.selectedCid)
		}
	}

	const pasteContour = () => {
		if (typeof svgStore.copiedCid !== 'number') return;
		svgStore.addElementWithCid(svgStore.copiedCid)
		svgStore.setCopiedCid(false)
		addToLog("Contour pasted")
	}

	const reverse = () => {
		inlet.reversePath()
	}

	const addPointToPath = () => {
		let newPathData = util.addPointToPath()
		if (newPathData) {
			svgStore.updateElementValue(svgStore.selectedPointOnPath.cid, 'contour', 'path', newPathData)
			svgStore.setSelectedPointOnPath(false)
			addToLog('Added new point to path')
		}
	}

	const deletePoint = () => {
		let newPathData = util.deletePoint()
		if (newPathData) {
			svgStore.updateElementValue(svgStore.selectedPointOnEdge.cid, 'contour', 'path', newPathData)
			svgStore.setSelectedPointOnEdge(false)
			addToLog('Point deleted from path')
		} else {
			console.log('No cut signor!')
		}
	}

	const roundEdge = () => {
		let newPathData = util.createFilletArc()
		if (newPathData) {
			svgStore.updateElementValue(svgStore.selectedPointOnEdge.cid, 'contour', 'path', newPathData)
			svgStore.setSelectedPointOnEdge(false)
			addToLog('Edge rounded')
		} else {
			console.log('No cut signor!')
		}
	}

	const panelInfo = [
		{
			id: "toolsPopup",
			fa: (
				<CustomIcon
					icon="wrench"
					width="20"
					height="20"
					color="black"
					fill="black"
					strokeWidth={10}
					className="m-2"
					viewBox='0 0 512 512'

				/>
			),
			content: (
				<div className="d-flex align-items-center btn_block flex-wrap">
					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_tool btn_resize_mode"
						onMouseDown={() => setMode('resize')}
					>

						<CustomIcon
							icon="fa-arrow-pointer"
							width="24"
							height="24"
							color="white"
							fill="black"
							strokeWidth={10}
							viewBox='0 0 640 640'
						/>
					</button>
					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_tool btn_drag_mode"
						onMouseDown={() => setMode('drag')}
					>
						<CustomIcon
							icon="hand"
							width="24"
							height="24"
							color="black"
							fill="black"
							strokeWidth={0.2}
							viewBox='0 0 20 20'
						/>
					</button>

					{svgStore.selectedPointOnPath ?
						<button disabled
							type="button"
							className="btn text-white mt-1 ms-2 btn_mode btn_tool btn_add_point"
							onMouseDown={addPointToPath}>
							<CustomIcon
								icon="gridicons:add"
								width="24"
								height="24"
								color="black"
								fill="black"
								strokeWidth={.5}
							/>
						</button>
						:
						<button disabled
							type="button"
							className="btn text-white mt-1 ms-2 btn_mode btn_tool btn_add_point"
							onMouseDown={() => setMode('addPoint')}							>
							<div className="d-flex flex-row align-items-center justify-content-center">
								<CustomIcon
									icon="fa-arrow-pointer"
									width="24"
									height="24"
									color="white"
									fill="black"
									strokeWidth={10}
									viewBox='0 0 640 640'
								/>
								<div style={{ marginLeft: -4,marginTop: 11, color: "black" }}>+</div>
							</div>
						</button>
					}

					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_copy btn_tool"
						onMouseDown={copyContour}
					>
						<CustomIcon
							icon="fa-regular:copy"
							width="24"
							height="24"
							color="black"
							fill="black"
							strokeWidth={0}
							viewBox='0 0 500 500'
						/>
					</button>
					{ svgStore.selectedPointOnEdge ? 

<button disabled
							type="button"
							className="btn text-white mt-1 ms-2 btn_tool btn_selectPoint_mode"
							onMouseDown={deletePoint}
						>
							<CustomIcon
								icon="delete-point"
								width="24"
								height="24"
								color="white"
								fill="black"
								strokeWidth={0.5}								
							/>
						</button>
						:
						<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_tool btn_selectPoint_mode"
						onMouseDown={() => setMode('selectPoint')}
					>
						<CustomIcon
								icon="fa-arrow-pointer"
								width="24"
								height="24"
								color="black"
								fill="white"
								strokeWidth={20}
								viewBox='0 0 640 640'
							/>
						</button>
					}
					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_rounding btn_tool"
						onMouseDown={roundEdge}
					>
							<CustomIcon
								icon="arc"
								width="24"
								height="24"
								color="black"
								fill="none"
								strokeWidth={2}
  							/>
					</button>
					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_paste btn_tool"
						onMouseDown={pasteContour}
					>
						<CustomIcon
								icon="fa-import"
								width="24"
								height="24"
								color="black"
								fill="black"
								strokeWidth={0}
								viewBox='0 0 640 640'
							/>
					</button>
					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_reverse_path btn_tool"
						onMouseDown={reverse}
					>

						<CustomIcon
							icon="fa-rotate"
							width="20"
							height="20"
							fill='black'
							strokeWidth={0}
							viewBox='0 0 1536 1536'
						/>
					</button>
					<ShapeModalComponent />
					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_text btn_tool"
						onMouseDown={() => setMode('text')}
					>
						<CustomIcon
							icon="text-size"
							width="24"
							height="24"
							fill='black'
							strokeWidth={1}							
							color='black'
						/>

					</button>
					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_new_outer btn_tool"
						onClick={() => svgStore.setNewOuter()}
					>

						<CustomIcon
							icon="settings-outline"
							width="32"
							height="32"
							fill='black'
							strokeWidth={0}
							viewBox='0 0 24 24'
						/>
					</button>

					<button disabled
						type="button"
						className="btn text-white mt-1 ms-2 btn_delete btn_tool" onMouseDown={deleteContour}
					>
						<CustomIcon
							icon="ic:twotone-delete-outline"
							width="24"
							height="24"
							fill='black'
							strokeWidth={0.2}
						/>
					</button>
				</div>
			),
		},
	]

	return (
		<>
			{panelInfo.map((element, index) => (
				<Panel key={'panel' + index + 8} element={element} index={index + 8} />
			))}
		</>
	);
})

export default ToolsPanel;



