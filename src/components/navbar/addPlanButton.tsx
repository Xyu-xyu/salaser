import { observer } from "mobx-react-lite";
import { useEffect, useRef, useState } from "react";
import { Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import constants from "../../store/constants";
import { showToast } from "../toast";
import macrosStore from "../../store/macrosStore";
import jobStore from "../../store/jobStore";
import CustomIcon from "../../icons/customIcon";

type FileData = {
	name: string;
	thickness: number;
	quantity: number;
	preset: number | null;
	material: string;
	materialLabel: string;
	dimX: number;
	dimY: number;
	file: any;
};


const AddPlanButton = observer(() => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const { t } = useTranslation();
	const [files, setFiles] = useState<FileData[]>([]);
	const [show, setShow] = useState(false);
	const { presets } = macrosStore
	useEffect(() => {
		if (!presets) macrosStore.fetchPresets();
	}, [])



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
		console.log("handleFileChange")
		const input = e.target;
		const selectedFiles = input.files;

		if (!selectedFiles || selectedFiles.length === 0) return;

		const fileArray = Array.from(selectedFiles);
		const parseFileContent = (file: File) => {
			return new Promise<FileData>((resolve, reject) => {
				const readerText = new FileReader();
				const readerBase64 = new FileReader();

				let textContent: string | null = null;
				let base64File: string | null = null;

				// Проверяем, готовы ли оба результата
				const tryResolve = () => {
					if (textContent && base64File) {
						const trunc = truncateStringByLines(textContent, 10);

						const fileData: FileData = {
							name: file.name,
							thickness: getAttribute("Thickness", trunc) ? parseFloat(getAttribute("Thickness", trunc)!) : 0,
							quantity: getAttribute("Repeat", trunc) ? parseInt(getAttribute("Repeat", trunc)!) : 1,
							preset: null,
							material: getAttribute("Label", trunc) || "Неизвестный материал",
							materialLabel: getAttribute("MaterialCode", trunc) || "Неизвестный MaterialCode",
							dimX: getAttribute("DimX", trunc) ? parseInt(getAttribute("DimX", trunc)!) : 0,
							dimY: getAttribute("DimY", trunc) ? parseInt(getAttribute("DimY", trunc)!) : 0,
							file: base64File
						};

						resolve(fileData);
					}
				};

				// === Чтение текста ===
				readerText.onload = () => {
					if (typeof readerText.result === 'string') {
						textContent = readerText.result;
						tryResolve();
					} else {
						reject(new Error("Не удалось прочитать текстовое содержимое файла"));
					}
				};

				// === Чтение base64 ===
				readerBase64.onload = () => {
					if (typeof readerBase64.result === 'string') {
						base64File = readerBase64.result.split(',')[1]; // убираем префикс data:
						tryResolve();
					} else {
						reject(new Error("Не удалось получить base64 файл"));
					}
				};

				readerText.onerror = () => reject(readerText.error);
				readerBase64.onerror = () => reject(readerBase64.error);

				// Запускаем оба чтения
				readerText.readAsText(file);
				readerBase64.readAsDataURL(file);
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


	// Обновленный обработчик для изменения выбранного preset по ID
	const handleMaterialChange = (index: number, presetId: number) => {
		setFiles((prevFiles) =>
			prevFiles.map((file, idx) =>
				idx === index ? { ...file, preset: presetId } : file
			)
		);
	};

	async function clearBase() {
		let resp = await fetch(constants.SERVER_URL + "/jdb/clear_all",
			{
				method: "POST",
				headers: {/* "Content-Type": "application/json" */ },
			});
		resp.json().then(() => {
			console.log("Base cleared")
			jobStore.loadJobs()
		});
	}

	const handleSubmit = () => {
		if (!files.length) {

			showToast({
				type: 'error',
				message: "Files not selected",
				position: 'bottom-right',
				autoClose: 2500
			})
			return
		}

		for (let file of files) {
			if (file?.preset === null) {
				showToast({
					type: 'error',
					message: "Cutting preset not chosen",
					position: 'bottom-right',
					autoClose: 2500
				});
				return;
			}
		}
		addJobs()
	}

	const addJobs = async () => {
		if (!files || files.length === 0) {
			showToast({
				type: 'warning',
				message: 'Нет данных для отправки',
				position: 'bottom-right',
				autoClose: 3000,
			});
			return;
		}

		let hasError = false;

		try {
			for (const [index, jobData] of files.entries()) {
				// jobData — это объект вида { name, thickness, quantity, file: "base64string", ... }

				const response = await fetch(`${constants.SERVER_URL}/jdb/upload_files`, {
					method: 'POST',
					headers: {
						/*'Content-Type': 'application/json',*/
					},
					body: JSON.stringify([jobData]), // отправляем весь объект как JSON
				});

				if (!response.ok) {
					hasError = true;
					const errorData = await response.json().catch(() => ({}));
					showToast({
						type: 'error',
						message: errorData.message || `Ошибка при загрузке файла: ${jobData.name || index + 1}`,
						position: 'bottom-right',
						autoClose: 5000,
					});
					// Продолжаем отправку остальных файлов, но пометим, что была ошибка
					continue;
				}

				// При успехе — можно ничего не делать, или логировать
				console.log(`Файл ${jobData.name} успешно отправлен`);
			}

			// Если ВСЕ файлы успешно загружены
			if (!hasError) {
				showToast({
					type: 'success',
					message: 'Все задания успешно добавлены',
					position: 'bottom-right',
					autoClose: 3000,
				});
				setFiles([]); // очищаем только при полном успехе
			} else {
				showToast({
					type: 'warning',
					message: 'Некоторые задания не были добавлены',
					position: 'bottom-right',
					autoClose: 5000,
				});
			}
		} catch (error) {
			showToast({
				type: 'error',
				message: 'Ошибка сети. Проверьте подключение.',
				position: 'bottom-right',
				autoClose: 5000,
			});
			console.error('Network error:', error);
		} finally {
			// Обновляем список заданий независимо от результата
			await jobStore.loadJobs();
			setTimeout(() => handleClose(), 1000);
		}
	};

	return (
		<div className="">
			<div className="m-0">
				<button className={`w-100`} onClick={showModal}>
					<div className="d-flex align-items-center">
						<CustomIcon
							icon="fluent:copy-add-20-regular"
							width="24"
							height="24"
							style={{ color: "black" }}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Upload")}</div>
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
								className="violet_button text-white p-1 br-5"
								type="button"
								onClick={handleClick}
							>
								<div className="d-flex align-items-center p-2">
									<CustomIcon
										icon="fluent:multiselect-16-filled"
										width="24"
										height="24"
										fill= {"white"}
										strokeWidth={0}
										className="ms-1"
										viewBox="0 0 16 16"
									/>
									<div className="flex-grow-1 text-center ms-2">{t("Select files")}</div>
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
										{ key: "workingArea", label: "Working Area" },
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
											<td style={{ verticalAlign: "middle" }}>

												<Dropdown>
													<DropdownButton
														variant="outline-primary"
														title={presets.find(preset => preset.id === item.preset)?.name || "Select Preset"} // Отображаем имя для текущего preset
														id={`preset-dropdown-${index}`}
														className="w-100"
													>
														{/* Мапим все presets в список */}
														{presets.map((preset, idx) => (
															<Dropdown.Item
																key={idx}
																eventKey={preset.id}
																onClick={() => handleMaterialChange(index, preset.id)}
																active={preset.id === item.preset}
															>
																{preset.name}
															</Dropdown.Item>
														))}
													</DropdownButton>
												</Dropdown>

											</td>
											<td style={{ verticalAlign: "middle" }}>{item.thickness}</td>
											<td style={{ verticalAlign: "middle" }}>{item.material}</td>
											<td style={{ verticalAlign: "middle" }}>{item.dimX} • {item.dimY} mm</td>
										</tr>
									))}
							</tbody>
						</table>
					</div>
				</div>
				<div className="m-2 d-flex justify-content-end">

					<button
						className="violet_button text-white p-1 br-5 me-2"
						type="button"
						onClick={clearBase}
					>
						<div className="d-flex align-items-center p-2">
							<CustomIcon
								icon="material-symbols:delete-outline-sharp"
								width="24"
								height="24"
								fill= {"white"}
								strokeWidth={0}
								className="ms-1"
							/>
							<div className="flex-grow-1 text-center ms-2">{t("Clear Base")}</div>
						</div>
					</button>
					<button
						className="violet_button text-white p-1 br-5"
						type="button"
						onClick={handleSubmit}
					>
						<div className="d-flex align-items-center p-2">
							<CustomIcon
								icon="line-md:square-to-confirm-square-transition"
								width="30"
								height="30"
								strokeWidth={1.5}
								className="0"
								color="white"
							/>
							<div className="flex-grow-1 text-center ms-2">{t("Submit")}</div>
						</div>
					</button>
				</div>
			</Modal>
		</div>
	);
});

export default AddPlanButton;
