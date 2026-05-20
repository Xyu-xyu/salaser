import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CustomIcon from "../../icons/customIcon.jsx";
import macrosStore from "../../store/macrosStore.jsx";
import utils from "../../scripts/util.jsx";
import CustomChartinFill from "../chart/customChartInFill.jsx"
import ModMacroEditBtnInAltSett from "./modMacroEditBtnInAltSett.jsx"
import IncutEditBtn from "./IncutEditBtn.jsx"


const SettingsAltButton = observer(() => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const [paramsViewMode, setParamsViewMode] = useState(false)
	const [fillMode, setFillMode] = useState('table')
	const handleClose = () => setShow(false);
	const showModal = () => setShow(true);
	const [expanded, setExpanded] = useState(false);
	const { modulationMacroinUse, selectedModulationMacro, piercingMacroinUse, selectedPiercingMacro } = macrosStore
	const [formData, setFormData] = useState(
		{
			"code":"STEEL",
			"name":"Steel",
			"thickness":1.5
		 },
	);


	const [feedingFormData, setFeedingFormData] = useState(
		{
			"arcLimitsEnabled": false,
			"feedLimit_mm_s": 50000,
			"microBridgeLength_mm": 2,
			"safeHeight_mm": 20,
			"toolCompensation":
				{ "g41Offset_mm": 0, 
				  "g42Offset_mm": 0 }
		},
	);




	const feeding_schema = {

		"feedLimit_mm_s": {
			"type": "number",
			"title": "Ограничение подачи, мм/с",
			"maximum": 200000,
			"default": 50000,
			"minimum": 10
		},
		"arcLimitsEnabled": {
			"type": "boolean",
			"title": "Дуги: ограничения по динамике",
			"description": "Включает/выключает ограничения дуг (скорость по v^2/r и ограничение разгона по суммарному ускорению). Отключение может ухудшить качество/точность на малых радиусах.",
			"default": false
		},
		"microBridgeLength_mm": {
			"type": "number",
			"title": "Длина микроперемычки, мм",
			"maximum": 1000.0,
			"default": 2.0,
			"minimum": 0.01
		},
		"safeHeight_mm": {
			"type": "number",
			"title": "Безопасная высота, мм",
			"maximum": 200.0,
			"default": 20.0,
			"minimum": 0.1
		},
		"toolCompensation": {
			"type": "object",
			"title": "Компенсация инструмента",
			"description": "Компенсация (tool offset) по стороне: G41 — слева от траектории, G42 — справа. Значения задаются в мм, без знака.",
			"properties": {
				"g41Offset_mm": {
					"type": "number",
					"title": "G41 (слева), мм",
					"maximum": 5.0,
					"default": 0.0,
					"minimum": 0.0
				},
				"g42Offset_mm": {
					"type": "number",
					"title": "G42 (справа), мм",
					"maximum": 5.0,
					"default": 0.0,
					"minimum": 0.0
				}
			},
			"additionalProperties": false
		}
	}


	const material_schema = {
 			"code": {
				"title": "Код",
				"minLength": 2,
				"maxLength": 64,
				"default": "STEEL",
				"type": "string"
			},
			"name": {
				"maxLength": 256,
				"type": "string",
				"title": "Название",
				"default": "Steel"
			},
			"thickness": {
				"type": "number",
				"title": "Толщина, мм",
				"maximum": 60.0,
				"default": 1.5,
				"minimum": 0.1
			}
	}

	const [errors, setErrors] = useState({});
	const validateField = (
		value,
		field
	) => {

		if (
			field.type === "number" ||
			field.type === "integer"
		) {

			if (
				value === "" ||
				value === undefined ||
				value === null
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
	// update root field
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
	// update nested object field
	// ------------------------------------------------

	const updateNestedField = (
		parentKey,
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

		setFormData(prev => ({

			...prev,

			[parentKey]: {

				...prev[parentKey],

				[key]: normalizedValue
			}
		}));

		const error = validateField(
			normalizedValue,
			field
		);

		const errorKey =
			`${parentKey}.${key}`;

		setErrors(prev => {

			const next = { ...prev };

			if (error) {
				next[errorKey] = error;
			}
			else {
				delete next[errorKey];
			}

			return next;
		});
	};

	// ------------------------------------------------
	// save
	// ------------------------------------------------

	const deleteThisModulation = (e) => {
		e.stopPropagation();
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete this modulation?',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			func: macrosStore.deleteAndUpdate,
			args: ['modulationMacros', selectedModulationMacro, 'modulationMacro']
		})
	}


	const deleteThisPiercing = (e) => {
		e.stopPropagation();
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete this piercing?',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			func: macrosStore.deleteAndUpdate,
			args: ['piercingMacros', selectedPiercingMacro, 'piercingMacro']
		})
	}


	const cloneThisModulation = (e) => {
		e.stopPropagation();
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to copy and add this modulation?',
			confirmText: 'Copy',
			cancelText: 'Cancel',
			func: macrosStore.AddAndUpdate,
			args: ['modulationMacros', selectedModulationMacro, 'modulationMacro']
		})
	}

	const cloneThisPiercing = (e) => {
		e.stopPropagation();
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to copy and add this piercing?',
			confirmText: 'Copy',
			cancelText: 'Cancel',
			func: macrosStore.AddAndUpdate,
			args: ['piercingMacros', selectedPiercingMacro, 'piercingMacro']
		})
	}

	useEffect(() => {
		macrosStore.loadCutSettings()
	}, [])

	const macros = macrosStore?.technology?.macros ?? [];
	const selectedMacroIdx = macrosStore?.selectedMacros ?? 0;
	const minimum = 0;
	const maximum = Math.max(0, macros.length - 1);
	const modMacroMax = utils.deepFind(false, ["modulationMacros", "maxItems"])
	const pierMacroMax = utils.deepFind(false, ["piercingMacros", "maxItems"])


	const [activeParam, setActiveParam] = useState("pressure");

	const macroName = (idx) => {
		if (idx === 0) return t("Cutting");
		if (idx === 1) return t("Pulse");
		if (idx === 2) return t("Engraving");
		if (idx === 3) return t("Vapor");
		if (idx === 4) return t("Edge");
		return t("Macro {{idx}}", { idx });
	};

	const params = [
		{ key: "pressure", domId: "rt_tile_pressure", valId: "rt_pressure" },
		{ key: "power_W_mm", domId: "rt_tile_energy", valId: "rt_energy" },
		{ key: "focus", domId: "rt_tile_focus", valId: "rt_focus" },
		{ key: "gas", domId: "rt_tile_gas", type: "enum" },
		{ key: "feedLimit_mm_s", domId: "rt_tile_feed", valId: "rt_feed_limit" },
		{ key: "modulationFrequency_Hz", domId: "rt_tile_freq", valId: "rt_freq" },
		{ key: "height", domId: "rt_tile_height", valId: "rt_height" },
		{ key: "enabled", domId: "rt_tile_enabled", type: "boolean" },
		{ key: "cross_blow", domId: "rt_tile_cross_blow", type: "boolean" },
	];

	const getMeta = (paramKey) => {
		const minimum = utils.deepFind(false, ["macros", paramKey, "minimum"]) ?? 0;
		const maximum = utils.deepFind(false, ["macros", paramKey, "maximum"]) ?? 0;
		const title = utils.deepFind(false, ["macros", paramKey, "title"]) ?? paramKey;
		const description = utils.deepFind(false, ["macros", paramKey, "description"]) ?? "";
		return { minimum, maximum, title, description };
	};

	const stepFor = (paramKey, min, max) => {
		const knobStp = Number(macrosStore?.knobStep?.[paramKey] ?? 1);
		const range = Number(max) - Number(min);
		// Same idea as UniversalKnob: don't step too fine for huge ranges
		return range / 50 > 50 ? 50 : knobStp;
	};

	const setNumberValue = (paramKey, nextRaw) => {
		const meta = getMeta(paramKey);
		const next = Number(nextRaw);
		if (!Number.isFinite(next)) return;
		macrosStore.setTecnologyValue(next, paramKey, "macros", meta.minimum, meta.maximum);
	};

	const enumOptions = (paramKey) => {
		// For string enums like gas/type
		const options = utils.deepFind(false, ["macros", paramKey, "enum"]);
		if (Array.isArray(options)) return options;
		return [];
	};

	const getEnumRefMax = (paramKey) => {
		const ref = utils.deepFind(false, ["macros", paramKey, "$wvEnumRef"]);
		if (typeof ref !== "string") return null;
		const paramName = ref.split("/").filter(Boolean).slice(-1)[0];
		const arr = macrosStore?.technology?.[paramName];
		if (!Array.isArray(arr)) return null;
		return Math.max(0, arr.length - 1);
	};

	const setEnumIndex = (paramKey, nextRaw) => {
		const maxRef = getEnumRefMax(paramKey);
		const min = 0;
		const max = typeof maxRef === "number" ? maxRef : (getMeta(paramKey).maximum ?? 0);
		const next = Number(nextRaw);
		if (!Number.isFinite(next)) return;
		macrosStore.setTecnologyValue(next, paramKey, "macros", min, max);
	};

	const bump = (paramKey, delta) => {
		const meta = getMeta(paramKey);
		const step = stepFor(paramKey, meta.minimum, meta.maximum);
		const currentValue = Number(macrosStore.getTecnologyValue(paramKey, "macros"));
		const newValue = currentValue + delta * step;
		macrosStore.setTecnologyValue(newValue, paramKey, "macros", meta.minimum, meta.maximum);
	};



	return (
		<div className="ms-2" id="settingsAltButton">
			<button className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`} onClick={showModal}>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon
						icon="fluent:wrench-screwdriver-24-regular"
						width="36"
						height="36"
						style={{ color: show ? "white" : "black" }}
						viewBox="0 0 24 24"
						strokeWidth={0}
						fill={show ? "white" : "black"}
					/>
				</div>
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				id="settingsAltButtonModal"
				className={`with-inner-backdrop settingsAltButton-navbar-modal ${expanded ? " expanded" : ""}`}
				centered={false}
			>
				<div className="p-2">
					<div className="drawer-body">
						<div className="rt-modal-topbar">
							<div className="rt-macros__label">{t('Settings')} :{ macrosStore.settingsSource.source }</div>
							<button
								type="button"
								className="rt-mode-toggle"
								onClick={() => setExpanded((v) => !v)}
							>
								{expanded ? t("Compact") : t("Expanded")}
							</button>
						</div>
						{expanded && (
							<div>
								<div className="drawer-body d-flex">
									<div className="cp-section" style={{ width: "150px" }}						>
										<div className="">
											<button
												key={-1}
												type="button"
												className={`rt-macro-tile mb-3 ${paramsViewMode ? "is-active" : ""}`}
												id={`paramsViewMode`}
												onClick={() => { setParamsViewMode(!paramsViewMode) }}
											>
												<div className="rt-macro-tile__top">
													<span className={`rt-macro__dot is-m8`} aria-hidden="true"></span>
												</div>
												<div className="rt-macro-tile__name">{!paramsViewMode ? t("Common") : t("Macros")}</div>
											</button>
											<div className="rt-macros__label">{t("Macros")}</div>
											{macros.map((_, idx) => (
												<button
													key={idx}
													type="button"
													className={`rt-macro-tile ${idx === selectedMacroIdx ? "is-active" : ""}`}
													id={`rt_macro_tile_${idx}`}
													data-macro={idx}
													onClick={() => {
														macrosStore.setVal("selector", idx, minimum, maximum)
														setParamsViewMode(false)
													}
													}
												>
													<div className="rt-macro-tile__top">
														<span className={`rt-macro__dot is-m${idx}`} aria-hidden="true"></span>
														<span className="rt-macro-tile__idx">{idx}</span>
													</div>
													<div className="rt-macro-tile__name">{macroName(idx)}</div>
												</button>
											))}
										</div>
									</div>
									{!paramsViewMode && <div className="d-flex flex-column">
										<div className="d-flex flex-column">
											<div className="cp-section" style={{ width: "750px" }}						>
												<div className="rt-macros__label">{t("Cutting parameters")}</div>
												<div className="cp-section__body cp-cols3">
													{/* enabled */}
													<div className="cp-field cp-field--toggle">
														<label className="cp-field__label">{t("Macro enabled")}</label>
														<label className="cp-toggle">
															<input
																type="checkbox"
																checked={Boolean(macrosStore.getTecnologyValue("enabled", "macros"))}
																onChange={(e) => macrosStore.setValBoolean("enabled", e.target.checked)}
															/>
															<span className="cp-toggle__track"></span>
														</label>
													</div>


													{/* type */}
													<div className="cp-field cp-field--enum">
														<label className="cp-field__label">{t("Type")}</label>
														<select
															className="cp-input"
															value={String(macrosStore.getTecnologyValue("type", "macros") ?? "")}
															onChange={(e) => macrosStore.setValString("type", e.target.value, "macros")}
														>
															{//enumOptions("type")
																["CW", "PULSE", "ENGRAVEING", "VAPOR", "EDGING"]
																	.map((opt) => (
																		<option key={opt} value={opt}>
																			{t(opt)}
																		</option>
																	))}
														</select>
													</div>

													{/* cross_blow */}
													<div className="cp-field cp-field--toggle">
														<label className="cp-field__label">{t(getMeta("cross_blow").title)}</label>
														<label className="cp-toggle">
															<input
																type="checkbox"
																checked={Boolean(macrosStore.getTecnologyValue("cross_blow", "macros"))}
																onChange={(e) => macrosStore.setValBoolean("cross_blow", e.target.checked)}
															/>
															<span className="cp-toggle__track"></span>
														</label>
													</div>

													{/* gas */}
													<div className="cp-field cp-field--enum">
														<label className="cp-field__label">{t(getMeta("gas").title)}</label>
														<select
															className="cp-input"
															value={String(macrosStore.getTecnologyValue("gas", "macros") ?? "")}
															onChange={(e) => macrosStore.setValString("gas", e.target.value, "macros")}
														>
															{enumOptions("gas").map((opt) => (
																<option key={opt} value={opt}>
																	{t(opt)}
																</option>
															))}
														</select>
													</div>

													{/* numbers */}
													{[
														"pressure",
														"power_W_mm",
														"feedLimit_mm_s",
														"height",
														"focus",
													].map((k) => {
														const meta = getMeta(k);
														const value = macrosStore.getTecnologyValue(k, "macros");
														const step = Number(macrosStore?.knobStep?.[k] ?? 1);

														return (
															<div key={k} className="cp-field cp-field--number">
																<label className="cp-field__label">{t(meta.title)}</label>
																<input
																	type="number"
																	className="cp-input"
																	min={meta.minimum}
																	max={meta.maximum}
																	step={step}
																	value={Number(value)}
																	onChange={(e) => setNumberValue(k, e.target.value)}
																/>
															</div>
														);
													})}
												</div>
											</div>

										<div className="d-flex">
										<div className="cp-section" style={{ width: "330px" }}		>
												<div className="rt-macros__label">{t("Cutting parameters")}:{t("Filling")}</div>
												<div className="cp-section__body">

													{/* fillMode */}
													<div className="cp-field cp-field--enum">
														<label className="cp-field__label">{t(getMeta("fillMode").title)}</label>
														<select
															className="cp-input"
															value={String(macrosStore.getTecnologyValue("fillMode", "macros") ?? "")}
															onChange={(e) => macrosStore.setValString("fillMode", e.target.value, "macros")}
														>
															{enumOptions("fillMode").map((opt) => (
																<option key={opt} value={opt}>
																	{t(opt)}
																</option>
															))}
														</select>
													</div>
													{macrosStore.getTecnologyValue("fillMode", "macros") === 'CURVE' &&
														<div className="">
															<div className="cp-curve__tabs">

																<button type="button" className={`cp-curve__tab ${fillMode === "table" ? "is-active" : ""}`}
																	onMouseDown={() => { setFillMode("table") }}
																>
																	{t("Table")}
																</button>

																<button type="button" className={`cp-curve__tab ${fillMode === "curve" ? "is-active" : ""}`}
																	onMouseDown={() => { setFillMode("curve") }}
																>
																	{t("CURVE")}
																</button>

															</div>
															<div className="cp-section__body">
																{fillMode === "table" &&
																	<div className="cp-curve__points" style={{}}>
																		<div className="d-flex w-100 justify-content-evenly">
																			<div className="cp-field__label">{t("Speed")}, {t("мм/с")}</div>
																			<div className="cp-field__label">{t("Filling")}, %</div>
																		</div>

																		{

																			macrosStore.getTecnologyValue("fillCurve", "macros")
																				.map((a, i) => {
																					return (

																						<div className="cp-curve__points__head d-flex m-1"
																							key={i}
																						>

																							<input type="number"
																								className="cp-input"
																								min={0}
																								max={200000}
																								step={1}
																								value={a.speed_mm_s}
																								onChange={(e) => {
																									macrosStore.setTecnologyValueForFillCurve(
																										'update',
																										'speed_mm_s',
																										i,
																										e.target.value
																									)
																								}}
																							/>

																							<input
																								type="number"
																								className="cp-input ms-1"
																								min={0} max={100}
																								step="0.1"
																								value={a.fill_percent}
																								onChange={(e) => {
																									macrosStore.setTecnologyValueForFillCurve(
																										'update',
																										'fill_percent',
																										i,
																										e.target.value
																									)
																								}}
																							/>
																							<button
																								type="button"
																								className="cp-btn cp-btn--danger ms-1"
																								onClick={() => macrosStore.setTecnologyValueForFillCurve("delete", false, i)}
																							>
																								×
																							</button>
																						</div>)

																				})

																		}

																	</div>
																}

																{fillMode === "curve" && <CustomChartinFill />}
															</div>
															<div className="cp-curve__controls">
																<button type="button" className="cp-btn cp-btn--primary"
																	onClick={() => macrosStore.setTecnologyValueForFillCurve("add")}
																>
																	+ {t("Point")}
																</button>
																<button type="button" className="cp-btn"
																	onClick={() => macrosStore.setTecnologyValueForFillCurve("sort")}
																>
																	{t("Sort")}
																</button>
																<button type="button" className="cp-btn cp-btn--danger"
																	onClick={() => macrosStore.setTecnologyValueForFillCurve("clear")}
																>
																	{t("Clear")}
																</button>
															</div>
														</div>

													}
												</div>
											</div>

											<div className="d-flex flex-column">
												<div className="cp-section">
													<div className="rt-macros__label">{t("Modulation")}</div>
													<div className="cp-section__body">
														<div className="cp-field cp-field--number">
															<label className="cp-field__label">{t(getMeta("modulationFrequency_Hz").title)}</label>
															<input
																type="number"
																className="cp-input"
																min={getMeta("modulationFrequency_Hz").minimum}
																max={getMeta("modulationFrequency_Hz").maximum}
																step={Number(macrosStore?.knobStep?.["modulationFrequency_Hz"] ?? 1)}
																value={Number(macrosStore.getTecnologyValue("modulationFrequency_Hz", "macros"))}
																onChange={(e) => setNumberValue("modulationFrequency_Hz", e.target.value)}
															/>
														</div>

														<div className="cp-select-with-actions">
															<div className="cp-field cp-field--enum">
																<label className="cp-field__label">{t("Modulation selection")}</label>
																<select
																	className="cp-input"
																	value={String(macrosStore.getTecnologyValue("modulationMacro", "macros") ?? 0)}
																	onChange={(e) => setEnumIndex("modulationMacro", e.target.value)}
																>
																	{(macrosStore?.technology?.modulationMacros ?? []).map((m, idx) => (
																		<option key={idx} value={idx}
																			className={(modulationMacroinUse.includes(idx) ? (idx === selectedPiercingMacro ? "currentMacrosInOption" : "") : "notInUseInOption")}
																		>
																			#{idx} · {m?.name ?? "Unknown piercing macro"}
																		</option>
																	))}
																</select>
															</div>
															<button
																type="button"
																className="cp-btn cp-btn--primary"
																title={t("Create new modulation macro")}
																onMouseDown={(e) => cloneThisModulation(e)}
																disabled={
																	modMacroMax === macrosStore?.technology?.modulationMacros.length
																}
															>
																+
															</button>
															<ModMacroEditBtnInAltSett />
															<button
																type="button" className="cp-btn cp-btn--danger"
																onMouseDown={(e) => deleteThisModulation(e)}
																title={t("Delete selected modulation")}
																disabled={
																	macrosStore?.technology?.modulationMacros.length === 1
																}
															>
																🗑
															</button>
														</div>
													</div>
												</div>

												<div className="cp-section" 					>
													<div className="">
														<div className="rt-macros__label">{t("Incut")}</div>
														<div className="cp-section__body">
															<div className="cp-field cp-field--number">
																<div className="d-flex flex-column">
																	<div className="cp-select-with-actions">
																		<div className="cp-field cp-field--enum">
																			<label className="cp-field__label">{t("Piercing macro selection")}</label>
																			<select
																				className="cp-input"
																				value={String(macrosStore.getTecnologyValue("piercingMacro", "macros") ?? 0)}
																				onChange={(e) => setEnumIndex("piercingMacro", e.target.value)}
																			>
																				{(macrosStore?.technology?.piercingMacros ?? []).map((m, idx) => (
																					<option key={idx} value={idx}
																						className={(piercingMacroinUse.includes(idx) ? (idx === selectedPiercingMacro ? "currentMacrosInOption" : "") : "notInUseInOption")}
																					>
																						#{idx} · {m?.name ?? "Unknown modulation macro"}
																					</option>
																				))}
																			</select>
																		</div>
																		<button
																			type="button"
																			className="cp-btn cp-btn--primary"
																			title={t("Create new modulation macro")}
																			onMouseDown={(e) => cloneThisPiercing(e)}
																			disabled={
																				pierMacroMax === macrosStore?.technology?.piercingMacros.length
																			}
																		>
																			+
																		</button>
																		<IncutEditBtn />
																		<button
																			type="button" className="cp-btn cp-btn--danger"
																			onMouseDown={(e) => deleteThisPiercing(e)}
																			title={t("Delete selected ?")}
																			disabled={
																				macrosStore?.technology?.piercingMacros.length === 1
																			}
																		>
																			🗑
																		</button>

																	</div>
																</div>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>	
											
										</div>

									</div>
									}

									{paramsViewMode &&

										<div className="d-flex">
											<div className="cp-section" 						>
												<div className="rt-macros__label">{t("Feeding and Moving")}</div>
												<div className="cp-section">
													{
														Object.entries(
															feeding_schema
														).map(([key, field]) => {

															// OBJECT
															if (
																field.type === "object"
															) {

																return (

																	<div
																		key={key}
																		className="cp-subgroup"
																	>

																		<h5 className="mb-3">
																			{t(field.title)}
																		</h5>

																		{
																			Object.entries(
																				field.properties
																			).map(
																				([nestedKey, nestedField]) => {

																					const value =
																						feedingFormData?.[
																						key
																						]?.[
																						nestedKey
																						];

																					const error =
																						errors?.[
																						`${key}.${nestedKey}`
																						];

																					return (

																						<Form.Group
																							className="mb-3"
																							key={nestedKey}
																						>

																							<Form.Label>
																								{t(nestedField.title)}
																							</Form.Label>

																							<Form.Control
																								type="number"

																								value={
																									value ?? ""
																								}

																								min={
																									nestedField.minimum
																								}

																								max={
																									nestedField.maximum
																								}

																								step={0.01}

																								isInvalid={
																									!!error
																								}

																								onChange={(e) =>
																									updateNestedField(
																										key,
																										nestedKey,
																										e.target.value,
																										nestedField
																									)
																								}
																							/>

																							<Form.Control.Feedback type="invalid">
																								{error}
																							</Form.Control.Feedback>

																						</Form.Group>
																					);
																				}
																			)
																		}

																	</div>
																);
															}

															// BOOLEAN
															if (
																field.type === "boolean"
															) {

																return (

																	<Form.Group
																		className="mb-3"
																		key={key}
																	>

																		<Form.Check
																			type="switch"

																			label={t(field.title)}

																			checked={
																				!!feedingFormData?.[key]
																			}

																			onChange={(e) =>
																				updateField(
																					key,
																					e.target.checked,
																					field
																				)
																			}
																		/>

																	</Form.Group>
																);
															}

															// NUMBER / TEXT
															const error =
																errors?.[key];

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
																			field.type === "number" ||
																				field.type === "integer"
																				? "number"
																				: "text"
																		}

																		value={
																			feedingFormData?.[key] ?? ""
																		}

																		min={field.minimum}

																		max={field.maximum}

																		step={
																			field.type === "integer"
																				? 1
																				: 0.01
																		}

																		isInvalid={!!error}

																		onChange={(e) =>
																			updateField(
																				key,
																				e.target.value,
																				field
																			)
																		}
																	/>

																	<Form.Control.Feedback type="invalid">
																		{error}
																	</Form.Control.Feedback>

																</Form.Group>
															);
														})
													}

												</div>
											</div>
											<div className="cp-section">
												<div className="rt-macros__label">{t("Material")}</div>
												{
														Object.entries(
															material_schema
														).map(([key, field]) => {

															// OBJECT
															if (
																field.type === "object"
															) {

																return (

																	<div
																		key={key}
																		className="cp-subgroup"
																	>

																		<h5 className="mb-3">
																			{t(field.title)}
																		</h5>

																		{
																			Object.entries(
																				field.properties
																			).map(
																				([nestedKey, nestedField]) => {

																					const value =
																						formData?.[
																						key
																						]?.[
																						nestedKey
																						];

																					const error =
																						errors?.[
																						`${key}.${nestedKey}`
																						];

																					return (

																						<Form.Group
																							className="mb-3"
																							key={nestedKey}
																						>

																							<Form.Label>
																								{t(nestedField.title)}
																							</Form.Label>

																							<Form.Control
																								type="number"

																								value={
																									value ?? ""
																								}

																								min={
																									nestedField.minimum
																								}

																								max={
																									nestedField.maximum
																								}

																								step={0.01}

																								isInvalid={
																									!!error
																								}

																								onChange={(e) =>
																									updateNestedField(
																										key,
																										nestedKey,
																										e.target.value,
																										nestedField
																									)
																								}
																							/>

																							<Form.Control.Feedback type="invalid">
																								{error}
																							</Form.Control.Feedback>

																						</Form.Group>
																					);
																				}
																			)
																		}

																	</div>
																);
															}

															// BOOLEAN
															if (
																field.type === "boolean"
															) {

																return (

																	<Form.Group
																		className="mb-3"
																		key={key}
																	>

																		<Form.Check
																			type="switch"

																			label={t(field.title)}

																			checked={
																				!!formData?.[key]
																			}

																			onChange={(e) =>
																				updateField(
																					key,
																					e.target.checked,
																					field
																				)
																			}
																		/>

																	</Form.Group>
																);
															}

															// NUMBER / TEXT
															const error =
																errors?.[key];

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
																			field.type === "number" ||
																				field.type === "integer"
																				? "number"
																				: "text"
																		}

																		value={
																			formData?.[key] ?? ""
																		}

																		min={field.minimum}

																		max={field.maximum}

																		step={
																			field.type === "integer"
																				? 1
																				: 0.01
																		}

																		isInvalid={!!error}

																		onChange={(e) =>
																			updateField(
																				key,
																				e.target.value,
																				field
																			)
																		}
																	/>

																	<Form.Control.Feedback type="invalid">
																		{error}
																	</Form.Control.Feedback>

																</Form.Group>
															);
														})
													}

												
											</div>
											<div className="cp-section">
												<div className="rt-macros__label">Machine</div>
												<div className="cp-subgroup">
													<h5 className="mb-3" />
													<div className="mb-3">
													<label className="form-label">{t('Name')}</label>
													<input
 														className="form-control"
														disabled=""
														onChange={()=>{}}
														value={ macrosStore.cut_settings ? macrosStore.cut_settings.machine.name :"SGNLaser"}
													/>
													<div className="invalid-feedback" />
													</div>
													<div className="mb-3">
													<label className="form-label">{t('Power, W')}</label>
													<input
														min={100}
														max={100000}
														step="0.01"
														className="form-control"
														type="number"
														onChange={()=>{}}
														value={ macrosStore.cut_settings ? macrosStore.cut_settings.sourcePower_w : 10000}
													/>
													<div className="invalid-feedback" />
													</div>
												</div>
											</div>

										</div>
									}

								</div>
							</div>
						)}
						<div className="d-flex">
							{!expanded && 
							<div className="rt-macros me-2" aria-label="Макросы" style={{ width: "300px" }}>
								<div className="rt-macros__label">{t("Macros")}</div>
								<div className={`rt-macros__grid ${expanded ? "is-col" : ""}`} id="rt_macros_grid">
									{macros.map((_, idx) => (
										<button
											key={idx}
											type="button"
											className={`rt-macro-tile ${idx === selectedMacroIdx ? "is-active" : ""}`}
											id={`rt_macro_tile_${idx}`}
											data-macro={idx}
											onClick={() => macrosStore.setVal("selector", idx, minimum, maximum)}
										>
											<div className="rt-macro-tile__top">
												<span className={`rt-macro__dot is-m${idx}`} aria-hidden="true"></span>
												<span className="rt-macro-tile__idx">{idx}</span>
											</div>
											<div className="rt-macro-tile__name">{macroName(idx)}</div>
										</button>
									))}
								</div>
							</div>}
							{!expanded && (
								<div className="rt-macros">
									<div className="rt-macros__label">{t("Parameters")}</div>
									<div className="rt-grid" aria-label={t("Parameters")}>
										{params.map(({ key, domId, valId, type }) => {
											const meta = getMeta(key);
											const value = macrosStore.getTecnologyValue(key, "macros");
											const isActive = activeParam === key;
											{
												!expanded && <div className="rt-macros" aria-label="Макросы">
													<div className="rt-macros__label">{t("Macros")}</div>
													<div className={`rt-macros__grid ${expanded ? "is-col" : ""}`} id="rt_macros_grid">
														{macros.map((_, idx) => (
															<button
																key={idx}
																type="button"
																className={`rt-macro-tile ${idx === selectedMacroIdx ? "is-active" : ""}`}
																id={`rt_macro_tile_${idx}`}
																data-macro={idx}
																onClick={() => macrosStore.setVal("selector", idx, minimum, maximum)}
															>
																<div className="rt-macro-tile__top">
																	<span className={`rt-macro__dot is-m${idx}`} aria-hidden="true"></span>
																	<span className="rt-macro-tile__idx">{idx}</span>
																</div>
																<div className="rt-macro-tile__name">{macroName(idx)}</div>
															</button>
														))}
													</div>
												</div>
											}
											if (type === "enum") {
												const options = utils.deepFind(false, ["macros", key, "enum"]) ?? [];
												const safeOptions = Array.isArray(options) ? options : [];
												const current = typeof value === "string" ? value : String(value ?? "");

												return (
													<div
														key={key}
														title={meta.description || meta.title}
														className={`rt-tile ${isActive ? "is-active" : ""}`}
														id={domId}
														data-param={key}
														onClick={() => setActiveParam(key)}
													>
														<div className="rt-tile__label">{t(meta.title)}</div>
														<div className="rt-tile__value">
															<select
																className="rt-tile__select"
																value={current}
																onClick={(e) => e.stopPropagation()}
																onChange={(e) => macrosStore.setValString(key, e.target.value, "macros")}
															>
																{safeOptions.map((opt) => (
																	<option key={opt} value={opt}>
																		{t(opt)}
																	</option>
																))}
															</select>
														</div>
													</div>
												);
											}

											if (type === "boolean") {
												const checked = Boolean(value);
												return (
													<div
														key={key}
														title={meta.description || meta.title}
														className={`rt-tile rt-tile--checkbox ${isActive ? "is-active" : ""} ${checked ? "is-checked" : ""}`}
														id={domId}
														data-param={key}
														onClick={() => setActiveParam(key)}
													>
														<div className="rt-tile__label">{t(meta.title)}</div>
														<div className="rt-tile__value">
															<input
																type="checkbox"
																className="rt-tile__checkbox"
																checked={checked}
																onChange={(e) => {
																	macrosStore.setValBoolean(key, e.target.checked);
																}}
															/>
															<span
																className="rt-tile__checkbox-indicator"
																onClick={(e) => {
																	e.stopPropagation();
																	macrosStore.setValBoolean(key, !checked);
																}}
															/>
														</div>
													</div>
												);
											}

											return (
												<div
													key={key}
													title={meta.description || meta.title}
													className={`rt-tile ${isActive ? "is-active" : ""}`}
													id={domId}
													data-param={key}
													onClick={() => setActiveParam(key)}
												>
													<div className="rt-tile__label">{t(meta.title)}</div>
													<div className="rt-tile__value">
														<span id={valId}>{value}</span>
													</div>
													<div className="rt-tile__adjust">
														<button
															type="button"
															className="rt-tile__stepbtn"
															aria-label={t("Increase")}
															onClick={(e) => {
																e.stopPropagation();
																bump(key, +1);
															}}
														>
															+
														</button>
														<button
															type="button"
															className="rt-tile__stepbtn"
															aria-label={t("Decrease")}
															onClick={(e) => {
																e.stopPropagation();
																bump(key, -1);
															}}
														>
															−
														</button>
													</div>
												</div>
											);
										})}
									</div>
								</div>
							)}

						</div>
					</div>
				</div>
			</Modal>
		</div>
	);
});

export default SettingsAltButton;
