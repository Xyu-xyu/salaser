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
import macrosStore from "../store/macrosStore";
import { useEffect } from "react";
import ServiceBar from "./serviceBar";
import { AnimatePresence, motion } from "framer-motion";
import SvgWrapper from "./editor/svgWrapper";


const Main = observer(() => {
	const { knobMode, centralBarMode } = laserStore;
	const { t } = useTranslation()

	useEffect(() => {
		if (!macrosStore.schema) macrosStore.loadCutSettingsSchema()
		if (!macrosStore.cut_settings) macrosStore.loadCutSettings()
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
				<div style={{ position: "relative", width: "100%", height: "100%" }}>
					{/* CentralBar */}
					<motion.div
						key="central"
						initial={false}
						animate={{
							opacity: centralBarMode === "service" ? 0 : 1,
							x: centralBarMode === "service" ? -30 : 0,
							pointerEvents: centralBarMode === "service" ? "none" : "auto",
						}}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
						}}
						className="h-100"
					>
						<CentralBar />
					</motion.div>

					{/* ServiceBar */}
					<motion.div
						key="service"
						initial={false}
						animate={{
							opacity: centralBarMode === "service" ? 1 : 0,
							x: centralBarMode === "service" ? 0 : 30,
							pointerEvents: centralBarMode === "service" ? "auto" : "none",
						}}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
						}}
					>
						<ServiceBar />
					</motion.div>
					{/* PlanEditorr */}
					<motion.div
						key="planEditor"
						initial={false}
						animate={{
							opacity: centralBarMode === "planEditor" ? 1 : 0,
							x: centralBarMode === "planEditor" ? 0 : 30,
							pointerEvents: centralBarMode === "planEditor" ? "auto" : "none",
						}}
						transition={{ duration: 0.25, ease: "easeInOut" }}
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
							backgroundColor: "var(--mainBg)"							
						}}
					>
						<div>
							<h1>planEditor</h1>
							<SvgWrapper />
						</div>
					</motion.div>
				</div>

			</div>


			<MacrosEditModalPanel />
			<PiercingEditModalPanel />
			<ModulationMacroModalPanel />
		</main>
	);
});

export default Main;
