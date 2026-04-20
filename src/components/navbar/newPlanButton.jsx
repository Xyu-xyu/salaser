import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Dropdown, DropdownButton, Modal, Form, Button, InputGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import macrosStore from "../../store/macrosStore";
import CustomIcon from "../../icons/customIcon";
import laserStore from "../../store/laserStore";
import svgStore from "../../store/svgStore";
import jobStore from "../../store/jobStore";
import constants from "../../store/constants";
import { showToast } from "../toast";
import DbPartsSortPanel from "../dbPartsSortPanel";
import partStore from "../../store/partStore";


const NewPlanButton = observer(() => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const { presets } = macrosStore;

	// Форма
	const [name, setName] = useState("new_plan");
	const [width, setWidth] = useState("1000");
	const [height, setHeight] = useState("700");
	const [quantity, setQuantity] = useState("1");
	const [thickness, setThickness] = useState("3");
	const [selectedPreset, setSelectedPreset] = useState(null);

	/** Пустой лист | авто-раскрой через POST /jdb/b7/nest */
	const [creationMode, setCreationMode] = useState("empty");
	const [nestPartRows, setNestPartRows] = useState(() => []);
	const [materialName, setMaterialName] = useState("DC01");
	const [partProtectionGap, setPartProtectionGap] = useState("10");
	const [nestLoading, setNestLoading] = useState(false);

	/** Импорт деталей из БД в B7-раскрой */
	const [showImportDb, setShowImportDb] = useState(false);
	const [importSelectedUuids, setImportSelectedUuids] = useState(() => new Set());

	// Ошибки валидации
	const [errors, setErrors] = useState({
		name: "",
		width: "",
		height: "",
		quantity: "",
		preset: "",
		thickness: "",
		nestParts: "",
		materialName: "",
	});

	useEffect(() => {
		if (!presets.length) macrosStore.fetchPresets();
	}, [/* presets */]);

	const validate = () => {
		const newErrors = {};

		// Name: строка до 50 символов, без спецсимволов (для имени файла)
		if (!name.trim()) {
			newErrors.name = t("Name is required");
		} else if (name.length > 50) {
			newErrors.name = t("Name must be no more than 50 characters");
		} else if (!/^[a-zA-Z0-9а-яА-ЯёЁ _-]+$/.test(name)) {
			newErrors.name = t("Name contains invalid characters (only letters, numbers, space, _, -)");
		}

		// Width: положительное число
		const w = parseFloat(width);
		if (!width || isNaN(w) || w <= 0) {
			newErrors.width = t("Width must be a positive number");
		}

		// Height: положительное число
		const h = parseFloat(height);
		if (!height || isNaN(h) || h <= 0) {
			newErrors.height = t("Height must be a positive number");
		}

		// Quantity: положительное целое число
		const q = parseInt(quantity, 10);
		if (!quantity || isNaN(q) || q <= 0 || !Number.isInteger(q)) {
			newErrors.quantity = t("Quantity must be a positive integer");
		}

		const th = parseFloat(thickness);
		if (!thickness || isNaN(th) || th <= 0) {
			newErrors.thickness = t("Thickness must be a positive number");
		}

		// Preset обязателен
		if (!selectedPreset) {
			newErrors.preset = t("Please select a preset");
		}

		if (creationMode === "b7_nest") {
			const filled = nestPartRows.filter((row) => row.path.trim());
			if (!filled.length) {
				newErrors.nestParts = t("No parts added");
			} else {
				filled.forEach((row) => {
					const idx = nestPartRows.indexOf(row);
					const q = parseInt(row.quantity, 10);
					if (!row.quantity || isNaN(q) || q <= 0 || !Number.isInteger(q)) {
						newErrors[`nestQty_${idx}`] = t("Quantity must be a positive integer");
					}
					const rot = Number(row.rotation);
					if (
						row.rotation !== "" &&
						row.rotation != null &&
						(isNaN(rot) || rot < 0)
					) {
						newErrors[`nestRot_${idx}`] = t("Rotation allowance must be a non-negative number");
					}
				});
			}
			if (!materialName.trim()) {
				newErrors.materialName = t("Material name is required");
			}
			const gap = Number(partProtectionGap);
			if (
				partProtectionGap === "" ||
				partProtectionGap == null ||
				Number.isNaN(gap) ||
				gap < 0
			) {
				newErrors.partProtectionGap = t("Part protection gap must be a non-negative number");
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const buildB7NestConfig = () => {
		const parts = nestPartRows
			.filter((row) => row.path.trim())
			.map((row) => ({
				path: row.path.trim(),
				quantity: parseInt(row.quantity, 10) || 1,
				rotation_allowance: Number(row.rotation) || 90,
			}));
		const w = parseFloat(width);
		const h = parseFloat(height);
		const sheetCount = parseInt(quantity, 10);
		const th = parseFloat(thickness);
		return {
			parts,
			sheets: [{ size_x: w, size_y: h, count: sheetCount }],
			material: {
				thickness: th,
				name: materialName.trim() || "Steel",
			},
			nesting: {
				part_protection_gap: Number(partProtectionGap) || 0,
				plan_name: name.trim() || `PLAN_${w}x${h}`,
			},
		};
	};

	const nestRequestPreview = useMemo(
		() => JSON.stringify({ config: buildB7NestConfig() }, null, 2),
		[width, height, quantity, thickness, materialName, nestPartRows]
	);

	const copyNestJson = async () => {
		if (creationMode !== "b7_nest") return;
		const raw = { config: buildB7NestConfig() };
		if (!raw.config.parts.length) {
			showToast({
				type: "error",
				message: t("No parts added"),
			});
			return;
		}
		try {
			await navigator.clipboard.writeText(JSON.stringify(raw, null, 2));
			showToast({ type: "success", message: t("Nest JSON copied to clipboard") });
		} catch {
			showToast({ type: "error", message: t("Could not copy to clipboard") });
		}
	};

	/** Пустой лист: данные в svgStore и переход в редактор плана */
	const applyEmptySheetToStore = () => {
		const res = {
			name: name.trim(),
			width: parseFloat(width),
			height: parseFloat(height),
			quantity: parseInt(quantity, 10),
			thickness: parseFloat(thickness),
			presetId: selectedPreset.id,
			presetName: selectedPreset.name,
			part_code: [],
			positions: [],
			b7NestMeta: null,
		};

		for (const key in res) {
			svgStore.setVal("svgData", key, res[key]);
		}
		laserStore.setVal("centralBarMode", "planEditor");
		jobStore.setVal("selectedId", "newSheet");
		handleClose();
	};

	const handleSubmit = async () => {
		if (!validate()) return;

		if (creationMode === "empty") {
			applyEmptySheetToStore();
			return;
		}

		const config = buildB7NestConfig();
		if (!config.parts.length) {
			setErrors((prev) => ({
				...prev,
				nestParts: t("No parts added"),
			}));
			return;
		}

		if (!constants.SERVER_URL) {
			showToast({ type: "error", message: t("Server URL is not configured") });
			return;
		}

		setNestLoading(true);
		let nestOk = false;
		try {
			const resp = await fetch(`${constants.SERVER_URL}/jdb/b7/nest`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ config }),
			});
			let data = {};
			try {
				data = await resp.json();
			} catch {
				data = {};
			}
			if (!resp.ok) {
				const msg =
					(typeof data?.error === "string" && data.error) ||
					resp.statusText ||
					t("Nest request failed");
				showToast({ type: "error", message: msg });
			} else if (data.status !== "ok") {
				const msg =
					(typeof data?.error === "string" && data.error) || t("Nest request failed");
				showToast({ type: "error", message: msg });
			} else {
				showToast({ type: "success", message: t("Nest completed successfully") });
				nestOk = true;
			}
		} catch (e) {
			console.error(e);
			showToast({ type: "error", message: t("Nest request failed") });
		} finally {
			setNestLoading(false);
		}

		handleClose();
		if (nestOk) {
			await jobStore.loadJobs();
		}
	};

	const handleClose = () => {
		setShow(false);
		// Сброс формы
		setName("");
		setWidth("");
		setHeight("");
		setQuantity("");
		setThickness("");
		setSelectedPreset(null);
		setCreationMode("empty");
		setNestPartRows([]);
		setMaterialName("DC01");
		setPartProtectionGap("10");
		setNestLoading(false);
		setErrors({
			name: "",
			width: "",
			height: "",
			quantity: "",
			preset: "",
			thickness: "",
			nestParts: "",
			materialName: "",
			partProtectionGap: "",
		});
	};

	const addNestPartRow = () => {
		setNestPartRows((rows) => [
			...rows,
			{ id: `p_${Date.now()}_${rows.length}`, path: "", quantity: "1", rotation: "90" },
		]);
	};

	const openDbPartsImport = async () => {
		setImportSelectedUuids(new Set());
		setShowImportDb(true);
		try {
			await partStore.loadDbParts();
		} catch (e) {
			console.error(e);
		}
	};

	const toggleImportUuid = (uuid) => {
		const key = String(uuid);
		setImportSelectedUuids((prev) => {
			const next = new Set(prev);
			if (next.has(key)) next.delete(key);
			else next.add(key);
			return next;
		});
	};

	const confirmImportFromDb = () => {
		if (!importSelectedUuids.size) {
			showToast({ type: "error", message: t("No parts selected") });
			return;
		}

		const baseDir = "parts";
		const byUuid = new Map(
			(partStore.dbParts || [])
				.filter((p) => p && p.uuid != null)
				.map((p) => [String(p.uuid), p])
		);
		const newRows = Array.from(importSelectedUuids).map((uuid) => {
			const row = byUuid.get(String(uuid));
			const partCode = row?.name != null && String(row.name).trim() !== ""
				? String(row.name).trim()
				: null;
			const suffix = partCode ? `:${partCode}` : "";

			return {
				id: `p_${Date.now()}_${uuid}`,
				path: `${baseDir}/${uuid}/part.ncp${suffix}`,
				quantity: "1",
				rotation: "90",
			};
		});

		setNestPartRows((rows) => [...rows, ...newRows]);
		setShowImportDb(false);
	};

	const removeNestPartRow = (id) => {
		setNestPartRows((rows) =>
			rows.length <= 1 ? rows : rows.filter((r) => r.id !== id)
		);
	};

	const updateNestPartRow = (id, field, value) => {
		setNestPartRows((rows) =>
			rows.map((r) => (r.id === id ? { ...r, [field]: value } : r))
		);
	};

	const showModal = () => setShow(true);

	return (
		<div>
			<button className="w-100" onClick={showModal}>
				<div className="d-flex align-items-center">
					<CustomIcon
						icon="fluent:tab-new-24-filled"
						width="24"
						height="24"
						color="black"
						viewBox="0 0 24 24"
						strokeWidth={0}
						className="ms-1"
						fill="black"
					/>
					<div className="flex-grow-1 text-center">{t("New")}</div>
				</div>
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				id="newPlanButtonModal"
				className="with-inner-backdrop"
				centered
				size="lg"
			>
				<Modal.Header closeButton>
					<Modal.Title>
						{t("New sheet")}
						{creationMode === "b7_nest" && (
							<span className="text-muted fw-normal ms-2 small">
								— {t("B7 auto nest")}
							</span>
						)}
					</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
						<Form.Group className="mb-3">
							<Form.Label>{t("Sheet creation mode")}</Form.Label>
							<div>
								<Form.Check
									inline
									type="radio"
									id="newSheetModeEmpty"
									name="creationMode"
									label={t("Empty sheet (no parts)")}
									checked={creationMode === "empty"}
									onChange={() => setCreationMode("empty")}
								/>
								<Form.Check
									inline
									type="radio"
									id="newSheetModeB7"
									name="creationMode"
									label={t("Backend B7 nest (server paths)")}
									checked={creationMode === "b7_nest"}
									onChange={() => setCreationMode("b7_nest")}
								/>
							</div>
							{creationMode === "b7_nest" && (
								<Form.Text className="d-block text-muted">
									{t("b7_nest_path_hint")}
								</Form.Text>
							)}
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>{t("Sheet name")} *</Form.Label>
							<Form.Control
								type="text"
								value={name}
								onChange={(e) => setName(e.target.value)}
								isInvalid={!!errors.name}
								placeholder={t("Enter name (up to 50 characters)")}
								maxLength={50}
							/>
							<Form.Control.Feedback type="invalid">
								{errors.name}
							</Form.Control.Feedback>
						</Form.Group>

						<div className="row">
							<div className="col-md-6">
								<Form.Group className="mb-3">
									<Form.Label>{t("Width (mm)")} *</Form.Label>
									<Form.Control
										type="number"
										value={width}
										onChange={(e) => setWidth(e.target.value)}
										isInvalid={!!errors.width}
										min="0.1"
										step="0.1"
									/>
									<Form.Control.Feedback type="invalid">
										{errors.width}
									</Form.Control.Feedback>
								</Form.Group>
							</div>

							<div className="col-md-6">
								<Form.Group className="mb-3">
									<Form.Label>{t("Height (mm)")} *</Form.Label>
									<Form.Control
										type="number"
										value={height}
										onChange={(e) => setHeight(e.target.value)}
										isInvalid={!!errors.height}
										min="0.1"
										step="0.1"
									/>
									<Form.Control.Feedback type="invalid">
										{errors.height}
									</Form.Control.Feedback>
								</Form.Group>
							</div>
						</div>


						<div className="row">
							<div className="col-md-6">
								<Form.Group className="mb-3">
									<Form.Label>{t("Quantity")} *</Form.Label>
									<Form.Control
										type="number"
										value={quantity}
										onChange={(e) => setQuantity(e.target.value)}
										isInvalid={!!errors.quantity}
										min="1"
										step="1"
									/>
									<Form.Control.Feedback type="invalid">
										{errors.quantity}
									</Form.Control.Feedback>
								</Form.Group>

							</div>
							<div className="col-md-6">
								<Form.Group className="mb-3">
									<Form.Label>{t("Thickness")} *</Form.Label>
									<Form.Control
										type="number"
										value={thickness}
										onChange={(e) => setThickness(e.target.value)}
										isInvalid={!!errors.thickness}
										min="1"
										step="0.1"
									/>
									<Form.Control.Feedback type="invalid">
										{errors.thickness}
									</Form.Control.Feedback>
								</Form.Group>
							</div>
						</div>

						{creationMode === "b7_nest" && (
							<>
								<Form.Group className="mb-3">
									<Form.Label>{t("Nest material name (b7)")} *</Form.Label>
									<Form.Control
										type="text"
										value={materialName}
										onChange={(e) => setMaterialName(e.target.value)}
										isInvalid={!!errors.materialName}
										placeholder={t("e.g. Steel")}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.materialName}
									</Form.Control.Feedback>
								</Form.Group>

								<Form.Group className="mb-3">
									<Form.Label>{t("Part protection gap (mm)")} *</Form.Label>
									<Form.Control
										type="number"
										min="0"
										step="0.1"
										value={partProtectionGap}
										onChange={(e) => setPartProtectionGap(e.target.value)}
										isInvalid={!!errors.partProtectionGap}
									/>
									<Form.Control.Feedback type="invalid">
										{errors.partProtectionGap}
									</Form.Control.Feedback>
								</Form.Group>

								<Form.Group className="mb-3">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<Form.Label className="mb-0">{t("Parts for nesting")}</Form.Label>
										<Button
											variant="outline-secondary"
											size="sm"
											type="button"
											onClick={openDbPartsImport}
										>
											{t("Add part")}
										</Button>
									</div>
									{errors.nestParts && (
										<div className="text-danger small mb-2">{errors.nestParts}</div>
									)}
									{nestPartRows.map((row) => (
										<InputGroup className="mb-2" key={row.id}>
											<div
												className="form-control"
												title={row.path || t("Absolute path on server (DXF, NCP, plan:offset)")}
												style={{
													overflow: "hidden",
													whiteSpace: "nowrap",
													textOverflow: "ellipsis",
													background: "#f8f9fa",
													display: "flex",
													alignItems: "center",
												}}
											>
												{row.path ? (
													row.path
												) : (
													<span className="text-muted">
														{t("Absolute path on server (DXF, NCP, plan:offset)")}
													</span>
												)}
											</div>
											<Form.Control
												style={{ maxWidth: "88px" }}
												type="number"
												min={1}
												title={t("Quantity")}
												value={row.quantity}
												onChange={(e) =>
													updateNestPartRow(row.id, "quantity", e.target.value)
												}
												isInvalid={!!errors[`nestQty_${nestPartRows.indexOf(row)}`]}
											/>
											<Form.Control
												style={{ maxWidth: "88px" }}
												type="number"
												min={0}
												step={90}
												title={t("Rotation allowance (deg)")}
												value={row.rotation}
												onChange={(e) =>
													updateNestPartRow(row.id, "rotation", e.target.value)
												}
												isInvalid={!!errors[`nestRot_${nestPartRows.indexOf(row)}`]}
											/>
											<Button
												variant="outline-danger"
												type="button"
												disabled={nestPartRows.length <= 1}
												onClick={() => removeNestPartRow(row.id)}
											>
												×
											</Button>
										</InputGroup>
									))}
								</Form.Group>

								<Form.Group className="mb-3">
									<div className="d-flex justify-content-between align-items-center mb-2">
										<Form.Label className="mb-0">{t("Request JSON (b7 nest)")}</Form.Label>
										<Button
											variant="outline-primary"
											size="sm"
											type="button"
											onClick={copyNestJson}
										>
											{t("Copy JSON")}
										</Button>
									</div>
									<Form.Control
										as="textarea"
										rows={8}
										readOnly
										className="font-monospace small"
										value={nestRequestPreview}
									/>
								</Form.Group>
							</>
						)}

						<Form.Group className="mb-3">
							<Form.Label>{t("Material / Preset")} *</Form.Label>
							<DropdownButton
								variant={errors.preset ? "outline-danger" : "outline-primary"}
								title={selectedPreset ? selectedPreset.name : t("Select preset")}
								onSelect={(eventKey) => {
									const preset = presets.find(p => p.id === Number(eventKey));
									setSelectedPreset(preset || null);
									if (preset) {
										setErrors(prev => ({ ...prev, preset: "" }));
									}
								}}
							>
								{presets?.map((preset) => (
									<Dropdown.Item
										key={preset.id}
										eventKey={preset.id}
										active={selectedPreset?.id === preset.id}
									>
										{preset.name}  {preset.id }
									</Dropdown.Item>
								)) || <Dropdown.Item disabled>{t("Loading...")}</Dropdown.Item>}
							</DropdownButton>
							{errors.preset && (
								<div className="text-danger mt-1 small">{errors.preset}</div>
							)}
						</Form.Group>
					</Form>
				</Modal.Body>

				<Modal.Footer>

					<button
						className="violet_button text-white p-1 br-5"
						type="button"
						onClick={handleClose}
					>
						<div className="d-flex align-items-center p-2">
							<CustomIcon
							icon="ic:round-cancel"
							width="24"
							height="24"
							color="white"
						/>
						{t("Cancel")}
						</div>
					</button>

			
					<button
						className="violet_button text-white p-1 br-5"
						type="button"
						disabled={nestLoading}
						onClick={handleSubmit}
					>
						<div className="d-flex align-items-center p-2">
							<CustomIcon
							icon="line-md:square-to-confirm-square-transition"
							width="24"
							height="24"
							color="white"
						/>
						{nestLoading
							? t("Nesting…")
							: creationMode === "b7_nest"
								? t("Run nest and open sheet")
								: t("Create")}
						</div>
					</button>
				</Modal.Footer>
			</Modal>

			<Modal
				show={showImportDb}
				onHide={() => setShowImportDb(false)}
				size="xl"
				className="with-inner-backdrop"
				centered
			>
				<Modal.Header closeButton>
					<Modal.Title>{t("Select parts from DB")}</Modal.Title>
				</Modal.Header>
				<Modal.Body
					className="p-0"
					style={{
						minHeight: "min(50vh, 420px)",
						maxHeight: "75vh",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					<div
						className="d-flex flex-column flex-grow-1 px-3 py-2"
						style={{ minHeight: 0, overflow: "hidden" }}
					>
						<DbPartsSortPanel
							multiSelect
							selectedImportUuids={importSelectedUuids}
							onToggleImportUuid={toggleImportUuid}
						/>
					</div>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={() => setShowImportDb(false)}>
						{t("Cancel")}
					</Button>
					<Button variant="primary" onClick={confirmImportFromDb}>
						{t("Add to nesting")}
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
});

export default NewPlanButton;