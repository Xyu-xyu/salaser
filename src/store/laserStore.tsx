import { makeAutoObservable } from "mobx";
import axios from "axios";

class LaserStore {
	carouselInPlan: boolean = false;
	mainMode: string = "planMode";
	rightMode: Boolean = true
	knobMode: Boolean = false
	tasks: any[] = []; // тут будут задачи с бэка
	loading: boolean = false;
	error: string | null = null;
	private intervalId: ReturnType<typeof setInterval> | null = null;
	loadResult:string= `{"success": true, "result": {"jobinfo": {}, "status": "IDLE", "mode": "NCP", "workarea": [3100, 2600]}}`


	constructor() {
		makeAutoObservable(this);
	}


	setVal<T extends keyof this>(key: T, value: this[T]) {
		if (key in this) {
			this[key] = value;
		}
	}

	setTasks(tasks: any[]) {
		this.tasks = tasks;
	}

	setLoading(loading: boolean) {
		this.loading = loading;
	}

	setError(error: string | null) {
		this.error = error;
	}

	async fetchTasks() {
		this.setLoading(true);
		try {
			const response = await axios.get("http://127.0.0.1/tasks-info");
			if (JSON.stringify(response.data) !== JSON.stringify(laserStore.tasks)){
				this.setTasks(response.data);	
			}		  
		} catch (error: any) {
		  this.setError(error.message);
		} finally {
		  this.setLoading(false);
		}
	  }
	
	  // запуск интервала (polling)
	  startPolling(intervalMs: number = 10000) {
		this.fetchTasks(); // первый вызов сразу
		if (this.intervalId) clearInterval(this.intervalId);
		this.intervalId = setInterval(() => this.fetchTasks(), intervalMs);
	  }
	
	  // остановка интервала
	  stopPolling() {
		if (this.intervalId) {
		  clearInterval(this.intervalId);
		  this.intervalId = null;
		}
	}

}

const laserStore = new LaserStore();
export default laserStore;