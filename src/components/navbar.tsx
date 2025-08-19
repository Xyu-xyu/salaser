import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../store/viewStore";
import PowerButton from "./navbar/powerButton";
import LaserIcon from "../../public/images/laserIcon";

const NavBar = observer(() => {

	const { knobMode, rightMode } = viewStore
	const handleClick = () => {
		viewStore.setKnobMode(!knobMode);
	};

	const handleClickRightMode = () => {
		viewStore.setRightMode(!rightMode);
	};


	return (
		<div>
			<div id="NavBar" className="w-100 mt-1">
				<div className="ms-2">
					<button className="violet_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<LaserIcon size={45} color="white" strokeWidth={1.5} />
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
						<Icon icon="mynaui:grid" width="48" height="48"  style={{color: 'black'}} strokeWidth={0.5}/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button">
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="material-symbols:cancel-outline"
								width="36"
								height="36"
								style={{ color: 'black' }}
							/>
						</div>
					</button>
				</div>

				{/* LONG button start */}
				<div className="ms-4 w-100" id='longButton'>
					<h5 className="m-0">Produce</h5>
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
							<Icon icon="fluent:wrench-16-regular"
								width="36"
								height="36"
								style={{ color: knobMode ? 'white':'red' }}
							/>
						</div>
					</button>
				</div>
				<div className="ms-2">
					<button className="white_button navbar_button">
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
					<button className="white_button navbar_button">
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
							<Icon icon="fluent:star-16-regular"
								width="36"
								height="36"
								style={{ color: rightMode ? 'white' : 'black' }}
							/>
						</div>
					</button>
				</div>
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
				<PowerButton />
			</div>
		</div>
	)
});

export default NavBar;


//fluent:question-circle-12-regular