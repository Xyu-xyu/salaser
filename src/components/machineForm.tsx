import React from "react";
import { IChangeEvent, withTheme } from "@rjsf/core";
import validator from "@rjsf/validator-ajv8";
import { Theme } from '@rjsf/mui';

const schema = {
	"$schema": "http://json-schema.org/draft-07/schema#",
	"required": [
		"machine",
		"technology",
		"material"
	],
	"properties": {
		"machine": {
			"type": "object",
			"description": "Current Machine",
			"properties": {
				"name": {
					"title": "Название",
					"minLength": 1,
					"maxLength": 128,
					"default": "SGNlaser",
					"type": "string"
				},
				"sourcePower_w": {
					"type": "integer",
					"title": "Мощность, Вт",
					"maximum": 100000,
					"default": 12000,
					"minimum": 100
				}
			},
			"additionalProperties": false,
			"required": [
				"name",
				"sourcePower_w"
			],
			"title": "Машина"
		},
		"material": {
			"properties": {
				"code": {
					"title": "Код",
					"minLength": 2,
					"maxLength": 64,
					"default": "STEEL",
					"type": "string"
				},
				"name": {
					"maxLength": 256,
					"type": "string",
					"title": "Название",
					"default": "Steel"
				},
				"thickness": {
					"type": "number",
					"title": "Толщина, мм",
					"maximum": 60.0,
					"default": 1.5,
					"minimum": 0.1
				}
			},
			"title": "Материал",
			"required": [
				"name",
				"code",
				"thickness"
			],
			"additionalProperties": false,
			"type": "object"
		},
		"technology": {
			"$wvType": "tabbed",
			"properties": {
				"macros": {
					"$wvType": "tabbed",
					"title": "Макросы",
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
								"type": "integer",
								"title": "Индекс врезки",
								"maximum": 7,
								"default": 0,
								"minimum": 0
							},
							"cutting": {
								"properties": {
									"pressure": {
										"type": "number",
										"title": "Давление, бар",
										"maximum": 35.0,
										"default": 8.0,
										"minimum": 0.1
									},
									"power_W_mm": {
										"type": "number",
										"title": "Энергия, Вт/мм",
										"maximum": 100000,
										"default": 100.0,
										"minimum": 1
									},
									"gas": {
										"enum": [
											"AIR",
											"O2",
											"N2"
										],
										"type": "string",
										"title": "Газ",
										"default": "AIR"
									},
									"focus": {
										"type": "number",
										"title": "Фокус, мм",
										"maximum": 15.0,
										"default": 1.0,
										"minimum": -15.0
									},
									"enabled": {
										"type": "boolean",
										"title": "Разрешено",
										"default": false
									},
									"type": {
										"enum": [
											"CW",
											"PULSE",
											"ENGRAVEING",
											"VAPOR",
											"EDGING"
										],
										"type": "string",
										"title": "Тип",
										"default": "CW"
									},
									"cross_blow": {
										"type": "boolean",
										"title": "Охлаждение",
										"default": false
									},
									"feedLimit_mm_s": {
										"type": "number",
										"title": "Ограничение подачи, мм/с",
										"maximum": 200000,
										"default": 50000,
										"minimum": 10
									},
									"modulationMacro": {
										"$wvEnumRef": "#/technology/modulationMacros",
										"type": "integer",
										"title": "Индекс импульсного режима",
										"maximum": 15,
										"default": 0,
										"minimum": 0
									},
									"height": {
										"type": "number",
										"title": "Высота, мм",
										"maximum": 20.0,
										"default": 1.0,
										"minimum": 0.1
									},
									"modulationFrequency_Hz": {
										"type": "number",
										"title": "Несущая частота, Hz",
										"maximum": 100000,
										"default": 10000.0,
										"minimum": 100
									}
								},
								"title": "Резка",
								"required": [
									"type",
									"enabled",
									"cross_blow",
									"gas"
								],
								"additionalProperties": false,
								"type": "object"
							}
						}
					},
					"additionalProperties": false,
					"maxItems": 8,
					"type": "array"
				},
				"piercingMacros": {
					"$wvType": "tabbed",
					"title": "Настройки врезок",
					"items": {
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
						"required": [
							"gas",
							"initial_cross_blow",
							"name"
						],
						"additionalProperties": false,
						"type": "object",
						"properties": {
							"name": {
								"title": "Название",
								"minLength": 1,
								"maxLength": 32,
								"default": "Unknown incut",
								"type": "string"
							},
							"initial_modulationFrequency_Hz": {
								"type": "number",
								"title": "Начальная несущая частота, Hz",
								"maximum": 100000,
								"default": 10000.0,
								"minimum": 100
							},
							"stages": {
								"title": "Шаги врезки",
								"items": {
									"required": [
										"enabled",
										"cross_blow"
									],
									"additionalProperties": false,
									"type": "object",
									"properties": {
										"power": {
											"type": "integer",
											"title": "Максимальная разрешенная мощность, Вт",
											"maximum": 100000,
											"default": 1000,
											"minimum": 10
										},
										"power_W_s": {
											"type": "integer",
											"title": "Энергия шага, Вт/с",
											"maximum": 1000000,
											"default": 1000,
											"minimum": 10
										},
										"enabled": {
											"type": "boolean",
											"title": "Используется",
											"default": false
										},
										"delay_s": {
											"type": "number",
											"title": "Задержка перед шагом, с",
											"default": 0
										},
										"pressure": {
											"type": "number",
											"title": "Давление, бар",
											"maximum": 35.0,
											"default": 8.0,
											"minimum": 0.1
										},
										"focus": {
											"type": "number",
											"title": "Фокус, мм",
											"maximum": 15.0,
											"default": 1.0,
											"minimum": -15.0
										},
										"height": {
											"type": "number",
											"title": "Высота, мм",
											"maximum": 20.0,
											"default": 1.0,
											"minimum": 0.1
										},
										"cross_blow": {
											"type": "boolean",
											"title": "Охлаждение",
											"default": false
										},
										"modulationFrequency_Hz": {
											"type": "number",
											"title": "Несущая частота, Hz",
											"maximum": 100000,
											"default": 10000.0,
											"minimum": 100
										},
										"modulationMacro": {
											"$wvEnumRef": "#/technology/modulationMacros",
											"type": "integer",
											"title": "Индекс импульсного режима",
											"maximum": 15,
											"default": 0,
											"minimum": 0
										}
									}
								},
								"additionalProperties": false,
								"maxItems": 16,
								"type": "array"
							},
							"initial_pressure": {
								"type": "number",
								"title": "Начальное давление, бар",
								"maximum": 35.0,
								"default": 8.0,
								"minimum": 0.1
							},
							"gas": {
								"enum": [
									"AIR",
									"O2",
									"N2"
								],
								"type": "string",
								"title": "Газ",
								"default": "AIR"
							},
							"initial_power": {
								"type": "integer",
								"title": "Начальная мощность, Вт",
								"maximum": 100000,
								"default": 1000,
								"minimum": 10
							},
							"initial_height": {
								"type": "number",
								"title": "Начальная высота, мм",
								"maximum": 20.0,
								"default": 1.0,
								"minimum": 0.1
							},
							"initial_cross_blow": {
								"type": "boolean",
								"title": "Охлаждение",
								"default": false
							},
							"initial_focus": {
								"type": "number",
								"title": "Начальный фокус, мм",
								"maximum": 15.0,
								"default": 1.0,
								"minimum": -15.0
							},
							"initial_modulationMacro": {
								"$wvEnumRef": "#/technology/modulationMacros",
								"type": "integer",
								"title": "Индекс начального импульсного режима",
								"maximum": 15,
								"default": 0,
								"minimum": 0
							}
						}
					},
					"additionalProperties": false,
					"maxItems": 8,
					"type": "array"
				},
				"modulationMacros": {
					"$wvType": "compact",
					"type": "array",
					"items": {
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
						},
						"properties": {
							"name": {
								"title": "Название",
								"minLength": 1,
								"maxLength": 32,
								"default": "Unknown modulation macro",
								"type": "string"
							},
							"pulseFill_percent": {
								"type": "number",
								"title": "Заполнение, %",
								"maximum": 100.0,
								"default": 50.0,
								"minimum": 0.1
							},
							"pulseFrequency_Hz": {
								"type": "number",
								"title": "Частота импульсов, Hz",
								"maximum": 1000,
								"default": 0,
								"minimum": 0
							}
						},
						"additionalProperties": false,
						"type": "object"
					},
					"additionalProperties": false,
					"maxItems": 16,
					"title": "Настройки импульсного реза"
				},
				"feeding": {
					"properties": {
						"feedLimit_mm_s": {
							"type": "number",
							"title": "Ограничение подачи, мм/с",
							"maximum": 200000,
							"default": 50000,
							"minimum": 10
						}
					},
					"title": "Холостые перемещения",
					"required": [
						"feedLimit_mm_s"
					],
					"additionalProperties": false,
					"type": "object"
				}
			},
			"title": "Технология",
			"required": [
				"macros",
				"piercingMacros",
				"feeding"
			],
			"additionalProperties": false,
			"type": "object"
		}
	},
	"description": "SGNmotion settings",
	"$id": "sgnMachineSettings",
	"type": "object",
	"additionalProperties": false,
	"title": "SGNmotion settings"
}

const MachineSettingsForm: React.FC = () => {
  const handleSubmit = (e: IChangeEvent) => {
    console.log("Данные формы:", e.formData);
  };

  const Form = withTheme(Theme);


  return (
    <div style={{ padding: "1rem" }}>
      <h2>{schema.title}</h2>
      <Form
        schema={schema}
        validator={validator}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default MachineSettingsForm;
