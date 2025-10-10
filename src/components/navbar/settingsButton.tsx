import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../../store/viewStore";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
//import { showToast } from "../toast";
import constants from "../../store/constants";
import utils from "../../scripts/util";

interface Preset {
	id: number;
	code: string;
	name: string;
	thickness: number;
	ts: string;
}

type SortKey = "code" | "name" | "thickness" | "ts";
type SortOrder = "asc" | "desc";

const SettingsButton = observer(() => {
	const { presetMode } = viewStore
	const [show, setShow] = useState(false);
	const [update, setUpdate] = useState(true);
	const [presets, setPresets] = useState<Preset[]>([]);
	const [sortKey, setSortKey] = useState<SortKey>("code");
	const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

	const api_host = 'http://' + constants.SERVER_URL;

	const showModal = () => {
		setShow(true)
		if (!update) setUpdate(true)
	};

	const handleClose = () => setShow(false);

	useEffect(() => {
		if (update) {
			listPresets()
			setUpdate(false)
		}
	}, [update])

	async function listPresets() {
		let resp = await fetch(api_host + "/db/listpresets");
		resp.json().then((data) => {
			setPresets(data);
		});
	}

	function sortPresets(key: SortKey) {
		if (sortKey === key) {
			// переключаем порядок сортировки
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortKey(key);
			setSortOrder("asc");
		}
	}

	const sortedPresets = [...presets].sort((a, b) => {
		let aVal = a[sortKey];
		let bVal = b[sortKey];

		if (sortKey === "thickness") {
			aVal = Number(aVal);
			bVal = Number(bVal);
		} else {
			aVal = String(aVal).toLowerCase();
			bVal = String(bVal).toLowerCase();
		}

		if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
		if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});


	const deleteP = (id: number) => {
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete this presets from DB?',
			confirmText: 'OK',
			cancelText: 'Cancel',
			func: deletePreset,
			args: [id]
		})	
	}


	async function deletePreset(id: number) {
		await fetch(api_host + `/db/deletepreset?id=${id}`, {
			method: "DELETE"
		}).then(() => {
			setUpdate(true)
		})
	}


	const copyP = (id: number) => {
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to copy this presets?',
			confirmText: 'OK',
			cancelText: 'Cancel',
			func: copyPreset,
			args: [id]
		})	
	}




	async function copyPreset(id: number) {
		await fetch(api_host + `/db/copy_preset`, {
			method: "POST",
			headers: {
				/* "Content-Type": "application/json" */
			},
			body: JSON.stringify({ id })
		}).then(() => {
			setUpdate(true)
		})

	}

	async function addDefault() {
		let defaults = utils.getDefaultsFromSchema()
		//console.log(JSON.stringify(defaults))
		addPreset(defaults)
	}

	async function addPreset(preset: object) {
		await fetch(api_host + `/db/savepreset`, {
			method: "POST",
			headers: {
				/* "Content-Type": "application/json" */
			},
			body: JSON.stringify(preset)
		}).then(() => {
			setUpdate(true)
		})
	}

	async function deleteAllPresets() {

		await fetch(api_host + `/db/delete_all_presets`, {
			method: "DELETE"
		}).then(() => {
			setUpdate(true)
		})
	}

	const deleteAll = () => {
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete ALL presets from DB?',
			confirmText: 'OK',
			cancelText: 'Cancel',
			func: deleteAllPresets,
			args: []
		})

		setTimeout(() => {
			setShow(false);
		}, 0);
	}

	async function editPreset (id: number) {
		try {
			viewStore.setPresetMode ( String(id)+"_edit")
			const resp = await fetch(`${api_host}/db/get_preset?id=${id}`, {
				method: "GET",
			});
			if (!resp.ok) throw new Error(`Ошибка: ${resp.statusText}`);
			
			const data = await resp.json();
			//console.log("📦 Получен пресет:", data);
			viewStore.setCutSettings( data.preset);
			handleClose()
			viewStore.setModal(true, 'macros')

		} catch (err) {
			console.error("Ошибка при загрузке пресета:", err);
			throw err;
		}
	}

	async function getAndSenTolaser (id: number) {
		const resp = await fetch(`${api_host}/db/get_preset?id=${id}`, {
			method: "GET",
		});
		if (!resp.ok) throw new Error(`Ошибка: ${resp.statusText}`);
		
		const data = await resp.json();
		viewStore.setCutSettings( data.preset );
		handleClose()
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to sent settings to laser ?',
			confirmText: 'OK',
			cancelText: 'Cancel',
			func: viewStore.sentSettingsToLaser,
			args: [data.preset]}
		)
	}
 

	return (
		<div className="ms-2">
			<button
				className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`}
				onClick={showModal}
			>
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
				id="settingsButtonModal"
				className="with-inner-backdrop powerButton-navbar-modal settingsButton-navbar-modal"
				centered={false}
			>
				<div style={{ padding: '.25rem' }}>
					<div
						style={{
							minHeight: 'calc(100vh * 0.5)',
							maxHeight: 'calc(100vh * 0.75)',
							minWidth: 'calc(100vw * 0.5)',
							overflowY: 'auto',
							overflowX: 'hidden',
						}}
					>
						<table style={{ width: '100%', borderCollapse: 'collapse' }} className="table table-striped table-hover">
							<thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
								<tr>
									{[
										{ key: "code", label: "Code" },
										{ key: "name", label: "Name" },
										{ key: "thickness", label: "Thickness" },
										{ key: "ts", label: "Timestamp" },
									].map((col) => (
										<th
											key={col.key}
											style={{
												cursor: "pointer",
												verticalAlign: "middle",
												whiteSpace: "nowrap",
												textAlign: "left",
											}}
											onClick={() => sortPresets(col.key as SortKey)}
										>
											<span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
												{col.label}
												<span
													style={{
														display: "inline-block",
														width: "1em", // фиксированное пространство под стрелку
														textAlign: "center",
													}}
												>
													<Icon
														icon="tabler:triangle-inverted-filled"
														width="14"
														height="14"
														style={{
															color: "#514fff",
															marginLeft: "4px",
															transition: "transform 0.2s ease-in-out",
															transform: sortKey === col.key && sortOrder === "desc" ? "rotate(180deg)" : "rotate(0deg)",
														}}
													/>
												</span>
											</span>
										</th>
									))}
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{sortedPresets.map((preset) => (
									<tr key={preset.id}>
										<td style={{ verticalAlign: "middle" }}>{preset.code}</td>
										<td style={{ verticalAlign: "middle" }}>{preset.name}</td>
										<td style={{ verticalAlign: "middle" }}>{preset.thickness}</td>
										<td style={{ verticalAlign: "middle" }}>{preset.ts}</td>
										<td style={{ verticalAlign: "middle" }}>
											<div>
												{presetMode === 'select' ? (
													<div className="mx-2 mt-1">
														<button
															onClick={() => { }}
															className="violet_button navbar_button small_button40"
														>
															<div className="d-flex align-items-center justify-content-center">
																<Icon
																	icon="charm:square-tick"
																	width="24"
																	height="24"
																	style={{ color: 'white' }}
																/>
															</div>
														</button>
													</div>
												) : (
													<div className="d-flex">
														<div className="mx-2 mt-1">
															<button
																onClick={() => { editPreset(preset.id)}}
																className="violet_button navbar_button small_button40"
															>
																<div className="d-flex align-items-center justify-content-center">
																	<Icon
																		icon="fa-regular:edit"
																		width="36"
																		height="36"
																		style={{ color: 'white' }}
																	/>
																</div>
															</button>
														</div>
														<div className="mx-2 mt-1">
															<button
																onClick={() => copyP(preset.id)}
																className="violet_button navbar_button small_button40"
															>
																<div className="d-flex align-items-center justify-content-center">
																	<Icon
																		icon="fa-regular:copy"
																		width="24"
																		height="24"
																		style={{ color: 'white' }}
																	/>
																</div>
															</button>
														</div>
														<div className="mx-2 mt-1">
															<button
																onClick={() => getAndSenTolaser(preset.id)}
																className="violet_button navbar_button small_button40"
															>
																<div className="d-flex align-items-center justify-content-center">
																	<Icon
																		icon="bi:send-arrow-up"
																		width="36"
																		height="36"
																		style={{ color: 'white' }}
																	/>
																</div>
															</button>
														</div>
														<div className="mx-2 mt-1">
															<button
																onClick={() => deleteP(preset.id)}
																className="violet_button navbar_button small_button40"
															>
																<div className="d-flex align-items-center justify-content-center">
																	<Icon
																		icon="ic:twotone-delete-outline"
																		width="36"
																		height="36"
																		style={{ color: 'white' }}
																	/>
																</div>
															</button>
														</div>
													</div>
												)}
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<button
						onClick={() => { deleteAll() }}
						className="violet_button navbar_button small_button40"
					>
						<div className="d-flex align-items-center justify-content-center">
							<Icon
								icon="ix:clear"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
					<button
						onClick={() => { addDefault() }}
						className="violet_button navbar_button small_button40 ms-1"
					>
						<div className="d-flex align-items-center justify-content-center">
							<Icon
								icon="fluent:copy-add-20-regular"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
			</Modal>
		</div>
	);
});

export default SettingsButton;
