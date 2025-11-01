import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import jobStore from '../store/jobStore';
import { ReactSortable } from 'react-sortablejs';
//import { showToast } from './toast';
import constants from '../store/constants';

const CanBan: React.FC = observer(() => {
	const { t } = useTranslation();
	const statuses: string[] = ['Loaded', 'Cutting', 'Pending', 'Completed'];
	const {  mockCards } = jobStore;
	const setList = (status: string) => (newList: any) => {
		// Обновляем порядок карточек в соответствующем статусе
		jobStore.setCardOrder( status, newList);
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
						group="kanban"  // Одна группа для всех колонок, чтобы элементы могли перемещаться между колонками
						onEnd={(evt) => {
						  const movedCardId = evt.item?.dataset?.id;
						  const targetStatus = evt.item?.dataset?.status;  // Колонка, откуда карточка была перемещена
						  const newStatus = evt.to?.id
 						  console.log(`Card with ID ${movedCardId} moved from ${targetStatus} to ${newStatus}`);
						}}
					  >
						{cards.length > 0 ? (
						  cards.map((card) => (
							<div key={card.id} className="kanbanCard" data-id={card.id} data-status={status} style={{ touchAction: 'none' }}>
							  <div className="cardfileName">
								{card.id} + {card.fileName}
							  </div>
		
							  {card.imgSrc && (
								<div className="cardImage">
								  <img src={`${constants.SERVER_URL}/api/random-image?random=${card.id}`} alt={card.fileName} />
								</div>
							  )}
		
							  <div className="mt-2">
								<div className="cardTime">
								  • {card.time} {t('min')}
								</div>
								<div className="cardMaterial">
								  • {card.thickness} {t('mm')} {card.material} • {card.width} * {card.heigth} {t('mm')}
								</div>
								<div className="cardTech">
								  • {t('macro')}: {card.macros} • {card.gas}
								</div>
							  </div>
							</div>
						  ))
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
