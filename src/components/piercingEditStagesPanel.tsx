import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import UniversalKnob from './universalKnob';
import IosToggleBlowInStage from './iosToggleBlowInStage';
import IosToggleMacrosInStage from './iosToggleMacrosInStage';

const PiercingEditModalPanel = observer(() => {
	const { isVertical } = viewStore;

	return (
		<>
			<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
				{[
	 	  		    "modulationMacro",
					"pressure",
					"power",
					"delay_s",					
				].map((a: string, i: number) => (
					<div className="" key={i}>
						<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
							<UniversalKnob param={a} keyParam={'piercingStages'} />
						</div>
					</div>
				))}
			</div>
			<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
				{[
					"power_W_s",
 					 "focus",
					 "height",
					 "modulationFrequency_Hz",
				].map((a: string, i: number) => (
					<div className="" key={i}>
						<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
							<UniversalKnob param={a} keyParam={'piercingStages'} />
						</div>
					</div>
				))}
			</div>
			<div className={'d-flex d-flex justify-content-evenly ' +  (isVertical ? "mt-10" : "mt-4")}>
				<div className="">
					<div className="editModal_col">
						<IosToggleBlowInStage />
					</div>
				</div>
				<div className="">
					<div className="editModal_col">
						<IosToggleMacrosInStage />
					</div>
				</div>
			</div>
		</>
	);
});


export default PiercingEditModalPanel;
