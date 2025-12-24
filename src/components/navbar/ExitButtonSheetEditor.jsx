import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import CustomIcon from "../../icons/customIcon";
import { observer } from 'mobx-react-lite';
import laserStore from "../../store/laserStore";
import { useTranslation } from 'react-i18next';
import partStore from "../../store/partStore";
import svgStore from "../../store/svgStore";


const ExitButtonSheetEditor = observer(() => {

	const [show, setShow] = useState(false);
	const { t } = useTranslation()
	const showModal = () => {
		setShow(true);
	};

	const handleClose = () => {
		setShow(false)
		laserStore.setVal("centralBarMode", "plans")
	};

	const handleSubmit = () => {
		setShow(false)
		laserStore.setVal("centralBarMode", "plans")
		svgStore.saveNewFile()
	}

	const modalProps = {
		modalBody: 'Do you want to save file and exit ?',
		confirmText: 'Save and exit',
		cancelText: 'Exit'
	}


	return (

		<div className="ms-2" >
			<div className="ms-2 position-absolute"
				style={{ top: "7px", right: "15px" }}
			>
				<button	className={`navbar_button me-1 violet_button`} onClick={showModal}>
					<div className="d-flex align-items-center justify-content-center">
						<CustomIcon icon="material-symbols:close-rounded"
							width="36"
							height="36"
							fill='white'
							strokeWidth={0}
						/>
					</div>
				</button>
			</div>
			<Modal
				size="lg"
				centered
				onHide={handleClose}
				className="with-inner-backdrop"
				show={show}
			>
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					<div className='modulatiomNacroName text-center'>
						<>
						{t(modalProps.modalBody)}
						</>
					</div>
				</Modal.Body>
				<Modal.Footer className="position-relative">

					<Button
						variant="primary"
						onClick={()=>{ setShow(false)}}
						size="lg"
						className='ms-2 m-2 py-3 px-5'
					>
						{t("Cancel")}
					</Button>
										
					<Button
						variant="primary"
						onClick={handleSubmit}
						size="lg"
						className='ms-2 m-2 py-3 px-5'
					>
						{t(modalProps.confirmText)}
					</Button>

					<Button
						variant="secondary"
						onClick={handleClose}
						size="lg"
						className='violet_button m-2 py-3 px-5'
					>
						{t(modalProps.cancelText)}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>

	)
});

export default ExitButtonSheetEditor;
