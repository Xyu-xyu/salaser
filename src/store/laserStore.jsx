import { makeAutoObservable, runInAction } from "mobx";
import { io, Socket } from "socket.io-client";
import constants from "./constants";




class LaserStore {
	
	mainMode = "planMode";
	rightMode = "plan"//plan, sheet, canBan ??
	leftMode = "plan" // plan | sheet | part
	planViewType ="CanBan"
	knobMode = false
	cutSeg = 0
	/** Текущий NCP/listing с `/api/listing` (синхрон с gcodeToSvg) — для прогресса и слайдера */
	listing = ""
	tasks = [];
	loading = false;
	error = null;
	intervalId = null;
	loadResult= '{}'
	centralBarMode = 'plans' //'planEditor' 'service'  'parrteditor'
	socket = null;
	paramsLimit = [];
	isLogined = false;

	constructor() {
		makeAutoObservable(this);
	}


	setVal (key, value) {
		if (key in this) {
			this[key] = value;
		}
	}

	setTasks(tasks) {
		this.tasks = tasks;
	}

	setLoading(loading) {
		this.loading = loading;
	}

	setError(error) {
		this.error = error;
	}

	async fetchTasks() {
		this.setLoading(true);
/* 		try {
			const response = await fetch("/api/tasks-info"); // Vite proxy или Flask build
			if (!response.ok) {
				throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
			}
			const data = JSON.parse(response)

 			if (JSON.stringify(data) !== JSON.stringify(laserStore.tasks)) {
				this.setTasks(data);
			} 
		} catch (error) {
			this.setError(error.message || "Неизвестная ошибка");
		} finally {
			this.setLoading(false);
		} */
		this.setTasks(['чacascaуй', 'gbpascaslf', 'scsacascas cacasca']);
		this.setLoading(false);
	}

	// запуск интервала (polling)
	startPolling(intervalMs = 10000) {
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

	initSocket() {
		if (laserStore.socket) return; // уже подключен — ничего не делаем

		//let lastUpdate = 0;

		this.socket = io(constants.SERVER_URL, {
			path: "/socket.io",
			transports: ["websocket"],
		});

		this.socket.on("connect", () => {
			console.log("✅ Connected to backend");
		});

		this.socket.on("disconnect", () => {
			console.log("❌ Disconnected from backend");
		});

		this.socket.on("machine_data", (data) => {
			//const now = Date.now();
			//if (lastUpdate) {
			//const diff = now - lastUpdate;
			//console.log(`⏱ Время между сообщениями: ${diff} мс`);
			//}

			//lastUpdate = now;
			runInAction(() => {
				this.paramsLimit = data;
				//console.log (data)
				const execLineValue =
					data.find((item) => item?.name === 'exec_line')?.val ?? 0;

				if (execLineValue > 0) {
					this.setVal('cutSeg', execLineValue);
				}
			});
		});
	}

    /** Отключение сокета и очистка */
    closeSocket() {
        if (this.socket) {
            this.socket.off("machine_data");
            this.socket.disconnect();
            this.socket = null;
            console.log("🔌 Socket disconnected");
        }
    }  

}

const laserStore = new LaserStore();
laserStore.initSocket()

export default laserStore;