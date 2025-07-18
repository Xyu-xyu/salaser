import { observer } from "mobx-react-lite";
import viewStore from "../store/viewStore";
import MacrosSelector from "./macrosSelector";
import MacrosEditModalPanel from "./macrosEditModalPanel";
import PiercingEditModalPanel from "./piercingEditModalPanel";
import ModulationMacroModalPanel from "./modulationMacroModalPanel";
import UniversalKnob from "./universalKnob";
import NavBar from "./navbar";
import UniversalNamedKnob from "./universalNamedKnob";

const Main1 = observer(() => {
	const { knobMode } = viewStore;

	const handleRightClick = (event: React.MouseEvent) => {
		if (event.clientX === event.clientY) {
			event.preventDefault(); // отключить стандартное контекстное меню
		console.log("Правый клик по координатам:", event.clientX, event.clientY);
		viewStore.setKnobMode(!knobMode); // переключение состояния
		}
	};

	return (
		<main
			id="main1"
			className="h-100 overflow-hidden d-flex w-100"
			onContextMenu={handleRightClick} // ← слушатель правого клика
		>
			<div className={`h-100 d-flex flex-column fade-toggle ${knobMode ? "visible" : ""}`}>
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
			<NavBar />
			<MacrosEditModalPanel />
			<PiercingEditModalPanel />
			<ModulationMacroModalPanel />
		</main>
	);
});

export default Main1;
