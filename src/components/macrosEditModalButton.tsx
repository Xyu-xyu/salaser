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

	const { isVertical } = viewStore
	const x1 = isVertical ? 83 : 110
	const y1 = isVertical ? -12 : 20

	const x2 = isVertical ? 77 : 103
	const y2 = isVertical ? -20 : 13



	return (
		<>
			<g onClick={handleShow} style={{ cursor: "pointer" }}>
				<circle
					cx={x1}
					cy={y1}
					r="15"
					fill="url(#circleGradient)"
					stroke="gray"
					strokeWidth="1"
					filter="var(--shadow)"
				/>
				<svg x={x2} y={y2} width="26" height="26">
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

			<Modal show={show} onHide={handleClose} size="lg" centered>
				<Modal.Header closeButton>
					<Modal.Title></Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<h3>Do you want to start macro editing ?</h3>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" className="mt-4 py-3 px-5 fs-3 close-button" onClick={handleClose}>
						Close
					</Button>
					<Button variant="primary" className="mt-4 py-3 px-5 fs-3 close-button" onClick={handleContinue}>
						Continue
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
});

export default MacrosEditModalButton;
