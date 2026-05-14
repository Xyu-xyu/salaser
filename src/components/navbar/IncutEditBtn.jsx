import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import macrosStore from "../../store/macrosStore";

const IncutEditBtn = observer(() => {

	const { t } = useTranslation();

	const [show, setShow] = useState(false);

	const [formData, setFormData] = useState({});

	const [errors, setErrors] = useState({});

	const { selectedPiercingMacro } = macrosStore

	const incut =
		macrosStore?.technology?.piercingMacros?.[
			selectedPiercingMacro
		];

	// ------------------------------------------------
	// schema
	// ------------------------------------------------

	const schema = {
		name: {
			title: "Название",
			minLength: 1,
			maxLength: 32,
			default: "Unknown incut",
			type: "string"
		},

		initial_modulationFrequency_Hz: {
			type: "number",
			title: "Начальная несущая частота, Hz",
			maximum: 100000,
			default: 10000,
			minimum: 100
		},

		initial_pressure: {
			type: "number",
			title: "Начальное давление, бар",
			maximum: 35,
			default: 8,
			minimum: 0.1
		},

		gas: {
			enum: ["AIR", "O2", "N2"],
			type: "string",
			title: "Газ",
			default: "AIR"
		},

		initial_power: {
			type: "integer",
			title: "Начальная мощность, Вт",
			maximum: 100000,
			default: 1000,
			minimum: 10
		},

		initial_height: {
			type: "number",
			title: "Начальная высота, мм",
			maximum: 20,
			default: 1,
			minimum: 0.1
		},

		initial_cross_blow: {
			type: "boolean",
			title: "Охлаждение",
			default: false
		},

		initial_focus: {
			type: "number",
			title: "Начальный фокус, мм",
			maximum: 15,
			default: 1,
			minimum: -15
		},

		initial_modulationMacro: {
			type: "integer",
			title: "Индекс начального импульсного режима",
			maximum: 15,
			default: 0,
			minimum: 0
		}
	};

	// ------------------------------------------------
	// open
	// ------------------------------------------------

	const showModal = () => {

		setFormData({
			...incut
		});

		setErrors({});

		setShow(true);
	};

	// ------------------------------------------------
	// close
	// ------------------------------------------------

	const handleClose = () => {

		setShow(false);

		setFormData({});

		setErrors({});
	};

	// ------------------------------------------------
	// validate field
	// ------------------------------------------------

	const validateField = (
		key,
		value,
		field
	) => {

		// string
		if (
			field.type === "string" &&
			!field.enum
		) {

			const str = String(value || "");

			if (
				field.minLength &&
				str.length < field.minLength
			) {
				return `${t("Minimum length")}: ${field.minLength}`;
			}

			if (
				field.maxLength &&
				str.length > field.maxLength
			) {
				return `${t("Maximum length")}: ${field.maxLength}`;
			}
		}

		// enum
		if (field.enum) {

			if (
				!field.enum.includes(value)
			) {
				return t("Invalid value");
			}
		}

		// numbers
		if (
			field.type === "number" ||
			field.type === "integer"
		) {

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
				field.type === "integer" &&
				!Number.isInteger(num)
			) {
				return t("Must be integer");
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

	// ------------------------------------------------
	// update field
	// ------------------------------------------------

	const updateField = (
		key,
		value,
		field
	) => {

		let normalizedValue = value;

		if (
			field.type === "number" ||
			field.type === "integer"
		) {
			normalizedValue =
				value === ""
					? ""
					: Number(value);
		}

		if (field.type === "boolean") {
			normalizedValue =
				Boolean(value);
		}

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

	// ------------------------------------------------
	// validate all
	// ------------------------------------------------

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

		return (
			Object.keys(nextErrors).length === 0
		);
	};

	// ------------------------------------------------
	// save
	// ------------------------------------------------

	const save = () => {

		const valid = validateAll();

		if (!valid) return;

		macrosStore.technology.incuts[
			selectedPiercingMacro
		] = {
			...formData
		};

		handleClose();
	};

	return (
		<div id="IncutEditBtn">

			<button
				type="button"
				className="cp-btn"
				onClick={showModal}
			>
				✎
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				centered
				size="xl"
				className="with-inner-backdrop"
			>

				<div className="cp-submodal__header">

					<span>
						{t("Edit")} · #
						{ selectedPiercingMacro }

						{t("Edit")}: #{selectedPiercingMacro} { incut.initial_modulationFrequency_Hz} Hz, { incut.stages.length } {t('stg.')}
					</span>

					<button
						type="button"
						className="cp-header__close"
						onMouseDown={handleClose}
					>
						×
					</button>

				</div>

				<div className="cp-submodal__body">
					<div className="d-flex">
						<div className="drawer-body d-flex">
							<div className="cp-section" style={{width: "300px"}}>
								<div className="rt-macros__label">{t("Initial parameters")}</div>

								{
									Object.entries(schema).map(
										([key, field]) => {

											const value =
												formData?.[key];

											return (

												<Form.Group
													className="mb-0"
													key={key}
												>

													<Form.Label>
														{t(field.title)}
													</Form.Label>

													{/* boolean */}
													{
														field.type === "boolean" && (

															<Form.Check
																type="switch"
																checked={!!value}
																onChange={(e) =>
																	updateField(
																		key,
																		e.target.checked,
																		field
																	)
																}
															/>
														)
													}

													{/* enum */}
													{
														field.enum && (

															<Form.Select
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
															>

																{
																	field.enum.map(item => (
																		<option
																			key={item}
																			value={item}
																		>
																			{item}
																		</option>
																	))
																}

															</Form.Select>
														)
													}

													{/* text/number */}
													{
														!field.enum &&
														field.type !== "boolean" && (

															<Form.Control
																type={
																	field.type === "number" ||
																		field.type === "integer"
																		? "number"
																		: "text"
																}

																value={
																	value ?? ""
																}

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

																min={field.minimum}

																max={field.maximum}

																step={
																	field.type === "integer"
																		? 1
																		: 0.1
																}

																maxLength={
																	field.maxLength
																}
															/>
														)
													}

													<Form.Control.Feedback type="invalid">
														{errors[key]}
													</Form.Control.Feedback>

												</Form.Group>
											);
										}
									)
								}
							</div>
						</div>
						<div>
							<div className="cp-section" style={{ width: "300px" }}						>
								<div className="rt-macros__label">{t("Stages")}</div>
							</div>
						</div>
					</div>


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

export default IncutEditBtn;