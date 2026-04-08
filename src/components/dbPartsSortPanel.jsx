import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import constants from "../store/constants";
import Util from "../scripts/util";
import partStore from "../store/partStore";

const inputBase = {
	flex: "1 1 7rem",
	minWidth: "4.5rem",
	maxWidth: "12rem",
};

const DbPartsSortPanel = observer(() => {
	const { t } = useTranslation();
	const q = partStore.dbPartsQuery;

	const applyFilters = () => {
		partStore.setDbPartsQuery({ offset: 0 });
		partStore.loadDbParts();
	};

	const setField = (field) => (e) => {
		partStore.setDbPartsQuery({ [field]: e.target.value });
	};

	const onLimitChange = (e) => {
		const raw = e.target.value.trim();
		partStore.setDbPartsQuery({
			limit: raw === "" ? "" : raw,
			offset: 0,
		});
	};

	const limit = Number(q.limit) || 50;
	const offset = Number(q.offset) || 0;
	const canPrev = offset > 0;
	const canNext = partStore.dbParts.length >= limit;

	useEffect(() => {
		partStore.loadDbMaterials();
	}, []);

	return (
		<div
			className="db-parts-sort-panel d-flex flex-column w-100 h-100"
			style={{ minHeight: 0 }}
		>
			<div className="db-parts-filters d-flex flex-wrap align-items-end gap-1 small py-1 border-bottom">
				<input
					type="text"
					className="form-control form-control-sm"
					style={inputBase}
					placeholder={t("Part name prefix")}
					value={q.name_prefix}
					onChange={setField("name_prefix")}
					autoComplete="off"
				/>
				<input
					type="text"
					className="form-control form-control-sm"
					style={inputBase}
					placeholder={t("Part name contains")}
					value={q.name_contains}
					onChange={setField("name_contains")}
					autoComplete="off"
				/>
				<input
					type="number"
					min={1}
					className="form-control form-control-sm"
					style={inputBase}
					placeholder={t("Created last days")}
					value={q.created_last_days}
					onChange={setField("created_last_days")}
				/>
				<input
					type="number"
					min={1}
					className="form-control form-control-sm"
					style={inputBase}
					placeholder={t("Updated last days")}
					value={q.updated_last_days}
					onChange={setField("updated_last_days")}
				/>
				<input
					type="number"
					step="any"
					className="form-control form-control-sm"
					style={inputBase}
					placeholder={t("Thickness mm")}
					value={q.thickness}
					onChange={setField("thickness")}
				/>
				<select
					className="form-control form-control-sm"
					style={{ ...inputBase, minWidth: "6.5rem" }}
					value={q.material_id}
					onChange={setField("material_id")}
					disabled={partStore.dbMaterialsLoading}
					title={
						partStore.dbMaterialsError
							? partStore.dbMaterialsError
							: t("Material")
					}
				>
					<option value="">{t("All materials")}</option>
					{partStore.dbMaterials.map((m) => (
						<option key={String(m.id)} value={String(m.id)}>
							{m.label}
						</option>
					))}
				</select>
				<label className="d-flex align-items-center gap-1 mb-0 text-nowrap text-muted">
					<span>{t("Page size")}</span>
					<input
						type="number"
						min={1}
						max={500}
						className="form-control form-control-sm"
						style={{ width: "3.25rem" }}
						value={q.limit}
						onChange={onLimitChange}
					/>
				</label>
				<button
					type="button"
					className="btn btn-sm btn-primary text-nowrap"
					disabled={partStore.dbPartsLoading}
					onClick={applyFilters}
				>
					{t("Filter run")}
				</button>
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary text-nowrap"
					disabled={partStore.dbPartsLoading}
					onClick={() => {
						partStore.resetDbPartsQuery();
						partStore.loadDbParts();
					}}
				>
					{t("Reset filters")}
				</button>
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					disabled={!canPrev || partStore.dbPartsLoading}
					onClick={() =>
						partStore.loadDbParts({ offset: Math.max(0, offset - limit) })
					}
				>
					{t("Prev page")}
				</button>
				<button
					type="button"
					className="btn btn-sm btn-outline-secondary"
					disabled={!canNext || partStore.dbPartsLoading}
					onClick={() => partStore.loadDbParts({ offset: offset + limit })}
				>
					{t("Next page")}
				</button>
				<details className="w-100 order-last border rounded px-2 py-1 mt-1">
					<summary className="cursor-pointer user-select-none">{t("More filters")}</summary>
					<div className="d-flex flex-wrap align-items-end gap-2 mt-2 pb-1">
						<div>
							<label className="form-label text-muted mb-0 small d-block">{t("Created from")}</label>
							<input
								type="date"
								className="form-control form-control-sm"
								value={q.created_from}
								onChange={setField("created_from")}
							/>
						</div>
						<div>
							<label className="form-label text-muted mb-0 small d-block">{t("Created to")}</label>
							<input
								type="date"
								className="form-control form-control-sm"
								value={q.created_to}
								onChange={setField("created_to")}
							/>
						</div>
						<div>
							<label className="form-label text-muted mb-0 small d-block">{t("Updated from")}</label>
							<input
								type="date"
								className="form-control form-control-sm"
								value={q.updated_from}
								onChange={setField("updated_from")}
							/>
						</div>
						<div>
							<label className="form-label text-muted mb-0 small d-block">{t("Updated to")}</label>
							<input
								type="date"
								className="form-control form-control-sm"
								value={q.updated_to}
								onChange={setField("updated_to")}
							/>
						</div>
						<div>
							<label className="form-label text-muted mb-0 small d-block">{t("Owner id")}</label>
							<input
								type="text"
								inputMode="numeric"
								className="form-control form-control-sm"
								style={{ width: "5rem" }}
								placeholder={t("Owner id")}
								value={q.owner}
								onChange={setField("owner")}
							/>
						</div>
					</div>
				</details>
			</div>

			<div
				className="d-flex flex-column flex-grow-1 mt-2"
				style={{ minHeight: 0 }}
			>
				{partStore.dbPartsLoading && (
					<div className="text-muted small">{t("Loading")}…</div>
				)}
				{!partStore.dbPartsLoading && partStore.dbPartsError && (
					<div className="text-danger small">{partStore.dbPartsError}</div>
				)}
				{!partStore.dbPartsLoading &&
					!partStore.dbPartsError &&
					!partStore.dbParts.length && (
						<div className="text-muted small">{t("No parts data")}</div>
					)}
				{!partStore.dbPartsLoading &&
					!partStore.dbPartsError &&
					!!partStore.dbParts.length && (
						<div
							className="db-parts-list flex-grow-1"
							style={{ overflowX: "hidden", overflowY: "auto", minHeight: 0 }}
						>
							<div className="d-flex flex-wrap gap-2 pb-2 align-content-start">
								{partStore.dbParts.map((p) => (
									<div
										key={p.uuid ?? p.id}
										role="button"
										tabIndex={0}
										onPointerDown={() => partStore.selectPart(p.uuid)}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												partStore.selectPart(p.uuid);
											}
										}}
										className={`d-flex flex-column align-items-center border rounded p-2 small part_item-class ${
											p.uuid && p.uuid === partStore.selectedPartUuid ? "selected" : ""
										}`}
										style={{
											width: "9.5rem",
											height: "9.5rem",
										}}
									>
										{p.uuid && (
											<img
												src={`${constants.SERVER_URL}/jdb/get_part_svg/${p.uuid}`}
												alt={p.name ?? "part"}
												width={56}
												height={56}
												style={{
													borderRadius: 6,
													border: "1px solid rgba(0,0,0,0.1)",
													background: "white",
													objectFit: "contain",
													flexShrink: 0,
												}}
											/>
										)}
										<span
											className="text-center text-truncate w-100 mt-1"
											style={{ maxWidth: "9rem" }}
											title={p.name}
										>
											{p.name}
										</span>
										{(p.material?.name || p.material?.label) && (
											<span
												className="text-center text-truncate w-100 px-1"
												style={{ maxWidth: "9rem", fontSize: "0.68rem", lineHeight: 1.2 }}
												title={
													[p.material?.name, p.material?.label].filter(Boolean).join(" — ") ||
													""
												}
											>
												{[p.material?.name, p.material?.label].filter(Boolean).join(" · ")}
											</span>
										)}
										{p.thickness != null && p.thickness !== "" && (
											<span
												className="text-muted text-nowrap"
												style={{ fontSize: "0.68rem" }}
											>
												{Util.smartRound(Number(p.thickness))} {t("mm")}
											</span>
										)}
										<span className="text-muted text-nowrap mt-auto pt-1" style={{ fontSize: "0.7rem" }}>
											{Util.smartRound(p.width)}×{Util.smartRound(p.height)}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
			</div>
		</div>
	);
});

export default DbPartsSortPanel;
