import cutting_settings_schema from '../store/cut_settings_schema';
import viewStore from '../store/viewStore';

interface NestedObject {
	[key: string]: any;
}

type Stage = {
	pressure: number;
	power: number;
	focus: number;
	height: number;
	enabled: boolean;
};

type ResultItem = {
	name: string;
	'focus, mm'?: number,
	'height, mm'?: number,
	'pressure, bar'?: number,
	'power, kWt'?: number,
	'enabled': boolean;
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
			x4: isVertical ? 5 : -30,
			y1: isVertical ? 105 : 80,
			y2: 80,
			y3: isVertical ? -15 : 10,
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
		const data = viewStore.technology.piercingMacros[keyInd]
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
		});

		// Остальные из stages
		data.stages.forEach((stage: Stage, index: number) => {
			  result.push({
				name: String(index + 1), // +1 потому что initial уже под "0"
				'focus, mm': this.getPercentage( stage.focus, minmax.focus.min, minmax.focus.max),
				'height, mm': this.getPercentage( stage.height, minmax.height.min, minmax.height.max),
				'pressure, bar': this.getPercentage( stage.pressure, minmax.pressure.min, minmax.pressure.max),
				'power, kWt': this.getPercentage( stage.power, minmax.power.min, minmax.power.max),
				'enabled': stage.enabled
			  });
		  });	  
		return result;
	}

}

const utils = new Utils();
export default utils;