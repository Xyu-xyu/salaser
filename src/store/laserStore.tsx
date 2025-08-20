import { makeAutoObservable } from "mobx";

class LaserStore {
  carouselInPlan: boolean = false;
  mainMode: string = "planMode";
  rightMode: Boolean = true
  knobMode: Boolean = false



  constructor() {
    makeAutoObservable(this);
  }

  setVal<T extends keyof this>(key: T, value: this[T]) {
    if (key in this) {
      this[key] = value;
    }
  }
}

const laserStore = new LaserStore();
export default laserStore;