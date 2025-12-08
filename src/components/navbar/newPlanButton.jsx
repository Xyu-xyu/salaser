import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { Dropdown, DropdownButton, Modal, Form  } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import macrosStore from "../../store/macrosStore";
import CustomIcon from "../../icons/customIcon";
import laserStore from "../../store/laserStore";
import svgStore from "../../store/svgStore";


const NewPlanButton = observer(() => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const { presets } = macrosStore;

	// Форма
	const [name, setName] = useState("new_plan");
	const [width, setWidth] = useState("900");
	const [height, setHeight] = useState("600");
	const [quantity, setQuantity] = useState("1");
	const [selectedPreset, setSelectedPreset] = useState(null);

	// Ошибки валидации
	const [errors, setErrors] = useState({
		name: "",
		width: "",
		height: "",
		quantity: "",
		preset: ""
	});

	useEffect(() => {
		if (!presets) macrosStore.fetchPresets();
	}, [presets]);

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

		// Preset обязателен
		if (!selectedPreset) {
			newErrors.preset = t("Please select a preset");
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validate()) return;

		// Здесь можно сохранить данные или передать в store
		let res = {
			name: name.trim(),
			width: parseFloat(width),
			height: parseFloat(height),
			quantity: parseInt(quantity, 10),
			presetId: selectedPreset.id,
			presetName: selectedPreset.name
		};

		for (let key in res) {
			console.log (key, res[key])
			svgStore.setVal ('svgData', key, res[key])
		}	
		laserStore.setVal("centralBarMode", "planEditor");
		handleClose();
	};

	const handleClose = () => {
		setShow(false);
		// Сброс формы
		setName("");
		setWidth("");
		setHeight("");
		setQuantity("");
		setSelectedPreset(null);
		//setErrors({});
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
				<Modal.Header>
					<Modal.Title>{t("New sheet")}</Modal.Title>
				</Modal.Header>

				<Modal.Body>
					<Form>
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
							<div className="col-md-4">
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

							<div className="col-md-4">
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

							<div className="col-md-4">
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
						</div>

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
										{preset.name}
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
						onClick={handleSubmit}
					>
						<div className="d-flex align-items-center p-2">
							<CustomIcon
							icon="line-md:square-to-confirm-square-transition"
							width="24"
							height="24"
							color="white"
						/>
						{t("Create")}
						</div>
					</button>
				</Modal.Footer>
			</Modal>
		</div>
	);
});

export default NewPlanButton;