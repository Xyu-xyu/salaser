import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
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
 		viewStore.setModalProps ( def )
	};

	const { t } = useTranslation()

	const handleSubmit = () => {
		if (viewStore.modalProps.func && Array.isArray(viewStore.modalProps.args)) {
			viewStore.modalProps.func(...viewStore.modalProps.args);
			viewStore.setModalProps ( def )
		}
 	};

	 const handleSubmit1 = () => {
		if (viewStore.modalProps.func1 && Array.isArray(viewStore.modalProps.args)) {
			viewStore.modalProps.func1(...viewStore.modalProps.args);
			viewStore.setModalProps ( def )
		}
 	};

	return (
		<>
			<Modal show={ Boolean(viewStore.modalProps.show) }      
				 size="lg" 
				 centered 
				 onHide={handleClose} 
				 className="with-inner-backdrop">
				<Modal.Header closeButton>
					<Modal.Title>
 					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					<div className='modulatiomNacroName text-center'>{t(viewStore.modalProps.modalBody)}</div>
				</Modal.Body>
				<Modal.Footer className="position-relative">
					<Button
						variant="secondary"
						onClick={handleClose}
 						size="lg"
						className='violet_button m-2 py-3 px-5'
					>
						{t(viewStore.modalProps.cancelText)}
					</Button>
					{ viewStore.modalProps.func1 && viewStore.modalProps.confirmText1 &&
							<Button
							variant="danger"
							onClick={handleSubmit1}
							size="lg"
							className='ms-2 m-2 py-3 px-5'
							>
							{t(viewStore.modalProps.confirmText1)}
						</Button>					
					}
					<Button
						variant="primary"
						onClick={handleSubmit}
						size="lg"
						className='ms-2 m-2 py-3 px-5'
 					>
						{t(viewStore.modalProps.confirmText)}
					</Button>
				</Modal.Footer>
 			</Modal>
		</>
	);
});

export default modalGeneric;
