import { makeAutoObservable } from "mobx";

class ViewStore {
    mode:string = 'main'
    knobMode:Boolean= false
    constructor() {
        makeAutoObservable(this);
    }

    setMode(newMode:string) {
        this.mode = newMode;
    }


    setKnobMode(newMode:Boolean) {
        this.knobMode= newMode;
    }
}

const viewStore = new ViewStore();
export default viewStore; 
