import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../../store/viewStore";
import { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import { showToast } from "../toast";
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

	const showModal = () => setShow(true);
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

	async function deletePreset(id: number) {
		await fetch(api_host + `/db/deletepreset?id=${id}`, {
			method: "DELETE"
		}).then(() => {
			setUpdate(true)
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

	async function addDefault () {
		let defaults = utils.getDefaultsFromSchema()
		console.log (JSON.stringify(defaults))
		savePreset (defaults)
	}

	async function savePreset (preset:object) {
		await fetch(api_host + `/db/savepreset`, {
			method: "POST",
			headers: {
				/* "Content-Type": "application/json" */
			},
			body: JSON.stringify( preset )
		}).then(() => {
			setUpdate(true)
		})
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
							minHeight: '500px',
							maxHeight: '900px',
							overflowY: 'auto',
							overflowX: 'hidden',
						}}
					>
						<table style={{ width: '100%', borderCollapse: 'collapse' }} className="table table-striped table-hover">
							<thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
								<tr>
									<th style={{ cursor: 'pointer' }} onClick={() => sortPresets('code')}>
										Code {sortKey === 'code' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th style={{ cursor: 'pointer' }} onClick={() => sortPresets('name')}>
										Name {sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th style={{ cursor: 'pointer' }} onClick={() => sortPresets('thickness')}>
										Thickness {sortKey === 'thickness' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th style={{ cursor: 'pointer' }} onClick={() => sortPresets('ts')}>
										Timestamp {sortKey === 'ts' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
									</th>
									<th>Actions</th>
								</tr>
							</thead>
							<tbody>
								{sortedPresets.map((preset) => (
									<tr key={preset.id}>
										<td>{preset.code}</td>
										<td>{preset.name}</td>
										<td>{preset.thickness}</td>
										<td>{preset.ts}</td>
										<td>
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
																	width="36"
																	height="36"
																	style={{ color: 'white' }}
																/>
															</div>
														</button>
													</div>
												) : (
													<div className="d-flex">
														<div className="mx-2 mt-1">
															<button
																onClick={() => { }}
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
																onClick={() => copyPreset(preset.id)}
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
																onClick={() => deletePreset(preset.id)}
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
						onClick={() =>{}}
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
						onClick={() => { addDefault()}}
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




/* 	const sentToLaser = () => {
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
 */
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


/*

async function updatePreset(data: any) {
	let resp = await fetch(api_host + "/db/updatepreset", {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(data)
	});
	return await resp.json();
} */

