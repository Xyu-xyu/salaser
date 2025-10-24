//import Form from "@rjsf/mui";
//import validator from "@rjsf/validator-ajv8";
import { observer } from "mobx-react-lite";
//import functions from "../store/functions.json";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import laserStore from "../store/laserStore";
import LaserIcon from "../../public/images/laserIcon";
import IosToggleGeneric from "./toggles/iosToggleGeneric";
import functionStore from "../store/functionStore";


const FunctionsForm = observer(() => {

	const { t } = useTranslation();
	const { vermatic } = functionStore
	const [rotated, setRotated] = useState(false);
	const [openDropdown, setOpenDropdown] = useState<string | null>(null);

	const handleToggle = (name: string) => {
		if (openDropdown === name) {
			// закрыть текущий
			setOpenDropdown(null);
		} else {			
			setOpenDropdown(name);
		}
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
									<div style={{ height: "50px", marginTop: "20px" }}>
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
								style={{
									maxHeight: isOpen ? "100px" : "0px",
									overflow: "hidden",
									transition: "max-height 0.5s ease-in-out",
									padding:  "0px 16px",
									background: isOpen ? "#fafafa" : "transparent",
									borderBottom: isOpen ? "1px solid #eee" : "none",
								}}
							>
								{isOpen && (
									// Здесь вы можете рендерить реальные контролы для item (inputs, selects и т.д.)
									<div>
										{/* Пример: показать объект (замените на реальные контролы) */}
										<pre style={{ margin: 0, fontSize: 13 }}>{JSON.stringify(item, null, 2)}</pre>
									</div>
								)}
							</div>
						</div>
					);
				})}

			</div>
		</div>
	);
});

export default FunctionsForm;
