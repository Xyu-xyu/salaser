import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import UniversalKnob from './universalKnob';
/*
{
                "pressure": 0,
                "power": 1000,
                	//"enabled": false,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": 1.0,
                "height": 1.0,
                "modulationFrequency_Hz": 10000.0,
                	//"cross_blow": false,
                "modulationMacro": 0
              },

*/

const PiercingEditModalPanel = observer(() => {
	const { isVertical } = viewStore;

	return (
		<>
			<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
				{[
					"pressure",
					"power",
					"delay_s",
					"power_W_s",
				].map((a: string, i: number) => (
					<div className="editModal_row" key={i}>
						<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
							<UniversalKnob param={a} keyParam={'piercingStages'} />
						</div>
					</div>
				))}
			</div>
			<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
				{[
 					 "focus",
					 "height",
					 "modulationFrequency_Hz",
					 "modulationMacro",
				].map((a: string, i: number) => (
					<div className="editModal_row" key={i}>
						<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
							<UniversalKnob param={a} keyParam={'piercingStages'} />
						</div>
					</div>
				))}
			</div>

		</>
	);
});


export default PiercingEditModalPanel;
