import { observer } from 'mobx-react-lite';
import macrosStore from '../store/macrosStore';
import UniversalKnob from './universalKnob';
import IosToggleBlowInStage from './toggles/iosToggleBlowInStage';
import IosToggleMacrosInStage from './toggles/iosToggleMacrosInStage';
import UniversalNamedKnob from './universalNamedKnob';
import UniversalKnobList from './universalKnobList';
import IosToggleBlowInPiercing from './toggles/iosToggleBlowInPiercing';


/* type Param = 'focus' | 'height' | 'pressure' | 'power';
type Param0 = 'initial_focus' | 'initial_height' | 'initial_pressure' | 'initial_power'; */

const data = {
	focus: '#8884d8',
	height: '#82ca9d',
	pressure: '#ffc658',
	power: '#ff7300',
};

const params = ['focus', 'height', 'pressure', 'power'];
const params0 = ['initial_focus', 'initial_height', 'initial_pressure', 'initial_power'];

const data0 = {
	initial_focus: '#8884d8',
	initial_height: '#82ca9d',
	initial_pressure: '#ffc658',
	initial_power: '#ff7300',
};


const PiercingEditStagesPanel = observer(() => {
	const { isVertical, selectedPiercingStage } = macrosStore;

	return (
		<>
			{selectedPiercingStage == 0 ?
				(
					<div className=''>
						<div className={'d-flex justify-content-evenly mt-50'}>
							{params0.map((a, i) => (
								<div className="vidget" key={i+'0'} style={{ border: `2px solid ${data0[a]}` }}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalKnob param={a} keyParam={'piercingMacros'} />
									</div>
								</div>
							))}
						</div>
						<div className={'d-flex justify-content-evenly mt-4'}>

							{[
								"initial_modulationMacro",
							].map((a, i) => (
								<div className="" key={i+'0'}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalNamedKnob param={a} keyParam={'piercingMacros'} />
									</div>
								</div>
							))}
							{[
								"initial_modulationFrequency_Hz",
							].map((a, i) => (
								<div className="" key={i+'0'}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalKnob param={a} keyParam={'piercingMacros'} />
									</div>
								</div>
							))}
							{[
								"gas",
							].map((a, i) => (
								<div className="" key={i +'0'}>
									<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
										<UniversalKnobList param={a} keyParam={'piercingMacros'} />
									</div>
								</div>
							))}
							<div className="">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<IosToggleBlowInPiercing />
								</div>
							</div>
						</div>
					</div>
				) :

				(
					<div className=''>
						<div className={'w-100 d-flex justify-content-evenly mt-50'}>
							{params.map((a, i) => (
								<div className="vidget" key={i+'1'} style={{ border: `2px solid ${data[a]}` }}>
									<div className={isVertical ? 'editModal_col' : 'editModal_col_hor'}>
										<UniversalKnob param={a} keyParam="stages" />
									</div>
								</div>
							))}
						</div>
						<div className={'w-100 d-flex justify-content-evenly mt-4'}>
							{[
								"modulationMacro",
								"modulationFrequency_Hz",
								"delay_s",
								"power_W_s",
							].map((a, i) =>
								a === 'modulationMacro' ? (
									<div className="" key={i+'2'}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<UniversalNamedKnob param={a} keyParam={'stages'} />
										</div>
									</div>
								) : (
									<div className="" key={i+'3'}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<UniversalKnob param={a} keyParam={'stages'} />
										</div>
									</div>
								))}
						</div>
						<div className={'w-100 d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-4" : "mt-2")}>
							<div className="">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<IosToggleBlowInStage />
								</div>
							</div>
							<div className="">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<IosToggleMacrosInStage />
								</div>
							</div>
						</div>
					</div>
				)
			}
		</>
	);
});


export default PiercingEditStagesPanel;
