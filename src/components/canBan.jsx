import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import jobStore from '../store/jobStore';
import { ReactSortable } from 'react-sortablejs';
//import { showToast } from './toast';
import macrosStore from '../store/macrosStore';
import { useEffect } from 'react';
import constants from '../store/constants';
import CustomIcon from '../icons/customIcon';

const CanBan = observer(() => {
	const { t } = useTranslation();
	const statuses = ['Loaded', 'Cutting', 'Pending', 'Completed'];
	const { mockCards, selectedId, taskView } = jobStore;
	const { presets } = macrosStore;
	const setList = (status) => (newList) => {
		jobStore.setCardOrder(status, newList);
	};
	const handleMouseDown = (id) => {
		console.log("Setting selected to:", id);
		jobStore.setVal('selectedId', id);
	};


	useEffect(() => {
		if (!presets.length) macrosStore.fetchPresets();
	}, [])

	return (
		<div className="kanbanContainer">
			{statuses.map((status) => {
				const cards = mockCards[status] ?? [];

				return ( taskView[status] &&
					<div key={status} className="kanbanColumn" id={status}>
						<div className="columnHeader">
							<h6 className="m-0 p-0">{t(status)}</h6>
							<span className="cardCount">{cards.length}</span>
						</div>

						<div className="columnBody gridWrapper">
							{/* ReactSortable для перетаскивания карточек */}
							<ReactSortable
								dragClass="sortableDrag"
								ghostClass="sortableGhost"
								filter=".is_cutting"
								list={cards}
								setList={setList(status)} // Обновляем список карточек в store
								animation={75}
								easing="ease-out"
								className="d-flex flex-column sortableContainerClass"
								id={status}
								group="kanban"
								draggable=".kanbanCard:not(.is_cutting)"   // только не-режущиеся можно брать

								// УСЛОЖНЁННАЯ ЛОГИКА: блокируем вставку ТОЛЬКО ПЕРЕД is_cutting
								onMove={(evt) => {
									const { dragged, related } = evt;

									// Если курсор над is_cutting элементом
									if (related && related.classList.contains('is_cutting')) {
										// Получаем координаты
										const relatedRect = related.getBoundingClientRect();
										const draggedRect = dragged.getBoundingClientRect();

										// Проверяем, куда пытаются вставить: перед или после?
										// (предполагаем вертикальный список — dragged.top > related.top значит "ниже" = после)
										const isDroppingAfter = draggedRect.top > relatedRect.top + (relatedRect.height / 2);

										if (!isDroppingAfter) {
											return false; // ЗАПРЕЩАЕМ вставку ПЕРЕД is_cutting
										}
									}

									return true; // Разрешаем в остальных случаях (включая ПОСЛЕ is_cutting)
								}}// Одна группа для всех колонок, чтобы элементы могли перемещаться между колонками
								onEnd={(/*evt*/) => {
									//const movedCardId = evt.item?.dataset?.id;
									//const targetStatus = evt.from?.id;  // Колонка, откуда карточка была перемещена
									//const newStatus = evt.to?.id
									//console.log(`Card with ID ${movedCardId} moved from ${targetStatus} to ${newStatus}`);
									jobStore.updateAllJobs()
								}}


							>
								{cards.length > 0 ? (
									cards.map((card) => {
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
												className={`${card.id === selectedId ? " selected " : ""} ${card.is_cutting === 1 ? " is_cutting kanbanCard " : " kanbanCard "}`}
												data-id={card.id}
												data-status={status}
												style={{ touchAction: 'none' }}
												onPointerDown={() => { handleMouseDown(card.id) }}

											>
												<div className='d-flex justify-content-between align-items-center'>
													<div className="cardfileName">
														{card.name}
													</div>
													{card.is_cutting === 1 &&
														<CustomIcon
															icon="LaserInCut"
															width="42"
															height="42"
															color="red"
															fill="none"
															strokeWidth={1.5}
															className="ms-1"
															viewBox='0 0 36 36'
														/>
													}
												</div>


												<div className="cardImage">
													<img src={`${constants.SERVER_URL}/api/get_svg/${card.id}`} alt={"img"} />
												</div>

												<div className="mt-2">
													<div className="cardTime">
														• {t('sheets')}: {card.quantity}
													</div>

													{/* Безопасно отображаем данные из loadResult */}
													{loadResult?.result?.jobinfo?.attr ? (
														<div className="cardMaterial">
															• {t(loadResult.result.jobinfo.attr.label ? loadResult.result.jobinfo.attr.label  :"no label")} {card.materialLabel} {loadResult.result.jobinfo.attr.thickness} {t('mm')}
														</div>
													) : (
														<div className="cardMaterial text-muted">
															• {t('No material info')}
														</div>
													)}

													<div className="cardMaterial">
														• {card.dimX} * {card.dimY} {t('mm')}
													</div>

													{presets.map((preset) =>
														preset.id === card.preset ? (
															<div className="cardTech" key={preset.id}>
																• {t('macro')}: {preset.name}
															</div>
														) : null
													)}
												</div>
											</div>
										);
									})
								) : (
									<div className="emptyState" data-status={status}>{t('No tasks')}</div>
								)}
							</ReactSortable>
						</div>
					</div>
				);
			})}
		</div>
	);
});

export default CanBan;
