import { observer } from 'mobx-react-lite';
import PowerButton from "./navbar/powerButton";
import laserStore from "../store/laserStore";
//import utils from "../scripts/util";
import SettingsButton from "./navbar/settingsButton";
//import constants from "../store/constants";
import { showToast } from "./toast";
import FavoritesButton from "./navbar/favoritesButton";
import LanguageButton from "./navbar/languageButton";
import TipsButton from "./navbar/tipsButton";
import ConnectionButton from "./navbar/connectionButton.jsx";
import { StartButton } from "./startButton";
import { StartButtonWithDefSettings } from "./startButtonWithDefSettings";
import CustomIcon from "../icons/customIcon";
import jobStore from '../store/jobStore';
import svgStore from '../store/svgStore';
import TooltipCreator from "./editor/panels/tooltipCreator.jsx";

const NavBar = observer(() => {

	const { knobMode, centralBarMode } = laserStore 


	const handleClick = () => {
		laserStore.setVal('knobMode', !knobMode);
	};


	return (
		<div>
			<div id="NavBar" className="w-100 my-1">
				<div className="ms-2">
					<TooltipCreator
						element={{
							id: "navPlans",
							info: (
								<button 
									className={`navbar_button me-1 ${centralBarMode === "plans" ? "violet_button" : "white_button"}` }
									onPointerDown={()=>{laserStore.setVal('centralBarMode', "plans"	)}}>
									<div className="d-flex align-items-center justify-content-center">
										<CustomIcon icon="LaserIcon" 
											width={45} 
											height={45} 
											color={ centralBarMode === "plans" ? "white" : "black" } 
											strokeWidth={1.5} 
											viewBox={'0 0 36 36'} 								
											/>
									</div>
								</button>
							)
						}}
					/>
				</div>
				<div className="ms-2">
					<TooltipCreator
						element={{
							id: "navService",
							info: (
								<button className={`navbar_button me-1 ${centralBarMode === "service" ? "violet_button" : "white_button"}` }
									onPointerDown={()=>{
										laserStore.setVal('centralBarMode', "service"
									)
								}}>
									<div className="d-flex align-items-center justify-content-center">
										<CustomIcon icon="mynaui:grid" 
											width="42" 
											height="42" 
											style={{ color: centralBarMode === "service" ? 'white' : "black"}} 
											strokeWidth={1.25} 								
										/>
									</div>
								</button>
							)
						}}
					/>
				</div>

				{/* LONG button start */}
				<div className="ms-4 w-100" id='longButton'>
					<h5 className="m-0"></h5>
				</div>

				{/* LONG button end */}

{/* 				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<CustomIcon icon="fluent:play-circle-28-regular"
								width="36"
								height="36"
								style={{ color: 'black' }}
							/>
						</div>
					</button>
				</div> */}
				<div className="ms-2">
					<TooltipCreator
						element={{
							id: "navClearCuttingFlags",
							info: (
								<button 
									className={`white_button navbar_button me-1` }
									onPointerDown={()=>{jobStore.clearAllCuttingFlags()}}>
									<div className="d-flex align-items-center justify-content-center">
										<CustomIcon icon="finnish" 
											width={48} 
											height={48} 
											color={ "black" } 
											fill='black'
											strokeWidth={0} 
											viewBox={'0 0 32 32'} 								
											/>
									</div>
								</button>
							)
						}}
					/>
				</div>	
				<div className="ms-2">
					<TooltipCreator
						element={{
							id: "navKnobMode",
							info: (
								<button className={`${knobMode ? "violet_button" : "white_button"} navbar_button`} onPointerDown={handleClick}>
									<div className="d-flex align-items-center justify-content-center">
										<CustomIcon icon="fluent:text-box-settings-24-regular"
											width="36"
											height="36"
											style={{ color: knobMode ? 'white' : 'black' }}
											fill={ knobMode ? 'white' : 'black'} 
											strokeWidth={0}
										/>
									</div>
								</button>
							)
						}}
					/>
				</div>
				<div className="ms-2">
					<TooltipCreator
						element={{
							id: "navStartWithDefaults",
							info: (
								<span className="d-inline-flex">
									<StartButtonWithDefSettings />
								</span>
							)
						}}
					/>
				</div>
				<div className="ms-2">
					<TooltipCreator
						element={{
							id: "navStart",
							info: (
								<span className="d-inline-flex">
									<StartButton />
								</span>
							)
						}}
					/>
				</div>
				<div className="ms-2">
					<TooltipCreator
						element={{
							id: "navEmergencyStop",
							info: (
								<button className="white_button navbar_button" onPointerDown={ ()=>{

										showToast({
											type: 'error',
											message: "Laser stop!",
											position: 'bottom-right',
											autoClose: false
										})
									}
								}>
									<div className="d-flex align-items-center justify-content-center">
										<CustomIcon icon="ic:round-cancel"
											width="36"
											height="36"
											style={{ color: 'red' }}
											fill={'red'}
											strokeWidth={0}
											color={"white"}
											
										/>
									</div>
								</button>
							)
						}}
					/>
				</div>

				<TooltipCreator element={{ id: "navFavorites", info: (<span className="d-inline-flex"><FavoritesButton /></span>) }} />
				<TooltipCreator element={{ id: "navTips", info: (<span className="d-inline-flex"><TipsButton color={"black"}/></span>) }} />
				<TooltipCreator element={{ id: "navSettings", info: (<span className="d-inline-flex"><SettingsButton /></span>) }} />
				<TooltipCreator element={{ id: "navLanguage", info: (<span className="d-inline-flex"><LanguageButton color={"black"}/></span>) }} />
				<TooltipCreator element={{ id: "navConnection", info: (<span className="d-inline-flex"><ConnectionButton /></span>) }} />
				<TooltipCreator element={{ id: "navPower", info: (<span className="d-inline-flex"><PowerButton /></span>) }} />
			</div>
		</div>
	)
});

export default NavBar;