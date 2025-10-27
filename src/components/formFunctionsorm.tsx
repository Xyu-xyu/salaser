//import Form from "@rjsf/mui";
//import validator from "@rjsf/validator-ajv8";
import { observer } from "mobx-react-lite";
//import functions from "../store/functions.json";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import laserStore from "../store/laserStore";
import LaserIcon from "../../public/images/laserIcon";
import IosToggleGeneric from "./toggles/iosToggleGeneric";
import functionStore from "../store/functionStore";
import { Form, ListGroup, Modal } from "react-bootstrap";


const FunctionsForm = observer(() => {

	console.log ('обновляем компонент')

	const { t } = useTranslation();
	const { vermatic } = functionStore
	const [rotated, setRotated] = useState(false);
	const [modalInnerVal, setModalInnerVal] = useState<React.ReactNode>(null);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const handleToggle = (name: string) => {
		if (openDropdown === name) {
			// закрыть текущий
			setOpenDropdown(null);			
		} else {			
			setOpenDropdown(name);
		}
	};

	const [show, setShow] = useState(false);
	
	// Открыть модалку
	const showModal = (a:string,b:string) => {
		console.log ('обновляем модалку')
		const { label, unit, value, type, enum:enumValues, min, max } = functionStore.getTitleAndUnit(a,b)

		console.log (label, unit, value, type,  enumValues, min, max)
 		if (type && type === 'number') {
			setModalInnerVal("Number Selector")
		} else if (type && type === 'boolean') {
			setModalInnerVal(
				<div style={{ padding: ".25rem" }}>
					<div
						style={{
							minWidth: "calc(100vw * 0.2)",
							height: "fit-content",
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
							<ListGroup>
								{[true, false].map((option, index) => (
									<ListGroup.Item className="w-100" key={index}>
									<Form.Check
										style={{ fontSize: "large"}}
										type="radio"
										id={`radio-${index}`}
										label={option ? 'On' : 'Off'}
										name="tf-options" 
										value={option ? 'On' : 'Off'}
										checked={value === option}
										onChange={() => { 
											console.log ('cur val  '+ value + '    new val: ' + option)
											functionStore.updateValue(`${a}.${b}`, option)
											//handleClose()
										}} 
										className="w-100 px-2 py-0"
									/>
									</ListGroup.Item>
								))}
							</ListGroup>
						</ListGroup>
					</div>
				</div>
				)

		} else if ( Array.isArray(enumValues)) {
			setModalInnerVal("ListSelector")
		}	

		setShow(true);
	}

	// Закрыть модалку
	const handleClose = () => { 
		setShow(false)
		setModalInnerVal("")
	};



	return (

		<div className="d-flex flex-column" id="FormFumction">
			<div className="d-flex  align-items-center justify-content-between">
				<div className="mt-2">
					<h5>{t("Functions")}</h5>
				</div>
				<div>
					<button className="white_button navbar_button"
						onClick={() => {
							setRotated(!rotated)
							setTimeout(() => {
								laserStore.setVal('rightMode', 'parameter')
							}, 500)
						}
						}
						style={{
							background: "none",
							border: "none",
							cursor: "pointer",
							padding: "8px",
						}}
					>
						<Icon
							icon="si:expand-more-alt-fill"
							width="24"
							height="24"
							style={{
								color: "black",
								transform: `rotate(${rotated ? 0 : -90}deg)`,
								transition: "transform 0.5s ease-in-out",
							}}
						/>
					</button>
				</div>
			</div>
			<div className="d-flex  align-items-center justify-content-between">
				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon
								icon="mdi:automatic"
								width="24"
								height="24"
								style={{ color: "black" }}
								className="ms-1"
							/>
							<div className="flex-grow-1 text-center">{t("Automation")}</div>
						</div>
					</button>
				</div>

				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<LaserIcon
								size={40}
								color={"black"}
								strokeWidth={1.5}
							/>
							<div className="flex-grow-1 text-center">{t("Cutting")}</div>
						</div>
					</button>
				</div>

				<div>
					<button className="w-100">
						<div className="d-flex align-items-center">
							<Icon
								icon="gg:arrow-up-o"
								width="24"
								height="24"
								style={{ color: "black" }}
								className="ms-1"
							/>
							<Icon
								icon="si:expand-more-alt-fill"
								width="24"
								height="24"
								style={{
									color: "black",
								}}
							/>
						</div>
					</button>
				</div>
			</div>
			<div className="d-flex flex-column mt-2">
				{Object.keys(vermatic).map((a: string) => {
					const item = vermatic[a as keyof typeof vermatic];
					const isOpen = openDropdown === a;

					return (
						<div key={a} className="m-0">
							<div className="w-100 d-flex align-items-center justify-content-between functionItem list-group-item">
								<div className="d-flex align-items-center">
									<button
										className="navbar_button"
										onPointerDown={() => {
											handleToggle(a);
										}}
										style={{ width: "fit-content" }}
										aria-expanded={isOpen}
										aria-controls={`panel-${a}`}
									>
										<Icon
											icon="si:expand-more-alt-fill"
											width="24"
											height="24"
											style={{
												color: "black",
												transform: `rotate(${isOpen ? 180 : 0}deg)`,
												transition: "transform 0.5s ease-in-out",
											}}
										/>
									</button>

									<div>
										<h6 className="p-0 m-0">{t(a.replace("_", " "))}</h6>
									</div>
								</div>

								<div>
									<div style={{ height: "50px", marginTop: "20px", transform: "scale(0.75)" }}>
										<IosToggleGeneric
											title=""
											checked={!!item.enabled}
											onChange={() => functionStore.updateValue(`${a}.enabled`, !item.enabled)}
											isVertical={false}
											hideLabels={true}
										/>
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
								}}
							>
								{isOpen && (
									// Здесь вы можете рендерить реальные контролы для item (inputs, selects и т.д.)
									<div>
										{/* Пример: показать объект (замените на реальные контролы) */}
										{Object.keys(item)
											.filter((key) => key !== "enabled")
											.map((inner_item, index) => {
												const { label, unit, value } = functionStore.getTitleAndUnit(a, inner_item);

												// если значение — объект (например, value у Microjoints)
												const displayValue =
												value && typeof value === "object"
													? JSON.stringify(value, null, 1).replace(/[{}"]/g, "")
													: typeof value === "boolean"
													? value
													? "On"
													: "Off"
													: value ?? "";

												return (
												<div
													className="d-flex justify-content-between mx-2 align-items-center"
													key={index}
												>
													<div className="functionsLabel">{label}</div>
													<div className="d-flex">
													<div 
														className="functionsValue" 
														onMouseDown={()=>{
															showModal(a,inner_item)
														}}
													>{displayValue}</div>
													<div className="functionsUnit">{unit}</div>
													</div>
													
												</div>
												);
											})}

									</div>
								)}
							</div>
							{/* Дропдаун-контент:K O Н Е Ц */}
						</div>
					);
				})}

			</div>
			<Modal
				show={show}
				onHide={handleClose}				
				className="with-inner-backdrop powerButton-navbar-modal"
				centered={false} // убираем выравнивание по центру
			>
				<div className="m-1">
					<div className="d-flex flex-column">
						<h1>{ modalInnerVal }</h1>
					</div>
				</div>
			</Modal>
</div>
);
});

export default FunctionsForm;
