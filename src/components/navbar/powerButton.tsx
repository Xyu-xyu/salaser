import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import macrosStore from "../../store/macrosStore";
import { useState } from "react";
import { Modal } from "react-bootstrap";


const powerButton = observer(() => {

	const [show, setShow] = useState(false);

	// Открыть модалку
	const showModal = () => {
		setShow(true);
	};

	// Закрыть модалку
	const handleClose = () => setShow(false);

	const reload = () => {
		//setShow(false)
		macrosStore.setModalProps ({
		   show:true,
			modalBody: 'Do you want to start laser reload?',
		   confirmText: 'OK',
		   cancelText:'Cancel',
		   func: ()=>{ 
 			console.log ('location.reload');
			location.reload;

			},
		   args:[]
	   })
   }

   const powerOff = () => {
		//setShow(false)
		macrosStore.setModalProps ({
		   show:true,
			modalBody: 'Do you want to power off?',
		   confirmText: 'OK',
		   cancelText:'Cancel',
		   func: ()=>{ 
			console.log ('location.reload');
			location.reload;
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
					<Icon icon="fluent:power-20-filled"
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
				className="with-inner-backdrop powerButton-navbar-modal"
				centered={false} // убираем выравнивание по центру
			>
				<div className="m-1">
					<div className="d-flex flex-column">
						<button className="white_button navbar_button m-1">
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="stash:user-cog" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>

						<button className="white_button navbar_button m-1" onClick={ powerOff }>
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="fluent:power-20-filled" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>

						<button className="white_button navbar_button m-1" onClick={ reload }>
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="ix:reboot" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>
					</div>
				</div>
			</Modal>
		</div>

	)
});

export default powerButton;