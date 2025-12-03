// stores/CoordsStore.ts
import { makeAutoObservable } from "mobx";

interface Coords {
	x: number;
	y: number;
	width: number;
	height: number;
}


interface Matrix {
	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;
}

interface FittedPosition {
	matrix: Matrix;
	groupMatrix: Matrix;
	rectParams: Coords;
}

class CoordsStore {
	coords: Coords = { x: 0, y:0, width:500, height:500 };
	preloader:boolean = false
	needToFit = false;
	fittedPosition: FittedPosition = {
		matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
		groupMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
		rectParams: { x: 0, y: 0, width:500, height:500 }
	}



	constructor() {
		makeAutoObservable(this);
	}

	setCoords = (newCoords: Coords): void => {
		this.coords = newCoords;
	};

	setNeedToFit = (val: boolean): void => {
		this.needToFit = val;
	};

	setFittedPosition = (val:FittedPosition): void => {
		this.fittedPosition = val;
	};

	setPreloader = (val: boolean): void => {
		this.preloader = val;
	};
}

// Singleton instance
const coordsStore = new CoordsStore();
export default coordsStore;