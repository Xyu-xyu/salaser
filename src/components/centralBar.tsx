import ProgressBarContainer from "./progressBarContainer";
import RightBar from "./rightBar";

const CentralBar = () => {


	return (

		<div id="CentralBar" className="d-flex  w-100 h-100 flex-start">
			<ProgressBarContainer />
			<RightBar />
		</div>
	)
};

export default CentralBar;
