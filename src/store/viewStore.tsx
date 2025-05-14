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
    isVertical:boolean = (window.innerHeight > window.innerWidth)
    macrosModalEdit:boolean = false;
    modulationMacroModalEdit:boolean = false;
    piercingMacroModalEdit:boolean = false;
    selectedModulationMacro:number = 0
    selectedPiercingMacro:number = 0

    mode: string = 'main1'
    theme: string = 'themeLight'
    knobMode: Boolean = true
    selectedMacros:number=0
    knobPath: Record<string, string> = {};
    knobStep: { [key: string]: number } = {
        pressure: 0.1,
        power_W_mm: 100,
        focus: 0.1,
        feedLimit_mm_s: 500,
        modulationMacro: 1,
        height: 1,
        modulationFrequency_Hz: 1,
        piercingMacro: 1,
        pulseFill_percent:1,
		pulseFrequency_Hz:1,
        initial_modulationFrequency_Hz:1,
        initial_pressure:0.1,
        initial_modulationMacro:1,
        initial_power:100,
        initial_focus:0.1,
        initial_height:1
        
    };

    knobRound: { [key: string]: number } = {
        pressure: 1,
        power_W_mm: 0,
        focus: 1,
        feedLimit_mm_s:0,
        modulationMacro: 0,
        height: 1,
        modulationFrequency_Hz: 0,
        piercingMacro:0,
        pulseFill_percent:0,
		pulseFrequency_Hz:0,
        initial_modulationFrequency_Hz:0,
        initial_pressure:1,
        initial_modulationMacro:0,
        initial_power:1,
        initial_focus:1,
        initial_height:1
    };
      
    knobs = cut_settings.result.technology.macros;
    technology = cut_settings.result.technology
    macrosProperties = cut_settings_schema.result.properties.technology.properties.macros.items.properties

    setIsVertical (val:boolean) {
        this.isVertical = val
    }
        
    constructor() {
        makeAutoObservable(this);
    }

    setTheme(theme:string ) {
        this.theme =theme
    }

    setKnobPath(param: string, path: string) {
        this.knobPath[param] = path;
    }

    getKnobPath(param: string): string {
        return this.knobPath[param] ?? "M0 0";
    }
 
    setMode(newMode: string) {
        this.mode = newMode;
    }

    setKnobMode(newMode: Boolean) {
        this.knobMode = newMode;
    }

    setModal (val:boolean, modal:string ) {
        console.log ('setModalEdit  '+ modal)
        if (modal === 'macros') {

            this.macrosModalEdit = val
            this.piercingMacroModalEdit = false
            this.modulationMacroModalEdit = false

        } else if (modal === 'modulationMacro') {

            this.modulationMacroModalEdit = val
            this.macrosModalEdit = false
            this.piercingMacroModalEdit = false
            
        } else if (modal === 'piercingMacro') {

            this.piercingMacroModalEdit = val
            this.modulationMacroModalEdit = false
            this.macrosModalEdit = false

        }
    }

    setVal(param: string, newVal: number, minimum:number, maximum:number) {
        if (param === 'selector') {
            // устанавливаем текущий макрос
            this.setSelectedMacros(newVal);
        } else {
            console.log ( arguments )
            if (newVal < minimum) newVal = minimum
            if (newVal > maximum) newVal = maximum
            const macro = this.knobs[this.selectedMacros];    

            if (param in macro.cutting) {
                (macro.cutting as any)[param] = Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (param in macro) {
                (macro as any)[param] = Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            }
        }
    }

    setValBoolean (param: string, newVal: boolean,) {
        const macro = this.knobs[this.selectedMacros];  
        if (param in macro.cutting) {
            (macro.cutting as any)[param] = newVal
        }  
    }

    setValString (param: string, newVal: string,) {
        const macro = this.knobs[this.selectedMacros];  
        if (param in macro.cutting) {
            (macro.cutting as any)[param] = newVal
        }  
    }
    
    setSelectedMacros ( newVal: number) {
        if (newVal < 0) newVal = 0
        if (newVal > this.knobs.length-1) newVal = this.knobs.length-1
        this.selectedMacros = newVal;
    }

    setSelectedModulationMacro  ( newVal: number) {
        if (newVal < 0) newVal = 0
        if (newVal > 15) newVal = 15
        this.selectedModulationMacro = newVal;
    }

    setSelectedPiercingMacro  ( newVal: number) {
        if (newVal < 0) newVal = 0
        if (newVal > 7) newVal = 7
        console.log ('setSelectedPiercingMacro ' + newVal)
        this.selectedPiercingMacro = newVal;
    }

    getTecnologyValue (param:string, keyParam:string) {
        if (keyParam === 'macros') {
            return this.technology.macros[this.selectedMacros][param]	
        } else if (keyParam === 'modulationMacros') {
             return this.technology.modulationMacros[this.selectedModulationMacro][param]
        } else if (keyParam === 'piercingMacros') {
            return this.technology.piercingMacros[this.selectedPiercingMacro][param]
        } 
    }

    setTecnologyValue (newVal: number, param: string, keyParam:string, minimum:number, maximum:number) {
        if (newVal < minimum) newVal = minimum
        if (newVal > maximum) newVal = maximum
        if (keyParam === 'macros') {
            this.technology.macros[this.selectedMacros][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
        } else if (keyParam === 'modulationMacros') {
            this.technology.modulationMacros[this.selectedModulationMacro][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
        } else if (keyParam === 'piercingMacros') {
            this.technology.piercingMacros[this.selectedPiercingMacro][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
        } 

    }
}

const viewStore = new ViewStore();
export default viewStore;         