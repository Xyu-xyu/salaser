import CustomIcon from "../icons/customIcon";
import { showToast } from "./toast";
import { useTranslation } from "react-i18next";


export default function serviceBar() {
	// группируем кнопки по рядам
	const { t } = useTranslation()
	const items = [
		{ name: "machine", icon: "fluent:hand-left-16-regular", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 16 16", onClick: () => handleClick("machine") },
		{ name: "laser module", icon: "game-icons:laser-warning", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 512 512",onClick: () => handleClick("laser module") },
		{ name: "IPC diagnostics", icon: "material-symbols:monitor-heart-outline-rounded", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 36 36", onClick: () => handleClick("IPC diagnostics") },
		{ name: "cutting head", icon: "fluent:laser-tool-20-regular", color:"black", fill:"black", strokeWidth:0, viewBox:" 0 0 20 20",onClick: () => handleClick("cutting head") },
		{ name: "manage", icon: "streamline-plump:code-monitor-2", color:"black", fill:"none", strokeWidth: 2.5, viewBox:" 0 0 48 48", onClick: () => handleClick("manage") },
		{ name: "operation log", icon: "hugeicons:book-edit", color:"black", fill:"white", strokeWidth:1.5, viewBox:" 0 0 36 36", onClick: () => handleClick("operation log") },
		{ name: "pallet change", icon: "icon-park:switch-contrast", color:"black", fill:"white", strokeWidth: 2.5, viewBox:" 0 0 48 48", onClick: () => handleClick("pallet change") },
		{ name: "motion control", icon: "streamline-plump:code-monitor-2", color:"black", fill:"none", strokeWidth: 2.5, viewBox:" 0 0 48 48", onClick: () => handleClick("motion control") }
	];


	const handleClick = (label) => {
		console.log(`Clicked on ${label}`);
		showToast({
			type: 'success',
			message: `Clicked on ${label}`,
			position: 'bottom-right',
			autoClose: 2500
		});
	};

	const rows = [
		items.slice(0, 3),
		items.slice(3, 6),
		items.slice(6, 8)
	];


	return (

		<div className="w-100" id="serviceBar">
			<div className="ms-2 my-4">
			{/* 	<h2>Modul</h2> */}
			</div>
			<div className="d-flex">
				{rows.map((row, i) => (
					<div key={i} className="d-flex flex-column col-4">
						{row.map(({ name, icon, color, fill, strokeWidth, viewBox, onClick }) => (
							<div key={name} className="p-2">
								<button className="w-100 white_button" onClick={onClick}>
									<div className="d-flex flex-column align-items-center justify-content-center">
										<div>
											<CustomIcon
												icon={icon}
												width="72"
												height="72"
												color={color} 
												strokeWidth={strokeWidth}
												fill={fill}
												viewBox={viewBox}
												className="ms-2"
											/>
										</div>
										<div className="mt-2">
											<h4 className="m-0 p-0">{t(name)}</h4>
										</div>
									</div>
								</button>
							</div>
						))}
					</div>
				))}
			</div>
		</div>

	);
}
