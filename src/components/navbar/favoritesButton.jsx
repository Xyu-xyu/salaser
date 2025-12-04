import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import { showToast } from "../toast";
import { useTranslation } from "react-i18next";
import CustomIcon from "../../icons/customIcon";

 
const FavoritesButton = observer(() => {
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const showModal = () => setShow(true);
	const { t } = useTranslation();

	const handleClick = (label) => {
		console.log(`Clicked on ${label}`);
		showToast({
			type: "success",
			message: `Clicked on ${label}`,
			position: "bottom-right",
			autoClose: 2500,
		});
	};

 	const menuData = {
		"Cutting head": [
			{ icon: "carbon:calibrate", onClick: () => handleClick("Calibrate"), text: "Calibrate", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 32 32"},
			{ icon: "solar:wind-outline", onClick: () => handleClick("Clean"), text: "Clean", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 24 34"},
		],
		"Shuttle table": [
			{ icon: "fluent:hand-left-16-regular", onClick: () => handleClick("Manual operation"), text: "Manual operation", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 16 16"  },
			{ icon: "icon-park:switch-contrast", onClick: () => handleClick("Switch"), text: "Switch", color:"black", fill:"none", strokeWidth: 2.5, viewBox:" 0 0 48 48"},
			{ icon: "mdi:truck", onClick: () => handleClick("Move aside"), text: "Move aside", color:"white", fill:"black", strokeWidth:1, viewBox:" 0 0 24 24"   },
		],
		"Machine": [
			{ icon: "fluent:hand-left-16-regular", onClick: () => handleClick("Manual operation"), text: "Manual operation", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 16 16"  },
			{ icon: "fluent:wrench-screwdriver-24-regular", onClick: () => handleClick("Service"), text: "Service" , color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 24 24" },
			{ icon: "parking", onClick: () => handleClick("Park"), text: "Park", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 24 24"},
			{ icon: "mdi:map-marker", onClick: () => handleClick("Move to reference"), text: "Move to reference", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 24 24"  },
			{ icon: "mdi:target", onClick: () => handleClick("Shift origin"), text: "Shift origin", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 24 24"  },
			{ icon: "wpf:cut-paper", onClick: () => handleClick("Separation cut"), text: "Separation cut" , color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 26 26" },
			{ icon: "solar:heart-pulse-linear", onClick: () => handleClick("Test"), text: "Test", color:"black", fill:"none", strokeWidth:1.5, viewBox:" 0 0 24 24"  },
		],
	};
	

	const MenuButton = ({ icon, onClick, text, color, strokeWidth, fill, viewBox }) => (
		<div>
			<button className="w-100 m-1" onClick={onClick}>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon
						icon={icon}  // ← теперь icon — это точный литерал, а не string!
						color={color} 
						strokeWidth={strokeWidth}
						fill={fill}
						viewBox={viewBox}
						className="ms-2"
					/>
					<div className="flex-grow-1 text-center">
						<h6 className="m-0 p-0">{t(text)}</h6>
					</div>
				</div>
			</button>
		</div>
	);

	const MenuSection = ({ title, items }) => (
		<div className="col-4 my-4 mx-1 d-flex flex-column">
			<div>
				<h4 className="ms-2 text-xs font-bold text-gray-500 uppercase mb-2">
					{t(title)}
				</h4>
			</div>
			<div className="d-flex flex-column w-100">
				{items.map((item, index) => (
					<MenuButton key={index} {...item} />
				))}
			</div>
		</div>
	);

	return (
		<div className="ms-2">
			<button
				className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`}
				onClick={showModal}
			>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon
						icon="fluent:star-16-regular"
						width="36"
						height="36"
						style={{ color: show ? "white" : "black" }}
						viewBox="0 0 16 16"
						fill="black"
						strokeWidth={0.1}
					/>
				</div>
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				id="favoritesButtonModal"
				className="with-inner-backdrop powerButton-navbar-modal favoritesButton-navbar-modal"
				centered={false}
			>
				<div style={{ padding: ".25rem" }}>
					<div
						style={{
							minHeight: "calc(100vh * 0.5)",
							maxHeight: "calc(100vh * 0.75)",
							minWidth: "calc(100vw * 0.5)",
							overflowY: "auto",
							overflowX: "hidden",
						}}
						className="d-flex"
					>
						{Object.entries(menuData).map(([title, items]) => (
							<MenuSection key={title} title={title} items={items} />
						))}
					</div>
				</div>
			</Modal>
		</div>
	);
});

export default FavoritesButton;