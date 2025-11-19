import React, { useRef } from "react";
import constants from "../store/constants";
import { useTranslation } from "react-i18next";
import laserStore from "../store/laserStore";
import { observer } from "mobx-react-lite";
import { showToast } from "../components/toast";
import CustomIcon from "../icons/customIcon";

// !!!   COMPONENT NOT IN USE
export const UploadButton = observer(() => {
	const fileInputRef = useRef<HTMLInputElement>(null);
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
 				let resp = await fetch(`${constants.SERVER_URL}/api/gcore/${core}/upload`, {	
					method: "POST",
					headers: {},
					body: content/* as string*/,
				});

				if (resp.ok) {
					//console.log("✅ Uploaded");
				} else {
					
					showToast({
						type: 'error',
						message: "Upload failed",
						position: 'bottom-right',
						autoClose: 2500
					});
					console.log ( "Upload failed:"+ resp.statusText )

				}
			} catch (error) {
				
				showToast({
					type: 'error',
					message: "Upload error:",
					position: 'bottom-right',
					autoClose: 2500
				});
				upload_is_ok = false;
				console.log ( "Upload error:"+ error )
			}

			try {

				let resp = await fetch(constants.SERVER_URL + "/api/loadresult")
				resp.json().then((data) => {

					if (data.result.status === "ERROR") {
						for (let msg_obj of data.result.jobinfo.messages) {
 							showToast({
								type: 'error',
								message: "Loading failed",
								position: 'bottom-right',
								autoClose: 2500
							});
							console.log ( "Loading failed:"+ msg_obj.Message )
						}
						return;
					}

					if (upload_is_ok) {
					 	console.log("✅ Success");
						if ( data !== JSON.stringify(loadResult)){
							laserStore.setVal('loadResult', JSON.stringify(data))
							showToast({
								type: 'success',
								message: "Upload success!",
								position: 'bottom-right',
								autoClose: 2500
							});
						}
					}
				});
			} catch (error) {
 				showToast({
					type: 'error',
					message: "loadresult error",
					position: 'bottom-right',
					autoClose: 2500
				});
				console.log ( "loadresult error:"+ error)
			}

		};
	};


	return (
		<>
			<button className="w-100" type="button" onClick={handleClick} disabled>
				<div className="d-flex align-items-center">
					<CustomIcon
						icon="fluent:copy-add-20-regular"
						width="26"
						height="26"
						color='black'
						fill='black'
						strokeWidth={0.5}
						viewBox="0 0 20 20"
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
