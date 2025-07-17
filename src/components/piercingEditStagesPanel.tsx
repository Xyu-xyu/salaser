import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import UniversalKnob from './universalKnob';
import IosToggleBlowInStage from './toggles/iosToggleBlowInStage';
import IosToggleMacrosInStage from './toggles/iosToggleMacrosInStage';
import UniversalNamedKnob from './universalNamedKnob';

const piercingEditStagesPanel = observer(() => {
	const { isVertical } = viewStore;

	return (
		<>
			<div className={'w-100 d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-50")}>
				{[	  		    
					   "focus",
					   "height",
					   "power",
					   "pressure",					
				].map((a: string, i: number) => (
					<div className="" key={i}>
						<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
							<UniversalKnob param={a} keyParam={'stages'} />
						</div>
					</div>
				))}
			</div>
			<div className={'w-100 d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>				
				{[
					"modulationMacro",
					"modulationFrequency_Hz",
					"delay_s",
					"power_W_s",
				].map((a: string, i: number) => 
				a === 'modulationMacro' ? (
					<div className="" key={i}>
						<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
							<UniversalNamedKnob param={a} keyParam={'stages'}/>
						</div>
					</div>
					) : (
					<div className="" key={i}>
						<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
							<UniversalKnob param={a} keyParam={'stages'}/>
						</div>
					</div>
				))}
			</div>
			<div className={'w-100 d-flex d-flex justify-content-evenly ' +  (isVertical ? "mt-10" : "mt-2")}>
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


export default piercingEditStagesPanel;
