import { observer } from "mobx-react-lite";
import viewStore from "../store/viewStore";
import MacrosSelector from "./macrosSelector";
import MacrosEditModalPanel from "./macrosEditModalPanel";
import PiercingEditModalPanel from "./piercingEditModalPanel";
import ModulationMacroModalPanel from "./modulationMacroModalPanel";
import UniversalKnob from "./universalKnob";
import NavBar from "./navbar";
import UniversalNamedKnob from "./universalNamedKnob";
import CentralBar from "./centralBar";

const Main1 = observer(() => {
	const { knobMode } = viewStore;	  

	return (
		<main
			id="main1"
			className="h-100 overflow-hidden d-flex w-100"
 		>

			<div className="d-flex flex-column">
				<div id="sidePanelWrapper" className={`h-100 d-flex flex-column justify-content-evenly fade-toggle ${knobMode ? "visible" : ""}`}>
				<h5 style={{
						opacity: knobMode ? 1 : 0						
					}}>
					Макрос
					</h5>

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
								<UniversalNamedKnob param={a} keyParam={"macros"} />
							</div>
						) : (
							<div key={i} className="h-125 col-12 vidget">
								<UniversalKnob param={a} keyParam={"macros"} />
							</div>
						)
					)}
				</div>
			</div>
			<div className="d-flex flex-column w-100 h-100">
 				<NavBar />
				<CentralBar />
			</div>		
			<MacrosEditModalPanel />
			<PiercingEditModalPanel />
			<ModulationMacroModalPanel />
		</main>
	);
});

export default Main1;
