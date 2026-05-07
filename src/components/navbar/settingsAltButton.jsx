import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CustomIcon from "../../icons/customIcon.jsx";
import macrosStore from "../../store/macrosStore.jsx";
import utils from "../../scripts/util.jsx";

const SettingsAltButton = observer(() => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const showModal = () => setShow(true);
	const [expanded, setExpanded] = useState(false);

	const macros = macrosStore?.technology?.macros ?? [];
	const selectedMacroIdx = macrosStore?.selectedMacros ?? 0;
	const minimum = 0;
	const maximum = Math.max(0, macros.length - 1);

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
				className="with-inner-backdrop powerButton-navbar-modal favoritesButton-navbar-modal settingsAltButton-navbar-modal"
				centered={false}
			>
				<div className="drawer-body pb-0">
					<div className="rt-modal-topbar">
						<button
							type="button"
							className="rt-mode-toggle"
							onClick={() => setExpanded((v) => !v)}
						>
							{expanded ? t("Compact") : t("Expanded")}
						</button>
					</div>
					<div className="rt-macros" aria-label="Макросы">
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
				</div>
				{!expanded && (
					<div className="drawer-body pt-0">
						<div className="rt-macros__label">{t("Parameters")}</div>
						<div className="rt-grid" aria-label={t("Parameters")}>
							{params.map(({ key, domId, valId, type }) => {
								const meta = getMeta(key);
								const value = macrosStore.getTecnologyValue(key, "macros");
								const isActive = activeParam === key;

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
			</Modal>
		</div>
	);
});

export default SettingsAltButton;
