import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import macrosStore from '../store/macrosStore';
import { useTranslation } from 'react-i18next';

 
const modalGeneric = observer(() => {
	const def = {
		show:false,
		modalBody: '',
		confirmText: '',
		cancelText:'',
		func:()=>{},
		args:['']
	}

	const handleClose = () => {
 		macrosStore.setModalProps ( def )
	};

	const { t } = useTranslation()

	const handleSubmit = () => {
		if (macrosStore.modalProps.func && Array.isArray(macrosStore.modalProps.args)) {
			macrosStore.modalProps.func(...macrosStore.modalProps.args);
			macrosStore.setModalProps ( def )
		}
 	};

	 const handleSubmit1 = () => {
		if (macrosStore.modalProps.func1 && Array.isArray(macrosStore.modalProps.args)) {
			macrosStore.modalProps.func1(...macrosStore.modalProps.args);
			macrosStore.setModalProps ( def )
		}
 	};

	return (
		<>
			<Modal show={ Boolean(macrosStore.modalProps.show) }      
				 size="lg" 
				 centered 
				 onHide={handleClose} 
				 className="with-inner-backdrop">
				<Modal.Header closeButton>
					<Modal.Title>
 					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					<div className='modulatiomNacroName text-center'>{macrosStore.modalProps.modalBody ? 
					t(macrosStore.modalProps.modalBody) : ""
				}</div>
				</Modal.Body>
				<Modal.Footer className="position-relative">
					<Button
						variant="secondary"
						onClick={handleClose}
 						size="lg"
						className='violet_button m-2 py-3 px-5'
					>
						{macrosStore.modalProps.cancelText ? t(macrosStore.modalProps.cancelText) : "Cancel"}
					</Button>
					{ macrosStore.modalProps.func1 && macrosStore.modalProps.confirmText1 &&
							<Button
							variant="danger"
							onClick={handleSubmit1}
							size="lg"
							className='ms-2 m-2 py-3 px-5'
							>
							{t(macrosStore.modalProps.confirmText1)}
						</Button>					
					}
					<Button
						variant="primary"
						onClick={handleSubmit}
						size="lg"
						className='ms-2 m-2 py-3 px-5'
 					>
						{macrosStore.modalProps.confirmText  ? t(macrosStore.modalProps.confirmText) : "Confirm"}
					</Button>
				</Modal.Footer>
 			</Modal>
		</>
	);
});

export default modalGeneric;
