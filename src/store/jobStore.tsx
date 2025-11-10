import { makeAutoObservable } from "mobx";
import { showToast } from "../components/toast";
import constants from "./constants";

interface JobInfoPart {
	debit: string;
	partcode: string;
}

interface JobInfoAttr {
	materialcode: string;
	dimx: string;
	jobcode: string;
	version: string;
	units: string;
	clamping: string;
	label: string;
	dimy: string;
	cuttechnology: string;
	formattype: string;
	thickness: string;
	id: number;
	fileName: string;
	preset: number;
	status:number;
}

interface JobInfo {
	parts: JobInfoPart[];
	isSGN: boolean;
	load_result: boolean;
	attr: JobInfoAttr;
	messages: any[];
}

interface LoadResult {
	success: boolean;
	result: {
		jobinfo: JobInfo;
		status: string;
		mode: string;
		workarea: number[];
	};
}


export interface FileData {
	id: string;
	name: string;
	material: string;
	materialLabel: string;
	dimX: number;
	dimY: number;
	quantity: number;
	preset: number | null;
	status: number;
	created_at: string;
	updated_at: string;
	loadResult: string | LoadResult;
}

class JobStore {


	mockCards: Record<string, JobInfoAttr[]> = {
		Loaded: [
			/*{
				id: 1,
				fileName: "nakladka_1.5_steel.ncp", progress: 10, time: 25.5, width: 3000, heigth: 1500,
				material: "steel", materialCode: "STEEL", gas: "O₂", macros: "STEEL 2", thickness: 2,
				imgSrc: 'public/images/06.08 1,5мм-01.svg'
			}*/
		],
		Cutting: [],
		Pending: [],
		Completed: [],
	};

	constructor() {
		makeAutoObservable(this, {});
	}

	setCardOrder(status: string, newList: JobInfoAttr[]) {
		console.log("update jobs")
		this.mockCards[status] = newList;
	}


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

	async loadJobs() {
		try {
			let resp = await fetch(`${constants.SERVER_URL}/jdb/get_jobs?limit=10`, {
				method: "GET",
				headers: {
					// Если нужно, добавляй заголовки
					// "Content-Type": "application/json"
				}
			});
	
			const data = await resp.json(); // Перемещаем `.json()` в `await`
	
			if (!data || !data.jobs) {
				// Если данные не загружены или отсутствуют
				showToast({
					type: 'error',
					message: "Loading failed",
					position: 'bottom-right',
					autoClose: 2500
				});
				return;
			}
	
			console.log(data);
	
			// Статусы
			const statuses = ["Loaded", "Cutting", "Pending", "Completed"];
	
			// Очищаем старые данные
			statuses.forEach(status => {
				jobStore.mockCards[status] = [];
			});
	
			// Перебираем все работы
			data.jobs.forEach((job: JobInfoAttr) => {
				// Проверяем, что status в допустимом диапазоне
				if (job.status >= 0 && job.status < statuses.length) {
					const statusKey = statuses[job.status];
	
					// Проверяем, что массив для текущего статуса существует
					if (!jobStore.mockCards[statusKey]) {
						jobStore.mockCards[statusKey] = [];
					}
	
					// Добавляем работу в массив
					jobStore.mockCards[statusKey].push(job);
				}
			});
	
		} catch (error) {
			console.error("Error loading jobs:", error);
			showToast({
				type: 'error',
				message: "An error occurred while loading jobs.",
				position: 'bottom-right',
				autoClose: 2500
			});
		}
	}
	
	
}

const jobStore = new JobStore();
export default jobStore;
