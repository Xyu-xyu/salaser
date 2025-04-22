import { makeAutoObservable } from "mobx";
export interface KnobData {
  minimum: number;
  maximum: number;
  default: number;
  val:number;
  //step: number;
  title: string;
  type: string;
}



class ViewStore {
    mode:string = 'main1'
    knobMode:Boolean= false
    knobPath:Array<String>=['M0 0', 'M0 0']
    knobs: KnobData[] = 

[
        {
            "type": "number",
            "title": "Начальная несущая частота, Hz",
            "maximum": 100000,
            "default": 10000,
            "val": 10000,
            "minimum": 100
        },
        {
            "type": "number",
            "title": "Начальная несущая частота, Hz",
            "maximum": 100000,
            "default": 10000.0,
            "val": 10000.0,
            "minimum": 100
        }


]


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
        if (newVal <  this.knobs[index].minimum) newVal = this.knobs[index].minimum
        if (newVal >  this.knobs[index].maximum) newVal = this.knobs[index].maximum
        this.knobs[index].val = newVal;
    }
}

const viewStore = new ViewStore();
export default viewStore; 

 