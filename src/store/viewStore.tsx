import { makeAutoObservable, computed } from "mobx";
import cut_settings_schema from './cut_settings_schema'
import cut_settings from "./cut_settings";
import utils from "../scripts/util";
import { showToast } from "../components/toast";
import constants from "./constants";

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
    cancelText: string;
    confirmText: string;
    confirmText1?: string;
    func: (...args: any[]) => void;
    func1?: (...args: any[]) => void;
    args?: any[];
}

export interface Root {
    success: boolean
    result: Result
}

export interface Result {
    $schema: string
    additionalProperties: boolean
    title: string
    description: string
    required: string[]
    properties: Properties
    $id: string
    type: string
}

export interface Properties {
    machine: Machine
    material: Material
    technology: Technology
}

export interface Machine {
    properties: Properties2
    description: string
    required: string[]
    additionalProperties: boolean
    title: string
    type: string
}

export interface Properties2 {
    name: Name
    sourcePower_w: SourcePowerW
}

export interface Name {
    minLength: number
    type: string
    maxLength: number
    default: string
    title: string
}

export interface SourcePowerW {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Material {
    properties: Properties3
    required: string[]
    type: string
    additionalProperties: boolean
    title: string
}

export interface Properties3 {
    code: Code
    name: Name2
    thickness: Thickness
}

export interface Code {
    minLength: number
    type: string
    maxLength: number
    default: string
    title: string
}

export interface Name2 {
    default: string
    type: string
    maxLength: number
    title: string
}

export interface Thickness {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Technology {
    properties: Properties4
    required: string[]
    $wvType: string
    additionalProperties: boolean
    type: string
    title: string
}

export interface Properties4 {
    macros: Macros
    piercingMacros: PiercingMacros
    modulationMacros: ModulationMacros
    feeding: Feeding
}

export interface Macros {
    type: string
    items: Items
    $wvType: string
    additionalProperties: boolean
    maxItems: number
    title: string
}

export interface Items {
    required: string[]
    type: string
    additionalProperties: boolean
    properties: Properties5
}

export interface Properties5 {
    piercingMacro: PiercingMacro
    cutting: Cutting
}

export interface PiercingMacro {
    $wvEnumRef: string
    title: string
    minimum: number
    maximum: number
    default: number
    type: string
}

export interface Cutting {
    properties: Properties6
    required: string[]
    type: string
    additionalProperties: boolean
    title: string
}

export interface Properties6 {
    pressure: Pressure
    power_W_mm: PowerWMm
    gas: Gas
    focus: Focus
    enabled: Enabled
    feedLimit_mm_s: FeedLimitMmS
    cross_blow: CrossBlow
    type: Type
    modulationMacro: ModulationMacro
    height: Height
    modulationFrequency_Hz: ModulationFrequencyHz
}

export interface Pressure {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface PowerWMm {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Gas {
    default: string
    type: string
    enum: string[]
    title: string
}

export interface Focus {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Enabled {
    title: string
    type: string
    default: boolean
}

export interface FeedLimitMmS {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface CrossBlow {
    title: string
    type: string
    default: boolean
}

export interface Type {
    default: string
    type: string
    enum: string[]
    title: string
}

export interface ModulationMacro {
    $wvEnumRef: string
    title: string
    minimum: number
    maximum: number
    default: number
    type: string
}

export interface Height {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface ModulationFrequencyHz {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface PiercingMacros {
    type: string
    items: Items2
    $wvType: string
    additionalProperties: boolean
    maxItems: number
    title: string
}

export interface Items2 {
    required: string[]
    properties: Properties7
    additionalProperties: boolean
    $wvFormat: WvFormat
    type: string
}

export interface Properties7 {
    initial_modulationFrequency_Hz: InitialModulationFrequencyHz
    initial_focus: InitialFocus
    initial_modulationMacro: InitialModulationMacro
    initial_pressure: InitialPressure
    gas: Gas2
    name: Name3
    initial_power: InitialPower
    initial_height: InitialHeight
    stages: Stages
    initial_cross_blow: InitialCrossBlow
}

export interface InitialModulationFrequencyHz {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface InitialFocus {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface InitialModulationMacro {
    $wvEnumRef: string
    title: string
    minimum: number
    maximum: number
    default: number
    type: string
}

export interface InitialPressure {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Gas2 {
    default: string
    type: string
    enum: string[]
    title: string
}

export interface Name3 {
    minLength: number
    type: string
    maxLength: number
    default: string
    title: string
}

export interface InitialPower {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface InitialHeight {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Stages {
    type: string
    items: Items3
    maxItems: number
    additionalProperties: boolean
    title: string
}

export interface Items3 {
    required: string[]
    additionalProperties: boolean
    type: string
    properties: Properties8
}

export interface Properties8 {
    pressure: Pressure2
    power: Power
    enabled: Enabled2
    delay_s: DelayS
    power_W_s: PowerWS
    focus: Focus2
    height: Height2
    modulationMacro: ModulationMacro2
    cross_blow: CrossBlow2
    modulationFrequency_Hz: ModulationFrequencyHz2
}

export interface Pressure2 {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Power {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Enabled2 {
    title: string
    type: string
    default: boolean
}

export interface DelayS {
    title: string
    type: string
    default: number
}

export interface PowerWS {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Focus2 {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Height2 {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface ModulationMacro2 {
    $wvEnumRef: string
    title: string
    minimum: number
    maximum: number
    default: number
    type: string
}

export interface CrossBlow2 {
    title: string
    type: string
    default: boolean
}

export interface ModulationFrequencyHz2 {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface InitialCrossBlow {
    title: string
    type: string
    default: boolean
}

export interface WvFormat {
    format: string
    variables: Variable[]
}

export interface Variable {
    type: string
    name: string
    default: string
}

export interface ModulationMacros {
    title: string
    items: Items4
    $wvType: string
    additionalProperties: boolean
    maxItems: number
    type: string
}

export interface Items4 {
    properties: Properties9
    additionalProperties: boolean
    type: string
    $wvFormat: WvFormat2
}

export interface Properties9 {
    pulseFill_percent: PulseFillPercent
    name: Name4
    pulseFrequency_Hz: PulseFrequencyHz
}

export interface PulseFillPercent {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface Name4 {
    minLength: number
    type: string
    maxLength: number
    default: string
    title: string
}

export interface PulseFrequencyHz {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}

export interface WvFormat2 {
    format: string
    variables: Variable2[]
}

export interface Variable2 {
    type: string
    name: string
    default: string
}

export interface Feeding {
    properties: Properties10
    required: string[]
    type: string
    additionalProperties: boolean
    title: string
}

export interface Properties10 {
    feedLimit_mm_s: FeedLimitMmS2
}

export interface FeedLimitMmS2 {
    type: string
    minimum: number
    maximum: number
    default: number
    title: string
}



class ViewStore {

    modalProps: ModalProps = {
        show: false,
        modalBody: 'This is the body of the modal.',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        func: () => { },
        args: []
    };

    diagActive: string = ''
    macrosModalEdit: boolean = false;
    carouselMode: boolean = false;
    carouselModeInPiercing: boolean = false;
    modulationMacroModalEdit: boolean = false;
    piercingMacroModalEdit: boolean = false;
    selectedPiercingStage: number = 0;
    selectedSlide: number = 0
    theme: string = 'themeLight'
    selectedMacros: number = 0
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

    knobRound: { [key: string]: number } = {
        pressure: 1,
        power_W_mm: 0,
        focus: 1,
        feedLimit_mm_s: 0,
        modulationMacro: 0,
        height: 1,
        modulationFrequency_Hz: 0,
        piercingMacro: 0,
        pulseFill_percent: 0,
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


    isAnimating: Boolean = false;
    isPaused: Boolean = false;
    atEnd: Boolean = false;
    elapsed: number = 0

    animProgress: { [key: string]: number } = { stage: 0, progress: 0 }
    cut_settings: any = null;
    schema: any = null;

    loading = false;
    error: string | null = null;

    technology = cut_settings.technology
    macrosProperties = cut_settings_schema.properties.technology.properties.macros.items.properties

    async loadCutSettings() {
        this.loading = true;
        this.error = null;
        try {
            const resp = await fetch(`http://${constants.SERVER_URL}/api/cut-settings`);
            if (!resp.ok) throw new Error(`Ошибка загрузки: ${resp.statusText}`);

            const data = await resp.json();
            viewStore.cut_settings = data.result;
            viewStore.technology = data.result.technology
            showToast({
                type: 'success',
                message: "Upload settings form core 0 success!",
                position: 'bottom-right',
                autoClose: 5000
            });
            //console.log (data)
        } catch (err: any) {
            this.error = err.message || "Неизвестная ошибка";
            showToast({
                type: 'error',
                message: "Upload settings from core error" + err.message,
                position: 'bottom-right',
                autoClose: 5000
            });
        } finally {
            this.loading = false;
        }
    }


    async loadCutSettingsSchema() {
        this.loading = true;
        this.error = null;
        try {
            const resp = await fetch(`http://${constants.SERVER_URL}/api/cut-settings-schema`);
            if (!resp.ok) throw new Error(`Ошибка загрузки: ${resp.statusText}`);

            const data = await resp.json();
            viewStore.schema = data.result
            viewStore.macrosProperties = data.result.properties.technology.properties.macros.items.properties
            showToast({
                type: 'success',
                message: "Upload  schema from core 0 success!",
                position: 'bottom-right',
                autoClose: 5000
            });
            //console.log (data)
        } catch (err: any) {
            this.error = err.message || "Неизвестная ошибка";
            showToast({
                type: 'error',
                message: "Upload schema from core error" + err.message,
                position: 'bottom-right',
                autoClose: 5000
            });
        } finally {
            this.loading = false;
        }
    }

    async sentSettingsToLaser() {
        let result = utils.validateCuttingSettings()
        if ( result?.errors.length === 0) {
            viewStore.cut_settings.technology = viewStore.technology
            try {
                const resp = await fetch(`http://${constants.SERVER_URL}/api/cut-settings`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(viewStore.cut_settings),
                });
                if (!resp.ok) throw new Error(`Ошибка обновления: ${resp.statusText}`);
                const data = await resp.json();
                if (data.success) {
                    //this.cut_settings = newSettings;
                    showToast({ type: "success", message: "Настройки обновлены" });
                } else {
                    throw new Error(data.exception || "Ошибка обновления");
                }
            } catch (err: any) {
                showToast({ type: "error", message: err.message });
            }
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
        return this.technology.macros[this.selectedMacros].cutting.modulationMacro;
    }

    get selectedPiercingMacro() {
        return this.technology.macros[this.selectedMacros].piercingMacro;
    }

    get isVertical() {
        return Boolean(window.innerHeight > window.innerWidth)
    }

    setModalProps(val: ModalProps) {
        // console.log (JSON.stringify(val))
        this.modalProps = val;
    }

    setTheme(theme: string) {
        this.theme = theme
    }

    setKnobPath(param: string, path: string) {
        this.knobPath[param] = path;
    }

    getKnobPath(param: string): string {
        return this.knobPath[param] ?? "M0 0";
    }

    setModal(val: boolean, modal: string) {
        console.log('setModalEdit  ' + modal)
        this.setCarouselMode(false)
        this.setCarouselModeInPiercing(false)
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

    setVal(param: string, newVal: number, minimum: number, maximum: number) {
        if (param === 'selector') {
            // устанавливаем текущий макрос
            this.setSelectedMacros(newVal);
        } else {
            console.log(arguments)
            if (newVal < minimum) newVal = minimum
            if (newVal > maximum) newVal = maximum
            const macro = this.technology.macros[this.selectedMacros];

            if (param in macro.cutting) {
                (macro.cutting as any)[param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            } else if (param in macro) {
                (macro as any)[param] = Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            }
        }
    }

    setValBoolean(param: string, newVal: boolean,) {
        const macro = this.technology.macros[this.selectedMacros];
        if (param in macro.cutting) {
            (macro.cutting as any)[param] = newVal
        }
    }

    setValString(param: string, newVal: string, keyParam: string, ind: number | boolean = false) {
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

    setSelectedMacros(newVal: number) {
        if (newVal < 0) newVal = 0
        if (newVal > this.technology.macros.length - 1) newVal = this.technology.macros.length - 1
        this.selectedMacros = newVal;
    }

    setselectedPiercingStage(val: number) {
        console.log('setselectedPiercingStage ' + val)
        this.selectedPiercingStage = val
    }

    getTecnologyValue(param: string, keyParam: string, keyInd: number | boolean = false) {
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
                let index: number = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
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

            }
        }

    }

    setTecnologyValue(newVal: number, param: string, keyParam: string, minimum: number, maximum: number, keyInd: number | boolean = false) {
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
                let index: number = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
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
                let index: number = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
                this.technology.piercingMacros[keyInd].stages[index][param] =
                    Math.round(newVal * (10 ** this.knobRound[param])) / (10 ** this.knobRound[param]);
            }
        }
    }

    setTecnologyValueBoolean(newVal: boolean, param: string, keyParam: string, keyInd: number | boolean = false) {

        if (typeof keyInd === 'boolean') {

            if (keyParam === 'stages') {
                let index: number = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
                this.technology.piercingMacros[this.selectedPiercingMacro].stages[index][param] = newVal
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[this.selectedPiercingMacro][param] = newVal
            }

        } else {

            if (keyParam === 'stages') {
                let index: number = this.selectedPiercingStage - 1 < 0 ? 0 : this.selectedPiercingStage - 1
                this.technology.piercingMacros[keyInd].stages[index][param] = newVal
            } else if (keyParam === 'piercingMacros') {
                this.technology.piercingMacros[keyInd][param] = newVal
            }

        }
    }

    setCarouselMode(val: boolean) {
        console.log('setCarouselMode  to ' + val)
        this.carouselMode = val
    }

    setCarouselModeInPiercing(val: boolean) {
        console.log('setCarouselMode  to ' + val)
        this.carouselModeInPiercing = val
    }

    setSelectedSlide(num: number) {
        this.selectedSlide = num;
    }

    deleteAndUpdate(deleteKey: string, deleteIndex: number, adjustKey: string) {
        //console.log ( arguments )
        //console.log (JSON.stringify(viewStore.technology))

        if (viewStore.technology[deleteKey]
            && Array.isArray(viewStore.technology[deleteKey])
            && viewStore.technology[deleteKey].length > 1) {
            viewStore.technology[deleteKey].splice(deleteIndex, 1);
            viewStore.setselectedPiercingStage(0)
        } else {
            showToast({
                type: 'warning',
                message: "Minimum value reached!",
                position: 'bottom-right',
                autoClose: 5000
            });
            return;
        }

        const adjustValues = (currentObj: NestedObject) => {
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

        adjustValues(viewStore.technology);
        //console.log (JSON.stringify(viewStore.technology))
    };

    AddAndUpdate(key: string, selectedSlide: number, adjustKey: string) {
        //console.log ( arguments )
        const max = utils.deepFind(false, [adjustKey, 'maximum']);
        if (viewStore.technology[key]
            && Array.isArray(viewStore.technology[key])
            && viewStore.technology[key].length < max + 1) {

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
            viewStore.setselectedPiercingStage(0)
        } else {
            showToast({
                type: 'warning',
                message: "Maximum value reached!",
                position: 'bottom-right',
                autoClose: 5000
            });
        }
    }

    deleteStage(arg: string) {

        if (arg === 'all') {
            viewStore.setselectedPiercingStage(0)
            viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages = []
            return
        }

        if (viewStore.selectedPiercingStage === 0) {
            showToast({
                type: 'warning',
                message: "Cannot delete this splice step!",
                position: 'bottom-right',
                autoClose: 5000
            });

        } else {
            if (viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.length > 1 &&
                typeof viewStore.selectedPiercingStage === 'number'
            ) {

                viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.splice(viewStore.selectedPiercingStage - 1, 1);
                if (viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.length < viewStore.selectedPiercingStage) {
                    viewStore.setselectedPiercingStage(viewStore.selectedPiercingStage - 1)
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

    addStage() {
        const max = 16
        if (viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages.length >= max) {
            showToast({
                type: 'warning',
                message: "Maximum value reached!",
                position: 'bottom-right',
                autoClose: 5000
            });
            return;
        }

        console.log()

        let stages = viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro].stages;

        if (viewStore.selectedPiercingStage !== 0) {
            const index = viewStore.selectedPiercingStage - 1;
            const stepPaste = stages[index];
            stages.splice(index + 1, 0, { ...stepPaste });

        } else {
            let donor = viewStore.technology.piercingMacros[viewStore.selectedPiercingMacro]
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
            autoClose: 5000
        });
    }

    setAnimProgress(stage: number, progress: number) {
        this.animProgress.stage = stage
        this.animProgress.progress = progress
    }

    setDiagActive(val: string) {
        this.diagActive = val;

    }

    setIsAnimating(val: boolean) {
        this.isAnimating = val;
    }

    setPaused(val: boolean) {
        this.isPaused = val;
    }

    setAtEnd(val: boolean) {
        this.atEnd = val;
    }

    setElapsed(val: number) {
        this.elapsed = val;
    }

    updateTechnology (settings:Properties,  name:string) {
        viewStore.technology = settings.technology  
        showToast({
            type: 'success',
            message: "Preset success download:"+  name,
            position: 'bottom-right',
            autoClose: 5000
        });      
        
    }
}

const viewStore = new ViewStore();
export default viewStore;         