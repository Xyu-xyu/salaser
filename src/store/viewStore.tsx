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
    knobPath:Array<String>=['M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0' ]
    knobs: KnobData[] = 

        [    
        {
            "type": "number",
            "title": "Частота импульсов, Hz",
            "maximum": 1000,
            "default": 0,
            "minimum": 0,
            "val": 0,

        },
        {
            "type": "number",
            "title": "Максимальная разрешенная мощность, Вт",
            "maximum": 100000,
            "default": 1000,
            "val": 50000,
            "minimum": 10
        },
        {
            "type": "number",
            "title": "Начальная несущая частота, Hz",
            "maximum": 100000,
            "default": 10000,
            "val": 10000,
            "minimum": 100
        },
        {
            "type": "integer",
            "title": "Энергия шага, Вт/с",
            "maximum": 1000000,
            "default": 1000,
            "minimum": 10,
            "val":1000000,
        },
        {
            "type": "integer",
            "title": "Давление, бар",
            "maximum": 35,//35.0,
            "default": 8,//8.0,
            "minimum": 0.1,
            "val":35
        },
        {
            "type": "number",
            "title": "Фокус, мм",
            "maximum": 15,//15.0,
            "default": 1,//1.0,
            "minimum": -15,//-15.0,
            "val":1//1.0
        },
        {
            "type": "number",
            "title": "Несущая частота, Hz",
            "maximum": 100000,
            "default": 10000,
            "minimum": 100,
            "val": 10000

        },
        {
            "type": "number",
            "title": "Заполнение, %",
            "maximum": 100,
            "default": 50,
            "val": 50,
            "minimum": 0.1
        },
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
        this.knobs[index].val = Math.round(newVal*10) /10;
    }
}

const viewStore = new ViewStore();
export default viewStore; 

 