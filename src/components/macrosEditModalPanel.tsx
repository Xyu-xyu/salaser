import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import UniversalKnob from './universalKnob';
import MacrosSelector from './macrosSelector';
import IosToggleBlowInMacros from './toggles/iosToggleBlowInMacros';
import IosToggleMacrocInMacros from './toggles/iosToggleMacrosInMacros';
//import MacrosEditList from './macrosEditList';
import { useTranslation } from 'react-i18next';
import UniversalNamedKnob from './universalNamedKnob';
import UniversalKnobList from './universalKnobList';


const MacrosEditModalPanel = observer(() => {
	const handleClose = () => {
		viewStore.setModal(false, 'macros');
	};
	const { t } = useTranslation()
	const { isVertical } = viewStore;

	return (
		<>
			<Modal show={viewStore.macrosModalEdit} onHide={handleClose} fullscreen centered >
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid w-100 h-100 d-flex flex-column justify-content-evenly">
						<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
							<div key={0} className="editModal_row">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<MacrosSelector />
								</div>
							</div>

							{[
								"gas",
								"type",
							].map((a: string, i: number) => (

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
 							].map((a: string, i: number) => (

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
							].map((a: string, i: number) => (

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
				<Modal.Footer className="position-relative">
					<Button
						variant="secondary"
						onClick={handleClose}
						className="mt-4 py-3 px-5 fs-3 close-button ms-auto"
					>
						{t ('Close') }
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
});

export default MacrosEditModalPanel;
