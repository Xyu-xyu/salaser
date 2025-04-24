import { makeAutoObservable } from "mobx";
export interface KnobData {
    minimum: number;
    maximum: number;
    default: number;
    val: number;
    title: string;
    type: string;
}

export interface CuttingSettings {
    pressure: number;
    power_W_mm: number;
    gas: string;
    focus: number;
    enabled: boolean;
    feedLimit_mm_s: number;
    cross_blow: boolean;
    type: string;
    modulationMacro: number;
    height: number;
    modulationFrequency_Hz: number;
}

export interface Makro {
    piercingMacro: number;
    cutting: CuttingSettings;
}



class ViewStore {
    mode: string = 'main1'
    knobMode: Boolean = true
    selectedMacros:number=0
    knobPath: Array<String> = ['M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0', 'M0 0']
    knobStep: Array<Number> = [1, 1, 0.1, 100, 0.1, 1, 1, 1, 1, 100]
    makrosVal: Makro[] = [
        {
            piercingMacro: 0,
            cutting: {
                pressure: 10,
                power_W_mm: 100,
                gas: "AIR",
                focus: -10,
                enabled: false,
                feedLimit_mm_s: 50000,
                cross_blow: false,
                type: "AAA",
                modulationMacro: 1,
                height: 1,
                modulationFrequency_Hz: 10000
            }
        },
        {
            piercingMacro: 1,
            cutting: {
                pressure: 20,
                power_W_mm: 5000,
                gas: "O2",
                focus: 10,
                enabled: false,
                feedLimit_mm_s: 50000,
                cross_blow: false,
                type: "Eng",
                modulationMacro: 2,
                height: 1,
                modulationFrequency_Hz: 50000
            }
        },
        {
            piercingMacro: 2,
            cutting: {
                pressure: 30,
                power_W_mm: 10000,
                gas: "N2",
                focus: 1,
                enabled: true,
                feedLimit_mm_s: 50000,
                cross_blow: false,
                type: "CW",
                modulationMacro: 3,
                height: 1,
                modulationFrequency_Hz: 100000
            }
        }
    ];

    knobs: KnobData[] =
        [
            {
                "type": "number",
                "title": "Технологический макрос, index",
                "maximum": this.makrosVal.length-1,
                "default": 0,
                "minimum": 0,
                "val": this.selectedMacros
            },
            {
                "type": "number",
                "title": "Макрос врезки, index",
                "maximum": 7,
                "default": 0,
                "minimum": 0,
                "val": 0
            },
            {
                "type": "integer",
                "title": "Давление газа, бар",
                "maximum": 35.0,
                "default": 8.0,
                "minimum": 0.1,
                "val": 35
            },
            {
                "type": "number",
                "minimum": 1,
                "maximum": 100000,
                "default": 100,
                "val": 100,
                "title": "Энергия, Вт/мм"
            },
            {
                "type": "integer",
                "title": "Фокус, мм",
                "maximum": 15.0,
                "default": 1.0,
                "minimum": -15.0,
                "val": 1.0
            },
            {
                "type": "number",
                "minimum": 10,
                "maximum": 200000,
                "default": 50000,
                "val": 50000,
                "title": "Ограничение подачи, мм/с"
            },
            {
                "type": "number",
                "title": "Индекс импульсного режима, index",
                "minimum": 0,
                "maximum": 15,
                "default": 0,
                "val": 0,
            },
            {
                "type": "number",
                "title": "Несущая частота, Hz",
                "maximum": 100000,
                "default": 10000,
                "minimum": 100,
                "val": 10000

            },
        ]

    
    constructor() {
        makeAutoObservable(this);
    }

    setKnobPath(index: number, path: string) {
        this.knobPath[index] = path;
    }

    setMode(newMode: string) {
        this.mode = newMode;
    }

    setKnobMode(newMode: Boolean) {
        this.knobMode = newMode;
    }

    setVal(index: number, newVal: number) {
        if (index === 0) {
            // устанавливаем тек макрос            
            this.setSelectedMacros(index, newVal)
        } else {
            if (newVal < this.knobs[index].minimum) newVal = this.knobs[index].minimum
            if (newVal > this.knobs[index].maximum) newVal = this.knobs[index].maximum
            if (this.knobs[index].type === 'integer') {
                this.knobs[index].val = Math.round(newVal * 10) / 10;
            } else {
                this.knobs[index].val = Math.round(newVal);
            }
        }
       
    }

    setSelectedMacros (index:number, newVal: number) {
        console.log ( newVal )
        if (newVal < this.knobs[index].minimum) newVal = this.knobs[index].minimum
        if (newVal > this.knobs[index].maximum) newVal = this.knobs[index].maximum
        this.selectedMacros = newVal;
        console.log ("current macros " + this.selectedMacros)

    }
}

const viewStore = new ViewStore();
export default viewStore;

