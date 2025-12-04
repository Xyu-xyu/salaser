import constants from "../store/constants";
//import { useTranslation } from "react-i18next";
import laserStore from "../store/laserStore";
import jobStore from "../store/jobStore";
import { observer } from "mobx-react-lite";
import { showToast } from "./toast";
import CustomIcon from "../icons/customIcon";
import macrosStore from "../store/macrosStore";


export const StartButton = observer(() => {

	const { loadResult } = laserStore
	const { mockCards } = jobStore

	const getPresetAndSenTolaser = async (preset) => {
		try {
			const resp = await fetch(`${constants.SERVER_URL}/db/get_preset?id=${preset}`, {
				method: "GET",
			});

			if (!resp.ok) {
				console.error("Failed to fetch preset:", resp.status, resp.statusText);
				return false;
			}

			const data = await resp.json();

			if (!data?.preset) {
				console.error("Preset data is empty");
				return false;
			}

			macrosStore.setCutSettings(data.preset);
			const sendResult = await macrosStore.sentSettingsToLaser(data.preset);
			return Boolean(sendResult)

		} catch (err) {
			console.error("Error in getPresetAndSenTolaser:", err);
			return false;
		}
	};

	const sentFileTolaser = async (id) => {

		let upload_is_ok = true;
		try {
			let resp = await fetch(`${constants.SERVER_URL}/api/gcore/0/upload_from_id`, {
				method: 'POST',
				headers: { /*'Content-Type': 'application/json' */ },
				body: JSON.stringify({ 'id': id })
			});

			if (resp.ok) {
				console.log("✅ Uploaded");
			} else {

				showToast({
					type: 'error',
					message: "Upload failed",
					position: 'bottom-right',
					autoClose: 2500
				});
				console.log("Upload failed:" + resp.statusText)

			}
		} catch (error) {

			showToast({
				type: 'error',
				message: "Upload error:",
				position: 'bottom-right',
				autoClose: 2500
			});
			upload_is_ok = false;
			console.log("Upload error:" + error)
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
						console.log("Loading failed:" + msg_obj.Message)
					}
					return;
				}

				if (upload_is_ok) {
					console.log("✅ Success");
					if (data !== JSON.stringify(loadResult)) {
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
			console.log("loadresult error:" + error)
		}
	}

	const execute = async () => {

		try {

			let req_resp = await fetch(`${constants.SERVER_URL}/api/gcore/${0}/execute`, {
				method: "GET",
				headers: {},
			});


			if (req_resp.ok) {
				const text = await req_resp.text();
				console.debug(`Execute: [${text}]`);
				showToast({
					type: 'success',
					message: "Execution started",
					position: 'bottom-right',
					autoClose: 2500
				});
				console.log("Execution started: " + req_resp.statusText)
				return;
			}

		} catch (exc) {

			showToast({
				type: 'error',
				message: "Execution error",
				position: 'bottom-right',
				autoClose: 2500
			});
			console.log("Execution error:" + exc.message)
		}
	}


	const updateIsCutting = async (id) => {
		jobStore.updateJobById(id, 'is_cutting', 1)
	}

	const startLaser = async () => {

		if (!mockCards.hasOwnProperty("Cutting") ||
			!mockCards["Cutting"].length
		) {
			showToast({
				type: 'warning',
				message: "Ooops, nothing to cut!",
				position: 'bottom-right',
				autoClose: 2500
			});
			return;
		}

		let id = false;
		let preset = false

		if (mockCards.hasOwnProperty("Cutting") && mockCards["Cutting"].length) {

			mockCards["Cutting"].forEach((item, index) => {
				if (item.hasOwnProperty("is_cutting") && item['is_cutting'] === 1) {
					showToast({
						type: 'warning',
						message: "Ooops, something is in cut " + item.name,
						position: 'bottom-right',
						autoClose: 2500
					});
					return
				}

				if (index === 0) {
					id = item['id']
					preset = item['preset']
				}
			})
		}

		if (typeof preset === 'number') {
			const success = await getPresetAndSenTolaser(preset);
			if (!success) {
				showToast({
					type: 'error',
					message: "Error in sending preset to laser!",
					position: 'bottom-right',
					autoClose: 2500
				});
				return;
			}
		}
		await sentFileTolaser(id);
		await execute();

		if (typeof id === 'string') {
			await updateIsCutting(id);
		}
	};

	const handleClick  =()=>{
		const def = {
			show:true,
			modalBody: 'Do you want to start laser cut process ?',
			confirmText: 'Start',
			cancelText:'Cancel',
			func: startLaser,
			args:['']
		}
		macrosStore.setModalProps (def)		
	}


	return (
		<>
			<button className="white_button navbar_button" onPointerDown={handleClick}>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon icon="fluent:laser-tool-20-filled"
						width="36"
						height="36"
						style={{ color: 'red' }}
						fill={"red"}
						viewBox={"0 0 20 20"}
						strokeWidth={0}
					/>
				</div>
			</button>
		</>
	);
});

// +получаем job_id и 
// +preset_id на back
// +отправляем preset on core 0
// +отправляем файл на core 0
// +отправялем load result frontend
// +если всё ок отправляем execute на  бэк
// +присваиваем id - is_cutting == true
// +обновляем joB_LIST
// +загружаем показания пресетов в текущие макросы.
// запрещаем перемещать ??
// остановка по азпросу ???
//

