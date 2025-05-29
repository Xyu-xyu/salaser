import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
 import viewStore from '../store/viewStore';

 
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

	const handleSubmit = () => {
		if (viewStore.modalProps.func && Array.isArray(viewStore.modalProps.args)) {
			viewStore.modalProps.func(...viewStore.modalProps.args);
			viewStore.setModalProps ( def )
		}
 	};

	return (
		<>
			<Modal show={ Boolean(viewStore.modalProps.show) }      
				 size="lg" 
				 centered 
				 onHide={handleClose} >
				<Modal.Header closeButton>
					<Modal.Title>
 					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					<div className='modulatiomNacroName text-center'>{viewStore.modalProps.modalBody}</div>
				</Modal.Body>
				<Modal.Footer className="position-relative">
					<Button
						variant="secondary"
						onClick={handleClose}
 						size="lg"
						className='violet_button m-2 p-3'
					>
						{viewStore.modalProps.cancelText}
					</Button>
					<Button
						variant="primary"
						onClick={handleSubmit}
						size="lg"
						className=' m-2 p-3'
 					>
						{viewStore.modalProps.confirmText}
					</Button>
				</Modal.Footer>
 			</Modal>
		</>
	);
});

export default modalGeneric;
