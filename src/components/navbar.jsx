import { observer } from 'mobx-react-lite';
import PowerButton from "./navbar/powerButton";
import laserStore from "../store/laserStore";
//import utils from "../scripts/util";
import SettingsButton from "./navbar/settingsButton";
//import constants from "../store/constants";
import { showToast } from "./toast";
import FavoritesButton from "./navbar/favoritesButton";
import LanguageButton from "./navbar/languageButton";
import { StartButton } from "./startButton";
import { StartButtonWithDefSettings } from "./startButtonWithDefSettings";
import CustomIcon from "../icons/customIcon";
import jobStore from '../store/jobStore';
import svgStore from '../store/svgStore';

const NavBar = observer(() => {

	const { knobMode, centralBarMode } = laserStore 


	const handleClick = () => {
		laserStore.setVal('knobMode', !knobMode);
	};


	return (
		<div>
			<div id="NavBar" className="w-100 my-1">
				<div className="ms-2">
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
				</div>
				<div className="ms-2">
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
				</div>	
				<div className="ms-2">
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
				</div>
				<div className="ms-2">
					<StartButtonWithDefSettings />
				</div>
				<div className="ms-2">
					<StartButton />
				</div>
				<div className="ms-2">
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
				</div>

				<FavoritesButton />
				<div className="ms-2">
					<button className="white_button navbar_button" onClick={ svgStore.fitToPage }>
						<div className="d-flex align-items-center justify-content-center">
							<CustomIcon icon="fluent:question-circle-12-regular"
								width="36"
								height="36"
								style={{ color: 'black' }}
								viewBox={'0 0 12 12'}
								fill={'black'}
								strokeWidth={0}
							/>
						</div>
					</button>
				</div>
				<SettingsButton />
				<LanguageButton />
				<PowerButton />
			</div>
		</div>
	)
});

export default NavBar;