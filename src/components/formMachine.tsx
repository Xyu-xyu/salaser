import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";
import { observer } from "mobx-react-lite";
import macrosStore from "../store/macrosStore";

const CuttingSettingsForm = observer(() => {

	return (
		<Form
			schema={macrosStore.schema}                // схема JSON Schema
			formData={macrosStore.cut_settings}    // данные для формы
			validator={validator}                    // ajv8 валидатор
			onChange={(e) => {
				// обновляем MobX store при изменении
				macrosStore.cut_settings= e.formData;
			}}
			onSubmit={(e) => {
				console.log("✅ данные валидны:", e.formData);
			}}
			onError={(errors) => {
				console.error("⚠️ ошибки валидации:", errors);
			}}
		/>
	);
});

export default CuttingSettingsForm;
