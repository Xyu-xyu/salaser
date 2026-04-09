import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import macrosStore from '../store/macrosStore';
import { useTranslation } from 'react-i18next';
import NewPartModalForm from './newPartModalForm';

 
const modalGeneric = observer(() => {
	const def = {
		show:false,
		modalBody: '',
		confirmText: '',
		cancelText:'',
		func:()=>{},
		args:[],
		variant: undefined,
		func1: undefined,
		confirmText1: undefined,
	}

	const handleClose = () => {
 		macrosStore.setModalProps ( def )
	};

	const { t } = useTranslation()

	const handleSubmit = () => {
		const fn = macrosStore.modalProps.func;
		if (typeof fn !== "function") return;
		const a = macrosStore.modalProps.args;
		if (Array.isArray(a)) fn(...a); else fn();
		macrosStore.setModalProps(def);
 	};

	 const handleSubmit1 = () => {
		const fn = macrosStore.modalProps.func1;
		if (typeof fn !== "function") return;
		const a = macrosStore.modalProps.args;
		if (Array.isArray(a)) fn(...a); else fn();
		macrosStore.setModalProps(def);
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
						{macrosStore.modalProps.variant === "newPart" && macrosStore.modalProps.modalBody
							? t(macrosStore.modalProps.modalBody)
							: ""}
 					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					{macrosStore.modalProps.variant === "newPart" ? (
						<NewPartModalForm onCancel={handleClose} />
					) : (
						<div className='modulatiomNacroName text-center'>
							{macrosStore.modalProps.modalBody ? t(macrosStore.modalProps.modalBody) : ""}
						</div>
					)}
				</Modal.Body>
				{macrosStore.modalProps.variant !== "newPart" && (
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
				)}
 			</Modal>
		</>
	);
});

export default modalGeneric;
