import { makeAutoObservable } from "mobx";
import { showToast } from "../components/toast";
import constants from "./constants";

interface JobInfoAttr {
	thickness: string;
	id: string;
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
	is_cutting: number
	array_id: number
}



class JobStore {
	selectedId: string = ""
	mockCards: Record<string, JobInfoAttr[]> = {
		Loaded: [],
		Cutting: [],
		Pending: [],
		Completed: [],
	};

	constructor() {
		makeAutoObservable(this, {});
	}

	get currentCuttingJobId(): string {
		for (const statusKey of Object.keys(this.mockCards) as (keyof typeof this.mockCards)[]) {
			const job = this.mockCards[statusKey].find(j => j.is_cutting === 1);
			if (job) {
				return job.id;
			}
		}
		return ''; // ничего не режется
	}

	get isAnythingCutting(): boolean {
		return this.currentCuttingJobId !== '';
	}

	// Вспомогательный метод: сбросить все is_cutting = 0 (на случай перезапуска)
	clearAllCuttingFlags() {
		for (const statusKey of Object.keys(this.mockCards) as (keyof typeof this.mockCards)[]) {
			this.mockCards[statusKey].forEach(job => {
				if (job.is_cutting === 1) {
					job.is_cutting = 0;
					this.updateJobById(job.id, 'is_cutting', 0)
				}
			});
		}
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

	updateJobs(param: string, id: string, newValue: any) {
		console.log('Arguments:', param, id, newValue); // Для отладки

		// Отправка POST запроса на сервер
		fetch(`${constants.SERVER_URL}/jdb/update_job`, {
			method: 'POST',
			headers: {/*'Content-Type': 'application/json',*/ },
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
					console.log(`Job ${param} updated successfully!`);
					// Обновляем интерфейс (например, список задач или отображаем измененные данные)
				} else {
					// В случае ошибки выводим сообщение
					console.log(`Error: ${data.error || data.message}`);
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}

	setVal<T extends keyof this>(key: T, value: this[T]) {
		if (key in this) {
			this[key] = value;
			console.log(key, value)
		}
	}

	async deleteJob() {
		if (jobStore.selectedId) {

			fetch(constants.SERVER_URL + '/jdb/delete_job', {
				method: "POST",
				headers: {/*"Content-Type": "application/json"*/ },
				body: JSON.stringify({ id: jobStore.selectedId })
			})
				.then(response => response.json())
				.then(data => {
					console.log('Server Response:', data);

					if (data.status === "success") {
						jobStore.setVal('selectedId', "")
						//ТУТ можно просто найти у удалить из массива такой id
						jobStore.loadJobs()
					} else {
						// В случае ошибки выводим сообщение
						console.error("Ошибка при удалении:");
					}
				})
		}
	}

	updateAllJobs() {

		// Проходим по ключам объекта mockCards
		const statuses = ['Loaded', 'Cutting', 'Pending', 'Completed'] as const;
		const res: { id: string; array_id: number; status: number }[] = [];

		for (const status of statuses) {
			const cards = this.mockCards[status];
			cards.forEach((card, index) => {
				res.push({
					id: card.id,
					array_id: index,
					status: statuses.indexOf(status), // или ваш объект statuses[status]
				});
			});
		}

		fetch(`${constants.SERVER_URL}/jdb/update_job_list`, {
			method: 'POST',
			headers: {/*'Content-Type': 'application/json',*/ },
			body: JSON.stringify(res)
		})
			.then(response => response.json())
			.then(data => {
				console.log('Server Response:', data);

				if (data.status === "success") {
					console.log(`Jobs updated successfully!`);
				} else {
					// В случае ошибки выводим сообщение
					console.log(`Error: ${data.error || data.message}`);
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}

	updateJobById(id: string, param: keyof JobInfoAttr, newValue: any) {
		// Проходим по всем статусам
		for (const statusKey of Object.keys(this.mockCards) as (keyof typeof this.mockCards)[]) {
			const jobsArray = this.mockCards[statusKey];

			const job = jobsArray.find(job => job.id === id);
			if (job) {
				// Прямое присваивание — MobX отследит изменение
				(job as any)[param] = newValue;

				// Если нужно — можно дополнительно триггерить реакцию
				// Но в 99% случаев MobX сам всё увидит
				return true; // найдено и обновлено
			}
		}

		console.warn(`Job with id ${id} not found`);
		return false; // не найдено
	}

}

const jobStore = new JobStore();
jobStore.loadJobs()
export default jobStore;
