import CentralBar from "./centralBar";
import NavBar from "./navbar";
import RightBar from "./rightBar";
import LeftBar from "./leftBar";

const Main = () => {

	return (
		<main id="main" className="w-100 h-100 lightTheme">
			<NavBar />
			<div className="dLine w-100" id="dLine"></div>
				<div className="d-flex flex-row w-100" id="BarContainer">
					<div className="d-flex flex-column" id="MidBarContainer">
 						<div className="d-flex" id="LeftCentralBarContainer">
							<LeftBar />
							<CentralBar />
						</div>  					
					</div>
					<RightBar />
				</div>
		</main>);
};

export default Main;
