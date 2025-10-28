import { makeAutoObservable } from "mobx";
import schema from './functions.json'

/* ---------------- Типизация для Vermatic schema ---------------- */

// Общие подтипы
interface EnabledValue {
	enabled: boolean;
	value: boolean;
}

interface OriginOffset {
	x_offset: number;
	y_offset: number;
	enabled: boolean;
}

interface ProgrammedReference {
	Programmed_reference_x: number;
	Programmed_reference_y: number;
	enabled: boolean;
}

interface Vaporisation {
	enabled: boolean;
	function: "part" | "plan" | "lead-in" | false;
}

interface Stops {
	Stop_before_part: number;
	Stop_at: "Off" | "Nozzle_change";
	Stop_Select: "Off" | "On";
	enabled: boolean;
}


interface Microjoints {
	enabled: boolean;
	function: "Programmed" | "Programmed + Measurement" | "Measurement" | "Programmed + position" | "Position" ;
	min_x_dimension?: number;
	max_x_dimension?: number;
	min_y_dimension?: number;
	max_y_dimension?: number;
}

interface EdgeDetection {
	Detection_method: "Capacitive" | "Detection eye";
	Detection: "X" | "Y" | "angle" | "X/Y" | "X/Y/angle";
	Move_to_starting_point_manually: boolean;
	Detection_corner: "Fl" | "Fr" | "Br" | "Bl";
	Sheet_loading: "Fl" | "Fr" | "Br" | "Bl";
	Sheet_dimension_offset_long_edge: number;
	Angle_or_sheet_corner: number;
	enabled: boolean;
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

/* ---------------- Store ---------------- */

class FunctionStore {
	vermatic: VermaticSchema = {
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

	aKey: string = ""
	bKey: string = ""

	constructor() {
		makeAutoObservable(this);
	}

	/**
	 * Универсальное обновление значения по пути
	 * @param path - строка пути, например "Stops.Stop_before_part"
	 * @param newValue - новое значение
	 */

	setVal<T extends keyof this>(key: T, value: this[T]) {
		if (key in this) {
			this[key] = value;
		}
	}

	updateValue(path: string, newValue: any) {
		console.log(" updateValue ")
		const keys = path.split(".");
		let current: any = this.vermatic;

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
	}

	getTitleAndUnit(blockKey: string, propKey: string) {
		const block = schema.properties?.[blockKey as keyof typeof schema.properties] as
			| { properties?: Record<string, any> }
			| undefined;
		
		const props = block?.properties || {};
		const propSchema = props[propKey];
		
		// Получаем значение из текущего состояния
		const blockValue = functionStore.vermatic?.[blockKey as keyof typeof functionStore.vermatic];
		const value =
			blockValue && propKey in (blockValue as object)
				? (blockValue as any)[propKey]
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
	
	

}

const functionStore = new FunctionStore();
export default functionStore;
