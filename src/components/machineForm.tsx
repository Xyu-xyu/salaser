import React from "react";
import { IChangeEvent, withTheme } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { Theme } from '@rjsf/mui';
import cut_settings from "./../store/cut_settings";
import cutting_settings_schema from "../store/cut_settings_schema";


const MachineSettingsForm: React.FC = () => {
	const handleSubmit = (e: IChangeEvent) => {
		console.log("Данные формы:", e.formData);
	};

	const Form = withTheme(Theme);


	return (
		<div style={{ padding: "1rem" }}>
			<Form
				schema={cutting_settings_schema.result}
				validator={validator}
				formData={cut_settings}
				onSubmit={handleSubmit}
			/>
		</div>
	);
};

export default MachineSettingsForm;
