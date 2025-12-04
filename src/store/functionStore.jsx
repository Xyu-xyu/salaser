import { makeAutoObservable } from "mobx";
import schema from './functions.json'
import constants from "./constants";

/* ---------------- Типизация для Vermatic schema ---------------- */

// Общие подтипы
/* interface EnabledValue {
	enabled;
	value;
}

interface OriginOffset {
	x_offset;
	y_offset;
	enabled;
}

interface ProgrammedReference {
	Programmed_reference_x;
	Programmed_reference_y;
	enabled;
}

interface Vaporisation {
	enabled;
	function: "part" | "plan" | "lead-in" | false;
}

interface Stops {
	Stop_before_part;
	Stop_at: "Off" | "Nozzle_change";
	Stop_Select: "Off" | "On";
	enabled;
}


interface Microjoints {
	enabled;
	function: "Programmed" | "Programmed + Measurement" | "Measurement" | "Programmed + position" | "Position";
	min_x_dimension?;
	max_x_dimension?;
	min_y_dimension?;
	max_y_dimension?;
}

interface EdgeDetection {
	Detection_method: "Capacitive" | "Detection eye";
	Detection: "X" | "Y" | "angle" | "X/Y" | "X/Y/angle";
	Move_to_starting_point_manually;
	Detection_corner: "Fl" | "Fr" | "Br" | "Bl";
	Sheet_loading: "Fl" | "Fr" | "Br" | "Bl";
	Sheet_dimension_offset_long_edge;
	Angle_or_sheet_corner;
	enabled;
}

export interface VermaticSchema {
	Origin_offset: OriginOffset;
	Programmed_reference: ProgrammedReference;
	Nozzle_cleaning: EnabledValue;
	inverse: EnabledValue;
	Sensor_field: EnabledValue;
	Vaporisation: Vaporisation;
	Stops: Stops;
	Microjoints: Microjoints;
	Edge_detection: EdgeDetection;
}
 */
/* ---------------- Store ---------------- */

class FunctionStore {
	vermatic = {
		Origin_offset: { x_offset: 0, y_offset: 0, enabled: false },
		Edge_detection: {
			Detection_method: "Capacitive",
			Detection: "X/Y/angle",
			Move_to_starting_point_manually: false,
			Detection_corner: "Fl",
			Sheet_loading: "Fl",
			Sheet_dimension_offset_long_edge: 0,
			Angle_or_sheet_corner: 90,
			enabled: false,
		},
		Microjoints: {
			enabled: false,
			function: "Programmed",
			min_x_dimension: 0,
			max_x_dimension: 0,
			min_y_dimension: 0,
			max_y_dimension: 0
		},
		Stops: { Stop_before_part: 25, Stop_at: "Off", Stop_Select: "Off", enabled: false },
		Nozzle_cleaning: { enabled: false, value: false },
		Programmed_reference: { Programmed_reference_x: 0, Programmed_reference_y: 0, enabled: false },
		Vaporisation: { enabled: false, function: false },
		inverse: { enabled: false, value: false },
		Sensor_field: { enabled: false, value: true },
	};

	aKey = ""
	bKey = ""

	constructor() {
		makeAutoObservable(this);
	}

	/**
	 * Универсальное обновление значения по пути
	 * @param path - строка пути, например "Stops.Stop_before_part"
	 * @param newValue - новое значение
	 */

	setVal (key, value) {
		if (key in this) {
			this[key] = value;
		}
	}

	updateValue(path, newValue) {
		console.log(" updateValue ")
		const keys = path.split(".");
		let current = this.vermatic;

		for (let i = 0; i < keys.length - 1; i++) {
			const key = keys[i];
			if (!(key in current)) {
				throw new Error(`Путь "${keys.slice(0, i + 1).join(".")}" не существует в объекте`);
			}
			current = current[key];
		}

		const lastKey = keys[keys.length - 1];
		if (!(lastKey in current)) {
			throw new Error(`Свойство "${lastKey}" не найдено в "${path}"`);
		}

		current[lastKey] = newValue;
		this.saveFunctions()
	}

	getTitleAndUnit(blockKey, propKey) {
		const block = schema.properties?.[blockKey] 

		const props = block?.properties || {};
		const propSchema = props[propKey];

		// Получаем значение из текущего состояния
		const blockValue = functionStore.vermatic?.[blockKey];
		const value =
			blockValue && propKey in (blockValue)
				? blockValue[propKey]
				: undefined;

		// Если схема не найдена — возвращаем ключ и значение как fallback
		if (!propSchema) {
			return { label: propKey, unit: "", value, type: false, enum: false, min: false, max: false };
		}

		// Разделяем title на имя и единицу измерения
		const [rawLabel, rawUnit] = (propSchema.title || propKey).split(",");

		// Убираем ".value" из имени (если оно есть)
		const label =
			propKey === "value"
				? rawLabel.replace(/ value$/i, "").trim()
				: rawLabel.trim();

		const unit = rawUnit?.trim() || "";

		// Получаем дополнительные данные типа, enum, min, max
		const type = propSchema.type || false;
		const enumValues = Array.isArray(propSchema.enum) ? propSchema.enum : false;
		const min = typeof propSchema.minimum === "number" ? propSchema.minimum : false;
		const max = typeof propSchema.maximum === "number" ? propSchema.maximum : false;
		const def = typeof propSchema.default === "number" ? propSchema.default : false;
		return { label, unit, value, type, enum: enumValues, min, max, def };
	}

	async loadFunctions() {
		try {
			const response = await fetch( `${constants.SERVER_URL}/api/get_functions`);
			if (!response.ok) throw new Error('Failed to load functions');

			const data = await response.json();
 			if (Array.isArray(data) && data.length > 0) {
				functionStore.setVermatic(data[0]); 
			} else if (data && typeof data === 'object') {
				functionStore.setVermatic(data);
			}
			console.log('SUCCESS in loading functions');

		} catch (error) {
			console.error('Error loading functions:', error);
		}
	}

	
	async saveFunctions() {
		await fetch(`${constants.SERVER_URL}/api/save_functions`, {
			method: "POST",
			headers: {
				/* "Content-Type": "application/json" */
			},
			body: JSON.stringify(this.vermatic), 
		}).then(() => {
			console.log ("SUCCESS saveFunctions")
		})
	}

	setVermatic(data) {
		this.vermatic = { ...this.vermatic, ...data };
	}
}

const functionStore = new FunctionStore();
functionStore.loadFunctions()
export default functionStore;
