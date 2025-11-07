import { makeAutoObservable } from "mobx";
import { showToast } from "../components/toast";
import constants from "./constants";

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
	/* 	Loaded: [
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
		Completed: [], */
	};

	constructor() {
		makeAutoObservable(this, {});
	}

	setCardOrder(status: string, newList: Card[]) {
		console.log("update jobs")
		this.mockCards[status] = newList;
	}

	async loadJobs() {

		/*		
			Чтобы получить данные с фильтрами, можно сделать HTTP GET-запрос с параметрами:
			GET /get_jobs?limit=10&offset=0&status=1&start_date=2023-01-01&end_date=2023-12-31&material=steel
			limit=10 — возвращает 10 записей.
			offset=0 — смещение на 0, то есть первая страница.
			status=1 — фильтрация по статусу (например, 1 для активных записей).
			start_date=2023-01-01 — фильтрация по дате начала.
			end_date=2023-12-31 — фильтрация по дате окончания.
			material=steel — фильтрация по материалу, содержащему слово steel.
		*/

		let resp = await fetch(`${constants.SERVER_URL}/jdb/get_jobs?limit=10`, {
			method: "GET",
			headers: {/*"Content-Type": "application/json"*/}

		});
		resp.json().then((data) => {
			if (!data) {
				showToast({
					type: 'error',
					message: "Loading failed",
					position: 'bottom-right',
					autoClose: 2500
				});
			} else {
				console.log(data)
			}

		})
	}
}

const jobStore = new JobStore();
export default jobStore;
