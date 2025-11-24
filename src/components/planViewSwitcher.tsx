import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import laserStore from "../store/laserStore";
import { useState } from "react";
//import { showToast } from "./toast";
import { ListGroup, Form } from "react-bootstrap";
import CustomIcon from "../icons/customIcon";
import jobStore from "../store/jobStore";

const PlanViewSwitcher = observer(() => {

	const { t } = useTranslation();
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);
	const { planViewType } = laserStore
	const { taskView } = jobStore

	const handleToggle = (name: string) => {
		if (openDropdown === name) {
			// закрыть текущий
			setOpenDropdown(null);
		} else {
			setOpenDropdown(name);
		}
	};


	return (
		<>
			<div className="mt-4">
				<h5>{t("View")}</h5>
			</div>
			<div className="d-flex flex-column mt-2" id="PlanViewSwitcher">
				{['View'].map((a: string) => {
					const isOpen = openDropdown === a;

					return (
						<div key={a} className="m-0"			>
							<div className={`w-100 d-flex align-items-center justify-content-between ${isOpen ? "functionItemPlanOpen" : "functionItemPlan"}  list-group-item`}

								onPointerDown={() => {
									handleToggle(a);
								}}
							>
								<div className="d-flex align-items-center">
									<button
										className="navbar_button"

										style={{ width: "fit-content" }}
										aria-expanded={isOpen}
										aria-controls={`panel-${a}`}
									>
										<CustomIcon
											icon="si:expand-more-alt-fill"
											width="24"
											height="24"
											color="black"
											fill="black"
											strokeWidth={0}
											style={{
												transform: `rotate(${isOpen ? 180 : 0}deg)`,
												transition: "transform 0.5s ease-in-out",
											}}
										/>
									</button>

									<div>
										<h6 className="p-0 m-0">{t(a.replace("_", " "))}</h6>
									</div>
								</div>

							</div>

							{/* Дропдаун-контент: плавное разворачивание по isOpen */}
							<div
								id={`panel-${a}`}
								className="m-0 mb-1"
								style={{
									maxHeight: isOpen ? "250px" : "0px",
									overflow: "hidden",
									transition: "max-height 0.5s ease-in-out",
									background: isOpen ? "var(--grey-main)" : "transparent",
									borderBottom: isOpen ? "2px solid var(--grey-nav)" : "none",
									borderRadius: "5px"
								}}
							>
								{isOpen && (
									// Здесь вы можете рендерить реальные контролы для item (inputs, selects и т.д.)
									<div>
										<div
											style={{
												minWidth: "40px",
												height: "fit-content",
												overflowY: "auto",
												overflowX: "hidden",
											}}
											className="d-flex"
										>
								{/* 			<ListGroup style={{
												width: "100%",
												padding: 0, // убираем внутренние отступы
												border: "none", // опционально
											}}> */}
												<ListGroup>
													{[
														"Carousel",
														"CanBan",
													].map((option, index) => (
														<ListGroup.Item className="m-0" key={index}>
															<Form.Check
																style={{ fontSize: "large" }}
																type="radio"
																id={`radio-${index}`}
																label={t(option)}
																name="tf-options"
																value={t(option)}
																checked={planViewType === option}
																onChange={() => {
																	laserStore.setVal(`planViewType`, option)
																}}
																className="px-2 py-0"
															/>
														</ListGroup.Item>
													))}
												</ListGroup>												
{/* 											</ListGroup>
 */}										</div>
									</div>

								)}
							</div>
							{/* Дропдаун-контент:K O Н Е Ц */}
						</div>
					);
				})}

			</div>
			<div className="d-flex flex-column" id="TaskViewSwitcher">
				{['Tasks'].map((a: string) => {
					const isOpen = openDropdown === a;
					return (
						<div key={a} className="m-0"			>
							<div className={`w-100 d-flex align-items-center justify-content-between ${isOpen ? "functionItemPlanOpen" : "functionItemPlan"}  list-group-item`}

								onPointerDown={() => {
									handleToggle(a);
								}}
							>
								<div className="d-flex align-items-center">
									<button
										className="navbar_button"

										style={{ width: "fit-content" }}
										aria-expanded={isOpen}
										aria-controls={`panel-${a}`}
									>
										<CustomIcon
											icon="si:expand-more-alt-fill"
											width="24"
											height="24"
											color="black"
											fill="black"
											strokeWidth={0}
											style={{
												transform: `rotate(${isOpen ? 180 : 0}deg)`,
												transition: "transform 0.5s ease-in-out",
											}}
										/>
									</button>

									<div>
										<h6 className="p-0 m-0">{t(a.replace("_", " "))}</h6>
									</div>
								</div>

							</div>

							{/* Дропдаун-контент: плавное разворачивание по isOpen */}
							<div
								id={`panel-${a}`}
								className="m-0 mb-1"
								style={{
									maxHeight: isOpen ? "250px" : "0px",
									overflow: "hidden",
									transition: "max-height 0.5s ease-in-out",
									background: isOpen ? "var(--grey-main)" : "transparent",
									borderBottom: isOpen ? "2px solid var(--grey-nav)" : "none",
									borderRadius: "5px"
								}}
							>
								{isOpen && (
									// Здесь вы можете рендерить реальные контролы для item (inputs, selects и т.д.)
									<div>
										<div
											style={{
												minWidth: "40px",
												height: "fit-content",
												overflowY: "auto",
												overflowX: "hidden",
											}}
											className="d-flex"
										>
							{/* 				<ListGroup style={{
												width: "100%",
												padding: 0, // убираем внутренние отступы
												border: "none", // опционально
											}}> */}
												<ListGroup>
													{['Loaded', 'Cutting', 'Pending', 'Completed']
														.map((option, index) => (
															<ListGroup.Item className="m-0" key={index}>
																<Form.Check
																	style={{ fontSize: "large" }}
																	type="checkbox"
																	id={t(option)}
																	label={t(option)}
																	name="tasks-options"
																	value={t(option)}
																	checked={taskView[option] === true}
																	onChange={() => {
																		jobStore.setTaskView( option, !taskView[option])
																	}}
																	className="px-2 py-0"
																/>
															</ListGroup.Item>
														))}
												</ListGroup>
{/* 											</ListGroup>
 */}										</div>
									</div>

								)}
							</div>
							{/* Дропдаун-контент:K O Н Е Ц */}
						</div>
					);
				})}

			</div>
		</>

	);
});

export default PlanViewSwitcher;


