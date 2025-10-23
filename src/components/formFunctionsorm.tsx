import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { observer } from "mobx-react-lite";
import functions  from "../store/functions.json";

const FunctionsForm = observer(() => {

	const data =  {
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
		<Form
			schema={functions}                // схема JSON Schema
			formData={data}    // данные для формы
			validator={validator}                    // ajv8 валидатор
			onSubmit={(e) => {
				console.log("✅ данные валидны:", e.formData);
			}}
			onError={(errors) => {
				console.error("⚠️ ошибки валидации:", errors);
			}}
		/>
	);
});

export default FunctionsForm;

