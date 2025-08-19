import { observer } from "mobx-react-lite";
import viewStore from "../store/viewStore";
import { useTranslation } from 'react-i18next';
import { Icon } from "@iconify/react/dist/iconify.js";
import LaserIcon from "./../../public/images/laserIcon"


const LeftBar = observer(() => {
	const { t } = useTranslation()

	return (
		<>
			<div id="LeftBar">
				<div className="d-flex flex-column">
					<div className="mt-2 mx-2">
						<button className="grey_button navbar_button w-100">
							<div className="d-flex align-items-center justify-content-center">
							<Icon icon="hugeicons:carousel-horizontal-02"
								width="36"
								height="36"
								style={{ color: 'blacl' }} 
							/>
							</div>
						</button>
					</div>
					<div className="mx-2 mt-1">
						<button className="viotet_button navbar_button w-100">
							<div className="d-flex align-items-center justify-content-center">
								<LaserIcon size={60} color="white" strokeWidth={1.5} />
							</div>	
						</button>
					</div>
				</div>
			</div>
		</>
	);
});

export default LeftBar;
