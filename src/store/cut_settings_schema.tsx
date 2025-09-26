
const schema = JSON.parse(`
    {
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
                                    "default": "Врезка №",
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
                                    "maximum": 15.0,
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
                                                "default": 0,
                                                "minimum": 0,
                                                "maximum": 10
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
                                                "maximum": 15.0,
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
                                    "default": "Режим импульса № ",
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
`)

export default schema