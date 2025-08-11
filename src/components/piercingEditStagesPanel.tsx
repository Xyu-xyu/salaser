import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import UniversalKnob from './universalKnob';
import IosToggleBlowInStage from './toggles/iosToggleBlowInStage';
import IosToggleMacrosInStage from './toggles/iosToggleMacrosInStage';
import UniversalNamedKnob from './universalNamedKnob';


type Param = 'focus' | 'height' | 'pressure' | 'power';
const data: Record<Param, string> = {
	focus: '#8884d8',
	height: '#82ca9d',
	pressure: '#ffc658',
	power: '#ff7300',
};

const params: Param[] = ['focus', 'height', 'pressure', 'power'];


const piercingEditStagesPanel = observer(() => {
	const { isVertical } = viewStore;

	return (
		<>
			<div className={'w-100 d-flex justify-content-evenly mt-50'}>
				{params.map((a, i) => (
					<div className="vidget" key={i} style={{ border: `2px solid ${data[a]}` }}>
						<div className={isVertical ? 'editModal_col' : 'editModal_col_hor'}>
							<UniversalKnob param={a} keyParam="stages" />
						</div>
					</div>
				))}
			</div>
			<div className={'w-100 d-flex justify-content-evenly '}>
				{[
					"modulationMacro",
					"modulationFrequency_Hz",
					"delay_s",
					"power_W_s",
				].map((a: string, i: number) =>
					a === 'modulationMacro' ? (
						<div className="" key={i}>
							<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
								<UniversalNamedKnob param={a} keyParam={'stages'} />
							</div>
						</div>
					) : (
						<div className="" key={i}>
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
		</>
	);
});


export default piercingEditStagesPanel;
