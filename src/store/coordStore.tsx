// stores/CoordsStore.ts
import { makeAutoObservable } from "mobx";

interface Coords {
  x: number;
  y: number;
}

class CoordsStore {
  coords: Coords = { x: 0, y: 0 };
  needToFit = false;
  fittedPosition: Coords | false = false;
  preloader = true;

  constructor() {
    makeAutoObservable(this);
  }

  setCoords = (newCoords: Coords): void => {
    this.coords = newCoords;
  };

  setNeedToFit = (val: boolean): void => {
    this.needToFit = val;
  };

  setFittedPosition = (val: Coords | false): void => {
    this.fittedPosition = val;
  };

  setPreloader = (val: boolean): void => {
    this.preloader = val;
  };
}

// Singleton instance
const coordsStore = new CoordsStore();
export default coordsStore;