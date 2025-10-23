//import Form from "@rjsf/mui";
//import validator from "@rjsf/validator-ajv8";
import { observer } from "mobx-react-lite";
import functions from "../store/functions.json";
import { Icon } from "@iconify/react/dist/iconify.js";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import laserStore from "../store/laserStore";


const FunctionsForm = observer(() => {

	const { t } = useTranslation();
	const [rotated, setRotated] = useState(false);

	const data = {
		"Origin_offset": { "x_offset": 0, "y_offset": 0, "enabled": false },
		"Edge_detection": {
			"enabled": false,
			"Detection_method": "Capacitive",
			"Detection": "X",
			"Move_to_starting_point_manually": false,
			"Detection_corner": "Fl",
			"Sheet_loading": "Fl",
			"Sheet_dimension_offset_long_edge": 0,
			"Angle_or_sheet_corner": 90
		},
		"Microjoints": { "enabled": false, "value": { "function": false } },
		"Stops": { "Stop_before_part": 0, "Stop_at": "Off", "Stop_Select": "Off", "enabled": false },
		"Nozzle_cleaning": { "enabled": false, "value": false },
		"Programmed_reference": { "Programmed_reference_x": 0, "Programmed_reference_y": 0, "enabled": false },
		"Vaporisation": { "enabled": false, "value": false },
		"inverse": { "enabled": false, "value": false },
		"Sensor_field": { "enabled": false, "value": false }
	}


	return (

		<div className="d-flex flex-column">
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
								transition: "transform 0.3s ease",
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
								icon="fluent:edit-24-regular"
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
							<Icon
								icon="fluent:edit-24-regular"
								width="24"
								height="24"
								style={{ color: "black" }}
								className="ms-1"
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
			<div className="d-flex flex-column">
				{
					Object.keys(data).map((a: string) => {
						return <div key={a}>
							<p>{t(a.replace("_", " "))}</p>
						</div>
					})
				}
			</div>
		</div>
	);
});

export default FunctionsForm;