import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';

interface Card {
	id: number;
	fileName: string;
	progress: number;
	time: number,
	width?: number,
	widthSheet?: number,
	heigth?: number,
	heigthSheet?: number,
	material?: string,
	materialCode?: string,
	gas?: string,
	macros?: string,
	thickness?: number,
	imgSrc?: string
}

const mockCards: Record<string, Card[]> = {
	Loaded: [
		{
			id: 1,
			fileName: "nakladka_1.5_steel.ncp",	progress: 10,time: 25.5,width: 3000,heigth: 1500,
			material: "steel",materialCode: "STEEL",gas: "O₂",macros: "STEEL 2",thickness: 2,
			imgSrc: 'public/images/06.08 1,5мм-01.svg'
		},
		{
			id: 21,
			fileName: "nakladka_1.5_steel.ncp",	progress: 10,time: 25.5,width: 3000,heigth: 1500,
			material: "steel",materialCode: "STEEL",gas: "O₂",macros: "STEEL 2",thickness: 2,
			imgSrc: 'public/images/06.08 1,5мм-01.svg'
		},
		{
			id: 3,
			fileName: "nakladka_1.5_steel.ncp",	progress: 10,time: 25.5,width: 3000,heigth: 1500,
			material: "steel",materialCode: "STEEL",gas: "O₂",macros: "STEEL 2",thickness: 2,
			imgSrc: 'public/images/06.08 1,5мм-01.svg'
		},
		{
			id: 4,
			fileName: "nakladka_1.5_steel.ncp",	progress: 10,time: 25.5,width: 3000,heigth: 1500,
			material: "steel",materialCode: "STEEL",gas: "O₂",macros: "STEEL 2",thickness: 2,
			imgSrc: 'public/images/06.08 1,5мм-01.svg'
		},
		{
			id: 5,
			fileName: "nakladka_1.5_steel.ncp",	progress: 10,time: 25.5,width: 3000,heigth: 1500,
			material: "steel",materialCode: "STEEL",gas: "O₂",macros: "STEEL 2",thickness: 2,
			imgSrc: 'public/images/06.08 1,5мм-01.svg'
		},	

	],
	Cutting: [],
	Pending: [],
	Completed: [],
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
										<div className="cardfileName">{card.fileName}</div>

										{card.imgSrc && (
											<div className="cardImage">
												<img src={card.imgSrc} alt={card.fileName} />
											</div>
										)}

										<div className='mt-2'>
											{/* Time */}
												<div className="cardTime">
													• {card.time} {t('min')}											
												</div>	
												{/* Material info */}
												<div className="cardMaterial">
												• {card.thickness} {t("mm")} {card.material} • {card.width} * {card.heigth} {t("mm")} 											
												</div>
												{/* Gas & Macros */}
												<div className="cardTech">
												• {t("macro")}:{card.macros}  • {card.gas} 
												</div>
										</div>									
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