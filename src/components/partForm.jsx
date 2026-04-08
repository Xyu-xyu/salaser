import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import constants from "../store/constants";
import CustomIcon from "../icons/customIcon";
import macrosStore from "../store/macrosStore";
import partStore from "../store/partStore";

function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => {
			const dataUrl = String(reader.result ?? "");
			const comma = dataUrl.indexOf(",");
			resolve(comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl);
		};
		reader.onerror = () => reject(reader.error);
		reader.readAsDataURL(file);
	});
}

/** Загрузка файла детали на бэк; после успеха обновляет список в partStore. */
export async function uploadPart(file) {
	if (!file) return;
	try {
		const fileBase64 = await fileToBase64(file);
		const res = await fetch(`${constants.SERVER_URL}/jdb/add_part`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				filename: file.name,
				file: fileBase64,
			}),
		});
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			console.error("jdb/add_part:", data?.error ?? res.status);
			return;
		}
		if (data.message === "данный вид файлов пока не поддерживается") {
			console.info(data.message);
			return;
		}
		await partStore.loadDbParts(50, 0);
	} catch (err) {
		console.error(err);
	}
}

export function parsePartsFromLoadResult(loadResultStr) {
	if (!loadResultStr) return [];
	try {
		const lr = JSON.parse(loadResultStr);
		return lr?.result?.jobinfo?.parts ?? [];
	} catch {
		return [];
	}
}

const PartForm = observer(() => {
	const { t } = useTranslation();
	const fileInputRef = useRef(null);

	const openPartFileDialog = () => {
		fileInputRef.current?.click();
	};

	const onPartFileChange = async (e) => {
		const input = e.target;
		const file = input.files?.[0];
		input.value = "";
		if (!file) return;
		const ext = (file.name.match(/\.([^.]+)$/)?.[1] ?? "").toLowerCase();
		if (!constants.PART_UPLOAD_EXTENSIONS.includes(ext)) {
			return;
		}
		await uploadPart(file);
	};

	return (
		<div id="PartForm">
			<input
				ref={fileInputRef}
				type="file"
				className="d-none"
				accept={constants.PART_UPLOAD_ACCEPT}
				onChange={onPartFileChange}
			/>
			<div className="mt-2">
				<h5>{t("Parts")}</h5>
			</div>

			<div>
				<button type="button" className="w-100" onClick={openPartFileDialog}>
					<div className="d-flex align-items-center">
						<CustomIcon
							icon="gridicons:add"
							width="24"
							height="24"
							color="black"
							fill="black"
							strokeWidth={0}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Add")}</div>
					</div>
				</button>
			</div>
			<div>
				<button
					type="button"
					className="w-100"
					onMouseDown={() => {
						if (!partStore.selectedPartUuid) return;
						macrosStore.setModalProps({
							show: true,
							modalBody: 'Do you want to delete part ?',
							confirmText: 'Delete',
							cancelText: 'Cancel',
							func: partStore.deletePart,
							args: [partStore.selectedPartUuid],
						});
					}}
					disabled={!partStore.selectedPartUuid}
				>
					<div className="d-flex align-items-center">
						<CustomIcon
							icon="material-symbols:delete-outline-sharp"
							width="24"
							height="24"
							fill="black"
							strokeWidth={0}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Delete")}</div>
					</div>
				</button>
			</div>
			<div>
				<button type="button" className="w-100" onMouseDown={() => { }}>
					<div className="d-flex align-items-center">
						<CustomIcon
							icon="fa-regular:copy"
							width="24"
							height="24"
							viewBox="0 0 448 512"
							color="black"
							fill="black"
							strokeWidth={0}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Copy")}</div>
					</div>
				</button>
			</div>

		</div>
	);
});

export default PartForm;
