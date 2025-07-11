import { makeAutoObservable, computed } from "mobx";
import cut_settings_schema from './cut_settings_schema'
import cut_settings from "./cut_settings";
import utils from "../scripts/util";
import { showToast } from "../components/toast";

export interface NestedObject {
    [key: string]: any; 
}

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

export interface ModalProps {
    show: boolean;
     modalBody: string;
    confirmText: string;
    cancelText: string;
    func: (...args: any[]) => void;
    args?: any[];
}



class ViewStore {

    modalProps: ModalProps = {
        show: false,
        modalBody: 'This is the body of the modal.',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        func: () => {},
        args: []
    };

    macrosModalEdit:boolean = false;
    carouselMode:boolean = false;
    carouselModeInPiercing:boolean = false;
    modulationMacroModalEdit:boolean = false;
    piercingMacroModalEdit:boolean = false;
    selectedPiercingStage:number = 0; 
    selectedSlide:number = 0
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
        height: 0.1,
        modulationFrequency_Hz: 1,
        piercingMacro: 1,
        pulseFill_percent:1,
		pulseFrequency_Hz:1,
        initial_modulationFrequency_Hz:1,
        initial_pressure:0.1,
        initial_modulationMacro:1,
        initial_power:100,
        initial_focus:0.1,
        initial_height:0.1,
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
            piercingMacroinUse:computed,

        });
    }

    get modulationMacroinUse () {
        return utils.extractValuesByKey(this.technology, 'modulationMacro')
    }

    get piercingMacroinUse () {
        return utils.extractValuesByKey(this.technology, 'piercingMacro')
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

    setModalProps (val:ModalProps) {
       // console.log (JSON.stringify(val))
        this.modalProps  =  val;
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
        this.setCarouselMode( false )
        this.setCarouselModeInPiercing ( false )
        if (modal === 'macros') {

            this.macrosModalEdit = val
           /*  setTimeout (()=>{
                this.piercingMacroModalEdit = false
                this.modulationMacroModalEdit = false
            },200) */

        } else if (modal === 'modulationMacro'  
            || modal === 'initial_modulationMacro') {

            this.modulationMacroModalEdit = val
/*             setTimeout (()=>{
                this.macrosModalEdit = false
                this.piercingMacroModalEdit = false
            },200) */
          
            
        } else if (modal === 'piercingMacro') {

            this.piercingMacroModalEdit = val
/*             setTimeout (()=>{
                this.modulationMacroModalEdit = false
                this.macrosModalEdit = false
            },200) */

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

    setValString(param: string, newVal: string, keyParam: string, ind:number|boolean=false) {
        if (keyParam === 'macros') {
            const macro = this.technology.macros[this.selectedMacros];
            if (param in macro.cutting) {
                (macro.cutting as any)[param] = newVal
            }
        } else if (keyParam === 'piercingMacros') {
            if (typeof ind !== 'number') {
                this.technology.piercingMacros[this.selectedPiercingMacro][param] = newVal    
            } else {
                this.technology.piercingMacros[ind][param] = newVal    
            }
            this.technology.piercingMacros[this.selectedPiercingMacro][param] = newVal
        } else if (keyParam === 'modulationMacros') {
            if (typeof ind !== 'number') {
                this.technology.modulationMacros[this.selectedModulationMacro][param] = newVal
            } else {
                this.technology.modulationMacros[ind][param] = newVal
            }
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
        //console.log ( arguments )
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
            } else if (keyParam === 'stages') {
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
            } else if (keyParam === 'stages') {
                
                if (this.selectedPiercingStage === 0 ) {
                    return this.technology.piercingMacros[this.selectedPiercingMacro][param]
                } else {
                    return this.technology.piercingMacros[this.selectedPiercingMacro].stages[this.selectedPiercingStage-1][param]    
                }
                
            }
        }
        
    }

    setTecnologyValue (newVal: number, param: string, keyParam:string, minimum:number, maximum:number,  keyInd:number|boolean=false) {
       console.log ( arguments )
        
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
            } else if (keyParam === 'stages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param] =  
                Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            }

        } else {
            if (keyParam === 'macros') {
                if (param === 'piercingMacro') {
                    this.technology.macros[keyInd][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);    
                } else {
                    this.technology.macros[keyInd].cutting[param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
                }               
            } else if (keyParam === 'modulationMacros') {
                this.technology.modulationMacros[keyInd][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[keyInd][param] =  Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            } else if (keyParam === 'stages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                this.technology.piercingMacros[keyInd].stages[index][param] =  
                Math.round(newVal * (10**this.knobRound[param])) / (10**this.knobRound[param]);
            }
        }
    }

    setTecnologyValueBoolean (newVal: boolean, param: string, keyParam:string,keyInd:number|boolean=false ) {

        if (typeof keyInd === 'boolean') {

            if (keyParam === 'stages') {
                let index:number = this.selectedPiercingStage-1 < 0 ? 0 : this.selectedPiercingStage-1
                this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param] = newVal
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[this.selectedPiercingMacro][param] = newVal
            }
         
        } else {

            if (keyParam === 'stages') {
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

    setCarouselModeInPiercing (val:boolean) {
        console.log ('setCarouselMode  to ' + val)
        this.carouselModeInPiercing = val
    }

    setSelectedSlide (num:number) {
        this.selectedSlide = num;
    }

    deleteAndUpdate ( deleteKey: string, deleteIndex: number, adjustKey: string) {
        console.log ( arguments )
		if (viewStore.technology[deleteKey] 
            && Array.isArray(viewStore.technology[deleteKey]) 
            && viewStore.technology[deleteKey].length > 1) {
			viewStore.technology[deleteKey].splice(deleteIndex, 1);
            viewStore.setselectedPiercingStage (0)
		} else {
            showToast({
                type: 'warning',
                message: "Minimum value reached!",
                position: 'bottom-right',
                autoClose: 5000
              });
        }
	
		const adjustValues = (currentObj: NestedObject) => {
			for (const key in currentObj) {
				if (currentObj.hasOwnProperty(key)) {
		            if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
 						adjustValues(currentObj[key]);
					} else if (key === adjustKey 
                            && typeof currentObj[key] === 'number'
                            && currentObj[key] >= deleteIndex
                            && currentObj[key] > 0) {
						currentObj[key] -=1;                     
					}
				}
			} 
		};
 		adjustValues(viewStore.technology);
	};

    AddAndUpdate(key: string, selectedSlide: number, adjustKey: string) {
        //console.log ( arguments )
        const max = utils.deepFind(false, [adjustKey, 'maximum']);
        if (viewStore.technology[key] 
            && Array.isArray(viewStore.technology[key]) 
            && viewStore.technology[key].length < max+1) {
            
            const itemCopy = { ...viewStore.technology[key][selectedSlide] };
            viewStore.technology[key].splice(selectedSlide + 1, 0, itemCopy);
            const adjustValues = (currentObj: any) => {
                for (const key in currentObj) {
                    if (currentObj.hasOwnProperty(key)) {
                        if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
                            adjustValues(currentObj[key]);
                        } else if (key === adjustKey 
                                  && typeof currentObj[key] === 'number'
                                  && currentObj[key] > selectedSlide) {
                            currentObj[key] += 1;
                        }
                    }
                }
            };
            adjustValues(viewStore.technology);
            viewStore.setselectedPiercingStage (0)
        } else {
            showToast({
                type: 'warning',
                message: "Maximum value reached!",
                position: 'bottom-right',
                autoClose: 5000
              });
        }
    }

    deleteStage() {
       
        if (viewStore.selectedPiercingStage === 0) {
            showToast({
                type: 'warning',
                message: "Cannot delete this splice step!",
                position: 'bottom-right',
                autoClose: 5000
              });

        } else {
            if ( viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.length > 1 &&
                 typeof viewStore.selectedPiercingStage === 'number'
            ) {

                viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.splice(viewStore.selectedPiercingStage-1, 1);
                if ( viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.length < viewStore.selectedPiercingStage) {
                    viewStore.setselectedPiercingStage(viewStore.selectedPiercingStage-1)
                }

                showToast({
                    type: 'success',
                    message: "Step removed!",
                    position: 'bottom-right',
                    autoClose: 5000
                  });
        
            }
        }      
    }

    addStage () {
        const max = 16
        if ( viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.length >= max ) {
            showToast({
                type: 'warning',
                message: "Maximum value reached!",
                position: 'bottom-right',
                autoClose: 5000
            });
            return;
        }      
        let stages = viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages;

        if (viewStore.selectedPiercingStage !==0) {
            const index = viewStore.selectedPiercingStage - 1;
            const stepPaste = stages[index];
            stages.splice(index + 1, 0, { ...stepPaste });

        } else {
            let donor  = viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro]
            const stepPaste = {
                "pressure": donor.initial_pressure,
                "power": donor.initial_power,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": donor.initial_pressure,
                "focus": donor.initial_focus,
                "height": donor.initial_height,
                "modulationFrequency_Hz": donor.initial_modulationFrequency_Hz,
                "cross_blow": false,
                "modulationMacro": donor.initial_modulationMacro
            }
            stages.splice( 0, 0, stepPaste);
        } 
        
        showToast({
            type: 'success',
            message: "Step added!",
            position: 'bottom-right',
            autoClose: 5000
          });
    }
}

const viewStore = new ViewStore();
export default viewStore;         