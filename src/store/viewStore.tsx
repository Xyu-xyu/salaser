import { makeAutoObservable } from "mobx";
import cut_settings_schema from './cut_settings_schema'
import cut_settings from "./cut_settings";

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
    knobs = cut_settings.result.technology.macros;
    macrosProperties = cut_settings_schema.result.properties.technology.properties.macros.items.properties

        
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
           /*  if (newVal < this.knobs[index].minimum) newVal = this.knobs[index].minimum
            if (newVal > this.knobs[index].maximum) newVal = this.knobs[index].maximum
            if (this.knobs[index].type === 'integer') {
                this.knobs[index].val = Math.round(newVal * 10) / 10;
            } else {
                this.knobs[index].val = Math.round(newVal);
            } */
        }
       
    }

    setSelectedMacros (index:number, newVal: number) {
        console.log ( newVal, index )
        if (newVal < 0) newVal = 0
        if (newVal > this.knobs.length-1) newVal = this.knobs.length-1
        this.selectedMacros = newVal;
    }
}

const viewStore = new ViewStore();
export default viewStore;

