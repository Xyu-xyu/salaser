import { makeAutoObservable, runInAction } from "mobx";
import { showToast } from "../components/toast";
import constants from "./constants";
import svgStore from "./svgStore";
/* 
interface JobInfoAttr {
	thickness;
	id;
	preset;
	status;
	name;
	dimX;
	dimY;
	materialLabel;
	quantity;
	created_at;
	updated_at;
	loadResult;
	is_cutting
	array_id
}
 */


class JobStore {
	selectedId = ""
	mockCards= {
		Loaded: [],
		Cutting: [],
		Pending: [],
		Completed: [],
	};

	taskView = {
		Loaded: true,
		Cutting: true,
		Pending: true,
		Completed: true,
	};

	constructor() {
		makeAutoObservable(this, {});
	}

	get currentCuttingJobId() {
		for (const statusKey of Object.keys(this.mockCards)) {
			const job = this.mockCards[statusKey].find(j => j.is_cutting === 1);
			if (job) {
				return job.id;
			}
		}
		return ''; // ничего не режется
	}

	get isAnythingCutting() {
		return this.currentCuttingJobId !== '';
	}

	// Вспомогательный метод: сбросить все is_cutting = 0 (на случай перезапуска)
	clearAllCuttingFlags() {
		for (const statusKey of Object.keys(this.mockCards)) {
			this.mockCards[statusKey].forEach(job => {
			  if (job.is_cutting === 1) {
				// job.is_cutting = 0;
				this.updateJobById(job.id, "is_cutting", 0);
				this.updateJobById(job.id, "status", 3);
			  }
			});
		  }
	}

	setCardOrder(statusKey, newList) {
		const statuses = ["Loaded", "Cutting", "Pending", "Completed"];
		const statusIndex = statuses.indexOf(statusKey);
		if (statusIndex === -1) return;

		runInAction(() => {
			this.mockCards[statusKey] = newList.map(job => ({
				...job,
				status: statusIndex,
				// array_id: index, // раскомментируй, если нужно
			}));
		});
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
			data.jobs.forEach((job) => {
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
	
	setVal (key, value) {
		if (key in this) {
			this[key] = value;
			console.log(key, value)
		}
	}

	setTaskView ( option,val) {
		this.taskView[option] = val
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
		const statuses = ['Loaded', 'Cutting', 'Pending', 'Completed'];
		const res = [];

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
					console.log(`Error: ${data.error || data.message} `+ data.status);
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
	}

	updateJobsInDB (param, id, newValue) {
		console.log('Arguments:', param, id, newValue); // Для отладки

		// Отправка POST запроса на сервер
		fetch(`${constants.SERVER_URL}/jdb/update_job`, {
			method: 'POST',
			headers: {/*'Content-Type': 'application/json',*/ },
			body: JSON.stringify({
				"param": param,
				"id": id,
				"value": newValue
			})
		})
		.then(response => response.json())
		.then(data => {
			console.log('Server Response:', data);

			if (data.status === "success") {
				// Если обновление прошло успешно, выводим сообщение на фронте
				console.log(`Job ${param} updated successfully to: ` + newValue);
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

	updateJobById(id, param, newValue) {
		const statuses = ["Loaded", "Cutting", "Pending", "Completed"];
	  
		for (const statusKey of Object.keys(this.mockCards)) {
		  const jobsArray = this.mockCards[statusKey];
	  
		  const job = jobsArray.find(job => job.id === id);
		  if (job) {
			// Если меняется статус — перемещаем!
			if (param === 'status' && typeof newValue === 'number') {
			  const newStatusKey = statuses[newValue];
	  
			  if (newStatusKey && newStatusKey !== statusKey) {
				runInAction(() => {
				  // Удаляем из старого
				  const index = jobsArray.indexOf(job);
				  if (index !== -1) jobsArray.splice(index, 1);
	  
				  // Обновляем и добавляем в новый
				  job.status = newValue;
				  this.mockCards[newStatusKey].push(job);
				});
	  
				this.updateJobsInDB(param, id, newValue);
				return true;
			  }
			}
	  
			// Обычное обновление поля
			runInAction(() => {
			  job[param] = newValue;
			});
	  
			this.updateJobsInDB(param, id, newValue);
			return true;
		  }
		}
	  
		console.warn(`Job with id ${id} not found`);
		return false;
	}

	getJobById (id) {
		for (const statusKey of Object.keys(this.mockCards)) {
			const jobsArray = this.mockCards[statusKey];
		
			const job = jobsArray.find(job => job.id === id);
			if (job) {			 		 
			  return job;
			}
		}
		return false;
	}

	async saveNcpToServer(ncpText) {

		if (!this.selectedId) return;
	
		let resp = await fetch(constants.SERVER_URL + "/jdb/update_ncp", {
			method: "POST",
			headers: {
				/*"Content-Type": "application/json"*/
			},
			body: JSON.stringify({
				uuid: this.selectedId,
				content: ncpText.join("\n")
			})
		})
	
		if (!resp.ok)
			throw new Error("Update failed")
	
		const data = await resp.json()
		console.log("updated:", data)	
		jobStore.loadJobs()
	}


	async saveNcpAsNewSheet( ncpText ) {

		const material = "Mild steel"
		const materialLabel = "S235JR"
		const { name, thickness, quantity, width, height, presetId } = svgStore.svgData
		
		const fileData = {
			name:name,
			thickness:thickness,
			quantity:quantity,
			preset: presetId,
			material:material,
			materialLabel:materialLabel,
			dimX: width,
			dimY: height,
			file: ncpText.join("\n")
		}

		//console.log( fileData )
		//console.log( ncpText )

	 
		let resp = await fetch(
			constants.SERVER_URL + "/jdb/create_from_ncp",
			{
				method: "POST",
				headers: {},
				body: JSON.stringify(fileData)
			}
		) 
	
	 	if (!resp.ok)
			throw new Error("create sheet failed")
	
		const data = await resp.json() 
	
		console.log("created:", data)
	 
		jobStore.loadJobs() 	
	}
	
}

const jobStore = new JobStore();
jobStore.loadJobs()
export default jobStore;
