import { showToast } from '../components/toast';
import cutting_settings_schema from '../store/cut_settings_schema';
import macrosStore, { Properties } from '../store/macrosStore';
import validator from "@rjsf/validator-ajv8";
import { getDefaultFormState } from "@rjsf/utils";

interface GCodeParams {
	[key: string]: number | undefined;
}

interface GCodeBase {
	X: number;
	Y: number;
	C: number;
}

interface GCodeLine {
	n?: number;
	g?: number;
	m?: number | false;
	params: GCodeParams;
	comment?: string;
	base?: GCodeBase;
}

interface NestedObject {
	[key: string]: any;
}

type Stage = {
	pressure: number;
	power: number;
	focus: number;
	height: number;
	enabled: boolean;
	power_W_s: number;
	delay_s:number;
};

type ResultItem = {
	name: string;
	'focus, mm'?: number,
	'height, mm'?: number,
	'pressure, bar'?: number,
	'power, kWt'?: number,
	'enabled': boolean;
	'power': number,
	'power_W_s': number,
	'delay_s':number
};

type MinMax = {
	[key: string]: {
	  min: number;
	  max: number;
	};
  };
  


class Utils {
	// Метод для преобразования полярных координат в декартовы
	polarToCartesian(radius: number, angle: number, center: { x: number, y: number } = { x: 50, y: 50 }) {
		const rad = (angle - 90) * (Math.PI / 180); // SVG 0° вверх
		return {
			x: center.x + radius * Math.cos(rad),
			y: center.y + radius * Math.sin(rad),
		};
	}

	// Метод для получения пути
	getPath(
		selectedMacros: number,
		minimum: number,
		maximum: number,
		sweepAngle: number,
		r1: number,
		r2: number,
		startAngle: number
	): string {
		const percentage = (selectedMacros - minimum) / (maximum - minimum);
		const angle = sweepAngle * percentage;

		const startOuter = this.polarToCartesian(r2, startAngle);
		const endOuter = this.polarToCartesian(r2, startAngle + angle);
		const startInner = this.polarToCartesian(r1, startAngle);
		const endInner = this.polarToCartesian(r1, startAngle + angle);

		// Определяем, нужен ли флаг large-arc (больше 180°)
		const largeArcFlag = angle > 180 ? 1 : 0;

		const arcOuter = `A ${r2} ${r2} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`;
		const arcInner = `A ${r1} ${r1} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`;

		// Возвращаем замкнутый сектор
		return `
            M ${startOuter.x} ${startOuter.y}
            ${arcOuter}
            L ${endInner.x} ${endInner.y}
            ${arcInner}
            Z
        `;
	}

	getTicks(
		minimum: number,
		maximum: number,
		stepBig: number,
		r1: number,
		r2: number,
		r3?: number,
		sAngle?: number,
		aPerStep?: number,
	) {
		const totalSteps = Math.floor((maximum - minimum) / stepBig);
		const anglePerStep = ( aPerStep ? aPerStep :270)  / totalSteps;
		const startAngle = sAngle ? sAngle :225;
		const endAngle = startAngle + ( aPerStep ? aPerStep :270) ;

		// Построение кольцевого сегмента от 225° до 135°
		const startOuter = this.polarToCartesian(r2, startAngle);
		const endOuter = this.polarToCartesian(r2, endAngle);
		const startInner = this.polarToCartesian(r1, endAngle);
		const endInner = this.polarToCartesian(r1, startAngle);

		const ringPath = `
                M ${startOuter.x} ${startOuter.y}
                A ${r2} ${r2} 0 1 1 ${endOuter.x} ${endOuter.y}
                L ${startInner.x} ${startInner.y}
                A ${r1} ${r1} 0 1 0 ${endInner.x} ${endInner.y}
                Z
            `;

		const ticks = Array.from({ length: totalSteps + 1 }).map((_, i) => {
			const angle = startAngle + i * anglePerStep;
			const r = (r1 + r2) / 2;
			const pos = this.polarToCartesian(r, angle);

			return (
				<circle
					key={i}
					cx={pos.x}
					cy={pos.y}
					r={ r3 ? r3 : 0.5}
					fill={'black'}
				/>
			);
		});

		return (
			<>
				{/* Кольцевая дуга */}
				<path
					d={ringPath}
					fill="rgba(0,0,0,0.05)"
				/>

				{/* Декоративные точки */}
				{ticks}
			</>
		);
	}


	getLampLine(
		minimum: number,
		maximum: number,
		val: number,         // Текущее значение
		stepBig: number,
		r1: number,
		r2: number,
 		sAngle?: number,
		aPerStep?: number
	) {
		const totalSteps = Math.floor((maximum - minimum) / stepBig);
		const anglePerStep = (aPerStep ?? 270) / totalSteps;
		const startAngle = sAngle ?? 225;
	
		const ticks = Array.from({ length: totalSteps + 1 }).map((_, i) => {
			const stepValue = minimum + i * stepBig; // значение на этом делении
			const angle = startAngle + i * anglePerStep;
			const r = (r1 + r2) / 2;
			const pos = this.polarToCartesian(r, angle);
	
			return (
				<circle
					key={i}
					cx={pos.x}
					cy={pos.y}
					r={stepValue <= val ? '1.5' : '1'}
 					fill={stepValue <= val ? 'orangered' : 'rgba(0,0,0,0.25)'}
					 filter={stepValue <= val  ? 'brightness(120%)' : undefined}

				/>
			);
		});
	
		return <>{ticks}</>;
	}
	

	getSticks(
		steps: number,
		radius: number,
		tickLength: number
	) {
		const anglePerStep = 360 / steps;
		const startAngle = 0;
	
		// Линии вместо кружков
		const ticks = Array.from({ length: steps + 1 }).map((_, i) => {
			const angle = startAngle + i * anglePerStep;
	
			const start = this.polarToCartesian(radius - tickLength / 2, angle);
			const end = this.polarToCartesian(radius + tickLength / 2, angle);
	
			return (
				<line
					key={i}
					x1={start.x}
					y1={start.y}
					x2={end.x}
					y2={end.y}
					stroke="gray"
					strokeWidth=".75"
				/>
			);
		});
	
		return (
			<>
				{ticks}
			</>
		);
	}
	

	calculateFontSize(minimum: number, maximum: number, step: number): number {
		const maxLength = Math.max(
			`${minimum - step}`.length,
			`${minimum + step}`.length,
			`${maximum - step}`.length,
			`${maximum + step}`.length
		);

		let fontSize = 80 / maxLength;

		// Ограничение по диапазону
		fontSize = Math.min(22.5, Math.max(10, fontSize));

		return fontSize;
	}

	getKnobLayout(isVertical: boolean) {
		return {
			x1: isVertical ? 17 : -10,
			x2: isVertical ? 83 : 110,
			x4: isVertical ? 5 : -56,
			y1: isVertical ? 105 : 80,
			y2: 80,
			y3: isVertical ? -15 : 15,
			r1: 37.5,
			r2: 38.5,
			center: { x: 50, y: 50 },
			startAngle: 225,
			sweepAngle: 270,
		};
	}

	findByKey(obj: any, keyToFind: string): any[] {

		const results: any[] = [];
		function recursiveSearch(obj: any) {
			if (typeof obj !== 'object' || obj === null) return;

			for (const key in obj) {
				if (key === keyToFind) {
					results.push(obj[key]);
				}
				recursiveSearch(obj[key]);
			}
		}

		recursiveSearch(obj);
		return results;
	}

	extractValuesByKey(obj: NestedObject, key: string): any[] {
		let result: any[] = [];

		const search = (currentObj: NestedObject) => {
			for (const currentKey in currentObj) {
				if (currentObj.hasOwnProperty(currentKey)) {
					if (currentKey === key) {
						result.push(currentObj[currentKey]);
					}
					// Если значение - это объект, рекурсивно вызываем функцию
					if (typeof currentObj[currentKey] === 'object' && currentObj[currentKey] !== null) {
						search(currentObj[currentKey]);
					}
				}
			}
		};

		search(obj);
		return [...new Set(result)].sort((a, b) => a - b);
	};

	deepFind(obj: Record<string, any> | false, keys: string[]): any | false {
		// If there are no keys to search or the object is empty, return false
		if (!obj) obj = cutting_settings_schema;
		if (!keys.length || !obj) return false


		// Taking the first key from the array
		const [currentKey, ...remainingKeys] = keys;

		// Recursive function to search for the key in the object at any depth
		const findKey = (currentObj: Record<string, any> | null): any | false => {
			if (currentObj && typeof currentObj === 'object') {
				// If the current object contains the desired key
				if (currentKey in currentObj) {
					// If this is the last key in the chain, return its value
					if (remainingKeys.length === 0) {
						return currentObj[currentKey];
					}
					// Otherwise, continue searching with the remaining keys in the value of the found key
					return utils.deepFind(currentObj[currentKey], remainingKeys);
				}

				// Searching for the key in all values of the object (recursively)
				for (const key of Object.keys(currentObj)) {
					const result = findKey(currentObj[key]);
					if (result !== false) return result;
				}
			}

			return false;
		};

		return findKey(obj);
	}

	getPercentage(current: number, min: number, max: number): number {
		if (max === min) return 0; // защита от деления на 0
		return ((current - min) / (max - min)) * 100;
	}


	getChartData(keyInd: number ): ResultItem[] {
		const result: ResultItem[] = [];
		const data = macrosStore.technology.piercingMacros[keyInd]
		const chartKeys: string[] = ['focus','initial_focus','height','initial_height','pressure', 'initial_pressure','power','initial_power'];
		const minmax: MinMax = {};

		chartKeys.forEach(i => {
			const minValue = utils.deepFind(false, ['piercingMacros', i, 'minimum']) ?? 0;
			const maxValue = utils.deepFind(false, ['piercingMacros', i, 'maximum']) ?? 0;
			const key:string = String(i)		  
			minmax[key]= {min: minValue,max: maxValue}
  		});	

		//console.log ( minmax )

		result.push({
			name: '0',
			'focus, mm': this.getPercentage( data.initial_focus,minmax.initial_focus.min, minmax.initial_focus.max),
			'height, mm': this.getPercentage( data.initial_height,minmax.initial_height.min, minmax.initial_height.max),
			'pressure, bar': this.getPercentage( data.initial_pressure,minmax.initial_pressure.min, minmax.initial_pressure.max),
			'power, kWt': this.getPercentage( data.initial_power,minmax.initial_power.min, minmax.initial_power.max),
			'enabled': true,
			'power': 0,
			'power_W_s': 0,
			'delay_s': 0 
		});

		// Остальные из stages
		data.stages.forEach((stage: Stage, index: number) => {
			  result.push({
				name: String(index + 1), // +1 потому что initial уже под "0"
				'focus, mm': this.getPercentage( stage.focus, minmax.focus.min, minmax.focus.max),
				'height, mm': this.getPercentage( stage.height, minmax.height.min, minmax.height.max),
				'pressure, bar': this.getPercentage( stage.pressure, minmax.pressure.min, minmax.pressure.max),
				'power, kWt': this.getPercentage( stage.power, minmax.power.min, minmax.power.max),
				'enabled': stage.enabled,
				'power': stage.power,
				'power_W_s': stage.power_W_s,
				'delay_s': stage.delay_s
			  });
		  });	  
		return result;
	}

	round(i:number, pow:number = 6, format:boolean = false) {
		if (!format) {
			return (Math.round(Number(i) * 10 ** pow)) / 10 ** pow
		} else {
			let d = String((Math.round(Number(i) * 10 ** pow)) / 10 ** pow)
			if (d.match(/\./)) {
				let afderDot =  d.split('.').reverse()[0].length
				return d +( afderDot < pow ? '0'.repeat(pow-afderDot) : '')
			} else {
				return (d + '.'+'0'.repeat(pow))
			}
		}
	}

	getLargeArcFlag(currentX:number, currentY:number, x:number, y:number, i:number, j:number, is_ccw:number) {
		const cp = {
			x: currentX + i,
			y: currentY + j
		};
		const sp = {
			x: currentX,
			y: currentY
		};
		const ep = { x, y };

		let sang = Math.atan2(sp.y - cp.y, sp.x - cp.x);
		let eang = Math.atan2(ep.y - cp.y, ep.x - cp.x);

		if (!is_ccw) {
			while (sang < eang) {
				sang += 2 * Math.PI;
			}

			if (sp.x === ep.x && sp.y === ep.y) {
				eang += 2 * Math.PI;
			}
		} else {
			while (sang > eang) {
				eang += 2 * Math.PI;
			}

			if (sp.x === ep.x && sp.y === ep.y) {
				sang += 2 * Math.PI;
			}
		}
		return (eang * 180) / Math.PI - (sang * 180) / Math.PI <= 180 ? 0 : 1;
	}

/* 	multiplyMatrices = (m1, m2) => {
        return {
            a: m1.a * m2.a + m1.c * m2.b,
            b: m1.b * m2.a + m1.d * m2.b,
            c: m1.a * m2.c + m1.c * m2.d,
            d: m1.b * m2.c + m1.d * m2.d,
            e: m1.a * m2.e + m1.c * m2.f + m1.e,
            f: m1.b * m2.e + m1.d * m2.f + m1.f,
        };
    }; */

/* 	convertScreenCoordsToSvgCoords(x:number, y:number) {
		var svg = document.getElementById("svg")
		var group = document.getElementById("group");
		var pt = svg.createSVGPoint();  // An SVGPoint SVG DOM object
		pt.x = x;
		pt.y = y;

		try {
			pt = pt.matrixTransform(group.getScreenCTM().inverse());
			return { 'x': pt.x, 'y': pt.y };
		} catch (e) {
			return { 'x':0,'y': 0 }
		}
	} */

/* 	getMousePosition = (evt) => {
		var svg = document.getElementById("svg")
    	let CTM = svg.getScreenCTM();
        
        return   {
            x: (evt.clientX + CTM.f)/ CTM.a,
            y: (evt.clientY + CTM.e)/ CTM.d
        }; 
    } */

	getLastTwoNumbers(str: string): number[] {
		// Находим все числа с точкой или без
		const numbers = str.match(/-?\d+(\.\d+)?/g);
		if (!numbers) return [];
	
		// Берём последние два
		const lastTwo = numbers.slice(-2).map(Number);
		return lastTwo;
	}
	
	makeGcodeParser() {
		console.log("makeGcodeParser");

		let last: GCodeLine = { g: undefined, m: undefined, params: {} };
		let base: GCodeBase = { X: 0, Y: 0, C: 0 }; // базовые значения из строки перед Part code

		return function parseGcodeLine(raw: string): GCodeLine {
			let s = String(raw).trim();
			s = s.replace(/^\d+\s*/, "");

			const out: GCodeLine = { n: undefined, g: undefined, m: undefined, params: {} };

			// Комментарий
			const commentMatch = s.match(/\(([^)]*)\)/);
			if (commentMatch) {
				out.comment = commentMatch[1];
				s = s.replace(/\([^)]*\)/g, " ");
			}

			// N-номер
			const nMatch = raw.match(/(\d+)N/i);
			if (nMatch) {
				out.n = parseInt(nMatch[1], 10); // используем первую группу
			}

			// G/M команды
			const gMatch = s.match(/G(-?\d+(?:\.\d+)?)/i);
			out.g = gMatch ? Number(gMatch[1]) : last.g;

			const mMatch = s.match(/M(-?\d+(?:\.\d+)?)/i);
			out.m = mMatch ? Number(mMatch[1]) : false;

			// Параметры
			const keys = ["X", "Y", "I", "J", "S", "P", "H", "A", "L", "C"];
			for (const k of keys) {
				const r = new RegExp(`${k}(-?\\d+(?:\\.\\d+)?)`, "i");
				const m = s.match(r);
				if (m) {
					out.params[k] = Number(m[1]);
				} else if (last.params[k] !== undefined) {
					out.params[k] = last.params[k];
				}
			}

			// Обработка "Part End"
			if (/(Part End)/i.test(s)) {
				out.base = { X: 0, Y: 0, C: 0 };
			}

			// Если это строка с G52 — сохраняем как базовую
			if (/G52/i.test(s)) {
				base = {
					X: out.params.X ?? 0,
					Y: out.params.Y ?? 0,
					C: out.params.C ?? 0,
				};
				out.base = { ...base };
			} else {
				out.base = { ...base };
			}

			// Обновляем last
			last.g = out.g;
			last.m = out.m;
			last.params = { ...last.params, ...out.params };

			return out;
		};
	}

	extractGcodeLines = (serverData: string): string => {
		// Регулярка достаёт номер и содержимое
		const regex = /<em>(\d+)<\/em>\s*<span>(.*?)<\/span>/g;
		let result = "";
		let match;

		while ((match = regex.exec(serverData)) !== null) {
			const lineNum = match[1];       // номер строки
			const content = match[2].trim();// содержимое
			result += `${lineNum}${content}\n`; // собираем строку с \n
		}
		return result;
	}

	normalizeAngle = (a: number) => {
		while (a > Math.PI) a -= 2 * Math.PI;
		while (a < -Math.PI) a += 2 * Math.PI;
		return a;
	}

	validateCuttingSettings( technology:Properties ) {
		const { schema } = macrosStore
		const result = validator.validateFormData(technology, schema);
		//console.log(result)

		if ( result?.errors.length === 0) {
			showToast({
				type: 'success',
				message: 'Cut settings is Valid!!',
				position: 'bottom-right',
				autoClose: 2500
			});

		} else {
			showToast({
				type: 'error',
				message: 'Cut settings invalid!!',
				position: 'bottom-right',				
			});
			console.error ( "ERROR in VALIDATION"+JSON.stringify (result) )
		}		 
		return result;
	}

	ensureMinItems(schema: any): any {
		if (!schema || typeof schema !== "object") return schema;

		const copy = Array.isArray(schema) ? [...schema] : { ...schema };

		// Если это объект-массив и есть maxItems — добавляем minItems: 1, если нет
		if (copy.type === "array" && copy.maxItems !== undefined && copy.minItems === undefined) {
			copy.minItems = copy.maxItems;
		}

		// Рекурсивно обходим вложенные свойства
		for (const key of Object.keys(copy)) {
			if (typeof copy[key] === "object") {
				copy[key] = this.ensureMinItems(copy[key]);
			}
		}
		return copy;
	}

	getDefaultsFromSchema() {
		const { schema } = macrosStore;
		if (!schema) return {};
		const safeSchema = this.ensureMinItems(schema);
		const defaults = getDefaultFormState(validator, safeSchema, undefined);
		return defaults
	}

}

const utils = new Utils();
export default utils;