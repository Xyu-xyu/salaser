import { makeAutoObservable, runInAction } from "mobx";
import { io, Socket } from "socket.io-client";
import constants from "./constants";

type ParamLimit = {
    name: string;
    measure: string;
    val: number;
};


class LaserStore {
	
	mainMode: string = "planMode";
	rightMode: string = "plan"//plan, sheet, canBan ??
	leftMode: string = "plan" //functions parameter, plan
	planViewType: string ="CanBan"
	knobMode: boolean = false
	cutSeg:number = 0
	tasks:string[]  = [];
	loading: boolean = false;
	error: string | null = null;
	private intervalId: ReturnType<typeof setInterval> | null = null;
	loadResult:string= `{"status":"PARSED","mode":"NCP","workarea":[700,700],"async_busy":false,"async_result":1,"async_lines":1293,"async_message":"OK: 1293 lines","jobinfo":{"attr":{"dimx":"700","dimy":"700","label":"Mild_Steel","thickness":"10.0","jobcode":"Test"},"messages":[],"load_result":true,"parts_count":8,"estimation_s":232.7,"parts":[{"partcode":"28___10__1","debit":1},{"partcode":"550_01_00_013___10__1","debit":1},{"partcode":"114___10__2","debit":6},{"partcode":"33___10__1","debit":1},{"partcode":"13___10__4","debit":1},{"partcode":"22___10__1","debit":1},{"partcode":"108___10__1","debit":1},{"partcode":"007___10__2","debit":1}]}}`
	centralBarMode:string = 'planEditor'
	socket: Socket | null = null;
	paramsLimit: ParamLimit[] = [];
	isLogined:boolean = false;

	constructor() {
		makeAutoObservable(this);
	}


	setVal<T extends keyof this>(key: T, value: this[T]) {
		if (key in this) {
			this[key] = value;
		}
	}

	setTasks(tasks:string[]) {
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
/* 		try {
			const response = await fetch("/api/tasks-info"); // Vite proxy или Flask build
			if (!response.ok) {
				throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
			}
			const data = JSON.parse(response)

 			if (JSON.stringify(data) !== JSON.stringify(laserStore.tasks)) {
				this.setTasks(data);
			} 
		} catch (error: any) {
			this.setError(error.message || "Неизвестная ошибка");
		} finally {
			this.setLoading(false);
		} */
		this.setTasks(['чacascaуй', 'gbpascaslf', 'scsacascas cacasca']);
		this.setLoading(false);
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

		this.socket.on("machine_data", (data: any) => {
			//const now = Date.now();
			//if (lastUpdate) {
			//const diff = now - lastUpdate;
			//console.log(`⏱ Время между сообщениями: ${diff} мс`);
			//}

			//lastUpdate = now;
			runInAction(() => {
				this.paramsLimit = data;
				const execLineValue =
					data.find((item: any) => item?.name === 'exec_line')?.val ?? 0;

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