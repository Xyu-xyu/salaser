import { observer } from "mobx-react-lite";
import viewStore from "../store/viewStore";
import ProgressBarContainer from "./progressBarContainer";
import RightBar from "./rightBar";

const CentralBar = observer(() => {


	return (

		<div id="CentralBar" className="d-flex  w-100 h-100 flex-start">
			<ProgressBarContainer />
			<RightBar />
		</div>
	)
});

export default CentralBar;
