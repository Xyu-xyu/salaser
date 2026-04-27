import { makeAutoObservable } from "mobx";

const STORAGE_KEY = "tipsEnabled";

class TipsStore {
	tipsEnabled = true;

	constructor() {
		makeAutoObservable(this);
		this.tipsEnabled = this.#loadFromStorage();
	}

	#loadFromStorage() {
		if (typeof localStorage === "undefined") {
			return true;
		}
		const raw = localStorage.getItem(STORAGE_KEY);
		if (raw === null) {
			// Backward compatibility with previous "tips" key.
			const legacy = localStorage.getItem("tips");
			if (legacy === "Hide Tips") return false;
			if (legacy === "Show Tips") return true;
			return true;
		}
		return raw === "1" || raw === "true";
	}

	setTipsEnabled(val) {
		this.tipsEnabled = Boolean(val);
		if (typeof localStorage !== "undefined") {
			localStorage.setItem(STORAGE_KEY, this.tipsEnabled ? "1" : "0");
		}
	}
}

export default new TipsStore();

