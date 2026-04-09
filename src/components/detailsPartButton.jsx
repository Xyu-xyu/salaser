import constants from "../store/constants";
import partStore from "../store/partStore";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import CustomIcon from "../icons/customIcon";
import { showToast } from "./toast";
import Util from "../scripts/util";

/**
 * Кнопка «сведения о детали» для каталога parts (как DetailsButton для заданий).
 * @param {{ uuid?: string, name?: string, [k: string]: unknown } | undefined} item — строка детали; если нет, берётся выбранная в partStore.
 */
export const DetailsPartButton = observer(({ item }) => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);

	const resolved =
		item && typeof item === "object" && item.uuid
			? item
			: partStore.dbParts.find((p) => String(p?.uuid) === String(partStore.selectedPartUuid));

	const hasSelection = Boolean(
		(item && typeof item === "object" && item.uuid) || partStore.selectedPartUuid
	);

	const showModal = () => {
		if (!resolved) {
			showToast({
				type: "warning",
				message: t("No part selected"),
				position: "bottom-right",
				autoClose: 2500,
			});
			return;
		}
		setShow(true);
	};

	const imgSrc = resolved?.uuid
		? `${constants.SERVER_URL}/jdb/get_part_svg/${encodeURIComponent(String(resolved.uuid))}?v=${encodeURIComponent(
				String(resolved.updated_at ?? resolved.updatedAt ?? "")
			)}`
		: "";

	const fmtNum = (v) => {
		if (v === undefined || v === null || v === "") return null;
		const n = Number(v);
		return Number.isFinite(n) ? Util.smartRound(n) : String(v);
	};

	const w = fmtNum(resolved?.width);
	const h = fmtNum(resolved?.height);
	const th = fmtNum(resolved?.thickness);

	return (
		<>
			<button type="button" className="w-100" onClick={showModal} disabled={!hasSelection}>
				<div className="d-flex align-items-center">
					<CustomIcon
						icon="details"
						width="24"
						height="24"
						color="black"
						fill="black"
						strokeWidth={0.5}
						className="ms-1"
					/>
					<div className="flex-grow-1 text-center">{t("Part details")}</div>
				</div>
			</button>
			<Modal
				show={show}
				onHide={handleClose}
				className="with-inner-backdrop"
				centered
				size="xl"
			>
				<Modal.Header closeButton>
					<Modal.Title></Modal.Title>
				</Modal.Header>
				<Modal.Body className="pt-0">
					{resolved && (
						<div className="detailsCard" data-uuid={resolved.uuid}>
							<div className="d-flex justify-content-center align-items-center mb-2">
								<div className="cardfileName mt-2">{resolved.name ?? "—"}</div>
							</div>
							{imgSrc ? (
								<div className="detailsImage d-flex justify-content-center"
								style={{
									transform: "rotate(90deg)",
									transformOrigin: "center",
								}}
								>
									<img
										src={imgSrc}
										alt=""
										style={{
											maxWidth: "100%",
											maxHeight: "min(50vh, 420px)",
											objectFit: "contain",									
										}}
									/>
								</div>
							) : null}
							<div className="m-4 small">
{/* 								<div className="cardTime text-break mb-1">
									<strong>{t("UUID")}:</strong> {String(resolved.uuid ?? "—")}
								</div>
								{resolved.id != null && resolved.id !== "" && (
									<div className="cardTime mb-1">
										<strong>ID:</strong> {String(resolved.id)}
									</div>
								)} */}
								{th != null && (
									<div className="cardMaterial mb-1">
										• {t("Thickness mm")}: {th}
									</div>
								)}
								{(resolved.material?.label || resolved.material?.name) && (
									<div className="cardMaterial mb-1">
										• {t("Material")}:{" "}
										{[resolved.material?.label, resolved.material?.name].filter(Boolean).join(" — ")}
									</div>
								)}
								{w != null && h != null && (
									<div className="cardMaterial mb-1">
										• {t("Dimensions")}: {w} × {h} {t("mm")}
									</div>
								)}
{/* 								{resolved.owner != null && resolved.owner !== "" && (
									<div className="cardTime mb-1 text-break">
										• {t("Owner id")}: {String(resolved.owner)}
									</div>
								)} */}
								{resolved.created_at != null && resolved.created_at !== "" && (
									<div className="cardTime mb-1 text-break">
										• {t("Created")}: {String(resolved.created_at)}
									</div>
								)}
								{resolved.updated_at != null && resolved.updated_at !== "" && (
									<div className="cardTime text-break">
										• {t("Updated")}: {String(resolved.updated_at)}
									</div>
								)}
							</div>
						</div>
					)}
				</Modal.Body>
			</Modal>
		</>
	);
});

export default DetailsPartButton;
