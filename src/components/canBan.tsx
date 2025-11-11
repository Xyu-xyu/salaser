import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import jobStore from '../store/jobStore';
import { ReactSortable } from 'react-sortablejs';
//import { showToast } from './toast';
import macrosStore from '../store/macrosStore';

const CanBan: React.FC = observer(() => {
	const { t } = useTranslation();
	const statuses: string[] = ['Loaded', 'Cutting', 'Pending', 'Completed'];
	const { mockCards } = jobStore;
	const { presets } = macrosStore;
	const setList = (status: string) => (newList: any) => {
 		jobStore.setCardOrder(status, newList);
	};

	return (
		<div className="kanbanContainer">
			{statuses.map((status) => {
				const cards = mockCards[status] ?? [];

				return (
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
								filter=""
								list={cards}
								setList={setList(status)} // Обновляем список карточек в store
								animation={75}
								easing="ease-out"
								className="d-flex flex-column sortableContainerClass"
								id={status}
								group="kanban"  // Одна группа для всех колонок, чтобы элементы могли перемещаться между колонками
								onEnd={(evt) => {
									const movedCardId = evt.item?.dataset?.id;
									//const targetStatus = evt.item?.dataset?.status;  // Колонка, откуда карточка была перемещена
									const newStatus = evt.to?.id
									//console.log(`Card with ID ${movedCardId} moved from ${targetStatus} to ${newStatus}`);
									jobStore.updateJobs('status', String(movedCardId), statuses.indexOf(newStatus) )
								}}
							>
								{cards.length > 0 ? (
									cards.map((card) => {
										const loadResult = JSON.parse(card.loadResult)

										return (
											<div key={card.id} className="kanbanCard" data-id={card.id} data-status={status} style={{ touchAction: 'none' }}>
												<div className="cardfileName">
													{card.name}
												</div>

												<div className="mt-2">
													<div className="cardTime">
														• {t('sheets')}:{ card.quantity }
													</div>
													<div className="cardMaterial">
														• {t(loadResult.result.jobinfo.attr.label)} {card.materialLabel} {loadResult.result.jobinfo.attr.thickness} {t('mm')}
													</div>
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
