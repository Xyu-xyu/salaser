// stores/CoordsStore.ts
import { makeAutoObservable } from "mobx";


class CoordsStore {
	coords = { x: 0, y:0, width:500, height:500 };
	preloader = false
	needToFit = false;
	fittedPosition = {
		matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
		groupMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
		rectParams: { x: 0, y: 0, width:500, height:500 }
	}

	constructor() {
		makeAutoObservable(this);
	}

	setCoords = (newCoords)=> {
		this.coords = newCoords;
	};

	setNeedToFit = (val)=> {
		this.needToFit = val;
	};

	setFittedPosition = (val)=> {
		this.fittedPosition = val;
	};

	setPreloader = (val)=> {
		this.preloader = val;
	};
}

// Singleton instance
const coordsStore = new CoordsStore();
export default coordsStore;