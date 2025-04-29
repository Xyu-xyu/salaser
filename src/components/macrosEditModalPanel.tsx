import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import CustomKnob from './customKnob';
import MacrosSelector from './macrosSelector';
import NamedKnob from './namedKnob';
import IosToggle3 from './iosToggle3';
import IosToggle4 from './iosToggle4';


const MacrosEditModalPanel = observer(() => {
	const handleClose = () => {
		viewStore.setMacrosModalEdit(false);
	};

	return (
		<>
			<Modal show={viewStore.macrosModalEdit} onHide={handleClose} centered fullscreen>
				<Modal.Header closeButton>
					<Modal.Title><h1>Режим редактирования макросов</h1></Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid">
						<div className='d-flex mt-10 d-flex justify-content-evenly mt-5'>
							<div key={0} className="editModal_row">
								<div key={0} className="editModal_col">
									<MacrosSelector />
 								</div>	
 							</div>
							{[
								"gas",
								"type",
							].map((a: string, i: number) => (
								
									<div key={i+3} className="editModal_row">										 
										<div key={i+3} className="editModal_col">
											<NamedKnob  param={ a } index={i+3}/>
										</div>
									</div>
								))
							}
						</div>
						<div className='d-flex d-flex justify-content-evenly mt-5'>
							{[
								"pressure",
								"power_W_mm",
								"focus",
								"feedLimit_mm_s",
							].map((a: string, i: number) => (
								
								<div  className="editModal_row" key={i+5}>
									<div className="editModal_col">
										<CustomKnob index={i + 5} param={a} />
									</div>
								</div>
							))}
						</div>
						<div className='d-flex d-flex justify-content-evenly mt-5'>
							{[
								"height",
								"modulationFrequency_Hz",
								"modulationMacro",
								"piercingMacro"
							].map((a: string, i: number) => (
								
								<div  className="editModal_row" key={i+9}>
									<div className="editModal_col">
										<CustomKnob index={i + 9} param={a} />
									</div>
								</div>
							))}
						</div>	
						<div className='d-flex d-flex justify-content-evenly mt-5'>
							<div  className="editModal_row">
								<div className="editModal_col">
									<IosToggle3 />
								</div>
							</div>
							<div  className="editModal_row">
								<div className="editModal_col">
									<IosToggle4 />
								</div>
							</div>
						
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
