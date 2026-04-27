import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
import CustomIcon from "../icons/customIcon";
import TooltipCreator from "./editor/panels/tooltipCreator.jsx";


const LeftBar = observer(() => {
	const { leftMode } = laserStore

	return (
		<>
			<div id="LeftBar">
				<div className="d-flex flex-column">
					<div className="mt-2 mx-2"					
						onClick={()=> {
							laserStore.setVal ('rightMode', 'plan')
							laserStore.setVal ('leftMode', 'plan')
						}}
					>
						<TooltipCreator
							element={{
								id: "leftBarPlan",
								info: (
									<button
										className={`${leftMode === 'plan' ? "viotet_button" : "grey_button"} navbar_button w-100`}>
										<div className="d-flex align-items-center justify-content-center">
											<CustomIcon icon="hugeicons:carousel-horizontal-02"
												width="36"
												height="36"
												strokeWidth={1.5}
												color={leftMode === 'plan'? "white":  'black'}
											/>
										</div>
									</button>
								)
							}}
						/>
					</div>
					<div className="mx-2 mt-1"
						onClick={()=> {
							laserStore.setVal ('rightMode', 'plan')
							laserStore.setVal ('leftMode', 'sheet')
						}} 
					>
						<TooltipCreator
							element={{
								id: "leftBarSheet",
								info: (
									<button 							
										className={`${leftMode === 'sheet' ? "viotet_button" :"grey_button"} navbar_button w-100`}>
										<div className="d-flex align-items-center justify-content-center">
											<CustomIcon 
												viewBox={'0 0 36 36'} 								
												icon="LaserIcon" 
												width={60} height={50} 
												style={{ color: leftMode === 'sheet'? "white": 'black' }} 
												strokeWidth={1.5} />
										</div>	
									</button>
								)
							}}
						/>
					</div>
					<div className="mx-2 mt-1"
						onClick={() => {
							laserStore.setVal('rightMode', 'part')
							laserStore.setVal('leftMode', 'part')
						}}
					>
						<TooltipCreator
							element={{
								id: "leftBarPart",
								info: (
									<button
										className={`${leftMode === 'part' ? "viotet_button" : "grey_button"} navbar_button w-100`}
									>
										<div className="d-flex align-items-center justify-content-center">
											<CustomIcon
												icon="shapes"
												viewBox="0 0 24 24"
												width="48"
												height="48"
												strokeWidth={1.2}		
												stroke={leftMode === 'part' ? 'white' : 'black'}
												color={leftMode === 'part' ? 'white' : 'black'}
											/>
										</div>
									</button>
								)
							}}
						/>
					</div>
				</div>
			</div>
		</>
	);
});

export default LeftBar;
