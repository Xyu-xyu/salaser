import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import PowerButton from "./navbar/powerButton";
import LaserIcon from "./../../public/images/laserIcon"
import laserStore from "../store/laserStore";
//import utils from "../scripts/util";
import SettingsButton from "./navbar/settingsButton";
import constants from "../store/constants";
import { showToast } from "./toast";
import FavoritesButton from "./navbar/favoritesButton";
import LanguageButton from "./navbar/languageButton";

const NavBar = observer(() => {

	const { rightMode, knobMode, centralBarMode } = laserStore


	const handleClick = () => {
		laserStore.setVal('knobMode', !knobMode);
	};

	const handleClickRightMode = () => {
		laserStore.setVal('rightMode', !rightMode);
	};

	const execute = async () => {
		
		try {
			
			let req_resp = await fetch(`http://${constants.SERVER_URL}/api/gcore/${0}/execute`, {	
				method: "GET",
				headers: {},
			});


			if (req_resp.ok) {
				const text = await req_resp.text();
				console.debug(`Execute: [${text}]`);
				showToast({
					type: 'success',
					message: "Execution started",
					position: 'bottom-right',
					autoClose: 2500
				});
				console.log ( "Execution started: " + req_resp.statusText )
				return;
			}

		} catch (exc: any) {

			showToast({
				type: 'error',
				message: "Execution error",
				position: 'bottom-right',
				autoClose: 2500
			});
			console.log ("Execution error:" + exc.message)
		}
	}

 

	return (
		<div>
			<div id="NavBar" className="w-100 mt-1">
				<div className="ms-2">
					<button 
						className={`navbar_button me-1 ${centralBarMode === "plans" ? "violet_button" : "white_button"}` }
						onPointerDown={()=>{laserStore.setVal('centralBarMode', "plans"	)}}>
						<div className="d-flex align-items-center justify-content-center">
							<LaserIcon 
								size={45} 
								color={ centralBarMode === "plans" ? "white" : "black"} 
								strokeWidth={1.5} 
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
							<Icon icon="mynaui:grid" 
								width="48" 
								height="48" 
								style={{ color: centralBarMode === "service" ? 'white' : "black" }} 
								strokeWidth={0.5} 								
							/>
						</div>
					</button>
				</div>

				{/* LONG button start */}
				<div className="ms-4 w-100" id='longButton'>
					<h5 className="m-0"></h5>
				</div>

				{/* LONG button end */}

				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:play-circle-28-regular"
								width="36"
								height="36"
								style={{ color: 'black' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className={`${knobMode ? "violet_button" : "white_button"} navbar_button`} onPointerDown={handleClick}>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:text-box-settings-24-regular"
								width="36"
								height="36"
								style={{ color: knobMode ? 'white' : 'black' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button" onPointerDown={execute}>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:laser-tool-20-filled"
								width="36"
								height="36"
								style={{ color: 'red' }}
							/>
						</div>
					</button>
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
							<Icon icon="ic:round-cancel"
								width="36"
								height="36"
								style={{ color: 'red' }}
							/>
						</div>
					</button>
				</div>

				<div className="ms-2">
					<button className={`${rightMode ? "violet_button" : "white_button"} navbar_button`} onPointerDown={handleClickRightMode}>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="ph:function-bold"
								width="36"
								height="36"
								style={{ color: rightMode ? 'white' : 'black' }}
							/>
						</div>
					</button>
				</div>
				<FavoritesButton />
				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="fluent:question-circle-12-regular"
								width="36"
								height="36"
								style={{ color: 'black' }}
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