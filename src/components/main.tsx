import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
import MacrosSelector from "./macrosSelector";
import MacrosEditModalPanel from "./macrosEditModalPanel";
import PiercingEditModalPanel from "./piercingEditModalPanel";
import ModulationMacroModalPanel from "./modulationMacroModalPanel";
import UniversalKnob from "./universalKnob";
import NavBar from "./navbar";
import UniversalNamedKnob from "./universalNamedKnob";
import CentralBar from "./centralBar";
import { useTranslation } from 'react-i18next';
import viewStore from "../store/viewStore";
import { useEffect } from "react";
import ServiceBar from "./serviceBar";
import { AnimatePresence, motion } from "framer-motion";


const Main = observer(() => {
	const { knobMode, centralBarMode } = laserStore;
	const { t } = useTranslation()

	useEffect(() => {
		if (!viewStore.schema) viewStore.loadCutSettingsSchema()
		if (!viewStore.cut_settings) viewStore.loadCutSettings()
		/* if (import.meta.env.DEV) {
			alert ('DEV MODE')
		} else {
			alert ('BUILD MODE')
		} */
	}, [])


	return (
		<main
			id="main1"
			className="h-100 overflow-hidden d-flex w-100"
		>

			<div className="d-flex flex-column">
			<AnimatePresence mode="wait">
  {knobMode && (
    <motion.div
      key="knobModeON"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{ position: "relative" }}
    >
      <div
        id="sidePanelWrapper"
        className="h-100 d-flex flex-column justify-content-evenly fade-toggle visible"
      >
        <h5>{t("Макрос")}</h5>

        <div key={0} className="h-125 col-12 vidget">
          <MacrosSelector />
        </div>

        {[
          "pressure",
          "power_W_mm",
          "focus",
          "feedLimit_mm_s",
          "modulationMacro",
          "height",
          "modulationFrequency_Hz",
        ].map((a: string, i: number) =>
          a === "modulationMacro" ? (
            <div key={i} className="h-125 col-12 vidget">
              <UniversalNamedKnob param={a} keyParam="macros" />
            </div>
          ) : (
            <div key={i} className="h-125 col-12 vidget">
              <UniversalKnob param={a} keyParam="macros" />
            </div>
          )
        )}
      </div>
    </motion.div>
  )}
</AnimatePresence>
			

			</div>

			<div className="d-flex flex-column w-100 h-100">
				<NavBar />
				<AnimatePresence mode="wait">
					{centralBarMode === 'service' ? (
						<motion.div
							key="service" // ключ обязательно разный для разных компонентов
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							transition={{ duration: 0.2 }}
						>
							<ServiceBar />
						</motion.div>
					) : (
						<motion.div
							key="central"
							initial={{ opacity: 0, x: 50 }}
							animate={{ opacity: 1, x: 0 }}
							exit={{ opacity: 0, x: -50 }}
							transition={{ duration: 0.2 }}
						>
							<CentralBar />
						</motion.div>
					)}
				</AnimatePresence>
			</div>


			<MacrosEditModalPanel />
			<PiercingEditModalPanel />
			<ModulationMacroModalPanel />
		</main>
	);
});

export default Main;
