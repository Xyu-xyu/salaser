import { makeAutoObservable } from "mobx";

class ViewStore {
    mode:string = 'main'
    constructor() {
        makeAutoObservable(this);
    }

    setMode(newMode:string) {
        this.mode = newMode;
    }
}

const viewStore = new ViewStore();
export default viewStore; 
