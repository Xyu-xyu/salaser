import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
import CustomIcon from "../icons/customIcon";


const LeftBar = observer(() => {
	const { leftMode } = laserStore

	return (
		<>
			<div id="LeftBar">
				<div className="d-flex flex-column">
					<div className="mt-2 mx-2"					
						onClick={()=> {
							console.log ("clack")
							laserStore.setVal ('rightMode', 'plan')
							laserStore.setVal ('leftMode', 'plan')
						}}
					>
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
					</div>
					<div className="mx-2 mt-1"
						onClick={()=> {
							console.log ("click")
							laserStore.setVal ('rightMode', 'parameter')
							laserStore.setVal ('leftMode', 'sheet')
						}} 
					>
						<button 							
							className={`${leftMode !== 'plan' ? "viotet_button" :"grey_button"} navbar_button w-100`}>
							<div className="d-flex align-items-center justify-content-center">
								<CustomIcon 
									viewBox={'0 0 36 36'} 								
									icon="LaserIcon" 
									width={60} height={60} 
									style={{ color: leftMode !== 'plan'? "white": 'black' }} 
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
