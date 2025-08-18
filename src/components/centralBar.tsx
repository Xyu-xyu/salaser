import { observer } from "mobx-react-lite";
import viewStore from "../store/viewStore";
import ProgressBarContainer from "./progressBarContainer";

const CentralBar = observer(() => {


	return (

		<div id="CentralBar" className="d-flex flex-column w-100 h-100 flex-start">
			<ProgressBarContainer />
		</div>
	)
});

export default CentralBar;
