import { makeAutoObservable } from "mobx";

class LaserStore {
	carouselInPlan: boolean = false;
	mainMode: string = "planMode";
	rightMode: Boolean = true
	knobMode: Boolean = false
	tasks: any[] = []; // тут будут задачи с бэка
	loading: boolean = false;
	error: string | null = null;


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

}

const laserStore = new LaserStore();
export default laserStore;