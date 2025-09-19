import React, { useRef } from "react";
import { Icon } from "@iconify/react";
import constants from "../store/constants";
import { useTranslation } from "react-i18next";
import laserStore from "../store/laserStore";
import { observer } from "mobx-react-lite";


export const UploadButton = observer(() => {
	const fileInputRef = useRef<HTMLInputElement>(null);
	const api_host = constants.api
	const core = 0
	const { t } = useTranslation()
	const { loadResult } = laserStore


	const handleClick = () => {
		fileInputRef.current?.click();
	};

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const input = e.target;
		const file = input.files?.[0];
		if (!file) return;

		console.log("📂 Selected file:", file);

		const reader = new FileReader();
		reader.readAsText(file);

		reader.onload = async (readerEvent) => {
			let upload_is_ok: boolean = true;
			console.log("📖 FileReader result:", readerEvent);
			const content = readerEvent.target?.result;

			console.log("⏳ Sending...");

			try {
				let resp = await fetch(`http://${api_host}/gcore/${core}/upload`, {
					method: "POST",
					headers: {},
					body: content/* as string*/,
				});

				if (resp.ok) {
					console.log("✅ Uploaded");
				} else {
					console.error("❌ Upload failed:", resp.statusText);
				}
			} catch (error) {
				console.error("❌ Upload error:", error);
				upload_is_ok = false;
			}

			try {
				let resp = await fetch(`http://${api_host}/py/gcores[${core}].loadresult`);
				resp.json().then((data) => {

					if (data.result.status === "ERROR") {
						for (let msg_obj of data.result.jobinfo.messages) {
							console.error("❌ Loading failed:", msg_obj.Message);
						}
						return;
					}

					if (upload_is_ok) {
					 	console.log("✅ Success");
						if ( data !== JSON.stringify(loadResult)){
							laserStore.setVal('loadResult', JSON.stringify(data))
						}
					}
				});
			} catch (error) {
				console.error("❌ loadresult error:", error);
			}

		};
	};


	return (
		<>
			<button className="w-100" type="button" onClick={handleClick}>
				<div className="d-flex align-items-center">
					<Icon
						icon="fluent:copy-add-20-regular"
						width="24"
						height="24"
						style={{ color: "black" }}
						className="ms-1"
					/>
					<div className="flex-grow-1 text-center">{t("Upload")}</div>
				</div>
			</button>

			{/* скрытый input */}
			<input
				type="file"
				ref={fileInputRef}
				hidden
				accept=".ncp,.sgn"   // только файлы с расширением .ncp и .sgn
				onChange={handleFileChange}
			/>
		</>
	);
});
