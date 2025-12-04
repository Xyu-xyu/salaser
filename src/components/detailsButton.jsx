//import constants from "../store/constants";
//import laserStore from "../store/laserStore";
import jobStore from "../store/jobStore";
import { observer } from "mobx-react-lite";
//import { showToast } from "./toast";
import CustomIcon from "../icons/customIcon";
import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { Dropdown, DropdownButton, Modal } from "react-bootstrap";
import { showToast } from "./toast";
//import constants from "../store/constants";
import macrosStore from "../store/macrosStore";
import DetailsButtonImg from "./detailsButtonImg"


 

export const DetailsButton = observer(({ item }) => {

	const { selectedId } = jobStore
	const { presets } = macrosStore
	const { t } = useTranslation()
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const job = jobStore.getJobById(selectedId)

	const showModal = () => {
		if (job) {
			setShow(true)
		} else {
			showToast({
				type: 'warning',
				message: "No selected jobs",
				position: 'bottom-right',
				autoClose: 2500
			});
		}
	};



	const handleMaterialChange = (preset) => {
		jobStore.updateJobsInDB('preset', selectedId, preset)
		jobStore.updateJobById(selectedId, "preset", preset)
	}

	return (
		<>
			<button
				className="w-100"
				onClick={showModal}
				disabled={item === 'is_cutting'}>
				<div className="d-flex align-items-center">
					<CustomIcon
						icon="details"
						width="24"
						height="24"
						color="black"
						fill="black"
						strokeWidth={.5}
						className="ms-1"
					/>
					<div className="flex-grow-1 text-center">{t("Details")}</div>
				</div>
			</button>
			<Modal
				show={show}
				onHide={handleClose}
				className="with-inner-backdrop"
				centered={true}
				size="xl"
			>
				<div>
					<div
					/* style={{
						minHeight: 'calc(100vh * 0.5)',
						maxHeight: 'calc(100vh * 0.75)',
						minWidth: 'calc(100vw * 0.5)',
						overflowY: 'auto',
						overflowX: 'hidden',
					}} */
					>


						{job && [job].map((card) => {
							let loadResult = null;
							try {
								// Пытаемся распарсить, только если строка не пустая
								if (card.loadResult && typeof card.loadResult === 'string' && card.loadResult.trim() !== '') {
									loadResult = JSON.parse(card.loadResult);
								}
							} catch (e) {
								console.warn('Failed to parse loadResult for card:', card.id, e);
								loadResult = null; // В случае ошибки — считаем, что данных нет
							}

							return (
								<div key={card.id}
									className={"detailsCard"}
									data-id={card.id}
									data-status={status}
									style={{ touchAction: 'none' }}

								>
									<div className='d-flex justify-content-center align-items-center mb-2'>
										<div className="cardfileName mt-2">
											{card.name}
										</div>
										<div className="">
											{card.is_cutting === 1 &&
												<CustomIcon
													icon="LaserInCut"
													width="42"
													height="42"
													color="red"
													fill="none"
													strokeWidth={1}
													className="ms-1"
													viewBox='0 0 36 36'
												/>
											}


											{card.is_cutting === 0 && card.status === 0 &&
												<CustomIcon
													icon="LaserLoaded"
													width="42"
													height="42"
													color="green"
													fill="none"
													strokeWidth={1}
													className="ms-1"
													viewBox='0 0 36 36'
												/>
											}


											{card.is_cutting === 0 && card.status === 1 &&
												<CustomIcon
													icon="LaserPending"
													width="42"
													height="42"
													color="green"
													fill="none"
													strokeWidth={1}
													className="ms-1"
													viewBox='0 0 36 36'
												/>
											}


											{card.is_cutting === 0 && card.status === 3 &&
												<CustomIcon
													icon="LaserComplete"
													width="42"
													height="42"
													color="var(--violet)"
													fill="none"
													strokeWidth={1}
													className="ms-1"
													viewBox='0 0 36 36'
												/>
											}


											{card.is_cutting === 0 && card.status === 2 &&
												<CustomIcon
													icon="LaserPause"
													width="42"
													height="42"
													color="var(--violet)"
													fill="none"
													strokeWidth={1}
													className="ms-1"
													viewBox='0 0 36 36'
												/>
											}

										</div>

									</div>

							{/* 		<div className="detailsImage">
										<img src={`${constants.SERVER_URL}/api/get_svg/${card.id}`} alt={"img"} />
									</div> */}

									<DetailsButtonImg id={card.id}/>

									<div className="m-4">
										<div className="cardTime">
											• {t('sheets')}: {card.quantity}
										</div>

										{loadResult?.result?.jobinfo?.attr ? (
											<div className="cardMaterial">
												• {t(loadResult.result.jobinfo.attr.label)} {card.materialLabel} {loadResult.result.jobinfo.attr.thickness} {t('mm')}
											</div>
										) : (
											<div className="cardMaterial text-muted">
												• {t('No material info')}
											</div>
										)}

										<div className="cardMaterial">
											• {card.dimX} * {card.dimY} {t('mm')}
										</div>

											<div className="d-flex align-items-center">
												<div className="cardTech">
													• {t('macro')}:
												</div>
												<Dropdown>
													<DropdownButton
														variant="outline-primary"
														title={presets.find(preset => preset.id === card.preset)?.name || "Select Preset"} // Отображаем имя для текущего preset
														id={`preset-dropdown-${1}`}
														className="w-100"
													>
														{/* Мапим все presets в список */}
														{presets.map((preset, idx) => (
															<Dropdown.Item
																key={idx}
																eventKey={preset.id}
																onClick={() => handleMaterialChange(preset.id)}
																active={preset.id === card.preset}
															>
																{preset.name}
															</Dropdown.Item>
														))}
													</DropdownButton>
												</Dropdown>
											</div>											
									</div>
								</div>
							)
						})}
					</div>
				</div>
			</Modal>
		</>
	);
});



