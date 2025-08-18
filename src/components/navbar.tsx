import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../store/viewStore";
import {  useState } from "react";
import { Modal } from "react-bootstrap";


const NavBar = observer(() => {

	const { knobMode, rightMode } = viewStore
	const handleClick = () => {
		viewStore.setKnobMode(!knobMode);
	};

	const handleClickRightMode = () => {
		viewStore.setRightMode(!rightMode);
	};

	const [show, setShow] = useState(false);

	// Открыть модалку
	const showModal = () => {
		setShow(true);
	};

	// Закрыть модалку
	const handleClose = () => setShow(false);



	return (
		<div>
			<div id="NavBar" className="w-100">
				<div className="ms-2">
					<button className="violet_button navbar_button">
						<div className="d-flex justify-content-center">
							<Icon icon="fluent:circle-12-regular"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:circle-12-regular"
								width="36"
								height="36"
								style={{ color: 'black' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="material-symbols:cancel-outline"
								width="36"
								height="36"
								style={{ color: 'black' }}
							/>
						</div>
					</button>
				</div>

				{/* LONG button start */}
				<div className="ms-4 w-100" id='longButton'>
					<h5 className="m-0">Produce</h5>
				</div>

				{/* LONG button end */}

				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:play-circle-28-regular"
								width="36"
								height="36"
								style={{ color: 'black' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button" onPointerDown={handleClick}>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:wrench-16-regular"
								width="36"
								height="36"
								style={{ color: 'red' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:laser-tool-20-filled"
								width="36"
								height="36"
								style={{ color: 'red' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="ic:round-cancel"
								width="36"
								height="36"
								style={{ color: 'red' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button" onPointerDown={handleClickRightMode}>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:star-16-regular"
								width="36"
								height="36"
								style={{ color: 'black' }}
							/>
						</div>
					</button>
				</div>
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

								<button className="white_button navbar_button m-1">
									<div className="d-flex align-items-center justify-content-center">
										<Icon icon="fluent:power-20-filled" width="36" height="36" style={{ color: 'black' }} />
									</div>
								</button>

								<button className="white_button navbar_button m-1">
									<div className="d-flex align-items-center justify-content-center">
										<Icon icon="ix:reboot" width="36" height="36" style={{ color: 'black' }} />
									</div>
								</button>
							</div>
						</div>
					</Modal>

				</div>
			</div>
		</div>
	)
});

export default NavBar;