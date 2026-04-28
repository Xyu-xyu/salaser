import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import partStore from "../store/partStore";
import { showToast } from "./toast";

const MaterialsModal = observer(function MaterialsModal(props) {
	const { show, onHide } = props ?? {};
	const { t } = useTranslation();
	const [newMatName, setNewMatName] = useState("");
	const [newMatLabel, setNewMatLabel] = useState("");
	const [saveError, setSaveError] = useState("");
	const [saving, setSaving] = useState(false);

	useEffect(() => {
		if (show) partStore.loadDbMaterials();
	}, [show]);

	useEffect(() => {
		if (!show) {
			setNewMatName("");
			setNewMatLabel("");
			setSaveError("");
			setSaving(false);
		}
	}, [show]);

	const normalizedExisting = useMemo(() => {
		const norm = (s) => String(s ?? "").trim().toLowerCase();
		const names = new Set();
		const labels = new Set();
		for (const m of partStore.dbMaterials) {
			names.add(norm(m?.name));
			labels.add(norm(m?.label));
		}
		return { names, labels, norm };
	}, [partStore.dbMaterials]);

	const validation = useMemo(() => {
		const name = String(newMatName ?? "").trim();
		const label = String(newMatLabel ?? "").trim();
		if (!name || !label) return { ok: false, reason: t("Fill name and label") };
		if (name.length > 64 || label.length > 64) return { ok: false, reason: t("Max length is 64") };
		const n = normalizedExisting.norm(name);
		const l = normalizedExisting.norm(label);
		if (normalizedExisting.names.has(n)) return { ok: false, reason: t("Name must be unique") };
		if (normalizedExisting.labels.has(l)) return { ok: false, reason: t("Label must be unique") };
		return { ok: true, reason: "" };
	}, [newMatName, newMatLabel, normalizedExisting, t]);

	return (
		<Modal
			show={Boolean(show)}
			onHide={() => {
				setSaveError("");
				if (typeof onHide === "function") onHide();
			}}
			className="with-inner-backdrop"
			size="lg"
			centered
		>
			<Modal.Header closeButton>
				<Modal.Title>{t("materials")}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{partStore.dbMaterialsError ? (
					<div className="text-danger small mb-2">{partStore.dbMaterialsError}</div>
				) : null}

				<div style={{ maxHeight: "45vh", overflow: "auto" }} className="border rounded">
					<table className="table table-striped table-hover mb-0">
						{/* <thead style={{ position: "sticky", top: 0, background: "#fff", zIndex: 1 }}>
							<tr>
								<th style={{ width: "50%" }}>{t("name")}</th>
								<th style={{ width: "50%" }}>{t("label")}</th>
							</tr>
						</thead> */}
						<tbody>
							{partStore.dbMaterials.map((m) => (
								<tr key={String(m.id)}>
									<td style={{ verticalAlign: "middle" }}>{m.name ?? ""}</td>
									<td style={{ verticalAlign: "middle" }}>{m.label ?? ""}</td>
								</tr>
							))}
							{!partStore.dbMaterialsLoading && partStore.dbMaterials.length === 0 ? (
								<tr>
									<td colSpan={2} className="text-muted small">
										{t("No data")}
									</td>
								</tr>
							) : null}
						</tbody>
					</table>
				</div>

				<div className="mt-3 pt-3 border-top">
					<div className="d-flex flex-wrap gap-2 align-items-end">
						<div style={{ minWidth: 220, flex: "1 1 12rem" }}>
							<label className="form-label mb-1">{t("name")}</label>
							<input
								type="text"
								className="form-control"
								value={newMatName}
								onChange={(e) => setNewMatName(e.target.value)}
								autoComplete="off"
								maxLength={64}
							/>
						</div>
						<div style={{ minWidth: 220, flex: "1 1 12rem" }}>
							<label className="form-label mb-1">{t("label")}</label>
							<input
								type="text"
								className="form-control"
								value={newMatLabel}
								onChange={(e) => setNewMatLabel(e.target.value)}
								autoComplete="off"
								maxLength={64}
							/>
						</div>
						<div className="ms-auto">
							<Button
								variant="primary"
								disabled={!validation.ok || saving}
								onClick={async () => {
									setSaveError("");
									if (!validation.ok) return;
									try {
										setSaving(true);
										await partStore.addDbMaterial({ name: newMatName, label: newMatLabel });
										setNewMatName("");
										setNewMatLabel("");
										showToast({
											type: "success",
											message: t("Material saved"),
											position: "bottom-right",
											autoClose: 2000,
										});
									} catch (e) {
										setSaveError(e?.message ?? String(e));
									} finally {
										setSaving(false);
									}
								}}
							>
								{t("Add material")}
							</Button>
						</div>
					</div>
					{!validation.ok ? (
						<div className="text-danger small mt-2">{t(validation.reason)}</div>
					) : null}
					{saveError ? <div className="text-danger small mt-2">{t(saveError)}</div> : null}
				</div>
			</Modal.Body>
		</Modal>
	);
});

export default MaterialsModal;

