import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from "mobx-react-lite";
import { useRef, useState } from "react";
import { Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";

type FileData = {
	name: string;
	thickness: number;
	quantity: number;
	preset: string;
	material: string;
	materialLabel: string;
	dimX: number;
	dimY: number;
};

const AddPlanButton = observer(() => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();
	const [files, setFiles] = useState<FileData[]>([]);
	const [show, setShow] = useState(false);

	// Открыть модалку
	const showModal = () => {
		setShow(true);
	};

	// Закрыть модалку
	const handleClose = () => {
		setShow(false);
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target;
		const selectedFiles = input.files;

		if (!selectedFiles || selectedFiles.length === 0) return;

		const fileArray = Array.from(selectedFiles);

		const parseFileContent = (file: File) => {
			return new Promise<FileData>((resolve, reject) => {
				const reader = new FileReader();
				reader.readAsText(file);

				reader.onload = () => {
					const content = reader.result as string;

					try {
						let trunc = truncateStringByLines(content, 10);
						const thickness = getAttribute("Thickness", trunc);
						const label = getAttribute("Label", trunc);
						const materialCode = getAttribute("MaterialCode", trunc);
						const dimX = getAttribute("DimX", trunc);
						const dimY = getAttribute("DimY", trunc);
						const repeat = getAttribute("Repeat", trunc);

						const fileData: FileData = {
							name: file.name,
							thickness: thickness ? parseFloat(thickness) : 0,
							quantity: repeat ? parseInt(repeat) : 1,
							preset: "none",
							material: label || "Неизвестный материал",
							materialLabel: materialCode || "Неизвестный MaterialCode",
							dimX: dimX ? parseInt(dimX) : 0,
							dimY: dimY ? parseInt(dimY) : 0,
						};

						resolve(fileData);
					} catch (err) {
						reject(err);
					}
				};

				reader.onerror = (error) => {
					reject(error);
				};
			});
		};

		const parseAllFiles = async () => {
			try {
				const fileDataPromises = fileArray.map((file) => parseFileContent(file));
				const filesData = await Promise.all(fileDataPromises); // Ждем, пока все файлы не будут обработаны
				setFiles(filesData); // Сохраняем данные в state
				console.log("📂 Извлеченные данные из файлов:", filesData);
			} catch (error) {
				console.error("Ошибка при обработке файлов:", error);
			}
		};

		parseAllFiles();
	};

	const getAttribute = (attr: string, source: string): string | null => {
		const regex = new RegExp(`${attr}="([^"]+)"`, "i");
		const match = source.match(regex);
		return match ? match[1] : null;
	};

	const truncateStringByLines = (text: string, n: number): string => {
		const lines = text.split("\n");
		const truncatedLines = lines.slice(0, n);
		return truncatedLines.join("\n");
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
				<div style={{ padding: ".25rem" }}>
					<div
						style={{
							minHeight: "calc(100vh * 0.5)",
							maxHeight: "calc(100vh * 0.75)",
							minWidth: "calc(100vw * 0.5)",
							overflowY: "auto",
							overflowX: "hidden",
						}}
					>
						<div className="m-2">
							<button
								className="violet_button text-white p-2"
								type="button"
								onClick={handleClick}
							>
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
								accept=".ncp,.sgn" // только файлы с расширением .ncp и .sgn
								multiple
								onChange={handleFileChange}
							/>
						</div>

						<table
							style={{ width: "100%", borderCollapse: "collapse" }}
							className="table table-striped table-hover"
						>
							<thead
								style={{
									position: "sticky",
									top: 0,
									background: "#fff",
									zIndex: 1,
								}}
							>
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
											key={col.key}
										>
											{col.label}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{files &&
									files.map((item, index) => (
										<tr key={index}>
											<td style={{ verticalAlign: "middle" }}>{item.name}</td>
											<td style={{ verticalAlign: "middle" }}>{item.quantity}</td>
											<td style={{ verticalAlign: "middle" }}>{item.preset}</td>
											<td style={{ verticalAlign: "middle" }}>{item.thickness}</td>
											<td style={{ verticalAlign: "middle" }}>{item.material}</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</div>
			</Modal>
		</div>
	);
});

export default AddPlanButton;
