import { makeAutoObservable, computed } from "mobx";
import cut_settings_schema from './cut_settings_schema'
import cut_settings from "./cut_settings";
import utils from "../scripts/util";
import { showToast } from "../components/toast";
import constants from "./constants";



class MacrosStore {

    modalProps  = {
        show: false,
        modalBody: 'This is the body of the modal.',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        func: () => { },
        args: []
    };

    //presets:Preset[]=[]
     _presets = []; 


    diagActive = ''
    macrosModalEdit = false;
    carouselMode = false;
    carouselModeInPiercing = false;
    modulationMacroModalEdit = false;
    piercingMacroModalEdit = false;
    selectedPiercingStage = 0;
    selectedSlide = 0
    theme = 'themeLight'
    selectedMacros = 0
    knobPath = {};
    knobStep = {
        pressure: 0.1,
        power_W_mm: 100,
        focus: 0.1,
        feedLimit_mm_s: 500,
        modulationMacro: 1,
        height: 0.1,
        modulationFrequency_Hz: 1,
        piercingMacro: 1,
        pulseFill_percent: 1,
        pulseFrequency_Hz: 1,
        initial_modulationFrequency_Hz: 1,
        initial_pressure: 0.1,
        initial_modulationMacro: 1,
        initial_power: 100,
        initial_focus: 0.1,
        initial_height: 0.1,
        delay_s: 0.1,
        power_W_s: 100,
        power: 100

    };

    knobRound = {
        pressure: 1,
        power_W_mm: 0,
        focus: 1,
        feedLimit_mm_s: 0,
        modulationMacro: 0,
        height: 1,
        modulationFrequency_Hz: 0,
        piercingMacro: 0,
        pulseFill_percent: 1,
        pulseFrequency_Hz: 0,
        initial_modulationFrequency_Hz: 0,
        initial_pressure: 1,
        initial_modulationMacro: 0,
        initial_power: 1,
        initial_focus: 1,
        initial_height: 1,
        delay_s: 1,
        power_W_s: 0,
        power: 0
    };

    presetMode = 'none'

    isAnimating = false;
    isPaused = false;
    atEnd = false;
    elapsed = 0

    animProgress = { stage: 0, progress: 0 }
    cut_settings = null;
    schema = null;

    loading = false;
    error  = null;

    technology = cut_settings.technology
    macrosProperties = cut_settings_schema.properties.technology.properties.macros.items.properties

    async loadCutSettings() {
        this.loading = true;
        this.error = null;
        try {
            const resp = await fetch(`${constants.SERVER_URL}/api/cut-settings`);
            if (!resp.ok) throw new Error(`Ошибка загрузки: ${resp.statusText}`);

            const data = await resp.json();
            macrosStore.setCutSettings(data.result)
            //macrosStore.cut_settings = data.result;
            //macrosStore.technology = data.result.technology
            showToast({
                type: 'success',
                message: "Upload settings form core 0 success!",
                position: 'bottom-right',
                autoClose: 2500
            });
            //console.log (data)
        } catch (err) {
            this.error = err.message || "Неизвестная ошибка";
            showToast({
                type: 'error',
                message: "Upload settings from core error",
                position: 'bottom-right',
                autoClose: 2500
            });
        console.log ( "Upload settings from core error" + err.message)
            // remove in production
            //macrosStore.cut_settings = cut_settings;
            //macrosStore.technology = cut_settings.technology
            macrosStore.setCutSettings(cut_settings)
        } finally {
            this.loading = false;
        }
    }

    async loadCutSettingsSchema() {
        this.loading = true;
        this.error = null;
        try {
            const resp = await fetch(`${constants.SERVER_URL}/api/cut-settings-schema`);
            if (!resp.ok) throw new Error(`Ошибка загрузки: ${resp.statusText}`);

            const data = await resp.json();
            macrosStore.schema = data.result
            macrosStore.macrosProperties = data.result.properties.technology.properties.macros.items.properties
            showToast({
                type: 'success',
                message: "Upload  schema from core 0 success!",
                position: 'bottom-right',
                autoClose: 2500
            });
            //console.log (data)
        } catch (err) {
            this.error = err.message || "Неизвестная ошибка";
            showToast({
                type: 'error',
                message: "Upload schema from core error",
                position: 'bottom-right',
                autoClose: 2500
            });
            console.log ("Upload schema from core error" + err.message)

            macrosStore.schema = cut_settings_schema
            macrosStore.macrosProperties = cut_settings_schema.result.properties.technology.properties.macros.items.properties
            
        } finally {
            this.loading = false;
        }
    }

    async sentSettingsToLaser( settings ) {
        if(!settings ) {
            macrosStore.cut_settings.technology = macrosStore.technology
            settings = macrosStore.cut_settings
        }
        //yobaniy kostyl remove
        if ("id" in settings) {
            delete settings.id;
        }

        let result = utils.validateCuttingSettings( settings )
        if ( result?.errors.length === 0) {
            
            try {
                
                const resp = await fetch(`${constants.SERVER_URL}/api/cut-settings`, {
                    method: "PUT",
                    headers: { /* "Content-Type": "application/json "*/ },
                    body: JSON.stringify(settings),
                });
                if (!resp.ok) throw new Error(`Ошибка обновления: ${resp.statusText}`);
                const data = await resp.json();
                if (data.success) {
                    //this.cut_settings = newSettings;
                    showToast({ type: "success", message: "Settings updated" });
                    return true;
                } else {
                    throw new Error(data.exception || "Update error");
                }

            } catch (err) {
                showToast({ type: "error", message: err.message });
                return false
            }
        } else {
            showToast({ type: "error", message: 'invalid something...' });
            return false
        }   
    }

    constructor() {
        makeAutoObservable(this, {
            selectedModulationMacro: computed,
            selectedPiercingMacro: computed,
            isVertical: computed,
            modulationMacroinUse: computed,
            piercingMacroinUse: computed,

        });
    }

    get modulationMacroinUse() {
        let a = utils.extractValuesByKey(this.technology, 'modulationMacro')
        let b = utils.extractValuesByKey(this.technology, 'initial_modulationMacro')
        return [...a, ...b]
    }

    get piercingMacroinUse() {
        return utils.extractValuesByKey(this.technology, 'piercingMacro')
    }

    get selectedModulationMacro() {
        try {
            return this.technology.macros[this.selectedMacros].cutting.modulationMacro     
        } catch (e) {
            console.log ("Catch in get selectedModulationMacro")
            return 0         
        }
    }

    get selectedPiercingMacro() {
        try {
            return this.technology.macros[this.selectedMacros].piercingMacro 
        } catch (e) {
            console.log ("Catch in get selectedPiercingMacro")
            return 0         
        }
    }

    get isVertical() {
        return Boolean(window.innerHeight > window.innerWidth)
    }

    setCutSettings(data) {
        this.cut_settings = data;
        this.technology = data?.technology ?? null;
      }

    setModalProps(val) {
        // console.log (JSON.stringify(val))
        this.modalProps = val;
    }

    setTheme(theme) {
        this.theme = theme
    }

    setKnobPath(param, path) {
        this.knobPath[param] = path;
    }

    getKnobPath(param) {
        return this.knobPath[param] ?? "M0 0";
    }

    setModal(val, modal) {
        console.log('setModalEdit  ' + modal)
        this.setCarouselMode(false)
        this.setCarouselModeInPiercing(false)
        if (modal === 'macros') {

            this.macrosModalEdit = val
            if ( val ) {
                // открываем модалку макросов
                //console.log ("OPEN MODAL")
           
            } else {
                // закрываем модалку макросов
                console.log ("CLOSE MODAL")
                if (this.presetMode.endsWith('edit')) {
                    let id  = Number ( this.presetMode.split('_')[0])
                    console.log ("update preset "+ id  )
                    macrosStore.setModalProps({
                        show: true,
                        modalBody: 'Do you want to save settings preset?',
                        confirmText: 'OK',
                        cancelText: 'Cancel',
                        func: macrosStore.updatePreset                        ,
                        args: [id]
                    })
                }
                this.setPresetMode('none')
            }
           
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

    setVal(param, newVal, minimum, maximum) {
        if (param === 'selector') {
            // устанавливаем текущий макрос
            this.setSelectedMacros(newVal);
        } else {
            console.log(arguments)
            if (newVal < minimum) newVal = minimum
            if (newVal > maximum) newVal = maximum
            const macro = this.technology.macros[this.selectedMacros];

            if (param in macro.cutting) {
                macro.cutting [param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            } else if (param in macro) {
                macro[param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            }
        }
    }

    setValBoolean(param, newVal,) {
        const macro = this.technology.macros[this.selectedMacros];
        if (param in macro.cutting) {
            macro.cutting[param] = newVal
        }
    }

    setValString(param, newVal, keyParam, ind = false) {
        if (keyParam === 'macros') {
            const macro = this.technology.macros[this.selectedMacros];
            if (param in macro.cutting) {
                macro.cutting[param] = newVal
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
        } else if (keyParam === 'preset') {
            this.cut_settings.material[param] = newVal
        }  else if (keyParam === 'thickness') {
            this.cut_settings.material[param] = Number(newVal)
        }
    }

    setSelectedMacros(newVal) {
        if (newVal < 0) newVal = 0
        if (newVal > this.technology.macros.length - 1) newVal = this.technology.macros.length - 1
        this.selectedMacros = newVal;
    }

    setselectedPiercingStage(val) {
        console.log('setselectedPiercingStage ' + val)
        this.selectedPiercingStage = val
    }

    getTecnologyValue(param, keyParam, keyInd = false) {
        //console.log ('getTecnologyValue')
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
                let index = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
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

                if (this.selectedPiercingStage === 0) {
                    return this.technology.piercingMacros[this.selectedPiercingMacro][param]
                } else {
                    return this.technology.piercingMacros[this.selectedPiercingMacro].stages[this.selectedPiercingStage - 1][param]
                }

            } else if (keyParam === 'preset') {
                return this.cut_settings.material[param]
            }
        }

    }

    setTecnologyValue(newVal, param, keyParam, minimum, maximum, keyInd = false) {
        //console.log ('setTecnologyValue')
        //console.log ( arguments )

        if (newVal < minimum) newVal = minimum
        if (newVal > maximum) newVal = maximum
        if (typeof keyInd === 'boolean') {
            if (keyParam === 'macros') {

                if (param === 'piercingMacro') {
                    this.technology.macros[this.selectedMacros][param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]); return this.technology.macros[this.selectedMacros][param]
                } else {
                    this.technology.macros[this.selectedMacros].cutting[param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
                }

            } else if (keyParam === 'modulationMacros') {
                this.technology.modulationMacros[this.selectedModulationMacro][param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[this.selectedPiercingMacro][param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            } else if (keyParam === 'stages') {
                let index = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
                this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param] =
                    Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            }

        } else {
            if (keyParam === 'macros') {
                if (param === 'piercingMacro') {
                    this.technology.macros[keyInd][param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
                } else {
                    this.technology.macros[keyInd].cutting[param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
                }
            } else if (keyParam === 'modulationMacros') {
                this.technology.modulationMacros[keyInd][param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[keyInd][param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            } else if (keyParam === 'stages') {
                let index = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
                this.technology.piercingMacros[keyInd].stages[index][param] =
                    Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            }
        }
    }

    setTecnologyValueBoolean(newVal, param, keyParam, keyInd = false) {

        if (typeof keyInd === 'boolean') {

            if (keyParam === 'stages') {
                let index = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
                this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param] = newVal
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[this.selectedPiercingMacro][param] = newVal
            }

        } else {

            if (keyParam === 'stages') {
                let index = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
                this.technology.piercingMacros[keyInd].stages[index][param] = newVal
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[keyInd][param] = newVal
            }

        }
    }

    setCarouselMode(val) {
        console.log('setCarouselMode  to ' + val)
        this.carouselMode = val
    }

    setCarouselModeInPiercing(val) {
        console.log('setCarouselMode  to ' + val)
        this.carouselModeInPiercing = val
    }

    setSelectedSlide(num) {
        this.selectedSlide = num;
    }

    deleteAndUpdate(deleteKey, deleteIndex, adjustKey) {
        //console.log ( arguments )
        //console.log (JSON.stringify(macrosStore.technology))

        if (macrosStore.technology[deleteKey]
            && Array.isArray(macrosStore.technology[deleteKey])
            && macrosStore.technology[deleteKey].length > 1) {
            macrosStore.technology[deleteKey].splice(deleteIndex, 1);
            macrosStore.setselectedPiercingStage(0)
        } else {
            showToast({
                type: 'warning',
                message: "Minimum value reached!",
                position: 'bottom-right',
                autoClose: 2500
            });
            return;
        }

        const adjustValues = (currentObj) => {
            for (const key in currentObj) {

                let altKey = key.replace('initial_', "")

                if (currentObj.hasOwnProperty(key) /* || currentObj.hasOwnProperty(altKey) */) {
                    if (typeof currentObj[key] === 'object' && currentObj[key] !== null) {
                        adjustValues(currentObj[key]);
                    } else if (key === adjustKey
                        && typeof currentObj[key] === 'number'
                        && currentObj[key] >= deleteIndex
                        && currentObj[key] > 0) {

                        currentObj[key] -= 1;

                    } else if (altKey === adjustKey

                        && typeof currentObj[key] === 'number'
                        && currentObj[key] >= deleteIndex
                        && currentObj[key] > 0) {

                        currentObj[key] -= 1;

                    }
                }
            };
        }

        adjustValues(macrosStore.technology);
        //console.log (JSON.stringify(macrosStore.technology))
    };

    AddAndUpdate(key, selectedSlide, adjustKey) {
        //console.log ( arguments )
        const max = utils.deepFind(false, [adjustKey, 'maximum']);
        if (macrosStore.technology[key]
            && Array.isArray(macrosStore.technology[key])
            && macrosStore.technology[key].length < max + 1) {

            const itemCopy = { ...macrosStore.technology[key][selectedSlide] };
            macrosStore.technology[key].splice(selectedSlide + 1, 0, itemCopy);
            const adjustValues = (currentObj) => {
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
            adjustValues(macrosStore.technology);
            macrosStore.setselectedPiercingStage(0)
        } else {
            showToast({
                type: 'warning',
                message: "Maximum value reached!",
                position: 'bottom-right',
                autoClose: 2500
            });
        }
    }

    deleteStage(arg) {

        if (arg === 'all') {
            macrosStore.setselectedPiercingStage(0)
            macrosStore.technology.piercingMacros[macrosStore.selectedPiercingMacro].stages = []
            return
        }

        if (macrosStore.selectedPiercingStage === 0) {
            showToast({
                type: 'warning',
                message: "Cannot delete this splice step!",
                position: 'bottom-right',
                autoClose: 2500
            });

        } else {
            if (macrosStore.technology.piercingMacros[macrosStore.selectedPiercingMacro].stages.length > 1 &&
                typeof macrosStore.selectedPiercingStage === 'number'
            ) {

                macrosStore.technology.piercingMacros[macrosStore.selectedPiercingMacro].stages.splice(macrosStore.selectedPiercingStage - 1, 1);
                if (macrosStore.technology.piercingMacros[macrosStore.selectedPiercingMacro].stages.length < macrosStore.selectedPiercingStage) {
                    macrosStore.setselectedPiercingStage(macrosStore.selectedPiercingStage - 1)
                }

                showToast({
                    type: 'success',
                    message: "Step removed!",
                    position: 'bottom-right',
                    autoClose: 2500
                });

            }
        }
    }

    addStage() {
        const max = 16
        if (macrosStore.technology.piercingMacros[macrosStore.selectedPiercingMacro].stages.length >= max) {
            showToast({
                type: 'warning',
                message: "Maximum value reached!",
                position: 'bottom-right',
                autoClose: 2500
            });
            return;
        }

        let stages = macrosStore.technology.piercingMacros[macrosStore.selectedPiercingMacro].stages;

        if (macrosStore.selectedPiercingStage !== 0) {
            const index = macrosStore.selectedPiercingStage - 1;
            const stepPaste = stages[index];
            stages.splice(index + 1, 0, { ...stepPaste });

        } else {
            let donor = macrosStore.technology.piercingMacros[macrosStore.selectedPiercingMacro]
            const stepPaste = {
                "pressure": donor.initial_pressure,
                "power": donor.initial_power,
                "enabled": true,
                "delay_s": 0,
                "power_W_s": 1000,
                "focus": donor.initial_focus,
                "height": donor.initial_height,
                "modulationFrequency_Hz": donor.initial_modulationFrequency_Hz,
                "cross_blow": false,
                "modulationMacro": donor.initial_modulationMacro

            }
            stages.splice(0, 0, stepPaste);
        }

        showToast({
            type: 'success',
            message: "Step added!",
            position: 'bottom-right',
            autoClose: 2500
        });
    }

    setAnimProgress(stage, progress) {
        this.animProgress.stage = stage
        this.animProgress.progress = progress
    }

    setDiagActive(val) {
        this.diagActive = val;

    }

    setIsAnimating(val) {
        this.isAnimating = val;
    }

    setPaused(val) {
        this.isPaused = val;
    }

    setAtEnd(val) {
        this.atEnd = val;
    }

    setElapsed(val) {
        this.elapsed = val;
    }


    setPresetMode (mode) {
        this.presetMode = mode
    }
    
    async updatePreset (id) {
        console.log ("update id " + id)
        const api_host = constants.SERVER_URL;
        macrosStore.cut_settings.technology = macrosStore.technology

        await fetch(api_host + `/db/updatepreset`, {
			method: "PUT",
            headers: {
				/* "Content-Type": "application/json" */
			},
             body: JSON.stringify({ id, ...macrosStore.cut_settings })
		}).then(() => {
			
            showToast({
                type: 'success',
                message: "Preset update with success!" ,
                position: 'bottom-right',
                autoClose: 2500
            }); 
            
		}).then(() => {
			
            showToast({
                type: 'success',
                message: "Current settings dounloaded from core 0!" ,
                position: 'bottom-right',
                autoClose: 2500
            }); 
            macrosStore.loadCutSettings()
            macrosStore.setPresetMode('none')
            
		})
    }

    async fetchPresets() {
        try {
          let resp = await fetch(constants.SERVER_URL + "/db/listpresets");
          const data = await resp.json();
          console.log(data); // Печать данных для отладки
          this._presets = data;
        } catch (error) {
          console.error("Ошибка при загрузке пресетов:", error);
        }
      }
    
      // Геттер для получения пресетов
      get presets() {
        return this._presets;
      }
    
}

const macrosStore = new MacrosStore();
export default macrosStore;         