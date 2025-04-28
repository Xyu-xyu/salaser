import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import CustomKnob from './customKnob';
import MacrosSelector from './macrosSelector';
import NamedKnob from './namedKnob';

const MacrosEditModalPanel = observer(() => {
	const handleClose = () => {
		viewStore.setMacrosModalEdit(false);
	};

	return (
		<>
			<Modal show={viewStore.macrosModalEdit} onHide={handleClose} centered fullscreen>
				<Modal.Header closeButton>
					<Modal.Title>Macro editing mode</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid">
						<div className='d-flex mt-10 d-flex justify-content-evenly'>
							<div key={0} className="editModal_row">
								<div key={0} className="editModal_col">
									<MacrosSelector />
 								</div>	
 							</div>	

							<div key={9} className="editModal_row">
										 
 								<div key={9} className="editModal_col">
 									<NamedKnob  param={'gas'}/>
								</div>
							</div>
						</div>
						<div className='d-flex d-flex justify-content-evenly'>
							{[
								"pressure",
								"power_W_mm",
								"focus",
								"feedLimit_mm_s",								
							].map((a: string, i: number) => (
								
								<div  className="editModal_row">
									<div className="editModal_col">
										<CustomKnob index={i + 1} param={a} />
									</div>
								</div>
							))}
						</div>
						<div className='d-flex d-flex justify-content-evenly'>
							{[
								"modulationMacro",
								"height",
								"modulationFrequency_Hz",
							].map((a: string, i: number) => (
								
								<div  className="editModal_row">
									<div className="editModal_col">
										<CustomKnob index={i + 5} param={a} />
									</div>
								</div>
							))}
						</div>
						
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Close
					</Button>
					<Button variant="primary" onClick={handleClose}>
						Save
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
});

export default MacrosEditModalPanel;
