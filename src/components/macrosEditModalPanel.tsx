import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import UniversalKnob from './universalKnob';
import MacrosSelector from './macrosSelector';
import IosToggle3 from './iosToggle3';
import IosToggle4 from './iosToggle4';
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
										<MacrosEditList param={a} />
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

								<div className="editModal_row" key={5 + i}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalKnob param={a} keyParam={'macros'}/>
									</div>
								</div>
							))}
						</div>
						<div className={'d-flex d-flex justify-content-evenly ' +  (isVertical ? "mt-10" : "mt-4")}>
							<div className="editModal_row">
								<div className="editModal_col">
									<IosToggle3 />
								</div>
							</div>
							<div className="editModal_row">
								<div className="editModal_col">
									<IosToggle4 />
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
