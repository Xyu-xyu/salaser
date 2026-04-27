import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Form, ListGroup, Modal } from "react-bootstrap";
//import { showToast } from "../toast";
import { useTranslation } from "react-i18next";
import CustomIcon from "../../icons/customIcon";
import tipsStore from "../../store/tipsStore.jsx";



const TipsButton = observer(() => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const handleClose = ()=> setShow(false);
	const showModal = ()=> setShow(true);
	const tips = [ "Show Tips", "Hide Tips"]
	const tipsMode = tipsStore.tipsEnabled ? "Show Tips" : "Hide Tips";

	return (
		<div className="ms-2" id="TipsButton">
			<button
				className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`}
				onClick={showModal}
			>
				<div className="d-flex align-items-center justify-content-center">
				<CustomIcon icon="fluent:question-circle-12-regular"
								width="36"
								height="36"
								style={{ color: show ?  'white': "black"}}
								viewBox={'0 0 12 12'}
								fill={ show ?  'white': "black"}
								strokeWidth={0}
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
							{tips.map((option, i) => (
								<ListGroup.Item key={i} className="w-100" >
									<Form.Check
										type="radio"
										style={{ margin: '.5em 0em', width: "100%" }}
										id={`radio-${option}`}
										label={t(option)}
										name={`${option}-Options`}
										value={option}
										checked={tipsMode === option}
										onChange={() => {
											localStorage.setItem('tips', option)
											tipsStore.setTipsEnabled(option === "Show Tips");
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

export default TipsButton;
