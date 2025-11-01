import { makeAutoObservable } from "mobx";

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

class JobStore {


	mockCards: Record<string, Card[]> = {
		Loaded: [
			{
				id: 1,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},
			{
				id: 21,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},
			{
				id: 3,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},
			{
				id: 4,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},
			{
				id: 5,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},

		],
		Cutting: [

			{
				id: 74,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},
			{
				id: 75,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},
			{
				id: 764,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			},
			{
				id: 99,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			}
		],
		Pending: [{
			id: 44,
			fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
			material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
			imgSrc: 'public/images/06.08 1,5мм-01.svg'
		},
		{
			id: 55,
			fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
			material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
			imgSrc: 'public/images/06.08 1,5мм-01.svg'
		},],
		Completed: [],
	};

	constructor() {
		makeAutoObservable(this, {});
	}

	/* 	// Перемещение карточки внутри одной колонки
		moveCardWithinColumn(status: string, fromIndex: number, toIndex: number) {
			const cards = this.mockCards[status];
			if (cards && fromIndex >= 0 && toIndex >= 0 && fromIndex < cards.length && toIndex < cards.length) {
				const [movedCard] = cards.splice(fromIndex, 1); // Убираем карточку из текущей позиции
				cards.splice(toIndex, 0, movedCard); // Вставляем на новое место
			}
		}
	
		moveCardBetweenColumns(fromStatus: string, toStatus: string, cardId: number, toIndex: number) {
			const fromColumn = this.mockCards[fromStatus];
			const toColumn = this.mockCards[toStatus];
		
			// Находим карточку, которую нужно переместить
			const cardIndex = fromColumn.findIndex(card => card.id === cardId);
			if (cardIndex !== -1) {
				const [movedCard] = fromColumn.splice(cardIndex, 1); // Убираем карточку из исходной колонки
				// Проверяем, если toIndex больше длины целевой колонки, то вставляем в конец
				if (toIndex > toColumn.length) {
					toColumn.push(movedCard);
				} else {
					toColumn.splice(toIndex, 0, movedCard);
				}
			}
		} */

	setCardOrder(status: string, newList: Card[]) {
		console.log("update jobs")
		this.mockCards[status] = newList;
	}


}

const jobStore = new JobStore();
export default jobStore;
