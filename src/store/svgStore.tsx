import { makeAutoObservable } from "mobx";

// Define interfaces for the data structures
interface Matrix {
	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;
}

interface Offset {
	x: number;
	y: number;
}

interface RectParams {
	x: number;
	y: number;
	width: number;
	height: number; // Fixed typo: "heigh" -> "height"
}

interface GridState {
	xsGrid: {
		visibility: string;
		fill: string;
	};
	smallGrid: {
		visibility: string;
		fill: string;
	};
	grid: {
		visibility: string;
		fill: string;
	};
}

interface SvgParams {
	width: number;
	height: number;
}

class SvgStore {
	// Define properties with type annotations
	svgParams: SvgParams = { width: 0, height: 0 };
	matrix: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	groupMatrix: Matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	offset: Offset = { x: 0, y: 0 };
	rectParams: RectParams = { x: 0, y: 0, width: 0, height: 0 }; // Fixed typo: "heigh" -> "height"
	gridState: GridState = {
		xsGrid: {
			visibility: "visible",
			fill: "var(--gridColorFill)",
		},
		smallGrid: {
			visibility: "visible",
			fill: "none",
		},
		grid: {
			visibility: "visible",
			fill: "none",
		},
	};

	constructor() {
		makeAutoObservable(this, {});
	}

	setGroupMatrix(val: Partial<Matrix>) {
		Object.assign(this.groupMatrix, val);
	}

	setOffset(val: Partial<Offset>) {
		Object.assign(this.offset, val);
	}

	setRectParams(val: Partial<RectParams>) {
		Object.assign(this.rectParams, val);
	}

	setGridState(val: Partial<GridState>) {
		Object.assign(this.gridState, val);
	}

	setSvgParams(val: Partial<SvgParams>) {
		Object.assign(this.svgParams, val);
	}


	setMatrix(val: Matrix) {
		Object.assign(this.matrix, val)
	}
}

const svgStore = new SvgStore();
export default svgStore;
