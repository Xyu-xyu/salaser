import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../../store/viewStore";
import { useState } from "react";
import { Modal } from "react-bootstrap";


const settingsButton = observer(() => {

	const [show, setShow] = useState(false);

	// Открыть модалку
	const showModal = () => {
		setShow(true);
	};

	// Закрыть модалку
	const handleClose = () => setShow(false);

	const sentToLaser = () => {
		//setShow(false)
		viewStore.setModalProps ({
		   show:true,
			modalBody: 'Do you want to sent settings to laser ?',
		   confirmText: 'OK',
		   cancelText:'Cancel',
		   func: viewStore.sentSettingsToLaser,
		   args:[]
	   })
   }

	const loadPreset = () => {
		//setShow(false)
		viewStore.setModalProps ({
		   show:true,
			modalBody: 'Do you want to load preset?',
		   confirmText: 'OK',
		   cancelText:'Cancel',
		   func: ()=>{ 
 			console.log ('loadPreset'); 
			},
		   args:[]
	   })
   }


   const savePreset = () => {
 	viewStore.setModalProps ({
	   show:true,
		modalBody: 'Do you want to save settings preset?',
	   confirmText: 'OK',
	   cancelText:'Cancel',
	   func: ()=>{ 
		 console.log ('savePreset'); 
		},
	   args:[]
   })
}



	return (

		<div className="ms-2" >
			<button
				className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`}
				onClick={showModal}>
				<div className="d-flex align-items-center justify-content-center">
					<Icon
						icon="gravity-ui:gear"
						width="36"
						height="36"
						style={{ color: show ? "white" : "black" }}
					/>
        		</div>
			</button>
			<Modal
				show={show}
				onHide={handleClose}
				id="powerButtonModal"
				className="with-inner-backdrop settingsButton-navbar-modal"
				centered={false} // убираем выравнивание по центру
			>
				<div className="m-1">
					<div className="d-flex flex-column">
						<button className="white_button navbar_button m-1" onClick={ sentToLaser }>
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="iconamoon:download" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>

						<button className="white_button navbar_button m-1" onClick={ loadPreset }  >
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="fluent-emoji-high-contrast:open-file-folder" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>

						<button className="white_button navbar_button m-1" onClick={ savePreset }  >
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="fluent:save-16-regular" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>
					</div>
				</div>
			</Modal>
		</div>

	)
});

export default settingsButton;