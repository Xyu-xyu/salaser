import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../../store/viewStore";
import { useState, useRef } from "react";
import { Modal } from "react-bootstrap";
import { showToast } from "../toast";
import constants from "../../store/constants";
import utils from "../../scripts/util";

const settingsButton = observer(() => {
	const fileInputRef_1 = useRef<HTMLInputElement>(null);
	const [show, setShow] = useState(false);
	const api_host = 'http://' + constants.SERVER_URL

	// Открыть модалку
	const showModal = () => {
		setShow(true);
	};

	// Закрыть модалку
	const handleClose = () => setShow(false);

	const sentToLaser = () => {
		//setShow(false)
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to sent settings to laser ?',
			confirmText: 'OK',
			cancelText: 'Cancel',
			func: viewStore.sentSettingsToLaser,
			args: []
		})
	}


	/* const savePreset = () => {
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to save settings preset?',
			confirmText: 'OK',
			cancelText: 'Cancel',
			func: viewStore.savePreset
			,
			args: []
		})

		setTimeout(() => {
			setShow(false);
		}, 0);
	} */

	const handleClick = () => {
		fileInputRef_1.current?.click();
	};


	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

		const input = e.target;
		const file = input.files?.[0];

		if (!file) {

			showToast({
				type: 'error',
				message: "Error in preset loading",
				position: 'bottom-right',
				autoClose: 5000
			});
		} else {

			try {
				const text = await file.text();
				const data = JSON.parse(text);
				viewStore.updateTechnology(data, file.name)

				setTimeout(() => {
					setShow(false);
				}, 0);

			} catch (err) {

				showToast({
					type: 'error',
					message: "Error in preset parsing",
					position: 'bottom-right',
					autoClose: 5000
				});

			} finally {
				input.value = "";
			}
		};
	};

	async function listPresets() {
		let resp = await fetch(api_host + "/db/listpresets");
		return await resp.json();
	}

	async function savePreset() {

		viewStore.cut_settings.technology = viewStore.technology
		let result = utils.validateCuttingSettings(viewStore.cut_settings)
		if (result?.errors.length !== 0) {

			showToast({
				type: 'error',
				message: `Preset invalid`,
				position: 'bottom-right',
				autoClose: 5000
			});

			return

		};

		try {
			let resp = await fetch(api_host + "/db/savepreset", {
				method: "POST",
				headers: { /* "Content-Type": "application/json" */ },
				body: JSON.stringify(viewStore.cut_settings)
			});

			if (!resp.ok) throw new Error(`Ошибка: ${resp.statusText}`);
			//const data = await resp.json();

			showToast({
				type: 'success',
				message: `Preset сохранён`,
				position: 'bottom-right',
				autoClose: 5000
			});

		} catch (err: any) {
			showToast({
				type: 'error',
				message: "Ошибка сохранения пресета: " + (err.message || "Неизвестная"),
				position: 'bottom-right',
				//autoClose: 5000
			});
		}

	}

	async function deletePreset(id: number) {
		let resp = await fetch(api_host + `/db/deletepreset?id=${id}`, {
			method: "DELETE"
		});
		return await resp.json();
	}

	async function updatePreset(data: any) {
		let resp = await fetch(api_host + "/db/updatepreset", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(data)
		});
		return await resp.json();
	}


	return (

		<div className="ms-2" >
			<button
				className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`}
				onClick={showModal}>
				<div className="d-flex align-items-center justify-content-center">
					<Icon
						icon="octicon:gear-24"
						width="36"
						height="36"
						style={{ color: show ? "white" : "black" }}
					/>
				</div>
			</button>
			<Modal
				show={show}
				onHide={handleClose}
				id="powerButtonModal"
				className="with-inner-backdrop settingsButton-navbar-modal"
				centered={false} // убираем выравнивание по центру
			>
				<div className="m-1">
					<div className="d-flex flex-column">
						<button className="white_button navbar_button m-1" onClick={sentToLaser}>
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="solar:upload-square-linear" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>

						<button className="white_button navbar_button m-1" onClick={handleClick}  >
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="fluent-emoji-high-contrast:open-file-folder" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>
						<input
							type="file"
							ref={fileInputRef_1}
							hidden
							accept=".json"   // только файлы с расширением .ncp и .sgn
							onChange={handleFileChange}
						/>

						<button className="white_button navbar_button m-1" onClick={savePreset}  >
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="fluent:save-16-regular" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>
						<button className="white_button navbar_button m-1" onClick={listPresets}  >
							<div className="d-flex align-items-center justify-content-center">
								<Icon icon="fluent:save-16-regular" width="36" height="36" style={{ color: 'black' }} />
							</div>
						</button>
					</div>
				</div>
			</Modal>
		</div>

	)
});

export default settingsButton;