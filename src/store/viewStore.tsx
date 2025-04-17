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
    knob1:String='M0 0'
    knobs: KnobData[] = [
        { min: 0, max: 100, val: 50, step: 1, m: '%' },
        { min: -60, max: 0, val: -20, step: 0.5, m: 'dB' },
       ];

    constructor() {
        makeAutoObservable(this);
    }

    setKnob1 (path:string) {
        this.knob1 = path;
    }

    setMode(newMode:string) {
        this.mode = newMode;
    }


    setKnobMode(newMode:Boolean) {
        this.knobMode= newMode;
    }

    setVal(index: number, newVal: number) {
        this.knobs[index].val = newVal;
      }
}

const viewStore = new ViewStore();
export default viewStore; 
