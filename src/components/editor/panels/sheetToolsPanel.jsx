import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import partStore from "../../../store/partStore.jsx";
import editorStore from "../../../store/editorStore.jsx";;
import inlet from '../../../scripts/inlet.jsx'
import ShapeModalComponent from '../shapeModalComponent.jsx';
import { addToLog } from '../../../scripts/addToLog.jsx';
import util from '../../../scripts/util.jsx';
import CustomIcon from '../../../icons/customIcon.jsx';
import svgStore from '../../../store/svgStore.jsx';


const SheetToolsPanel = observer(() => {
	
	const deleteSelectedPosition = () => {
		svgStore.deleteSelectedPosition()
	}

	const rotateSelectedPosition = () => {
		svgStore.rotateSelectedPosition()
	}



	const panelInfo = [
		{
			id: "sheetToolsPopup",
			fa: (
				<CustomIcon
					icon="wrench"
					width="20"
					height="20"
					color="black"
					fill="limegreen"
					strokeWidth={10}
					className="m-2"
					viewBox='0 0 512 512'

				/>
			),
			content: (
				<div className="d-flex align-items-center btn_block flex-wrap">

					<button 
						type="button"
						className="btn text-white mt-1 ms-2 btn_tool"
						onMouseDown={rotateSelectedPosition}
					>

						<CustomIcon
							icon="fa-rotate"
							width="20"
							height="20"
							fill={"var(--violet)"}
							strokeWidth={0}
							viewBox='0 0 1536 1536'
						/>
					</button>
					<ShapeModalComponent />
 

					<button 
						type="button"
						className="btn text-white mt-1 ms-2 btn_delete btn_tool" onMouseDown={deleteSelectedPosition}
					>
						<CustomIcon
							icon="ic:twotone-delete-outline"
							width="24"
							height="24"
							fill={"var(--violet)"}
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
				<Panel key={'panel' + index + 8} element={element}/>
			))}
		</>
	);
})

export default SheetToolsPanel;



