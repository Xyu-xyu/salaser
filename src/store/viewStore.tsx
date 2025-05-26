import { makeAutoObservable, computed } from "mobx";
import cut_settings_schema from './cut_settings_schema'
import cut_settings from "./cut_settings";
import utils from "../scripts/util";

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
    macrosModalEdit:boolean = false;
    carouselMode:boolean = false;
    modulationMacroModalEdit:boolean = false;
    piercingMacroModalEdit:boolean = false;
    selectedPiercingStage:number = 0; 

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
        initial_height:1,
        delay_s:0.1,
        power_W_s:100,
        power:100
        
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
        initial_height:1,
        delay_s:1,
        power_W_s:0,
        power:0
    };
      
    technology = cut_settings.result.technology
    macrosProperties = cut_settings_schema.result.properties.technology.properties.macros.items.properties

    constructor() {
        makeAutoObservable(this, {
            selectedModulationMacro: computed,
            selectedPiercingMacro: computed,
            isVertical: computed,
            modulationMacroinUse:computed,

        });
    }

    get modulationMacroinUse () {
        return utils.extractValuesByKey(cut_settings, 'modulationMacro')
    }

    get selectedModulationMacro() {
        return this.technology.macros[this.selectedMacros].cutting.modulationMacro;
    }

    get selectedPiercingMacro() {
        return this.technology.macros[this.selectedMacros].piercingMacro;
    }

    get isVertical () {
        return Boolean(window.innerHeight > window.innerWidth)
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
            setTimeout (()=>{
                this.piercingMacroModalEdit = false
                this.modulationMacroModalEdit = false
            },200)

        } else if (modal === 'modulationMacro'  
            || modal === 'initial_modulationMacro') {

            this.modulationMacroModalEdit = val
            setTimeout (()=>{
                this.macrosModalEdit = false
                this.piercingMacroModalEdit = false
            },200)
          
            
        } else if (modal === 'piercingMacro') {

            this.piercingMacroModalEdit = val
            setTimeout (()=>{
                this.modulationMacroModalEdit = false
                this.macrosModalEdit = false
            },200)
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
            const macro = this.technology.macros[this.selectedMacros];    

            if (param in macro.cutting) {
                (macro.cutting as any)[param] = Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (param in macro) {
                (macro as any)[param] = Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            }
        }
    }

    setValBoolean (param: string, newVal: boolean,) {
        const macro = this.technology.macros[this.selectedMacros];  
        if (param in macro.cutting) {
            (macro.cutting as any)[param] = newVal
        }  
    }

    setValString(param: string, newVal: string, keyParam: string) {
        if (keyParam === 'macros') {
            const macro = this.technology.macros[this.selectedMacros];
            if (param in macro.cutting) {
                (macro.cutting as any)[param] = newVal
            }
        } else if (keyParam === 'piercingMacros') {
            this.technology.piercingMacros[this.selectedPiercingMacro][param] = newVal
        } else if (keyParam === 'modulationMacros') {
            this.technology.modulationMacros[this.selectedModulationMacro][param] = newVal
        }
    }
    
    setSelectedMacros ( newVal: number) {
        if (newVal < 0) newVal = 0
        if (newVal > this.technology.macros.length-1) newVal = this.technology.macros.length-1
        this.selectedMacros = newVal;
    }

    setselectedPiercingStage (val:number) {
        console.log ('setselectedPiercingStage ' + val)
        this.selectedPiercingStage = val
    }

    getTecnologyValue (param:string, keyParam:string, keyInd:number|boolean=false) {
        if (typeof keyInd === 'number') {
            if (keyParam === 'macros') {
            
                if (param === 'piercingMacro') {
                    return this.technology.macros[keyInd][param]	    
                }
                return this.technology.macros[keyInd].cutting[param]	
                
            } else if (keyParam === 'modulationMacros') {
                 return this.technology.modulationMacros[keyInd][param]
            } else if (keyParam === 'piercingMacros') {
                return this.technology.piercingMacros[keyInd][param]
            } else if (keyParam === 'piercingStages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                return this.technology.piercingMacros[keyInd].stages[index][param]
            }

        } else {
            if (keyParam === 'macros') {

                if (param === 'piercingMacro') {
                    return this.technology.macros[this.selectedMacros][param]	    
                }
                return this.technology.macros[this.selectedMacros].cutting[param]	
                
            } else if (keyParam === 'modulationMacros') {
                 return this.technology.modulationMacros[this.selectedModulationMacro][param]
            } else if (keyParam === 'piercingMacros') {
                return this.technology.piercingMacros[this.selectedPiercingMacro][param]
            } else if (keyParam === 'piercingStages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                return this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param]
            }
        }
        
    }

    setTecnologyValue (newVal: number, param: string, keyParam:string, minimum:number, maximum:number,  keyInd:number|boolean=false) {
        if (newVal < minimum) newVal = minimum
        if (newVal > maximum) newVal = maximum
        if (typeof keyInd === 'boolean') {
            if (keyParam === 'macros') {

                if (param === 'piercingMacro') {
                    this.technology.macros[this.selectedMacros][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);    return this.technology.macros[this.selectedMacros][param]	    
                } else {
                    this.technology.macros[this.selectedMacros].cutting[param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
                }
               
            } else if (keyParam === 'modulationMacros') {
                this.technology.modulationMacros[this.selectedModulationMacro][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[this.selectedPiercingMacro][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (keyParam === 'piercingStages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param] =  
                Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            }

        } else {
            if (keyParam === 'macros') {
                if (param === 'piercingMacro') {
                    this.technology.macros[keyInd][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);    return this.technology.macros[this.selectedMacros][param]	    
                } else {
                    this.technology.macros[keyInd].cutting[param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
                }               
            } else if (keyParam === 'modulationMacros') {
                this.technology.modulationMacros[keyInd][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[keyInd][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (keyParam === 'piercingStages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                this.technology.piercingMacros[keyInd].stages[index][param] =  
                Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            }
        }
    }

    setTecnologyValueBoolean (newVal: boolean, param: string, keyParam:string,keyInd:number|boolean=false ) {

        if (typeof keyInd === 'boolean') {

            if (keyParam === 'piercingStages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param] = newVal
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[this.selectedPiercingMacro][param] = newVal
            }
         
        } else {

            if (keyParam === 'piercingStages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                this.technology.piercingMacros[keyInd].stages[index][param] = newVal
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[keyInd][param] = newVal
            }

        }
    }

    setCarouselMode (val:boolean) {
        console.log ('setCarouselMode  to ' + val)
        this.carouselMode = val
    }
}

const viewStore = new ViewStore();
export default viewStore;         