import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import laserStore from "../store/laserStore";
import partStore from "../store/partStore";

/** Имя: латиница, кириллица, цифры, _, - ; длина 3–60; без точек, слэшей и т.п. */
export function isValidNewPartName(raw) {
	const v = String(raw ?? "").trim();
	if (v.length < 3 || v.length > 60) return false;
	return /^[0-9A-Za-z_\u0400-\u04FF-]+$/.test(v);
}

/** Толщина: > 0, десятичная точка, не длинее 5 символов строки. */
export function isValidNewPartThickness(raw) {
	const v = String(raw ?? "")
		.trim()
		.replace(",", ".");
	if (v.length < 1 || v.length > 5) return false;
	if (!/^\d+(\.\d+)?$/.test(v)) return false;
	const n = Number(v);
	return Number.isFinite(n) && n > 0;
}

const NewPartModalForm = observer(({ onCancel }) => {
	const { t } = useTranslation();
	const [name, setName] = useState("");
	const [thickness, setThickness] = useState("");
	const [materialId, setMaterialId] = useState("");

	useEffect(() => {
		partStore.loadDbMaterials();
	}, []);

	const nameOk = useMemo(() => isValidNewPartName(name), [name]);
	const thicknessOk = useMemo(() => isValidNewPartThickness(thickness), [thickness]);
	const materialOk = useMemo(() => String(materialId).trim() !== "", [materialId]);

	const allValid = nameOk && thicknessOk && materialOk;

	const nameHint = useMemo(() => {
		const v = String(name).trim();
		if (!v) return "";
		if (v.length < 3 || v.length > 60) return t("Part name length hint");
		if (!/^[0-9A-Za-z_\u0400-\u04FF-]+$/.test(v)) return t("Part name chars hint");
		return "";
	}, [name, t]);

	const thicknessHint = useMemo(() => {
		const v = String(thickness).trim().replace(",", ".");
		if (!v) return "";
		if (v.length > 5) return t("Thickness length hint");
		if (!/^\d+(\.\d+)?$/.test(v)) return t("Thickness format hint");
		const n = Number(v);
		if (!Number.isFinite(n) || n <= 0) return t("Thickness positive hint");
		return "";
	}, [thickness, t]);

	const handleSubmit = () => {
		if (!allValid) return;
		const th = String(thickness).trim().replace(",", ".");
		partStore.applyNewPartDefaultsAndOpenEditor({
			name: String(name).trim(),
			thickness: th,
			material_id: materialId,
		});
		laserStore.setVal("centralBarMode", "partEditor");
		onCancel();
	};

	return (
		<div className="text-start small px-1">
			<div className="mb-3">
				<label className="form-label mb-1">{t("Part name")}</label>
				<input
					type="text"
					className="form-control"
					value={name}
					onChange={(e) => setName(e.target.value)}
					autoComplete="off"
					maxLength={60}
				/>
				{nameHint ? <div className="text-danger mt-1">{nameHint}</div> : null}
			</div>
			<div className="mb-3">
				<label className="form-label mb-1">{t("Thickness mm")}</label>
				<input
					type="text"
					inputMode="decimal"
					className="form-control"
					style={{ maxWidth: "10rem" }}
					value={thickness}
					onChange={(e) => setThickness(e.target.value)}
					maxLength={5}
				/>
				{thicknessHint ? <div className="text-danger mt-1">{thicknessHint}</div> : null}
			</div>
			<div className="mb-3">
				<label className="form-label mb-1">{t("Material")}</label>
				<select
					className="form-select"
					value={materialId}
					onChange={(e) => setMaterialId(e.target.value)}
					disabled={partStore.dbMaterialsLoading}
				>
					<option value="">{t("Select material")}</option>
					{partStore.dbMaterials.map((m) => (
						<option key={String(m.id)} value={String(m.id)}>
							{m.label}
						</option>
					))}
				</select>
			</div>
			<div className="d-flex justify-content-end gap-2 pt-2 border-top">
				<Button variant="secondary" size="lg" className="violet_button" onClick={onCancel}>
					{t("Cancel")}
				</Button>
				<Button
					variant="primary"
					size="lg"
					className="ms-2"
					disabled={!allValid || partStore.dbMaterialsLoading}
					onClick={handleSubmit}
				>
					{t("Submit")}
				</Button>
			</div>
		</div>
	);
});

export default NewPartModalForm;
