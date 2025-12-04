import { makeAutoObservable } from "mobx";
import CONSTANTS from "./constants";


class PanelStore {

	positions = CONSTANTS.panelPostions
	constructor() {
		makeAutoObservable(this);
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
