import { makeAutoObservable } from "mobx";
export interface KnobData {
  min: number;
  max: number;
  val: number;
  step: number;
  m: string;
}


class ViewStore {
    mode:string = 'main1'
    knobMode:Boolean= false
    knobPath:Array<String>=['M0 0', 'M0 0']
    knobs: KnobData[] = [
        { min: 0, max: 100, val: 50, step: 1, m: '%' },
        { min: -60, max: 0, val: -20, step: 0.5, m: 'dB' },
       ];

    constructor() {
        makeAutoObservable(this);
    }

    setKnobPath (index:number,path:string) {
        this.knobPath[index] = path;
    }

    setMode(newMode:string) {
        this.mode = newMode;
    }

    setKnobMode(newMode:Boolean) {
        this.knobMode= newMode;
    }
    
    setVal(index: number, newVal: number) {
        console.log ( newVal )
        this.knobs[index].val = newVal;
    }
}

const viewStore = new ViewStore();
export default viewStore; 
