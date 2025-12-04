import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Form, ListGroup, Modal } from "react-bootstrap";
//import { showToast } from "../toast";
import { useTranslation } from "react-i18next";
import constants from "../../store/constants";
import CustomIcon from "../../icons/customIcon";



const LanguageButton = observer(() => {

	const [show, setShow] = useState(false);
	const handleClose = ()=> setShow(false);
	const showModal = ()=> setShow(true);
	const { i18n } = useTranslation();
	const { languages } = constants


	return (
		<div className="ms-2" id="LanguageButton">
			<button
				className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`}
				onClick={showModal}
			>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon
						icon="fluent-mdl2:world"
						width="30"
						height="30"
						style={{ color: show ? "white" : "black" }}
						viewBox={"0 0 2048 2048"}
						strokeWidth={1}
						fill="black"
					/>
				</div>
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				id="favoritesButtonModal"
				className="with-inner-backdrop powerButton-navbar-modal favoritesButton-navbar-modal"
				centered={false}
			>
				<div style={{ padding: ".25rem" }}>
					<div
						style={{
							height: "fit-content",
							minWidth: "calc(100vw * 0.2)",
							overflowY: "auto",
							overflowX: "hidden",
						}}
						className="d-flex"
					>
						<ListGroup style={{ 
								width: "100%",
								padding: 0, // убираем внутренние отступы
								border: "none", // опционально
							}}>
							{languages.map((option) => (
								<ListGroup.Item key={option.lang} className="w-100" >
									<Form.Check
										type="radio"
										style={{ margin: '.5em 0em', width: "100%" }}
										id={`radio-${option.lang}`}
										label={option.name}
										name={`${option.lang}-Options-${'lang'}`}
										value={option.name}
										checked={option.lang === i18n.language}
										onChange={() => {
											i18n.changeLanguage(option.lang)
											localStorage.setItem('lng', option.lang)
											setTimeout(()=>{setShow(false)}, 500)

										}}
										className="w-100 px-3 py-2"
									/>
								</ListGroup.Item>
							))}
						</ListGroup>
					</div>
				</div>
			</Modal>
		</div>
	);
});

export default LanguageButton;
