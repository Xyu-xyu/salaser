import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
import { Icon } from "@iconify/react/dist/iconify.js";
import LaserIcon from "./../../public/images/laserIcon"


const LeftBar = observer(() => {
	const { leftMode } = laserStore

	return (
		<>
			<div id="LeftBar">
				<div className="d-flex flex-column">
					<div className="mt-2 mx-2">
						<button
							onClick={()=> {
								laserStore.setVal ('rightMode', 'plan')
								laserStore.setVal ('leftMode', 'plan')
							}} 
							className={`${leftMode === 'plan' ? "viotet_button" : "grey_button"} navbar_button w-100`}>
							<div className="d-flex align-items-center justify-content-center">
							<Icon icon="hugeicons:carousel-horizontal-02"
								width="36"
								height="36"
								color={leftMode === 'plan'? "white":  'black'}
							/>
							</div>
						</button>
					</div>
					<div className="mx-2 mt-1">
						<button 
							onClick={()=> {
								laserStore.setVal ('rightMode', 'parameter')
								laserStore.setVal ('leftMode', 'sheet')
							}} 
							className={`${leftMode !== 'plan' ? "viotet_button" :"grey_button"} navbar_button w-100`}>
							<div className="d-flex align-items-center justify-content-center">
								<LaserIcon size={60} 
								color={leftMode !== 'plan'? "white":  'black'}
								strokeWidth={1.5} />
							</div>	
						</button>
					</div>
				</div>
			</div>
		</>
	);
});

export default LeftBar;
