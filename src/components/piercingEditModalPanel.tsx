import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import CustomKnob from './customKnob';
import UniversalKnob from './universalKnob';


const PiercingEditModalPanel = observer(() => {
	const handleClose = () => {
		viewStore.setModal(false, 'piercingMacro');
	};

	const { isVertical } = viewStore;

	return (
		<>
			<Modal show={viewStore.piercingMacroModalEdit} onHide={handleClose} centered fullscreen>
				<Modal.Header closeButton>
					<Modal.Title>
						{"piercingMacro"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid">
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
							<div key={0} className="editModal_row">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>								

									{[								 
										"piercingMacro"
									].map((a: string, i: number) => (

										<div className="editModal_row" key={5 + i}>
											<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
												<CustomKnob param={a} />
											</div>
										</div>
									))}
								</div>
							</div>						
						</div>
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")} >

							{	
								[								 
								"initial_modulationFrequency_Hz",
								"initial_pressure",
								"initial_modulationMacro",
								].map((a: string, i: number) => (

									<div className="editModal_row" key={i}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<UniversalKnob param={a}  keyParam={'piercingMacros'}/>
										</div>
									</div>
								))
							} 
					
						</div>
						<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>

							{	
								[								 
								"initial_power",
								"initial_focus",
								"initial_height",									
								].map((a: string, i: number) => (

									<div className="editModal_row" key={i}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<UniversalKnob param={a}  keyParam={'piercingMacros'}/>
										</div>
									</div>
								))
							} 
						
						</div>
						<div className={'d-flex d-flex justify-content-evenly ' +  (isVertical ? "mt-10" : "mt-4")}>
							<div className="editModal_row">
								 
							</div>
							<div className="editModal_row">
								 
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

export default PiercingEditModalPanel;
