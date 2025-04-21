import { makeAutoObservable } from "mobx";
export interface KnobData {
  min: number;
  max: number;
  val: number;
  step: number;
  m: string;
  name: string;
}


class ViewStore {
    mode:string = 'main1'
    knobMode:Boolean= false
    knobPath:Array<String>=['M0 0', 'M0 0']
    knobs: KnobData[] = [
        { min: 0, max: 100, val: 50, step: 1, m: '%', name: 'Percentage' },
        { min: -60, max: 20, val: 5, step: 5, m: 'dB', name: 'Volume' },
        { min: 0, max: 1000, val: 25, step: 10, m: 'Hz', name: 'Volume' },
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
