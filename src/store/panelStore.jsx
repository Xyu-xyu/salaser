import { makeAutoObservable } from "mobx";
import CONSTANTS from "./constants";


class PanelStore {

	positions = CONSTANTS.panelPostions
	maxZindex = 0
	constructor() {
		makeAutoObservable(this);
	}

	setMaxZindex (val) {
		this.maxZindex = val
	}

	getInitialPositions() {
		const ppp = JSON.parse(localStorage.getItem('ppp'));
		if (ppp) {
			for (let key in ppp) {
				if (ppp.hasOwnProperty(key)) {
					this.positions[key] = ppp[key];
				}
			}
		}
	}

	setPosition(id, positions) {
		this.positions[id]=positions
	}

}

const panelStore = new PanelStore();
export default panelStore; // Default export
