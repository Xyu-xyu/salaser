import { Icon } from "@iconify/react/dist/iconify.js";
import { showToast } from "./toast";
import { useTranslation } from "react-i18next";


export default function serviceBar() {
	// группируем кнопки по рядам
	const { t } = useTranslation()
	const items = [
		{ name: "machine", icon: "fluent:hand-left-16-regular", onClick: () => handleClick("machine") },
		{ name: "laser module", icon: "game-icons:laser-warning", onClick: () => handleClick("laser module") },
		{ name: "IPC diagnostics", icon: "material-symbols:monitor-heart-outline-rounded", onClick: () => handleClick("IPC diagnostics") },
		{ name: "cutting head", icon: "fluent:laser-tool-20-regular", onClick: () => handleClick("cutting head") },
		{ name: "manage", icon: "streamline-plump:code-monitor-2", onClick: () => handleClick("manage") },
		{ name: "operation log", icon: "hugeicons:book-edit", onClick: () => handleClick("operation log") },
		{ name: "pallet change", icon: "icon-park:switch-contrast", onClick: () => handleClick("pallet change") },
		{ name: "motion control", icon: "streamline-plump:code-monitor-2", onClick: () => handleClick("motion control") }
	];

	const handleClick = (label: string): void => {
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
						{row.map(({ name, icon, onClick }) => (
							<div key={name} className="p-2">
								<button className="w-100 white_button" onClick={onClick}>
									<div className="d-flex flex-column align-items-center justify-content-center">
										<div>
											<Icon
												icon={icon}
												width="72"
												height="72"
												style={{ color: "black" }}
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
