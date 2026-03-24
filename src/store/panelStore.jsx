import { makeAutoObservable } from "mobx";
import CONSTANTS from "./constants";


class PanelStore {

	positions = CONSTANTS.panelPostions
	maxZindex = 0
	dockMode = false
	isInitialized = false
	constructor() {
		makeAutoObservable(this);
	}

	setMaxZindex (val) {
		if (typeof val !== 'number') debugger;
		this.maxZindex = val
	}

	getInitialPositions() {
		if (this.isInitialized) return;
		const ppp = JSON.parse(localStorage.getItem('ppp'));
		if (ppp) {
			for (let key in ppp) {
				if (ppp.hasOwnProperty(key)) {
					this.positions[key] = ppp[key];
				}
			}
		}
		const savedDockMode = localStorage.getItem('panelDockMode');
		if (savedDockMode !== null) {
			this.dockMode = savedDockMode === 'true';
		}
		this.isInitialized = true;
	}

	setPosition(id, positions) {
		this.positions[id]=positions
	}

	savePositions() {
		localStorage.setItem('ppp', JSON.stringify(this.positions));
	}

	setPositions(positions) {
		this.positions = positions;
		this.savePositions();
	}

	collapsePanels(keepIds = []) {
		const keepIdsSet = new Set(keepIds);
		const nextPositions = Object.fromEntries(
			Object.entries(this.positions).map(([key, value]) => [
				key,
				keepIdsSet.has(key)
					? value
					: {
						...value,
						mini: true,
					},
			])
		);

		this.positions = nextPositions;
		this.savePositions();
	}

	setDockMode(value) {
		this.dockMode = Boolean(value);
		localStorage.setItem('panelDockMode', String(this.dockMode));
	}

	toggleDockMode() {
		this.setDockMode(!this.dockMode);
	}

}

const panelStore = new PanelStore();
export default panelStore; // Default export
