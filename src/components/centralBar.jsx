import LeftBar from "./leftBar";
import ProgressBarContainer from "./progressBarContainer";
import RightBar from "./rightBar";
import MidBar from "./midBar";

const CentralBar = () => {
	return (

		<div id="CentralBar" className="d-flex  w-100 h-100 flex-start">
			<div className="d-flex w-100 h-100 flex-start flex-column">
				<ProgressBarContainer />
				<div className="d-flex w-100 h-100 flex-start">
					<LeftBar />
					<MidBar />					
				</div>
			</div>
			<RightBar />
		</div>
	)
};

export default CentralBar;
