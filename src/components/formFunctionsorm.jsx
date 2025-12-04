//import Form from "@rjsf/mui";
//import validator from "@rjsf/validator-ajv8";
import { observer } from "mobx-react-lite";
//import functions from "../store/functions.json";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import laserStore from "../store/laserStore";
import IosToggleGeneric from "./toggles/iosToggleGeneric";
import functionStore from "../store/functionStore";
import { Form, ListGroup, Modal } from "react-bootstrap";
import CalculatorModal from "./calculatorModal";
import { showToast } from './toast';
import CustomIcon from "../icons/customIcon";


const FunctionsForm = observer(() => {

	const { t } = useTranslation();
	const { vermatic, aKey, bKey } = functionStore
	const [rotated, setRotated] = useState(false);
	const [openDropdown, setOpenDropdown] = useState(null);
	const { leftMode } = laserStore

	const handleToggle = (name) => {
		if (openDropdown === name) {
			// закрыть текущий
			setOpenDropdown(null);			
		} else {			
			setOpenDropdown(name);
		}
	};

	const [show, setShow] = useState(false);
	
	// Открыть модалку
	const showModal = () => {
	  setShow(true);
	}

	// Закрыть модалку
	const handleClose = () => { 
		setShow(false)
	};

	const unknown =()=>{
		showToast({
			type: 'error',
			message: "Unknown button",
			position: 'bottom-right',
			autoClose: 2500
		});
	}

	const generateInnerModal = () =>{
		const { label, value, type, enum:enumValues, min, max, def } = functionStore.getTitleAndUnit( aKey, bKey)
		if (type && type === 'number') {
			return  (
				<CalculatorModal
					min={min ?? 0}
					max={max ?? 25}
					defaultValue={value ?? 0}
					label={label}
					aKey={aKey}
					bKey={bKey}
					def={def}
      />
			)
		} else if (type && type === 'boolean') {
			return (
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
										label={option ? t('On') : t('Off')}
										name="tf-options" 
										value={option ? t('On') : t('Off')}
										checked={value === option}
										onChange={() => { 
 											functionStore.updateValue(`${aKey}.${bKey}`, option)
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
 			return (
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
								{enumValues.map((option, index) => (
									<ListGroup.Item className="w-100" key={index}>
									<Form.Check
										style={{ fontSize: "large"}}
										type="radio"
										id={`radio-${index}`}
										label={t(option)}
										name="tf-options" 
										value={t(option)}
										checked={value === option}
										onChange={() => { 
											functionStore.updateValue(`${aKey}.${bKey}`, option)
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
		}	
	}



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
								// здесь переключалка когда закрываем раздел функции								
								laserStore.setVal('rightMode', leftMode === "plan" ? "plan" : "parameter")
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
						<CustomIcon
							icon="si:expand-more-alt-fill"
							width="30"
							height="30"
							color="black"
							fill="black"
							strokeWidth={0}
							style={{
 								transformOrigin: `50% 50%`,
								transform: `rotate(${rotated ? 0 : -90}deg)`,
								transition: "transform 0.5s ease-in-out",
							}}
						/>
					</button>
				</div>
			</div>
			<div className="d-flex  align-items-center justify-content-between">
				<div>
					<button className="w-100" onClick={ unknown}>
						<div className="d-flex align-items-center">
							<CustomIcon
								icon="mdi:automatic"
								width="24"
								height="24"
								color="black"
								fill="black"
								strokeWidth={0}
								className="ms-1"
							/>
							<div className="flex-grow-1 text-center">{t("Automation")}</div>
						</div>
					</button>
				</div>

				<div>
					<button className="w-100 violet_button">
						<div className="d-flex align-items-center">
							<CustomIcon 
								viewBox={'0 0 36 36'} 								
								icon="LaserIcon" 
								width={40} 
								height={40} 
								color="white" 
								strokeWidth={1.5} 
								style={{ color: "red! important" }}/>
							<div className="flex-grow-1 text-center text-white">{t("Cutting")}</div>
						</div>
					</button>
				</div>

				<div>
					<button className="w-100" onClick={ unknown }>
						<div className="d-flex align-items-center">
							<CustomIcon
								icon="si:expand-more-alt-fill"
								width="24"
								height="24"
								color="black"
								fill="black"
								strokeWidth={0}
							/>
						</div>
					</button>
				</div>
			</div>
			<div className="d-flex flex-column mt-2">
				{Object.keys(vermatic).map((a) => {
					const item = vermatic[a];
					const isOpen = openDropdown === a;

					return (
						<div key={a} className="m-0">
							<div className="w-100 d-flex align-items-center justify-content-between functionItem list-group-item">
								<div className="d-flex align-items-center"
									onPointerDown={() => {
										handleToggle(a);
									}}
									>
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
													? t("On")
													: t("Off")
													: value ?? "";

												return (
												<div
													className="d-flex justify-content-between mx-2 align-items-center"
													key={index}
												>
													<div className="functionsLabel">{t(label)}</div>
													<div className="d-flex">
													<div 
														className="functionsValue" 
														onMouseDown={()=>{
															
															functionStore.setVal ("aKey", a)
															functionStore.setVal ("bKey", inner_item)
															showModal()

														}}
													>{typeof displayValue === 'number' ? displayValue : t(displayValue)}</div>
													<div className="functionsUnit">{t(unit)}</div>
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
				className="with-inner-backdrop functionButton-navbar-modal"
				centered={false} // убираем выравнивание по центру
			>
				<div className="m-1">
					<div className="d-flex flex-column">
						{show && generateInnerModal()}
					</div>
				</div>
			</Modal>
</div>
);
});

export default FunctionsForm;
