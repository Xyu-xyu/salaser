import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
//import partStore from "../../../store/partStore.jsx";
//import editorStore from "../../../store/editorStore.jsx";;
import ShapeModalComponent from '../shapeModalComponent.jsx';
//import { addToLog } from '../../../scripts/addToLog.jsx';
//import util from '../../../scripts/util.jsx';
import CustomIcon from '../../../icons/customIcon.jsx';
import svgStore from '../../../store/svgStore.jsx';
import editorStore from '../../../store/editorStore.jsx';
import { useState } from "react";
import constants from '../../../store/constants.jsx';
import { addToSheetLog } from '../../../scripts/addToSheetLog.jsx';
import panelStore from '../../../store/panelStore.jsx';


const SheetToolsPanel = observer(() => {

	const [angle, setAngle] = useState(constants.defaultAngle);
	const activeModeIconColor = "var(--violet)";
	const inactiveModeIconColor = "black";
	const inactivePointerStrokeColor = "white";

	const isModeActive = (mode) => editorStore.mode === mode;
	const getModeIconFill = (mode) => (
		isModeActive(mode) ? activeModeIconColor : inactiveModeIconColor
	);
	const getModeIconStroke = (mode, inactiveColor = inactiveModeIconColor) => (
		isModeActive(mode) ? activeModeIconColor : inactiveColor
	);

	const deleteSelectedPosition = () => {
		const selectedCount = svgStore.svgData.positions.filter(pos => pos.selected).length;
		if (!selectedCount) return;

		svgStore.deleteSelectedPosition()
		addToSheetLog('Selected parts deleted');
	}

	const rotateSelectedPosition = (n = 0) => {
		if (angle === "" || isNaN(angle)) return;
		const selectedCount = svgStore.svgData.positions.filter(pos => pos.selected).length;
		if (!selectedCount) return;

		svgStore.rotateSelectedPosition(n);
		addToSheetLog('Selected parts rotated');
	};

	const handleAngleChange = (e) => {
		let value = e.target.value;
	
		// разрешаем пустое значение (чтобы можно было редактировать)
		if (value === "") {
			setAngle("");
			return;
		}
	
		// только целые числа (с минусом)
		if (!/^-?\d+$/.test(value)) return;
	
		let num = parseInt(value, 10);
	
		// ограничение диапазона
		if (num > 360) num = 360;
		if (num < -360) num = -360;
	
		setAngle(num);
	};



	const panelInfo = [
		{
			id: "sheetToolsPopup",
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

					<button
						type="button"
						className="btn text-white btn_tool btn_resize_mode"
						onMouseDown={() => { 
							if (editorStore.mode === "resize") {
								svgStore.deselect()
							}
							editorStore.setMode("resize")
						}}
					>

						<CustomIcon
							icon="fa-arrow-pointer"
							width="20"
							height="20"
							color={getModeIconStroke("resize", inactivePointerStrokeColor)}
							fill={getModeIconFill("resize")}
							strokeWidth={10}
							viewBox='0 0 640 640'
						/>
					</button>

					<button
						type="button"
						className="btn text-white btn_tool btn_resize_mode"
						onMouseDown={() => {
							editorStore.setMode("selector")
						}}
					>
						<CustomIcon
							icon="rect-dash"
							width="20"
							height="20"
							color={getModeIconStroke("selector")}
							fill={getModeIconFill("selector")}
							strokeWidth={1.5}
							viewBox='0 0 256 256'
						/>
					</button>

				

					<button
						type="button"
						className="btn text-white btn_mode btn_tool btn_add_point"
						onMouseDown={() => {
							editorStore.setMode("selectionPlus")
						}}							>
						<div className="d-flex flex-row align-items-center justify-content-center">
							<CustomIcon
								icon="fa-arrow-pointer"
								width="20"
								height="20"
								color={getModeIconStroke("selectionPlus", inactivePointerStrokeColor)}
								fill={getModeIconFill("selectionPlus")}
								strokeWidth={10}
								viewBox='0 0 640 640'
							/>
							<div style={{ marginLeft: -4, marginTop: 11, color: getModeIconFill("selectionPlus") }}>+</div>
						</div>
					</button>


					<button
						type="button"
						className="btn text-white btn_mode btn_tool btn_add_point"
						onMouseDown={() => {
							editorStore.setMode("selectionMinus")}
							}							>
						<div className="d-flex flex-row align-items-center justify-content-center">
							<CustomIcon
								icon="fa-arrow-pointer"
								width="20"
								height="20"
								color={getModeIconStroke("selectionMinus", inactivePointerStrokeColor)}
								fill={getModeIconFill("selectionMinus")}
								strokeWidth={10}
								viewBox='0 0 640 640'
							/>
							<div style={{ marginLeft: -4, marginTop: 11, color: getModeIconFill("selectionMinus") }}>-</div>
						</div>
					</button>

					<button
						type="button"
						className="btn text-white btn_tool btn_resize_mode"
						onMouseDown={() => { 
							svgStore.inverSelection()
							editorStore.setMode("resize")
						}}
					>
						<CustomIcon
							icon="invert"
							width="20"
							height="20"
							color="black"
							fill="black"
							strokeWidth={1}
							viewBox='0 0 16 16'
						/>
					</button>

					<ShapeModalComponent />

					<button 
						type="button"
						className="btn text-white btn_tool"
						onMouseDown={ ()=>rotateSelectedPosition (-angle)}
					>

						<CustomIcon
							icon="fa-rotate"
							width="20"
							height="20"
							fill={"black"}
							strokeWidth={0}
							viewBox='0 0 1536 1536'
						/>
					</button>

					<button 
						type="button"
						className="btn text-white btn_tool"
						onMouseDown={ ()=>rotateSelectedPosition (angle)}
					>

						<CustomIcon
							icon="fa-rotateR"
							width="20"
							height="20"
							fill={"black"}
							strokeWidth={0}
							viewBox='0 0 1536 1536'
						/>
					</button>
					<input
						type="number"
						step="1"
						min={-360}
						max={360}
						value={angle}
						onChange={handleAngleChange}
						style={{
							width: "100px",
							height: "40px",
							textAlign: "center",
							fontSize: "16px",
							marginLeft: "10px"
						}}
						className="form-control"
					/>

 

					<button 
						type="button"
						className="btn text-white btn_delete btn_tool" onMouseDown={deleteSelectedPosition}
					>
						<CustomIcon
							icon="ic:twotone-delete-outline"
							width="24"
							height="24"
							fill={"black"}
							strokeWidth={0.2}
						/>
					</button>
					<button
						type="button"
						title={panelStore.dockMode ? "Floating panels" : "Dock panels"}
						className={`btn text-white btn_tool`}
						onMouseDown={() => panelStore.toggleDockMode()}
					>
						<CustomIcon
							icon="panelSwitch"
							width="24"
							height="24"
							color={"black"}
							fill={"black"}
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



