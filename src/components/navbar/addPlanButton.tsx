import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import { useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from 'react-i18next';
import laserStore from "../../store/laserStore";
import { showToast } from './../toast';



const AddPlanButton = observer(() => {

	const fileInputRef = useRef<HTMLInputElement>(null);
	const core = 0
	const { t } = useTranslation()
	const { loadResult } = laserStore
	const [files, setFiles] = useState<FileList | null>(null);

	const [show, setShow] = useState(false);

	// Открыть модалку
	const showModal = () => {
		setShow(true);
	}

	// Закрыть модалку
	const handleClose = () => {
		setShow(false)
	};


	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target;
		const selectedFiles = input.files;
		if (!selectedFiles || selectedFiles.length === 0) return;

		setFiles(selectedFiles);
		console.log("📂 Selected file:", selectedFiles);
	};



	return (
		<div className="">
			<div className="m-0">
				<button className={`w-100`} onClick={showModal}>
					<div className="d-flex align-items-center">
						<Icon
							icon="fluent:copy-add-20-regular"
							width="24"
							height="24"
							style={{ color: "black" }}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Add")}</div>
					</div>
				</button>
			</div>

			<Modal
				show={show}
				onHide={handleClose}
				id="addPlanButtonModal"
				className="with-inner-backdrop appPlanButton-navbar-modal addPlanButton-navbar-modal"
				centered={false}
			>
				<div style={{ padding: '.25rem' }}>
					<div
						style={{
							minHeight: 'calc(100vh * 0.5)',
							maxHeight: 'calc(100vh * 0.75)',
							minWidth: 'calc(100vw * 0.5)',
							overflowY: 'auto',
							overflowX: 'hidden',
						}}
					>
						<div className="m-2">
							<button className="violet_button text-white p-2" type="button" onClick={handleClick}>
								<div className="d-flex align-items-center p-2">
									<Icon
										icon="fluent:copy-add-20-regular"
										width="24"
										height="24"
										style={{ color: "white" }}
										className="ms-1"
									/>
									<div className="flex-grow-1 text-center ms-2">{t("Upload")}</div>
								</div>
							</button>

							{/* скрытый input */}
							<input
								type="file"
								ref={fileInputRef}
								hidden
								accept=".ncp,.sgn"   // только файлы с расширением .ncp и .sgn
								multiple
								onChange={handleFileChange}
							/>
						</div>

						<table style={{ width: '100%', borderCollapse: 'collapse' }} className="table table-striped table-hover">
							<thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
								<tr>
									{[
										{ key: "name", label: "Name" },
										{ key: "quantity", label: "Quantity" },
										{ key: "preset", label: "Preset" },
										{ key: "thickness", label: "Thickness" },
										{ key: "material", label: "Material" },
									].map((col) => (
										<th
											style={{
												cursor: "pointer",
												verticalAlign: "middle",
												whiteSpace: "nowrap",
												textAlign: "left",
											}}
										>
											{col.label}
										</th>
									))}
 								</tr>
							</thead>
							<tbody>
								{
									files && Array.from(files).map((item) => (
										<tr>
											<td style={{ verticalAlign: "middle" }}>{item.name}</td>
											<td style={{ verticalAlign: "middle" }}></td>
											<td style={{ verticalAlign: "middle" }}></td>
											<td style={{ verticalAlign: "middle" }}></td>
											<td style={{ verticalAlign: "middle" }}></td>
 										</tr>
									))
								}

							</tbody>
						</table>
					</div>
				</div>
			</Modal>
		</div>
	);
});

export default AddPlanButton;
