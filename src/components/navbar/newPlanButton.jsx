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
import HoldStepperNumberInput from "../holdStepperNumberInput.jsx";
import PartSvgImg from "../partSvgImg";


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
	const [showAdvancedB7, setShowAdvancedB7] = useState(false);

	// B7 advanced: sheets/material/nesting defaults
	const [sheetMarginLeft, setSheetMarginLeft] = useState("0");
	const [sheetMarginRight, setSheetMarginRight] = useState("0");
	const [sheetMarginTop, setSheetMarginTop] = useState("0");
	const [sheetMarginBottom, setSheetMarginBottom] = useState("0");
	const [materialAutoParams, setMaterialAutoParams] = useState(false);
	const [materialAutoParamsForce, setMaterialAutoParamsForce] = useState(false);

	const [nestingHoleClearance, setNestingHoleClearance] = useState("");
	const [nestingMinHoleArea, setNestingMinHoleArea] = useState("");
	const [nestingInHoles, setNestingInHoles] = useState(true);
	const [nestingDirection, setNestingDirection] = useState("bottom_to_top");
	const [cutSequence, setCutSequence] = useState("child_first");
	const [shakeCount, setShakeCount] = useState("0");
	const [processingSequenceEnabled, setProcessingSequenceEnabled] = useState(false);
	const [processingSequenceMode, setProcessingSequenceMode] = useState("build_order");
	const [processingSequenceStep, setProcessingSequenceStep] = useState("1");
	const [processingSequenceGroupBySectors, setProcessingSequenceGroupBySectors] =
		useState(false);
	const [processingSequenceSectorX, setProcessingSequenceSectorX] = useState("500");
	const [processingSequenceSectorY, setProcessingSequenceSectorY] = useState("500");

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
					if (
						row.priority !== "" &&
						row.priority != null &&
						String(row.priority).trim() !== ""
					) {
						const pri = parseInt(String(row.priority), 10);
						if (!Number.isInteger(pri) || pri < 1 || pri > 99) {
							newErrors[`nestPrio_${idx}`] = t("Priority must be an integer from 1 to 99");
						}
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
			.map((row) => {
				const prRaw = row.priority;
				const prParsed =
					prRaw === "" || prRaw == null ? 10 : parseInt(String(prRaw), 10);
				const pr =
					Number.isFinite(prParsed) && prParsed > 0
						? Math.min(99, Math.max(1, prParsed))
						: 10;

				const base = {
					path: row.path.trim(),
					quantity: parseInt(row.quantity, 10) || 1,
					rotation_allowance: row.rotation === "" || row.rotation == null
						? null
						: Number(row.rotation) || 0,
					priority: pr,
				};

				if (row.is_filler === true) base.is_filler = true;

				return base;
			});
		const w = parseFloat(width);
		const h = parseFloat(height);
		const sheetCount = parseInt(quantity, 10);
		const th = parseFloat(thickness);
		const config = {
			parts,
			sheets: [{
				size_x: w,
				size_y: h,
				count: sheetCount,
			}],
			material: {
				thickness: th,
				name: materialName.trim() || "Steel",
			},
			nesting: {
				part_protection_gap: Number(partProtectionGap) || 0,
				plan_name: name.trim() || `PLAN_${w}x${h}`,
			},
		};

		if (showAdvancedB7) {
			// sheets margins
			const ml = Number(sheetMarginLeft);
			const mr = Number(sheetMarginRight);
			const mt = Number(sheetMarginTop);
			const mb = Number(sheetMarginBottom);
			if (!Number.isNaN(ml) && ml) config.sheets[0].margin_left = ml;
			if (!Number.isNaN(mr) && mr) config.sheets[0].margin_right = mr;
			if (!Number.isNaN(mt) && mt) config.sheets[0].margin_top = mt;
			if (!Number.isNaN(mb) && mb) config.sheets[0].margin_bottom = mb;

			// material auto params
			if (materialAutoParams) config.material.auto_params = true;
			if (materialAutoParamsForce) config.material.auto_params_force = true;

			// nesting fields
			const hc = nestingHoleClearance === "" ? null : Number(nestingHoleClearance);
			if (hc != null && Number.isFinite(hc)) config.nesting.hole_clearance = hc;

			const mha = nestingMinHoleArea === "" ? null : Number(nestingMinHoleArea);
			if (mha != null && Number.isFinite(mha)) config.nesting.min_hole_area_for_nesting = mha;

			config.nesting.nesting_in_holes = Boolean(nestingInHoles);
			config.nesting.nesting_direction = nestingDirection || "bottom_to_top";
			config.nesting.cut_sequence = cutSequence || "child_first";

			const sc = shakeCount === "" ? null : parseInt(shakeCount, 10);
			if (sc != null && Number.isFinite(sc)) config.nesting.shake_count = sc;

			const stepPs = parseInt(processingSequenceStep, 10);
			const stepVal =
				processingSequenceStep === "" || processingSequenceStep == null
					? 1
					: Number.isFinite(stepPs) && stepPs > 0
						? stepPs
						: 1;
			const sx = Number(processingSequenceSectorX);
			const sy = Number(processingSequenceSectorY);
			config.nesting.processing_sequence = {
				enabled: Boolean(processingSequenceEnabled),
				mode: processingSequenceMode || "build_order",
				step: stepVal,
				group_by_sectors: Boolean(processingSequenceGroupBySectors),
				sector_size_x:
					processingSequenceSectorX === "" || processingSequenceSectorX == null
						? 500
						: Number.isFinite(sx) && sx > 0
							? sx
							: 500,
				sector_size_y:
					processingSequenceSectorY === "" || processingSequenceSectorY == null
						? 500
						: Number.isFinite(sy) && sy > 0
							? sy
							: 500,
			};
		}

		return config;
	};

	const nestRequestPreview = useMemo(
		() => JSON.stringify({ config: buildB7NestConfig() }, null, 2),
		[
			name,
			width,
			height,
			quantity,
			thickness,
			materialName,
			partProtectionGap,
			nestPartRows,
			showAdvancedB7,
			sheetMarginLeft,
			sheetMarginRight,
			sheetMarginTop,
			sheetMarginBottom,
			materialAutoParams,
			materialAutoParamsForce,
			nestingHoleClearance,
			nestingMinHoleArea,
			nestingInHoles,
			nestingDirection,
			cutSequence,
			shakeCount,
			processingSequenceEnabled,
			processingSequenceMode,
			processingSequenceStep,
			processingSequenceGroupBySectors,
			processingSequenceSectorX,
			processingSequenceSectorY,
		]
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
		if (!validate()) {
			const msg =
				Object.values(errors || {}).find((v) => typeof v === "string" && v.trim() !== "") ||
				t("Validation error");
			showToast({ type: "warning", message: msg });
			return;
		}

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
		setShowAdvancedB7(false);
		setSheetMarginLeft("0");
		setSheetMarginRight("0");
		setSheetMarginTop("0");
		setSheetMarginBottom("0");
		setMaterialAutoParams(false);
		setMaterialAutoParamsForce(false);
		setNestingHoleClearance("");
		setNestingMinHoleArea("");
		setNestingInHoles(true);
		setNestingDirection("bottom_to_top");
		setCutSequence("child_first");
		setShakeCount("0");
		setProcessingSequenceEnabled(false);
		setProcessingSequenceMode("build_order");
		setProcessingSequenceStep("1");
		setProcessingSequenceGroupBySectors(false);
		setProcessingSequenceSectorX("500");
		setProcessingSequenceSectorY("500");
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
			{
				id: `p_${Date.now()}_${rows.length}`,
				uuid: null,
				path: "",
				quantity: "1",
				rotation: "90",
				is_filler: false,
				priority: "10",
			},
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
				uuid: String(uuid),
				path: `${baseDir}/${uuid}/part.ncp${suffix}`,
				quantity: "1",
				rotation: "90",
				is_filler: false,
				priority: "10",
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

	const getPartThumbUpdatedAt = (uuid) => {
		if (!uuid) return "";
		const p = partStore.dbParts.find((x) => String(x?.uuid) === String(uuid));
		return String(p?.updated_at ?? p?.updatedAt ?? "");
	};
	const getPartCodeFromPath = (path) => {
		const raw = String(path ?? "");
		const idx = raw.lastIndexOf(":");
		if (idx < 0) return "";
		return raw.slice(idx + 1).trim();
	};

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
				size="xl"
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

				<Modal.Body style={{ maxHeight: "85vh", overflowY: "auto" }}>
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
									{t("Create nesting plan")}
								</Form.Text>
							)}
						</Form.Group>

						



						<div className="row">
							<div className="col-md-6">

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
							</div>

							<div className="col-md-6">
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


							</div>
						</div>

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
								<div className="d-flex justify-content-between align-items-center mb-2">
									<Form.Label className="mb-0">{t("B7 parameters")}</Form.Label>
									<Button
										type="button"
										variant={showAdvancedB7 ? "secondary" : "outline-secondary"}
										size="sm"
										onClick={() => setShowAdvancedB7((v) => !v)}
									>
										{showAdvancedB7 ? t("Hide advanced") : t("Advanced parameters")}
									</Button>
								</div>

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

								{showAdvancedB7 && (
									<>
										<Form.Group className="mb-3">
											<Form.Label>{t("Sheet margins (mm)")}</Form.Label>
											<div className="row g-2">
												<div className="col-6 col-lg-3">
													<Form.Label className="small text-muted mb-1">
														{t("Left")}
													</Form.Label>
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														title={t("Left")}
														placeholder={t("Left")}
														value={sheetMarginLeft}
														onChange={(e) => setSheetMarginLeft(e.target.value)}
													/>
												</div>
												<div className="col-6 col-lg-3">
													<Form.Label className="small text-muted mb-1">
														{t("Right")}
													</Form.Label>
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														title={t("Right")}
														placeholder={t("Right")}
														value={sheetMarginRight}
														onChange={(e) => setSheetMarginRight(e.target.value)}
													/>
												</div>
												<div className="col-6 col-lg-3">
													<Form.Label className="small text-muted mb-1">
														{t("Top")}
													</Form.Label>
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														title={t("Top")}
														placeholder={t("Top")}
														value={sheetMarginTop}
														onChange={(e) => setSheetMarginTop(e.target.value)}
													/>
												</div>
												<div className="col-6 col-lg-3">
													<Form.Label className="small text-muted mb-1">
														{t("Bottom")}
													</Form.Label>
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														title={t("Bottom")}
														placeholder={t("Bottom")}
														value={sheetMarginBottom}
														onChange={(e) => setSheetMarginBottom(e.target.value)}
													/>
												</div>
											</div>
										</Form.Group>

										<Form.Group className="mb-3">
											<Form.Label className="mb-2">{t("Material auto params")}</Form.Label>
											<div className="d-flex flex-wrap gap-3">
												<Form.Check
													type="switch"
													id="b7MatAutoParams"
													label={t("auto_params")}
													checked={materialAutoParams}
													onChange={(e) => setMaterialAutoParams(e.target.checked)}
												/>
												<Form.Check
													type="switch"
													id="b7MatAutoParamsForce"
													label={t("auto_params_force")}
													checked={materialAutoParamsForce}
													onChange={(e) => setMaterialAutoParamsForce(e.target.checked)}
												/>
											</div>
										</Form.Group>

										<Form.Group className="mb-3">
											<Form.Label>{t("Nesting options")}</Form.Label>
											<div className="row g-2">
												<div className="col-6 col-lg-4">
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														placeholder={t("hole_clearance")}
														title={t("hole_clearance")}
														value={nestingHoleClearance}
														onChange={(e) => setNestingHoleClearance(e.target.value)}
													/>
												</div>
												<div className="col-6 col-lg-4">
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														placeholder={t("min_hole_area_for_nesting")}
														title={t("min_hole_area_for_nesting")}
														value={nestingMinHoleArea}
														onChange={(e) => setNestingMinHoleArea(e.target.value)}
													/>
												</div>
												<div className="col-6 col-lg-4">
													<Form.Control
														type="number"
														min={0}
														step="1"
														placeholder={t("shake_count")}
														title={t("shake_count")}
														value={shakeCount}
														onChange={(e) => setShakeCount(e.target.value)}
													/>
												</div>
											</div>

											<div className="row g-2 mt-1">
												<div className="col-12 col-lg-4">
													<Form.Label className="small text-muted mb-1">
														{t("nesting_direction")}
													</Form.Label>
													<Form.Select
														title={t("nesting_direction")}
														value={nestingDirection}
														onChange={(e) => setNestingDirection(e.target.value)}
													>
														<option value="bottom_to_top">{t("bottom_to_top")}</option>
														<option value="top_to_bottom">{t("top_to_bottom")}</option>
														<option value="left_to_right">{t("left_to_right")}</option>
														<option value="right_to_left">{t("right_to_left")}</option>
													</Form.Select>
												</div>
												<div className="col-12 col-lg-4">
													<Form.Label className="small text-muted mb-1">
														{t("cut_sequence")}
													</Form.Label>
													<Form.Select
														title={t("cut_sequence")}
														value={cutSequence}
														onChange={(e) => setCutSequence(e.target.value)}
													>
														<option value="child_first">{t("child_first")}</option>
														<option value="parent_first">{t("parent_first")}</option>
														<option value="flat">{t("flat")}</option>
													</Form.Select>
												</div>
												<div className="col-12 col-lg-4 d-flex flex-wrap align-items-center gap-3">
													<Form.Check
														type="switch"
														id="b7NestingInHoles"
														label={t("nesting_in_holes")}
														checked={nestingInHoles}
														onChange={(e) => setNestingInHoles(e.target.checked)}
													/>
												</div>
											</div>
										</Form.Group>

										<Form.Group className="mb-3">
											<Form.Label>{t("processing_sequence")}</Form.Label>
											<div className="d-flex flex-wrap gap-3 mb-2">
												<Form.Check
													type="switch"
													id="b7ProcessingSequenceEnabled"
													label={t("processing_sequence_enabled")}
													checked={processingSequenceEnabled}
													onChange={(e) => setProcessingSequenceEnabled(e.target.checked)}
												/>
											</div>
											<div className="row g-2">
												<div className="col-12 col-lg-6">
													<Form.Label className="small text-muted mb-1">
														{t("processing_sequence_mode")}
													</Form.Label>
													<Form.Select
														title={t("processing_sequence_mode")}
														value={processingSequenceMode}
														onChange={(e) => setProcessingSequenceMode(e.target.value)}
													>
														<option value="build_order">
															{t("ps_mode_build_order")}
														</option>
														<option value="random">
															{t("ps_mode_random")}
														</option>
														<option value="vertical_left_to_right">
															{t("ps_mode_vertical_left_to_right")}
														</option>
														<option value="vertical_right_to_left">
															{t("ps_mode_vertical_right_to_left")}
														</option>
														<option value="horizontal_bottom_to_top">
															{t("ps_mode_horizontal_bottom_to_top")}
														</option>
														<option value="horizontal_top_to_bottom">
															{t("ps_mode_horizontal_top_to_bottom")}
														</option>
													</Form.Select>
												</div>
												<div className="col-12 col-lg-3">
													<Form.Label className="small text-muted mb-1">
														{t("processing_sequence_step")}
													</Form.Label>
													<Form.Control
														type="number"
														min={1}
														step={1}
														title={t("processing_sequence_step")}
														value={processingSequenceStep}
														onChange={(e) => setProcessingSequenceStep(e.target.value)}
													/>
												</div>
											</div>
											<div className="d-flex flex-wrap gap-3 mt-2">
												<Form.Check
													type="switch"
													id="b7PsGroupSectors"
													label={t("processing_sequence_group_by_sectors")}
													checked={processingSequenceGroupBySectors}
													onChange={(e) =>
														setProcessingSequenceGroupBySectors(e.target.checked)
													}
												/>
											</div>
											<div className="row g-2 mt-1">
												<div className="col-6 col-lg-3">
													<Form.Label className="small text-muted mb-1">
														{t("processing_sequence_sector_size_x")}
													</Form.Label>
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														title={t("processing_sequence_sector_size_x")}
														value={processingSequenceSectorX}
														onChange={(e) => setProcessingSequenceSectorX(e.target.value)}
													/>
												</div>
												<div className="col-6 col-lg-3">
													<Form.Label className="small text-muted mb-1">
														{t("processing_sequence_sector_size_y")}
													</Form.Label>
													<Form.Control
														type="number"
														min={0}
														step="0.1"
														title={t("processing_sequence_sector_size_y")}
														value={processingSequenceSectorY}
														onChange={(e) => setProcessingSequenceSectorY(e.target.value)}
													/>
												</div>
											</div>
										</Form.Group>
									</>
								)}

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
									{nestPartRows.map((row) => {
										const rowIdx = nestPartRows.indexOf(row);
										return (
										<div key={row.id} className="mb-2">
											<InputGroup
												className="align-items-stretch row-part-inpu-group"
												style={{ minHeight: 48 }}
											>
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
														gap: 10,
														minHeight: 48,
													}}
												>
													{row.uuid ? (
														<>
															<PartSvgImg
																uuid={row.uuid}
																updated_at={getPartThumbUpdatedAt(row.uuid)}
																alt={getPartCodeFromPath(row.path) || "part"}
																width={34}
																height={34}
																style={{
																	borderRadius: 6,
																	border: "1px solid rgba(0,0,0,0.12)",
																	background: "white",
																	objectFit: "contain",
																	flexShrink: 0,
																}}
															/>
															<span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
																{getPartCodeFromPath(row.path) || row.path}
															</span>
														</>
													) : row.path ? (
														<span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
															{row.path}
														</span>
													) : (
														<span className="text-muted">
															{t("Absolute path on server (DXF, NCP, plan:offset)")}
														</span>
													)}
												</div>
												<HoldStepperNumberInput
													value={row.quantity}
													onChangeValue={(val) => updateNestPartRow(row.id, "quantity", val)}
													min={1}
													step={1}
													title={t("Quantity")}
													isInvalid={!!errors[`nestQty_${rowIdx}`]}
													buttonTitlePlus={t("Increase")}
													buttonTitleMinus={t("Decrease")}
													style={{ height: "100%" }}
													inputStyle={{ height: "100%" }}
												/>
												<div
													className="d-flex flex-column justify-content-center px-1"
													style={{
														background: "var(--bs-body-bg, #fff)",
														borderLeft: "1px solid var(--bs-border-color, #dee2e6)",
														minWidth: 84,
													}}
												>
												<Form.Label className="small text-muted mb-0" style={{ fontSize: "0.7rem" }}>
														{t("rotation")}
												</Form.Label>
												<Form.Control
													style={{ height: "100%", maxWidth: "88px" }}
													type="number"
													min={0}
													step={90}
													title={t("Rotation allowance (deg)")}
													value={row.rotation}
													onChange={(e) =>
														updateNestPartRow(row.id, "rotation", e.target.value)
													}
													isInvalid={!!errors[`nestRot_${rowIdx}`]}
												/>
												</div> 
												<div
													className="d-flex flex-column justify-content-center px-1"
													style={{
														background: "var(--bs-body-bg, #fff)",
														borderLeft: "1px solid var(--bs-border-color, #dee2e6)",
														minWidth: 84,
													}}
												>
													<Form.Label className="small text-muted mb-0" style={{ fontSize: "0.7rem" }}>
														{t("priority")}
													</Form.Label>
													<Form.Control
														className="py-0"
														size="sm"
														type="number"
														min={1}
														max={99}
														step={1}
														title={t("priority")}
														placeholder="10"
														value={row.priority ?? "10"}
														onChange={(e) =>
															updateNestPartRow(row.id, "priority", e.target.value)
														}
														isInvalid={!!errors[`nestPrio_${rowIdx}`]}
													/>
												</div>
												<div
													className="d-flex align-items-center px-2"
													style={{
														background: "var(--bs-body-bg, #fff)",
														borderLeft: "1px solid var(--bs-border-color, #dee2e6)",
													}}
												>
													<Form.Check
														type="switch"
														id={`b7Filler_${row.id}`}
														className="mb-0"
														label={t("is_filler")}
														checked={row.is_filler === true}
														onChange={(e) =>
															updateNestPartRow(row.id, "is_filler", e.target.checked)
														}
													/>
												</div>
												<Button
													variant="outline-danger"
													type="button"
													disabled={nestPartRows.length <= 1}
													onClick={() => removeNestPartRow(row.id)}
													style={{ height: "100%" }}
												>
													×
												</Button>
											</InputGroup>
										</div>
									);
									})}
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
								? t("Run nesting")
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