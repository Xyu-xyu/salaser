import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import CustomKnob from './customKnob';
import MacrosSelector from './macrosSelector';


const MacrosEditModalPanel = observer(() => {

	const handleClose = () => {
		viewStore.setMacrosModalEdit(false)
	}


	return (
		<>

			<Modal show={viewStore.macrosModalEdit} onHide={handleClose} centered>
				<Modal.Header closeButton>
					<Modal.Title>Macro editing mode</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div>

						<div key={0} className="h-125 col-12 vidget">
							<MacrosSelector />
						</div>

						{
							[
								"pressure",
								"power_W_mm",
								//"gas": "AIR",
								"focus",
								//"enabled": false,
								"feedLimit_mm_s",
								//"cross_blow": false,
								//"type": "CW",
								"modulationMacro",
								"height",
								"modulationFrequency_Hz",
							].map((a: string, i: number) => (
								<div key={i} className="h-125 col-12 vidget">
									<CustomKnob index={i + 1} param={a} />
								</div>
							))
						}

						
				</div>				</Modal.Body>
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
