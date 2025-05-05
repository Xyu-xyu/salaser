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

const cutting_settings = {
    "success": true,
    "result": {
        "$schema": "http://json-schema.org/draft-07/schema#",
        "additionalProperties": false,
        "title": "SGNmotion settings",
        "description": "SGNmotion settings",
        "required": [
            "machine",
            "technology",
            "material"
        ],
        "properties": {
            "machine": {
                "properties": {
                    "name": {
                        "minLength": 1,
                        "type": "string",
                        "maxLength": 128,
                        "default": "SGNlaser",
                        "title": "Название"
                    },
                    "sourcePower_w": {
                        "type": "integer",
                        "minimum": 100,
                        "maximum": 100000,
                        "default": 12000,
                        "title": "Мощность, Вт"
                    }
                },
                "description": "Current Machine",
                "required": [
                    "name",
                    "sourcePower_w"
                ],
                "additionalProperties": false,
                "title": "Машина",
                "type": "object"
            },
            "material": {
                "properties": {
                    "code": {
                        "minLength": 2,
                        "type": "string",
                        "maxLength": 64,
                        "default": "STEEL",
                        "title": "Код"
                    },
                    "name": {
                        "default": "Steel",
                        "type": "string",
                        "maxLength": 256,
                        "title": "Название"
                    },
                    "thickness": {
                        "type": "number",
                        "minimum": 0.1,
                        "maximum": 60.0,
                        "default": 1.5,
                        "title": "Толщина, мм"
                    }
                },
                "required": [
                    "name",
                    "code",
                    "thickness"
                ],
                "type": "object",
                "additionalProperties": false,
                "title": "Материал"
            },
            "technology": {
                "properties": {
                    "macros": {
                        "type": "array",
                        "items": {
                            "required": [
                                "cutting",
                                "piercingMacro"
                            ],
                            "type": "object",
                            "additionalProperties": false,
                            "properties": {
                                "piercingMacro": {
                                    "$wvEnumRef": "#/technology/piercingMacros",
                                    "title": "Индекс врезки",
                                    "minimum": 0,
                                    "maximum": 7,
                                    "default": 0,
                                    "type": "integer"
                                },
                                "cutting": {
                                    "properties": {
                                        "pressure": {
                                            "type": "number",
                                            "minimum": 0.1,
                                            "maximum": 35.0,
                                            "default": 8.0,
                                            "title": "Давление, бар"
                                        },
                                        "power_W_mm": {
                                            "type": "number",
                                            "minimum": 1,
                                            "maximum": 100000,
                                            "default": 100.0,
                                            "title": "Энергия, Вт/мм"
                                        },
                                        "gas": {
                                            "default": "AIR",
                                            "type": "string",
                                            "enum": [
                                                "AIR",
                                                "O2",
                                                "N2"
                                            ],
                                            "title": "Газ"
                                        },
                                        "focus": {
                                            "type": "number",
                                            "minimum": -15.0,
                                            "maximum": 15.0,
                                            "default": 1.0,
                                            "title": "Фокус, мм"
                                        },
                                        "enabled": {
                                            "title": "Разрешено",
                                            "type": "boolean",
                                            "default": false
                                        },
                                        "feedLimit_mm_s": {
                                            "type": "number",
                                            "minimum": 10,
                                            "maximum": 200000,
                                            "default": 50000,
                                            "title": "Ограничение подачи, мм/с"
                                        },
                                        "cross_blow": {
                                            "title": "Охлаждение",
                                            "type": "boolean",
                                            "default": false
                                        },
                                        "type": {
                                            "default": "CW",
                                            "type": "string",
                                            "enum": [
                                                "CW",
                                                "PULSE",
                                                "ENGRAVING",
                                                "VAPOR",
                                                "EDGING"
                                            ],
                                            "title": "Тип"
                                        },
                                        "modulationMacro": {
                                            "$wvEnumRef": "#/technology/modulationMacros",
                                            "title": "Индекс импульсного режима",
                                            "minimum": 0,
                                            "maximum": 15,
                                            "default": 0,
                                            "type": "integer"
                                        },
                                        "height": {
                                            "type": "number",
                                            "minimum": 0.1,
                                            "maximum": 20.0,
                                            "default": 1.0,
                                            "title": "Высота, мм"
                                        },
                                        "modulationFrequency_Hz": {
                                            "type": "number",
                                            "minimum": 100,
                                            "maximum": 100000,
                                            "default": 10000.0,
                                            "title": "Несущая частота, Hz"
                                        }
                                    },
                                    "required": [
                                        "type",
                                        "enabled",
                                        "cross_blow",
                                        "gas"
                                    ],
                                    "type": "object",
                                    "additionalProperties": false,
                                    "title": "Резка"
                                }
                            }
                        },
                        "$wvType": "tabbed",
                        "additionalProperties": false,
                        "maxItems": 8,
                        "title": "Макросы"
                    },
                    "piercingMacros": {
                        "type": "array",
                        "items": {
                            "required": [
                                "gas",
                                "initial_cross_blow",
                                "name"
                            ],
                            "properties": {
                                "initial_modulationFrequency_Hz": {
                                    "type": "number",
                                    "minimum": 100,
                                    "maximum": 100000,
                                    "default": 10000.0,
                                    "title": "Начальная несущая частота, Hz"
                                },
                                "initial_focus": {
                                    "type": "number",
                                    "minimum": -15.0,
                                    "maximum": 15.0,
                                    "default": 1.0,
                                    "title": "Начальный фокус, мм"
                                },
                                "initial_modulationMacro": {
                                    "$wvEnumRef": "#/technology/modulationMacros",
                                    "title": "Индекс начального импульсного режима",
                                    "minimum": 0,
                                    "maximum": 15,
                                    "default": 0,
                                    "type": "integer"
                                },
                                "initial_pressure": {
                                    "type": "number",
                                    "minimum": 0.1,
                                    "maximum": 35.0,
                                    "default": 8.0,
                                    "title": "Начальное давление, бар"
                                },
                                "gas": {
                                    "default": "AIR",
                                    "type": "string",
                                    "enum": [
                                        "AIR",
                                        "O2",
                                        "N2"
                                    ],
                                    "title": "Газ"
                                },
                                "name": {
                                    "minLength": 1,
                                    "type": "string",
                                    "maxLength": 32,
                                    "default": "Unknown incut",
                                    "title": "Название"
                                },
                                "initial_power": {
                                    "type": "integer",
                                    "minimum": 10,
                                    "maximum": 100000,
                                    "default": 1000,
                                    "title": "Начальная мощность, Вт"
                                },
                                "initial_height": {
                                    "type": "number",
                                    "minimum": 0.1,
                                    "maximum": 20.0,
                                    "default": 1.0,
                                    "title": "Начальная высота, мм"
                                },
                                "stages": {
                                    "type": "array",
                                    "items": {
                                        "required": [
                                            "enabled",
                                            "cross_blow"
                                        ],
                                        "additionalProperties": false,
                                        "type": "object",
                                        "properties": {
                                            "pressure": {
                                                "type": "number",
                                                "minimum": 0.1,
                                                "maximum": 35.0,
                                                "default": 8.0,
                                                "title": "Давление, бар"
                                            },
                                            "power": {
                                                "type": "integer",
                                                "minimum": 10,
                                                "maximum": 100000,
                                                "default": 1000,
                                                "title": "Максимальная разрешенная мощность, Вт"
                                            },
                                            "enabled": {
                                                "title": "Используется",
                                                "type": "boolean",
                                                "default": false
                                            },
                                            "delay_s": {
                                                "title": "Задержка перед шагом, с",
                                                "type": "number",
                                                "default": 0
                                            },
                                            "power_W_s": {
                                                "type": "integer",
                                                "minimum": 10,
                                                "maximum": 1000000,
                                                "default": 1000,
                                                "title": "Энергия шага, Вт/с"
                                            },
                                            "focus": {
                                                "type": "number",
                                                "minimum": -15.0,
                                                "maximum": 15.0,
                                                "default": 1.0,
                                                "title": "Фокус, мм"
                                            },
                                            "height": {
                                                "type": "number",
                                                "minimum": 0.1,
                                                "maximum": 20.0,
                                                "default": 1.0,
                                                "title": "Высота, мм"
                                            },
                                            "modulationMacro": {
                                                "$wvEnumRef": "#/technology/modulationMacros",
                                                "title": "Индекс импульсного режима",
                                                "minimum": 0,
                                                "maximum": 15,
                                                "default": 0,
                                                "type": "integer"
                                            },
                                            "cross_blow": {
                                                "title": "Охлаждение",
                                                "type": "boolean",
                                                "default": false
                                            },
                                            "modulationFrequency_Hz": {
                                                "type": "number",
                                                "minimum": 100,
                                                "maximum": 100000,
                                                "default": 10000.0,
                                                "title": "Несущая частота, Hz"
                                            }
                                        }
                                    },
                                    "maxItems": 16,
                                    "additionalProperties": false,
                                    "title": "Шаги врезки"
                                },
                                "initial_cross_blow": {
                                    "title": "Охлаждение",
                                    "type": "boolean",
                                    "default": false
                                }
                            },
                            "additionalProperties": false,
                            "$wvFormat": {
                                "format": "{0}: {1} Hz, {2} stages",
                                "variables": [
                                    {
                                        "type": "value",
                                        "name": "name",
                                        "default": "Unknown"
                                    },
                                    {
                                        "type": "value",
                                        "name": "initial_modulationFrequency_Hz",
                                        "default": "-1"
                                    },
                                    {
                                        "type": "length",
                                        "name": "stages",
                                        "default": "-1"
                                    }
                                ]
                            },
                            "type": "object"
                        },
                        "$wvType": "tabbed",
                        "additionalProperties": false,
                        "maxItems": 8,
                        "title": "Настройки врезок"
                    },
                    "modulationMacros": {
                        "title": "Настройки импульсного реза",
                        "items": {
                            "properties": {
                                "pulseFill_percent": {
                                    "type": "number",
                                    "minimum": 0.1,
                                    "maximum": 100.0,
                                    "default": 50.0,
                                    "title": "Заполнение, %"
                                },
                                "name": {
                                    "minLength": 1,
                                    "type": "string",
                                    "maxLength": 32,
                                    "default": "Unknown modulation macro",
                                    "title": "Название"
                                },
                                "pulseFrequency_Hz": {
                                    "type": "number",
                                    "minimum": 0,
                                    "maximum": 1000,
                                    "default": 0,
                                    "title": "Частота импульсов, Hz"
                                }
                            },
                            "additionalProperties": false,
                            "type": "object",
                            "$wvFormat": {
                                "format": "{0}: {1}%, {2} Hz",
                                "variables": [
                                    {
                                        "type": "value",
                                        "name": "name",
                                        "default": "Unknown"
                                    },
                                    {
                                        "type": "value",
                                        "name": "pulseFill_percent",
                                        "default": "-1"
                                    },
                                    {
                                        "type": "value",
                                        "name": "pulseFrequency_Hz",
                                        "default": "-1"
                                    }
                                ]
                            }
                        },
                        "$wvType": "compact",
                        "additionalProperties": false,
                        "maxItems": 16,
                        "type": "array"
                    },
                    "feeding": {
                        "properties": {
                            "feedLimit_mm_s": {
                                "type": "number",
                                "minimum": 10,
                                "maximum": 200000,
                                "default": 50000,
                                "title": "Ограничение подачи, мм/с"
                            }
                        },
                        "required": [
                            "feedLimit_mm_s"
                        ],
                        "type": "object",
                        "additionalProperties": false,
                        "title": "Холостые перемещения"
                    }
                },
                "required": [
                    "macros",
                    "piercingMacros",
                    "feeding"
                ],
                "$wvType": "tabbed",
                "additionalProperties": false,
                "type": "object",
                "title": "Технология"
            }
        },
        "$id": "sgnMachineSettings",
        "type": "object"
    }
}

export default cutting_settings