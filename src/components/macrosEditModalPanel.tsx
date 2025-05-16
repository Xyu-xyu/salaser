import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import UniversalKnob from './universalKnob';
import MacrosSelector from './macrosSelector';
import IosToggleBlowInMacros from './iosToggleBlowInMacros';
import IosToggleMacrocInMacros from './iosToggleMacrosInMacros';
import MacrosEditList from './macrosEditList';


const MacrosEditModalPanel = observer(() => {
	const handleClose = () => {
		viewStore.setModal(false, 'macros');
	};

	const { isVertical } = viewStore;

	return (
		<>
			<Modal show={viewStore.macrosModalEdit} onHide={handleClose} centered fullscreen>
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid">
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
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
										<MacrosEditList param={a} keyParam={'macros'}/>
									</div>
								</div>
							))}

						</div>
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")} >
							{[
								"pressure",
								"power_W_mm",
 								"focus",
 								"feedLimit_mm_s",
 							].map((a: string, i: number) => (

								<div className="editModal_row" key={i + 1}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalKnob param={a} keyParam={'macros'}/>
									</div>
								</div>
							))}
						</div>
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
							{[								 
								"modulationMacro",
								"height",
								"modulationFrequency_Hz",
								"piercingMacro"
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
								<div className="editModal_col">
									<IosToggleBlowInMacros />
								</div>
							</div>
							<div className="">
								<div className="editModal_col">
									<IosToggleMacrocInMacros />
								</div>
							</div>
						</div>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button
						variant="secondary"
						onClick={handleClose}
						className="mt-4 py-3 px-5 fs-3 close-button"
					>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
});

export default MacrosEditModalPanel;
