import { makeAutoObservable } from "mobx";

class LaserStore {
	carouselInPlan: boolean = false;
	mainMode: string = "planMode";
	rightMode: Boolean = true
	knobMode: Boolean = false
	tasks: {
		categories?: {
		  active?: {
			items?: any[];
		  };
		};
	  } = {};
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

	setTasks(tasks: {
		categories?: {
		  active?: {
			items?: any[];
		  };
		};
	  }) {
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
			const response = await fetch("http://127.0.0.1/tasks-info");
			if (!response.ok) {
				throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
			}
			const data = await response.json();

			// сравниваем с текущими задачами
			if (JSON.stringify(data) !== JSON.stringify(laserStore.tasks)) {
				this.setTasks(data);
			}
		} catch (error: any) {
			this.setError(error.message || "Неизвестная ошибка");
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