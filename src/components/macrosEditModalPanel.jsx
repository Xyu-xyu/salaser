import { observer } from 'mobx-react-lite';
import { Modal } from 'react-bootstrap';
import macrosStore from '../store/macrosStore';
import UniversalKnob from './universalKnob';
import MacrosSelector from './macrosSelector';
import IosToggleBlowInMacros from './toggles/iosToggleBlowInMacros';
import IosToggleMacrocInMacros from './toggles/iosToggleMacrosInMacros';
import UniversalNamedKnob from './universalNamedKnob';
import UniversalKnobList from './universalKnobList';
import StringComponent from './stringComponent';
import CustomIcon from '../icons/customIcon';


const MacrosEditModalPanel = observer(() => {
	const handleClose = () => {
		macrosStore.setModal(false, 'macros');
	};
	const { isVertical } = macrosStore;

	return (
		<>
			<Modal show={macrosStore.macrosModalEdit} onHide={handleClose} fullscreen centered >
			<Modal.Header className="d-flex justify-content-between align-items-center">
					<Modal.Title></Modal.Title>
					<button
						className={`violet_button navbar_button small_button40`} onClick={handleClose}>
						<div className="d-flex align-items-center justify-content-center">
							<CustomIcon icon="material-symbols:close-rounded"
								width="36"
								height="36"
								fill='white'
								strokeWidth={0}
							/>
						</div>
					</button>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid w-100 h-100 d-flex flex-column justify-content-evenly">
					<div className={'d-flex  ' + (isVertical ? "mt-10 flex-column justify-content-evenly my-2 align-items-center" : "mt-4 justify-content-evenly")}>
						<StringComponent keyParam={'preset'} param={'name'} />
						<StringComponent keyParam={'preset'} param={'thickness'} />
					</div>
						<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
							<div key={0} className="editModal_row">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<MacrosSelector />
								</div>
							</div>

							{[
								"gas",
								"type",
							].map((a, i) => (

								<div className="editModal_row" key={i + 10}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalKnobList param={a} keyParam={'macros'}/>
									</div>
								</div>
							))}

						</div>
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")} >
							{[
								"modulationMacro",
								"piercingMacro",
 								"focus",
 								"feedLimit_mm_s",
 							].map((a, i) => (

								(a === 'modulationMacro' || a === 'piercingMacro') ? (
									<div className="editModal_row" key={i + 1}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<UniversalNamedKnob param={a} keyParam={"macros"}/>
										</div>
									</div>
								) : (
									<div className="editModal_row" key={i + 1}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<UniversalKnob param={a} keyParam={"macros"}/>
										</div>
									</div>
								)
							))}
						</div>
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
							{[								 
								"height",
								"pressure",
								"power_W_mm",
								"modulationFrequency_Hz",
							].map((a, i) => (

								<div className="" key={5 + i}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalKnob param={a} keyParam={'macros'}/>
									</div>
								</div>
							))}
						</div>
						<div className={'d-flex d-flex justify-content-evenly ' +  (isVertical ? "mt-10" : "mt-4")}>
							<div className="">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<IosToggleBlowInMacros />
								</div>
							</div>
							<div className="">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<IosToggleMacrocInMacros />
								</div>
							</div>
						</div>
					</div>
				</Modal.Body>
				
			</Modal>
		</>
	);
});

export default MacrosEditModalPanel;
