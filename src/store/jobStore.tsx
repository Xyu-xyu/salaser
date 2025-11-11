import { makeAutoObservable } from "mobx";
import { showToast } from "../components/toast";
import constants from "./constants";

interface JobInfoAttr {
	thickness: string;
	id: number;
	preset: number;
	status: number;
	name: string;
	dimX: number;
	dimY: number;
	materialLabel: string;
	quantity: number;
	created_at: string;
	updated_at: string;
	loadResult: string;
}



class JobStore {
	mockCards: Record<string, JobInfoAttr[]> = {
		Loaded: [],
		Cutting: [],
		Pending: [],
		Completed: [],
	};

	constructor() {
		makeAutoObservable(this, {});
	}

	setCardOrder(status: string, newList: JobInfoAttr[]) {
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

	updateJobs(param:string, id:string, newValue:any) {
		console.log('Arguments:', param, id, newValue); // Для отладки
	
		// Отправка POST запроса на сервер
		fetch(`${constants.SERVER_URL}/jdb/update_job`, {
			method: 'POST',
			headers: {/*'Content-Type': 'application/json',*/},
			body: JSON.stringify({
				param: param,
				id: id,
				value: newValue
			})
		})
		.then(response => response.json())
		.then(data => {
			console.log('Server Response:', data);
	
			if (data.status === "success") {
				// Если обновление прошло успешно, выводим сообщение на фронте
				console.log (`Job ${param} updated successfully!`);
				// Обновляем интерфейс (например, список задач или отображаем измененные данные)
 			} else {
				// В случае ошибки выводим сообщение
				console.log  (`Error: ${data.error || data.message}`);
			}
		})
		.catch(error => {
			console.error('Error:', error);
 		});
	}
}

const jobStore = new JobStore();
jobStore.loadJobs()
export default jobStore;
