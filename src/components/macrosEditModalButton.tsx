import { observer } from 'mobx-react-lite';
import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';

const MacrosEditModalButton = observer(() => {
	const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const handleContinue = () => {
		setShow(false)
		viewStore.setMacrosModalEdit (true)
	}


	return (
		<>
			<g onClick={handleShow} style={{ cursor: "pointer" }}>
				<circle
					cx="83"
					cy="-12"
					r="15"
					fill="url(#circleGradient)"
					stroke="gray"
					strokeWidth="1"
					filter="var(--shadow)"
				/>
				<svg x="77" y="-20" width="26" height="26">
					<Icon
						icon="fluent:document-edit-16-regular"
						width="14"
						height="14"
						style={{
							color: "var(--knobMainText)",
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(50%, 50%)",
						}}
					/>
				</svg>

			</g>

			<Modal show={show} onHide={handleClose} centered>
				<Modal.Header closeButton>
					<Modal.Title>Macro editing mode</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					Do you want to start macro editing ?
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleClose}>
						Close
					</Button>
					<Button variant="primary" onClick={handleContinue}>
						Continue
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
});

export default MacrosEditModalButton;
