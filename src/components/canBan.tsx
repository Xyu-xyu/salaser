import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Card {
	id: number;
	title: string;
	progress: number;
}

const mockCards: Record<string, Card[]> = {
	Loaded: [
		{ id: 1, title: 'Order #1001', progress: 75 },
		{ id: 2, title: 'Order #1002', progress: 30 },
		{ id: 1000, title: "Order #1001", progress: 83 },
		{ id: 999,  title: "Order #1002", progress: 12 },
		{ id: 998,  title: "Order #1003", progress: 95 },
		{ id: 997,  title: "Order #1004", progress: 47 },
		{ id: 996,  title: "Order #1005", progress: 61 },
		{ id: 995,  title: "Order #1001", progress: 29 },
		{ id: 1000, title: "Order #1001", progress: 83 },
		{ id: 9,  title: "Order #1002", progress: 12 },
		{ id: 98,  title: "Order #1003", progress: 95 },
		{ id: 97,  title: "Order #1004", progress: 47 },
		{ id: 96,  title: "Order #1005", progress: 61 },
		{ id: 9,  title: "Order #1001", progress: 29 },
		{ id: 29,  title: "Order #1002", progress: 12 },
		{ id: 2298,  title: "Order #1003", progress: 95 },
		{ id: 22297,  title: "Order #1004", progress: 47 },
		{ id: 2296,  title: "Order #1005", progress: 61 },
		{ id: 229,  title: "Order #1001", progress: 29 },

	],
	Cutting: [
		{ id: 3, title: 'Order #1003', progress: 50 },
	],
	Pending: [],
	Completed: [
		{ id: 4, title: 'Order #1004', progress: 100 },
		{ id: 5, title: 'Order #1005', progress: 100 },
	],
};

const CanBan: React.FC = observer(() => {
	const { t } = useTranslation();
	const statuses: string[] = ['Loaded', 'Cutting', 'Pending', 'Completed'];

	return (
		<div className="kanbanContainer">
			{statuses.map((status) => {
				const cards = mockCards[status] ?? [];

				return (
					<div key={status} className="kanbanColumn">
						<div className="columnHeader">
							<h6 className='m-0 p-0'>{t(status)}</h6>
							<span className="cardCount">{cards.length}</span>
						</div>

						<div className="columnBody">
							{cards.length > 0 ? (
								cards.map((card) => (
									<div key={card.id} className="kanbanCard">
										<div className="cardTitle">{card.title}</div>

										{card.progress < 100 ? (
											<div className="progressContainer">
												<div className="progressLabel">
													{card.progress}% {t('done')}
												</div>
												<div className="progressBar">
													<div
														className="progressFill"
														style={{ width: `${100}%` }}
													/>
												</div>
											</div>
										) : (
											<div className="completedBadge">
												{t('Completed')}
											</div>
										)}
									</div>
								))
							) : (
								<div className="emptyState">{t('No tasks')}</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
});

export default CanBan;