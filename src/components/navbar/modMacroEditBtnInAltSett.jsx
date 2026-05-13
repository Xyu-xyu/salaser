import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import macrosStore from "../../store/macrosStore";
import utils from "../../scripts/util";

const ModMacroEditBtnInAltSett = observer(() => {

	const { t } = useTranslation();

	const [show, setShow] = useState(false);

	const [formData, setFormData] = useState({});

	const [errors, setErrors] = useState({});

	const { selectedModulationMacro } = macrosStore;

	const macros =
		macrosStore?.technology?.modulationMacros[
			selectedModulationMacro
		];

	const schema = utils.deepFind(false, [ 'modulationMacros', 'properties'])

	// ------------------------
	// open
	// ------------------------

	const showModal = () => {

		setFormData({
			...macros
		});
		setErrors({});
		setShow(true);
	};

	// ------------------------
	// close
	// ------------------------

	const handleClose = () => {

		setShow(false);
		setFormData({});
		setErrors({});
	};

	// ------------------------
	// validate field
	// ------------------------

	const validateField = (
		key,
		value,
		field
	) => {

		// string
		if (field.type === "string") {

			const str = String(value || "");

			if (
				field.minLength &&
				str.length < field.minLength
			) {
				return t("Minimum length") +
					`: ${field.minLength}`;
			}

			if (
				field.maxLength &&
				str.length > field.maxLength
			) {
				return t("Maximum length") +
					`: ${field.maxLength}`;
			}
		}

		// number
		if (field.type === "number") {

			if (
				value === "" ||
				value === null ||
				value === undefined
			) {
				return t("Field is required");
			}

			const num = Number(value);

			if (Number.isNaN(num)) {
				return t("Invalid number");
			}

			if (
				field.minimum !== undefined &&
				num < field.minimum
			) {
				return `${t("Minimum value")}: ${field.minimum}`;
			}

			if (
				field.maximum !== undefined &&
				num > field.maximum
			) {
				return `${t("Maximum value")}: ${field.maximum}`;
			}
		}

		return null;
	};

	// ------------------------
	// update field
	// ------------------------

	const updateField = (
		key,
		value,
		field
	) => {

		const normalizedValue =
			field.type === "number"
				? value === ""
					? ""
					: Number(value)
				: value;

		setFormData(prev => ({
			...prev,
			[key]: normalizedValue
		}));

		const error = validateField(
			key,
			normalizedValue,
			field
		);

		setErrors(prev => {

			const next = { ...prev };

			if (error) {
				next[key] = error;
			}
			else {
				delete next[key];
			}

			return next;
		});
	};

	// ------------------------
	// validate all before save
	// ------------------------

	const validateAll = () => {

		const nextErrors = {};

		Object.entries(schema).forEach(
			([key, field]) => {

				const error = validateField(
					key,
					formData[key],
					field
				);

				if (error) {
					nextErrors[key] = error;
				}
			}
		);

		setErrors(nextErrors);

		return Object.keys(nextErrors).length === 0;
	};

	// ------------------------
	// save
	// ------------------------

	const save = () => {

		const valid = validateAll();
		if (!valid) return;
		handleClose();
		Object.keys(formData).map((key)=>{
			if (schema[key].type  === 'number') {
				
				let minimum = schema[key].minimum
				let maximum = schema[key].maximum
				macrosStore.setTecnologyValue( formData[key], key, 'modulationMacros', minimum, maximum, selectedModulationMacro )

			} else if (schema[key].type  === 'string') {
				
				macrosStore.setValString(key, formData[key], 'modulationMacros', selectedModulationMacro)

			}
		})
		
	};

	return (
		<div id="modMacroEditBtnInAltSett">

			<button
				type="button"
				className="cp-btn"
				title={t("Edit selected modulation")}
				onClick={showModal}
			>
				✎
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				centered
				className="with-inner-backdrop"
			>

				<div className="cp-submodal__header">

					<span>
						{t("Edit")}: #{selectedModulationMacro} { macros.name}, { macros.pulseFill_percent}%, { macros.pulseFrequency_Hz}Hz
					</span>

					<button
						className="cp-header__close"
						onMouseDown={handleClose}
						type="button"
					>
						×
					</button>

				</div>

				<div className="cp-submodal__body">

					{
						Object.entries(schema).map(
							([key, field]) => {

								const value =
									formData?.[key] ?? "";

								return (
									<Form.Group
										className="mb-3"
										key={key}
									>

										<Form.Label>
											{t(field.title)}
										</Form.Label>

										<Form.Control
											type={
												field.type === "number"
													? "number"
													: "text"
											}

											value={value}

											onChange={(e) =>
												updateField(
													key,
													e.target.value,
													field
												)
											}

											isInvalid={
												!!errors[key]
											}

											placeholder={
												t(field.title)
											}

											min={field.minimum}

											max={field.maximum}

											step={field.step}

											maxLength={
												field.maxLength
											}
										/>

										<Form.Control.Feedback type="invalid">
											{t(errors[key])}
										</Form.Control.Feedback>

									</Form.Group>
								);
							}
						)
					}

				</div>

				<div className="cp-submodal__footer">

					<button
						type="button"
						className="cp-btn"
						onMouseDown={handleClose}
					>
						{t("Cancel")}
					</button>

					<button
						type="button"
						className="cp-btn cp-btn--primary"
						onMouseDown={save}
						disabled={
							Object.keys(errors).length > 0
						}
					>
						{t("Save")}
					</button>

				</div>

			</Modal>
		</div>
	);
});

export default ModMacroEditBtnInAltSett;