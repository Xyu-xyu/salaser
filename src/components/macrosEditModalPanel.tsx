import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import CustomKnob from './customKnob';
import MacrosSelector from './macrosSelector';
import NamedKnob from './namedKnob';
import IosToggle3 from './iosToggle3';
import IosToggle4 from './iosToggle4';
import ListMacrosEdit from './listMacrosEdit';


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
								<div className="editModal_col">
									<MacrosSelector />
 								</div>	
 							</div>
							 <div key={0} className="editModal_row">
								<div className="editModal_col">
									<ListMacrosEdit />
								</div>
							</div>
						</div>
						<div className='d-flex d-flex justify-content-evenly mt-5'>
							{[
								"pressure",
								"power_W_mm",
								//"gas": "AIR",
								"focus",
								//"enabled": false,
								"feedLimit_mm_s",
								//"cross_blow": false,
								//"type": "CW",
								//"modulationMacro",
								//"height",
								//"modulationFrequency_Hz",
							].map((a: string, i: number) => (
								
								<div  className="editModal_row" key={i+1}>
									<div className="editModal_col">
										<CustomKnob param={a} index={i+1}/>
									</div>
								</div>
							))}
						</div>
						<div className='d-flex d-flex justify-content-evenly mt-5'>
							{[
	 							//"pressure",
								//"power_W_mm",
								 //"gas": "AIR",
								 //"focus",
								 //"enabled": false,
								 //"feedLimit_mm_s",
								 //"cross_blow": false,
								 //"type": "CW",
								 "modulationMacro",
								 "height",
								 "modulationFrequency_Hz",
								 "piercingMacro"
							].map((a: string, i: number) => (
								
								<div  className="editModal_row" key={5+i}>
									<div className="editModal_col">
										<CustomKnob index={5+i} param={a} />
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
						<div className='d-flex d-flex justify-content-evenly mt-5'>
								{[
								"gas",
								"type",
							].map((a: string, i: number) => (
								
									<div  className="editModal_row" key={i+10}>										 
										<div className="editModal_col">
											<NamedKnob  param={ a } index={i+10}/>
										</div>
									</div>
								))
							}
						
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
