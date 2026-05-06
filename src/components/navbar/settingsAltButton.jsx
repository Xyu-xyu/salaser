import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CustomIcon from "../../icons/customIcon.jsx";
import macrosStore from "../../store/macrosStore.jsx";

const SettingsAltButton = observer(() => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const showModal = () => setShow(true);

	const macros = macrosStore?.technology?.macros ?? [];
	const selectedMacroIdx = macrosStore?.selectedMacros ?? 0;

	const macroName = (idx) => {
		if (idx === 0) return t("Cutting");
		if (idx === 1) return t("Pulse");
		if (idx === 2) return t("Engraving");
		if (idx === 3) return t("Vapor");
		if (idx === 4) return t("Edge");
		return t("Macro {{idx}}", { idx });
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
				<div className="drawer-body">
					<div className="rt-macros" aria-label="Макросы">
						<div className="rt-macros__label">{t("Macros")}</div>
						<div className="rt-macros__grid" id="rt_macros_grid">
							{macros.map((_, idx) => (
								<button
									key={idx}
									type="button"
									className={`rt-macro-tile ${idx === selectedMacroIdx ? "is-active" : ""}`}
									id={`rt_macro_tile_${idx}`}
									data-macro={idx}
									onClick={() => macrosStore.setSelectedMacros(idx)}
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
			</Modal>
		</div>
	);
});

export default SettingsAltButton;
