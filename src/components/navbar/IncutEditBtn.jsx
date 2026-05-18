import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import macrosStore from "../../store/macrosStore";
import utils from "../../scripts/util";
import Demo from "./demo";

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

	const schema =  utils.deepFind(false, ['piercingMacros', 'items', 'properties'])
	const stages_schema = utils.deepFind(false, ['piercingMacros', 'items', 'properties', 'stages', 'items', 'properties'])

	const deleteStage = (idx) => {
		macrosStore.deleteStage(idx, true)
	}

	const copyStage = (idx) => {
		macrosStore.addStage(idx)
	}

	const move = (direction, idx) => {
		macrosStore.moveStage(direction, idx)
	}

	const updateStageField = (
		stageIdx,
		key,
		value,
		field,
	) => {
	
		macrosStore.setselectedPiercingStage(stageIdx)
	
		let normalizedValue = value
		// normalize
		if (
			field?.type === 'number' ||
			field?.type === 'integer'
		) {
	
			normalizedValue =
				value === ''
					? ''
					: Number(value)
		}
	
		if (field?.type === 'boolean') {
	
			normalizedValue =
				Boolean(value)
		}
	
		// validate
		const error = validateField(
			key,
			normalizedValue,
			field
		)
	
		const errorKey =
			`${stageIdx}_${key}`
	
		// update errors state
		setErrors(prev => {
	
			const next = { ...prev }
	
			if (error) {
				next[errorKey] = error
			}
			else {
				delete next[errorKey]
			}
	
			return next
		})
	
		// prevent invalid values from saving
		if (error) return
	
		// save to mobx store
		if (
			field?.type === 'number' ||
			field?.type === 'integer'
		) {
	
			macrosStore.setTecnologyValue(
				normalizedValue,
				key,
				'stages',
				field.minimum,
				field.maximum,
				stageIdx
			)
	
		}
		else if (field?.type === 'boolean') {
	
			macrosStore.setTecnologyValueBoolean(
				normalizedValue,
				key,
				'stages',
				stageIdx
			)
		}
	}


	const showModal = () => {

		setFormData({
			...incut
		});

		setErrors({});

		setShow(true);
	};


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
				className={`with-inner-backdrop settingsAltButton-navbar-modal expanded`}
				centered={false}
			>

				<div className="cp-submodal__header"
					
				>

					<span>
						{t("Edit")} · #
						{selectedPiercingMacro}

						{t("Edit")}: #{selectedPiercingMacro} {incut.initial_modulationFrequency_Hz} Hz, {incut.stages.length} {t('stg.')}
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
							<div className="cp-section" style={{ minWidth: "300px" }}>
								<div className="rt-macros__label">{t("Initial parameters")}</div>

								{
									Object.entries(schema)
									.map(
										([key, field]) => {

											const value =
												formData?.[key];

											return (

												<Form.Group
													className="m-1 p-0"
													key={key}
												>

													<Form.Label
													className="m-0 p-0">
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
																			{t(item)}
																		</option>
																	))
																}

															</Form.Select>
														)
													}

													{/* text/number */}
													{
														!field.enum &&
														field.type !== "array" &&
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
							<div className="cp-section" style={{ maxWidth: '1400px' }}>
								<div className="rt-macros__label">{t("Stages")}</div>
								<div className="cp-section__body">

									<div className="d-flex flex-column">
										<div className="cp-stages-table-wrapper">

											<table className="cp-stages-table">

												<tbody>

													{/* ---------------------------------- */}
													{/* header row INSIDE table body */}
													{/* ---------------------------------- */}

													<tr>

														<td className="cp-sticky-col cp-param-name cp-stage-corner">
															{t("Parameter")}
														</td>

														{
															incut.stages.map((stage, stageIdx) => (

																<td
																	key={stageIdx}
																	className="cp-stage-head"
																>

																	<div className="cp-stage-head-title">
																		{t("Step")} {stageIdx + 1}
																	</div>

																	<div className="cp-stage-actions">

																		<button
																			type="button"
																			className="cp-btn cp-btn--ghost"
																			disabled={stageIdx === 0}
																			onMouseDown={(idx) => move('left', stageIdx)}
																		>
																			◀
																		</button>

																		<button
																			type="button"
																			className="cp-btn cp-btn--ghost"
																			disabled={
																				stageIdx === incut.stages.length - 1
																			}
																			onMouseDown={(idx) => move('right', stageIdx)}
																		>
																			▶
																		</button>

																		<button
																			type="button"
																			className="cp-btn cp-btn--danger"
																			onMouseDown={(idx) => deleteStage(stageIdx+1)}
																		>
																			×
																		</button>
																		<button
																			type="button"
																			className="cp-btn cp-btn--primary"
																			onMouseDown={(idx) => copyStage(stageIdx+1)}
																		>
																			+
																		</button>

																	</div>

																</td>
															))
														}

													</tr>

													{/* ---------------------------------- */}
													{/* fields */}
													{/* ---------------------------------- */}

													{
														Object.entries(
															stages_schema
															).map(([key, field]) => (

															<tr key={key}>

																{/* left sticky param name */}
																<td className="cp-sticky-col cp-param-name">

																	{t(field.title)}

																</td>

																{/* values */}
																{
																	incut.stages.map(
																		(stage, stageIdx) => {

																			const value =
																				stage?.[key];

																			const error =
																				errors?.[
																				`${stageIdx}_${key}`
																				];

																			return (

																				<td
																					key={stageIdx}
																					className="cp-stage-value"
																				>

																					{/* boolean */}
																					{
																						field.type === "boolean" && (

																							<Form.Check
																								type="switch"
																								checked={!!value}
																								onChange={(e) =>
																									updateStageField(
																										stageIdx,
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
																								size="sm"
																								value={value}
																								isInvalid={!!error}
																								onChange={(e) =>
																									updateStageField(
																										stageIdx,
																										key,
																										e.target.value,
																										field
																									)
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

																					{/* text / number */}
																					{
																						!field.enum &&
																						field.type !== "boolean" && (

																							<Form.Control
																								size="sm"

																								type={
																									field.type === "number" ||
																										field.type === "integer"
																										? "number"
																										: "text"
																								}

																								value={
																									value ?? ""
																								}

																								isInvalid={
																									!!error
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

																								onChange={(e) =>
																									updateStageField(
																										stageIdx,
																										key,
																										e.target.value,
																										field,
																									)
																								}
																							/>
																						)
																					}

																					<Form.Control.Feedback
																						type="invalid"
																					>
																						{error}
																					</Form.Control.Feedback>

																				</td>
																			)
																		}
																	)
																}

															</tr>
														))
													}

												</tbody>

											</table>

										</div>
									</div>
								</div>
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
 					<Demo />
			 		{/* <button
						type="button"
						className="cp-btn cp-btn--primary"
						onMouseDown={save}
						disabled={
							Object.keys(errors).length > 0
						}
					>
						{t("Save")}
					</button> */}

				</div>

			</Modal>
		</div>
	);
});

export default IncutEditBtn;