import { showToast } from '../components/toast';
import cutting_settings_schema from '../store/cut_settings_schema';
import macrosStore from '../store/macrosStore';
import validator from "@rjsf/validator-ajv8";
import { getDefaultFormState } from "@rjsf/utils";
import svgPath from 'svgpath';


class Utils {
	// Метод для преобразования полярных координат в декартовы
	polarToCartesian(radius, angle, center = { x: 50, y: 50 }) {
		const rad = (angle - 90) * (Math.PI / 180); // SVG 0° вверх
		return {
			x: center.x + radius * Math.cos(rad),
			y: center.y + radius * Math.sin(rad),
		};
	}

	// Метод для получения пути
	getPath(
		selectedMacros,
		minimum,
		maximum,
		sweepAngle,
		r1,
		r2,
		startAngle
	) {
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
		minimum,
		maximum,
		stepBig,
		r1,
		r2,
		r3,
		sAngle,
		aPerStep,
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
		minimum,
		maximum,
		val,         // Текущее значение
		stepBig,
		r1,
		r2,
 		sAngle,
		aPerStep
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
		steps,
		radius,
		tickLength
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
	

	calculateFontSize(minimum, maximum, step) {
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

	getKnobLayout(isVertical) {
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

	findByKey(obj, keyToFind) {

		const results = [];
		function recursiveSearch(obj) {
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

	extractValuesByKey(obj, key) {
		let result = [];

		const search = (currentObj) => {
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

	deepFind(obj, keys) {
		// If there are no keys to search or the object is empty, return false
		if (!obj) obj = cutting_settings_schema;
		if (!keys.length || !obj) return false


		// Taking the first key from the array
		const [currentKey, ...remainingKeys] = keys;

		// Recursive function to search for the key in the object at any depth
		const findKey = (currentObj)  => {
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

	getPercentage(current, min, max) {
		if (max === min) return 0; // защита от деления на 0
		return ((current - min) / (max - min)) * 100;
	}


	getChartData(keyInd ) {
		const result = [];
		const data = macrosStore.technology.piercingMacros[keyInd]
		const chartKeys = ['focus','initial_focus','height','initial_height','pressure', 'initial_pressure','power','initial_power'];
		const minmax = {};

		chartKeys.forEach(i => {
			const minValue = utils.deepFind(false, ['piercingMacros', i, 'minimum']) ?? 0;
			const maxValue = utils.deepFind(false, ['piercingMacros', i, 'maximum']) ?? 0;
			const key = String(i)		  
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
		data.stages.forEach((stage, index) => {
			  result.push({
				name: String(index + 1),
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

	round(i, pow = 6, format = false) {
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

	getLargeArcFlag(currentX, currentY, x, y, i, j, is_ccw) {
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

 	convertScreenCoordsToSvgCoords(x, y) {
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
	} 

 	getLastTwoNumbers(str) {
		// Находим все числа с точкой или без
		const numbers = str.match(/-?\d+(\.\d+)?/g);
		if (!numbers) return [];
	
		// Берём последние два
		const lastTwo = numbers.slice(-2).map(Number);
		return lastTwo;
	}
	
	makeGcodeParser() {
		console.log("makeGcodeParser");

		let last = { g: undefined, m: undefined, params: {} };
		let base = { X: 0, Y: 0, C: 0 }; // базовые значения из строки перед Part code

		return function parseGcodeLine(raw) {
			let s = String(raw).trim();
			s = s.replace(/^\d+\s*/, "");

			const out = { n: undefined, g: undefined, m: undefined, params: {} };

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

	extractGcodeLines = (serverData) => {
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

	normalizeAngle = (a) => {
		while (a > Math.PI) a -= 2 * Math.PI;
		while (a < -Math.PI) a += 2 * Math.PI;
		return a;
	}

	validateCuttingSettings( technology ) {
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

	ensureMinItems(schema) {
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

	multiplyMatrices = (m1, m2) => {
        return {
            a: m1.a * m2.a + m1.c * m2.b,
            b: m1.b * m2.a + m1.d * m2.b,
            c: m1.a * m2.c + m1.c * m2.d,
            d: m1.b * m2.c + m1.d * m2.d,
            e: m1.a * m2.e + m1.c * m2.f + m1.e,
            f: m1.b * m2.e + m1.d * m2.f + m1.f,
        };
    };


	normPath (path) {
		return SVGPathCommander.normalizePath(path)
	}

	radian(ux, uy, vx, vy) {
		var dot = ux * vx + uy * vy;
		var mod = Math.sqrt((ux * ux + uy * uy) * (vx * vx + vy * vy));
		var rad = Math.acos(dot / mod);
		if (ux * vy - uy * vx < 0.0) {
			rad = -rad;
		}
		return rad;
	}

	degreeToRadian(deg) {
		return deg * (Math.PI / 180);
	}

		getBisectorPoint(x, y, x1, y1, x2, y2, l) {
		// вычисляем точку на биисектрисе для поиска координать скругдления
		// Вычисляем векторы A и B
		let vectorA = { x: x1 - x, y: y1 - y };
		let vectorB = { x: x2 - x, y: y2 - y };
		
		// Находим длины векторов
		let lengthA = Math.sqrt(vectorA.x ** 2 + vectorA.y ** 2);
		let lengthB = Math.sqrt(vectorB.x ** 2 + vectorB.y ** 2);
		
		// Нормализуем векторы (делаем их единичной длины)
		let normA = { x: vectorA.x / lengthA, y: vectorA.y / lengthA };
		let normB = { x: vectorB.x / lengthB, y: vectorB.y / lengthB };
		
		// Суммируем нормализованные векторы для получения направления биссектрисы
		let bisector = { x: normA.x + normB.x, y: normA.y + normB.y };
		
		// Находим длину вектора биссектрисы
		let bisectorLength = Math.sqrt(bisector.x ** 2 + bisector.y ** 2);
		
		// Нормализуем вектор биссектрисы
		let normBisector = { x: bisector.x / bisectorLength, y: bisector.y / bisectorLength };
		
		// Возвращаем точку на биссектрисе длиной l
		return {
			x: x + normBisector.x * l,
			y: y + normBisector.y * l
		};
	}

/* 	isPathClosed(normalizedPath) {
		normalizedPath = SVGPathCommander.normalizePath(normalizedPath); 
		if (!normalizedPath || normalizedPath.length < 2) return false;
		const first = normalizedPath[0]; 
		const last = normalizedPath[normalizedPath.length - 1]; 
		if (first[0] !== "M") return false;
		return first[1] === last[last.length - 2] && first[2] === last[last.length - 1];
	} */
	
	radianToDegree(rad) {
		return rad * (180 / Math.PI);
	}

	distance(arg1, arg2, arg3 = null, arg4 = null) {
        let x1, y1, x2, y2;

        if (arg2 !== null && arg3 === null && arg4 === null) {
            // Если переданы два объекта с координатами
            x1 = arg1.x;
            y1 = arg1.y;
            x2 = arg2.x;
            y2 = arg2.y;
        } else if (arg2 !== null && arg3 !== null && arg4 !== null) {
            // Если переданы четыре отдельных числа
            x1 = arg1;
            y1 = arg2;
            x2 = arg3;
            y2 = arg4;
        } else {
            throw new Error("Invalid arguments. Use either two points as objects or four numbers.");
        }

        const dx = x1 - x2;
        const dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

	convertScreenCoordsToSvgCoords(x, y) {
		var svg = document.getElementById("svg")
		var group = document.getElementById("group");
		var pt = svg.createSVGPoint();  // An SVGPoint SVG DOM object
		pt.x = x;
		pt.y = y;

		try {
			pt = pt.matrixTransform(group.getScreenCTM().inverse());
			return { 'x': pt.x, 'y': pt.y };
		} catch (e) {
			return false
		}
	}
	 
	getMousePosition = (evt) => {
		var svg = document.getElementById("svg")
    	let CTM = svg.getScreenCTM();
        
        return   {
            x: (evt.clientX + CTM.f)/ CTM.a,
            y: (evt.clientY + CTM.e)/ CTM.d
        }; 
    }

	 
 
	getValueFromString(str, targetChar, num = true) {
		// Create a regular expression pattern to match the target character and its value
		const pattern = new RegExp(targetChar + '(\\S+)');

		// Use the regular expression to find a match in the input string
		const match = str.match(pattern);

		// If a match is found, return the matched value; otherwise, return null
		if (match && match[1]) {
			if (num) {
				return +match[1];
			} else {
				return match[1];
			}
		} else {
			return null;
		}
	}

	getAttributeValue(inputString, attributeName) {
		const pattern = new RegExp(`${attributeName}="([^"]+)"`, 'i');
		const match = inputString.match(pattern);

		if (match && match[1]) {
			return match[1];
		} else {
			return null;
		}
	}

	round(i, pow = 6, format = false) {
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

	getJoint (x,y) {
		return `M${x} ${y} l2 2 -4 -4 2 2 2 -2 -4 4`
	}

	uuid() {
		let d = new Date().getTime();
		if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
			d += performance.now(); // Add high-precision timestamp if available
		}

		// Use a version-4 UUID, which has 122 bits of randomness
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
			const r = (d + Math.random() * 16) % 16 | 0;
			d = Math.floor(d / 16);
			return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
		});
	}

	getLargeArcFlag(currentX, currentY, x, y, i, j, is_ccw) {
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

	transformContour (path, id, val, params, t=false) {
        let {x, y, width, height, angle, proportion} = params
		if (!t) {
            t = {
                scaleX: 1,
                scaleY: 1,
                translateX: 0,
                translateY: 0,
                rotate:{angle:0, x:0, y:0},
                update: false,
                element:false
            }      
            
            //const isProportionChecked = document.getElementById('proportion').checked;
            //const proportionX = +document.getElementById('proportionX').value / 100
            //const proportionY = +document.getElementById('proportionY').value / 100
            if (id === "contourPointXvalue") {
                t.translateX = val - x;
            } else if (id === "contourPointYvalue") {
                t.translateY = val - y;
            } else if (id === "contourWidthValue") {
                t.scaleX = val / width
                t.translateX = x - x * t.scaleX
                if (proportion) {
                    t.scaleY = t.scaleX * 1//(proportionY / proportionX)
                    t.translateY = y - y * t.scaleY
                }
            } else if (id === "contourHeightValue") {
                t.scaleY = val / height
                t.translateY = y - y * t.scaleY;
                if (proportion) {
                    t.scaleX = t.scaleY * 1//(proportionX / proportionY)
                    t.translateX = x - x * t.scaleX
                }
            } else if (id === "contourRotateValue") {
                if (angle) t.rotate={angle: angle, x:x, y:y}     
            }
        }
      
		let newPath = this.applyTransform(path,t.scaleX, t.scaleY, t.translateX, t.translateY, t.rotate, t.update, t.element)
		let resp ={
			newPath: newPath,
			scaleX:t.scaleX,
			scaleY:t.scaleY,
			translateX:t.translateX,
			translateY:t.translateY,
			rotate: t.rotate
		}
		return resp;
        
    }

    applyTransform(path, scaleX, scaleY, translateX, translateY, rotate={angle: 0, x:0, y:0}, update = true, element =false, updatePanels=true) {
        var transformed = svgPath(path)
            .scale(scaleX, scaleY)
            .translate(translateX, translateY)
            .rotate( rotate.angle, rotate.x, rotate.y )
            .toString();
        
		return transformed
    }

		pathToPolyline(path, segments = 1) {
/* 		let points = [] 
		let contourPath = SVGPathCommander.normalizePath(path);
		let PX, PY, SX, SY;

		contourPath.forEach((seg, i)=>{
			if (seg.includes('M')) {
				SX=seg[1]
				SY=seg[2]
				PX=seg[1]
				PY=seg[2]
			} else if ( seg.includes('L')) {
				PX=seg[1]
				PY=seg[2]    
			} else if (seg.includes('A')) {

		
				let cc = arc.svgArcToCenterParam( PX, PY,seg[1], seg[2], seg[3], seg[4], seg[5], seg[6], seg[7])
				let startAngle = cc.startAngle
				let endAngle = cc.endAngle
				let radiusX = seg[1]
				let radiusY = seg[2]
				let clockwise =  cc.clockwise
				let rotationAngle = seg[3]
				let centerX = cc.cx 
				let centerY = cc.cy
				let step = 0.1

				startAngle = ((startAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
				endAngle = ((endAngle % (2 * Math.PI)) + (2 * Math.PI)) % (2 * Math.PI);
	
				if (clockwise && startAngle > endAngle) {
					endAngle += 2 * Math.PI;
				} else if (!clockwise && startAngle < endAngle) {
					startAngle += 2 * Math.PI;
				}
	
				const phi = rotationAngle * Math.PI / 180;
				const sinPhi = Math.sin(phi);
				const cosPhi = Math.cos(phi);
				const totalSteps = Math.ceil(Math.abs(endAngle - startAngle) / step);

				// Итерация по точкам дуги
				for (let i = 0; i < totalSteps; i++) {
					const isLast = i === totalSteps; // Проверяем последний шаг
					const angle = isLast ? endAngle : clockwise 
						? startAngle + i * step 
						: startAngle - i * step;
				
					// Координаты без учёта поворота
					const localX = radiusX * Math.cos(angle);
					const localY = radiusY * Math.sin(angle);
				
					// Поворот вокруг центра
					const x = centerX + localX * cosPhi - localY * sinPhi;
					const y = centerY + localX * sinPhi + localY * cosPhi;				
					points.push(`${x},${y}`);
				}
			
				PX=seg[6]
				PY=seg[7]  

			}  else if (seg.includes('z') || seg.includes('Z')) {
				PX=SX
				PY=SY   				
			} 
			points.push(`${PX},${PY}`);

		})
		//console.log ('Points:    '+ points)
 		return points.join(";"); */
	}

	intersects(edge1, edge, asSegment=true) {
		const a = edge1[0];
		const b = edge1[1];
		const e = edge[0];
		const f = edge[1]
		const a1 = (b.y - a.y);
		const a2 = (f.y - e.y);
		const b1 = (a.x - b.x);
		const b2 = (e.x - f.x);
		const denom = ((a1 * b2) - (a2 * b1));	   
		if (denom === 0) {
			return null;
		}
		const c1 = ((b.x * a.y) - (a.x * b.y));
		const c2 = ((f.x * e.y) - (e.x * f.y));
		
		let point={}
		point.x = ((b1 * c2) - (b2 * c1)) / denom;
		point.y = ((a2 * c1) - (a1 * c2)) / denom;

		if (asSegment) {
			const uc = ((f.y - e.y) * (b.x - a.x) - (f.x - e.x) * (b.y - a.y));
			const ua = (((f.x - e.x) * (a.y - e.y)) - (f.y - e.y) * (a.x - e.x)) / uc;
			const ub = (((b.x - a.x) * (a.y - e.y)) - ((b.y - a.y) * (a.x - e.x))) / uc;

			if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
				return point;
			} else {
				return null;
			}
		}	
		return point;
	}

	getPerpendicularCoordinates(arcParams, length) {
		const { clockwise, cx, cy, deltaAngle, endAngle, phi, rx, ry, startAngle } = arcParams;
	
		// Calculate coordinates of the point on the ellipse at startAngle
		const x0 = cx + rx * Math.cos(startAngle) * Math.cos(phi) - ry * Math.sin(startAngle) * Math.sin(phi);
		const y0 = cy + rx * Math.cos(startAngle) * Math.sin(phi) + ry * Math.sin(startAngle) * Math.cos(phi);
	
		// Calculate derivatives at startAngle
		const xPrime = -rx * Math.sin(startAngle) * Math.cos(phi) - ry * Math.cos(startAngle) * Math.sin(phi);
		const yPrime = -rx * Math.sin(startAngle) * Math.sin(phi) + ry * Math.cos(startAngle) * Math.cos(phi);
	
		// Slope of the tangent
		const m = yPrime / xPrime;
	
		// Slope of the perpendicular
		const mPerp = -1 / m;
	
		// Calculate coordinates of the end points of the perpendicular line
		const dx = length / Math.sqrt(1 + mPerp * mPerp);
		const dy = mPerp * dx;
	
		const x1 = x0 + dx;
		const y1 = y0 + dy;
		const x2 = x0 - dx;
		const y2 = y0 - dy;

		//this.showPoint( { x: x1, y: y1 },{ x: x2, y: y2 })

		return {
			point1: { x: x1, y: y1 },
			point2: { x: x2, y: y2 }
		};
	}

	getPerpendicularCoordinatesToPoint (arcParams, point, length) {
		const { cx, cy, rx, ry, phi } = arcParams;
		const { x, y } = point; // Точка на дуге
	
		// 1. Приводим точку (x, y) в локальную систему координат эллипса
		const cosPhi = Math.cos(phi);
		const sinPhi = Math.sin(phi);
	
		const localX = (x - cx) * cosPhi + (y - cy) * sinPhi;
		const localY = (y - cy) * cosPhi - (x - cx) * sinPhi;
	
		// 2. Вычисляем угол θ этой точки относительно центра эллипса
		const theta = Math.atan2(localY / ry, localX / rx);
	
		// 3. Касательный вектор (производная по θ)
		const dx_tangent = -rx * Math.sin(theta) * cosPhi - ry * Math.cos(theta) * sinPhi;
		const dy_tangent = -rx * Math.sin(theta) * sinPhi + ry * Math.cos(theta) * cosPhi;
	
		// 4. Нормальный вектор (перпендикуляр к касательной)
		const length_tangent = Math.sqrt(dx_tangent * dx_tangent + dy_tangent * dy_tangent);
		const dx_normal = dy_tangent / length_tangent;
		const dy_normal = -dx_tangent / length_tangent;
	
		// 5. Две точки на перпендикуляре
		const x1 = x + length * dx_normal;
		const y1 = y + length * dy_normal;
		const x2 = x - length * dx_normal;
		const y2 = y - length * dy_normal;
	
		return {
			point1: { x: x1, y: y1 },
			point2: { x: x2, y: y2 }
		};
	}
	
	arraysAreEqual(arr1, arr2) {
		if (arr1.length !== arr2.length) {
		   return false;
	   }
		for (let i = 0; i < arr1.length; i++) {
		   if (arr1[i] !== arr2[i]) {
			   return false;
		   }
	   }
		return true;
   }

	svgArcToCenterParam(x1, y1, rx, ry, degree, fA, fS, x2, y2, centers=false) {
		var cx, cy, startAngle, deltaAngle, endAngle, outputObj;
		var PIx2 = Math.PI * 2.0;
		var phi = degree * Math.PI / 180;

		if (rx < 0) {
			rx = -rx;
		}
		if (ry < 0) {
			ry = -ry;
		}
		if (rx == 0.0 || ry == 0.0) { // invalid arguments
			return false
			throw Error('rx and ry can not be 0');
		}

		// SVG use degrees, if your input is degree from svg,
		// you should convert degree to radian as following line.
		// phi = phi * Math.PI / 180;
		var s_phi = Math.sin(phi);
		var c_phi = Math.cos(phi);
		var hd_x = (x1 - x2) / 2.0; // half diff of x
		var hd_y = (y1 - y2) / 2.0; // half diff of y
		var hs_x = (x1 + x2) / 2.0; // half sum of x
		var hs_y = (y1 + y2) / 2.0; // half sum of y

		// F6.5.1
		var x1_ = c_phi * hd_x + s_phi * hd_y;
		var y1_ = c_phi * hd_y - s_phi * hd_x;

		// F.6.6 Correction of out-of-range radii
		//   Step 3: Ensure radii are large enough
		var lambda = (x1_ * x1_) / (rx * rx) + (y1_ * y1_) / (ry * ry);
		if (lambda > 1) {
			rx = rx * Math.sqrt(lambda);
			ry = ry * Math.sqrt(lambda);
		}

		var rxry = rx * ry;
		var rxy1_ = rx * y1_;
		var ryx1_ = ry * x1_;
		var sum_of_sq = rxy1_ * rxy1_ + ryx1_ * ryx1_; // sum of square
		if (!sum_of_sq) {
			return false
			throw Error('start point can not be same as end point');
		}
		var coe = Math.sqrt(Math.abs((rxry * rxry - sum_of_sq) / sum_of_sq));
		if (fA == fS) { coe = -coe; }

		// F6.5.2
		var cx_ = coe * rxy1_ / ry;
		var cy_ = -coe * ryx1_ / rx;

		// F6.5.3
		cx = c_phi * cx_ - s_phi * cy_ + hs_x;
		cy = s_phi * cx_ + c_phi * cy_ + hs_y;

		if (!centers) {

			var xcr1 = (x1_ - cx_) / rx;
			var xcr2 = (x1_ + cx_) / rx;
			var ycr1 = (y1_ - cy_) / ry;
			var ycr2 = (y1_ + cy_) / ry;

			// F6.5.5
			startAngle = this.radian(1.0, 0.0, xcr1, ycr1);

			// F6.5.6
			deltaAngle = this.radian(xcr1, ycr1, -xcr2, -ycr2);
			while (deltaAngle > PIx2) { deltaAngle -= PIx2; }
			while (deltaAngle < 0.0) { deltaAngle += PIx2; }
			if (fS == false || fS == 0) { deltaAngle -= PIx2; }
			endAngle = startAngle + deltaAngle;
			while (endAngle > PIx2) { endAngle -= PIx2; }
			while (endAngle < 0.0) { endAngle += PIx2; }

			outputObj = {   
				cx: cx,
				cy: cy,
				rx: rx,
				ry: ry,
				phi: phi,
				startAngle: startAngle,
				deltaAngle: deltaAngle,
				endAngle: endAngle,
				clockwise: (fS == true || fS == 1),
				i:cx - x1,
				j:y1 - cy,
			}
		}

		if (centers) {
			outputObj= { x: cx, y: cy }
		}
		return outputObj;
	}

	calculateAngleVector(x, y, x1, y1, x2, y2) {
		// Calculate vectors
		const vector1 = { x: x1 - x, y: y1 - y };
		const vector2 = { x: x2 - x, y: y2 - y };
	
		// Calculate dot product
		const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y;
	
		// Calculate magnitudes
		const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y);
		const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y);
	
		// Check if magnitudes are non-zero to avoid division by zero
		if (magnitude1 === 0 || magnitude2 === 0) {
			return NaN; // Angle is undefined if either vector has zero length
		}
	
		// Calculate cosine of the angle
		const cosTheta = dotProduct / (magnitude1 * magnitude2);
	
		// Clamp the value of cosTheta to the range [-1, 1] to avoid NaN from Math.acos
		const clampedCosTheta = Math.max(-1, Math.min(1, cosTheta));
	
		// Calculate angle in radians
		let angleRad = Math.acos(clampedCosTheta);
	
		// Convert angle from radians to degrees
		let angleDeg = angleRad * (180 / Math.PI);
	
		return angleDeg;
	}

	findPointWithSameDirection(x, y, x1, y1, L) {
		// Вычисляем вектор направления отрезка
		let directionVector = { x: x1 - x, y: y1 - y };
	
		// Находим длину вектора направления
		let length = Math.sqrt(directionVector.x * directionVector.x + directionVector.y * directionVector.y);
	
		// Нормализуем вектор направления
		let normalizedDirection = { x: directionVector.x / length, y: directionVector.y / length };
	
		// Вычисляем координаты точки на расстоянии L в направлении вектора
		let pointX = x + normalizedDirection.x * L;
		let pointY = y + normalizedDirection.y * L;
	
		return { x: pointX, y: pointY };
	}

	angleBetweenPoints (x1, y1, x2, y2) {
		const delta_x = x2 - x1;
		const delta_y = y2 - y1;
		const angle_AB = Math.atan2(delta_y, delta_x);
		let angle_degrees_AB = angle_AB * 180 / Math.PI;
		angle_degrees_AB = (angle_degrees_AB + 360) % 360
		return angle_degrees_AB
	}

	findTangentPoints(circleCenterX, circleCenterY, radius, pointX, pointY) {
		// Расчет расстояния между центром окружности и точкой
		var distance = Math.sqrt(Math.pow(pointX - circleCenterX, 2) + Math.pow(pointY - circleCenterY, 2));
		
		// Если расстояние больше радиуса, то точка находится вне окружности и касательных не существует
		if (distance < radius) {
			return null;
		}
		
		// Находим угол между центром окружности и точкой
		var angle = Math.atan2(pointY - circleCenterY, pointX - circleCenterX);
		
		// Находим углы касательных линий с учетом радиуса окружности и расстояния до точки
		var tangentAngle = Math.acos(radius / distance);
		
		// Координаты точек касания касательных линий
		var tangentPoint1X = circleCenterX + radius * Math.cos(angle + tangentAngle);
		var tangentPoint1Y = circleCenterY + radius * Math.sin(angle + tangentAngle);
		var tangentPoint2X = circleCenterX + radius * Math.cos(angle - tangentAngle);
		var tangentPoint2Y = circleCenterY + radius * Math.sin(angle - tangentAngle);
		
		// Возвращаем координаты точек касания
		return [{x: tangentPoint1X, y: tangentPoint1Y}, {x: tangentPoint2X, y: tangentPoint2Y}];
	}

	arcLength (svgArc) {

		let radius, x1, y1, x2, y2, flag1, flag2, flag3;
		let pathArc  = SVGPathCommander.normalizePath (svgArc)
		if (pathArc.length) {
			pathArc.forEach( seg=>{
				if ( seg.includes('A')) {
					radius=seg[1]
					x2=seg[6]
					y2=seg[7]
					flag1=seg[3]
                    flag2=seg[4]
                    flag3=seg[5]
				}
				if ( seg.includes('M')) {
					x1=seg[1]
					y1=seg[2]
				}

				if ( seg.includes('L')) {
					x1=seg[1]
					y1=seg[2]
				}
			}) 
		}
 	
	 	const chordLength = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
		const theta = 2 * Math.asin(Math.round( (chordLength / (2 * radius)) * 10**5) /10**5);
		inlet.theta = theta
		let arcLength = radius * theta;
		if (flag2 === 1 ) arcLength = 2*radius*Math.PI - arcLength
		return +arcLength;
	}

	rotatePoint(MX, MY, LX, LY, oldAxis, newAxis) {
		// Step 1: Find the difference between the new and old axes
		const angleDifference = newAxis - oldAxis;
	
		// Step 2: Convert the difference to radians
		const angleRadians = angleDifference * (Math.PI / 180);
	
		// Step 3: Find the coordinates of the vector from LX, LY to MX, MY
		const dx = MX - LX;
		const dy = MY - LY;
	
		// Step 4: Rotate the vector
		const newX = LX + dx * Math.cos(angleRadians) - dy * Math.sin(angleRadians);
		const newY = LY + dx * Math.sin(angleRadians) + dy * Math.cos(angleRadians);
	
		// Return the new coordinates of the point
		return { x:newX, y:newY };
	}

		getNewEndPoint(MX, MY, LX, LY, newLength) {
		// Step 1: Calculate the vector of the line segment
		const dx = LX - MX;
		const dy = LY - MY;
		const originalLength = Math.sqrt(dx ** 2 + dy ** 2);
	
		// Step 2: Normalize the direction of the original segment
  
		// Step 3: Scale the normalized direction by the new length
		const newEndPointX = LX - dx * newLength/originalLength;
		const newEndPointY = LY - dy * newLength/originalLength;
	
		// Step 4: Return the coordinates of the new end point
		return { x: newEndPointX, y: newEndPointY };
	}

		calculateEndPoint(centerX, centerY, radius, startX, startY, arcLength, flag3) {
		// Step 1: Calculate the initial angle of the arc
		let endX, endY;
		const startAngle = Math.atan2(startY - centerY, startX - centerX);
	
		// Step 2: Calculate the angular distance based on arc length and radius
		//const angularDistance = arcLength / radius;
		const angularDistance = arcLength / radius;
	
		if (flag3 === 0) {
			// Step 3: Calculate the angle of the end point
			const endAngle = startAngle + angularDistance;
		
			// Step 4: Calculate the coordinates of the end point
			endX = centerX + radius * Math.cos(endAngle);
			endY = centerY + radius * Math.sin(endAngle);
		} else {
			// Step 3: Calculate the angle of the end point (counter-clockwise)
			const endAngle = startAngle - angularDistance; // Subtract angular distance for counter-clockwise direction
			// Step 4: Calculate the coordinates of the end point
			endX = centerX + radius * Math.cos(endAngle);
			endY = centerY + radius * Math.sin(endAngle);
		}
		// Return the coordinates of the end point
		return { x: endX, y: endY };
	}	

	angleBetwenContourAndInlet ( path, contourPath, inlet=true) {
		let  A, MX, MY, LX, LY,  PX, PY;
		if(inlet){
			if (path.length) {
				path.forEach( seg=>{
					if ( seg.includes('M')) {
						MX=seg[1]
						MY=seg[2]
					}
					if ( seg.includes('L')) {
						LX=seg[1]
						LY=seg[2]    
					} else if (seg.includes('V')) {
						LY=seg[1]
						LX=MX 
					} else if (seg.includes('H')) {
						LY=MY
						LX=seg[1]
					}
				}) 
			}
		
			contourPath.forEach((seg, i, arr)=>{
				if (i < 2){
					if (seg.includes('M')) {
						PX=seg[1]
						PY=seg[2]
					} else if ( seg.includes('L')) {
						PX=seg[1]
						PY=seg[2]    
					} else if (seg.includes('V')) {
						PY=seg[1]//-1
					 } else if (seg.includes('H')) {
						PX=seg[1]//-1
					} else if (seg.includes('A')) {
						PX=seg[6]
						PY=seg[7]
					}
				}
			})
			
			A = this.calculateAngleVector ( LX, LY, MX, MY, PX, PY)
			return A
		} else {
			if(!path.hasOwnProperty('segments')){
				path =  SVGPathCommander.normalizePath(path)
			}
            if (path.length) {
                path.forEach((seg,i)=>{
                    if ( seg.includes('M')) {
                        MX=seg[1]
                        MY=seg[2]
                    }
                    if ( seg.includes('L')) {
                        LX=seg[1]
                        LY=seg[2]    
                    } else if (seg.includes('V')) {
                        LY=seg[1]
                        LX=MX 
                    } else if (seg.includes('H')) {
                        LY=MY
                        LX=seg[1]
                    }
                }) 
            }

			if(!contourPath.hasOwnProperty('segments')){
				contourPath =  SVGPathCommander.normalizePath(contourPath)
			}

            contourPath.forEach((seg, i)=>{
                if (i < contourPath.length-1){
                    if (seg.includes('M')) {
                        PX=seg[1]
                        PY=seg[2]
                    } else if ( seg.includes('L')) {
                        PX=seg[1]
                        PY=seg[2]    
                    } else if (seg.includes('V')) {
                        PY=seg[1]
                     } else if (seg.includes('H')) {
                        PX=seg[1]
                    } else if (seg.includes('A')) {
                        PX=seg[6]
                        PY=seg[7]
                    }
                }
            })
            A = this.calculateAngleVector ( MX, MY,  LX, LY, PX, PY)
			return A			
		}
	}

	findPerpendicularPoints(x, y, x1, y1, L) {
		//return [point1, point2];
		let dx = x1 - x
		let dy = y1 - y
		//Длина
		let len = Math.sqrt(dx * dx + dy * dy)
		//Нормализованный вектор (единичной длины)
		let udx = dx / len
		let udy = dy / len
		//Перпендикулярный единичный вектор
		let nx = - udy
		let ny = udx
		//Точки (C, D) на перпендикуляре на расстоянии R
		return [{ x: x + nx * L, y: y + ny * L }, { x: x - nx * L, y: y - ny * L }]
	}

	transformCoordinates(input) {
		const values = input.split(';')
		const transformed = [];
		for (let i = 0; i < values.length; i++) {
			let splitted= values[i].split(',').map(Number)
			transformed.push([splitted[0], splitted[1]]);
		}
		return [transformed];
	}

	pointInSvgPath(path, x, y) {
		//console.log(arguments)
		let polyline = this.pathToPolyline(path)
		let polygon = this.transformCoordinates(polyline)
		let pointIn = inside([x, y], polygon)
		return pointIn
	}

	findNearestPointOnSegment(x, y, x1, y1, x2, y2) {
		const dx = x2 - x1;
		const dy = y2 - y1;
		const dx1 = x - x1;
		const dy1 = y - y1;
	
		// Найдем длину отрезка
		const segmentLength = Math.sqrt(dx * dx + dy * dy);
	
		// Найдем проекцию точки на прямую, содержащую отрезок
		const dotProduct = (dx1 * dx + dy1 * dy) / segmentLength;
		
		let nearestX, nearestY;
	
		// Если проекция находится внутри отрезка
		if (dotProduct >= 0 && dotProduct <= segmentLength) {
			nearestX = x1 + dx * dotProduct / segmentLength;
			nearestY = y1 + dy * dotProduct / segmentLength;
		} else {
			// Если проекция находится за границами отрезка, ближайшей точкой будет один из концов отрезка
			if (dotProduct < 0) {
				nearestX = x1;
				nearestY = y1;
			} else {
				nearestX = x2;
				nearestY = y2;
			}
		}
	
		return { x: nearestX, y: nearestY };
	}

	findNearestPointOnEllipse(x, y, xc, yc, rx, ry, xAxisRotation) {
		// Вращение точки (x, y) в обратную сторону на xAxisRotation
		const radians = (Math.PI / 180) * xAxisRotation; // Угол вращения в радианах
		const cosAngle = Math.cos(radians);
		const sinAngle = Math.sin(radians);
	
		// Преобразование точки в системе координат эллипса с учетом вращения
		const dx = x - xc;
		const dy = y - yc;
		const rotatedX = cosAngle * dx + sinAngle * dy;
		const rotatedY = -sinAngle * dx + cosAngle * dy;
	
		// Нормализация координат как ранее
		const normalizedX = rotatedX / rx;
		const normalizedY = rotatedY / ry;
		const distance = Math.sqrt(normalizedX ** 2 + normalizedY ** 2);
	
		// Нахождение ближайшей точки в "круговой" системе координат
		const nearestX = normalizedX / distance; // Нормализация на окружности
		const nearestY = normalizedY / distance;
	
		// Масштабирование обратно с учетом радиусов эллипса
		const scaledX = nearestX * rx;
		const scaledY = nearestY * ry;
	
		// Возвращаем найденную точку в исходную систему координат (с учетом обратного вращения)
		const finalX = cosAngle * scaledX - sinAngle * scaledY + xc;
		const finalY = sinAngle * scaledX + cosAngle * scaledY + yc;
	
		return { x: finalX, y: finalY };
	}

	normalizedAngle (startAngle)	{
		return (startAngle < 0 ? startAngle + 2 * Math.PI : startAngle) % (2 * Math.PI);
    }

	findNearestPointOnPath(pathString, point) {
		const pathCommands = SVGPathCommander.normalizePath (pathString)
        let nearestPoint  = {}
		let nearestPointOnCommand ={}
		let minDistance = Infinity
		let tangentAngle
		let dist 
        let currentX = 0;
        let currentY = 0;
		let index =0
		         
        for (const command of pathCommands) {
            const commandType = command[0]
			
            switch (commandType) {
                case 'M':
                    currentX = parseFloat(command[1]);
                    currentY = parseFloat(command[2]);				
                    break;
                case 'L':
                    const x = parseFloat(command[1]);
                    const y = parseFloat(command[2]);   
					nearestPointOnCommand = this.findNearestPointOnSegment(point.x, point.y, x, y, currentX, currentY )
					dist = this.distance({x:point.x, y:point.y}, {x:nearestPointOnCommand.x, y:nearestPointOnCommand.y})
					if (dist < minDistance) {
						minDistance = dist
						nearestPoint = nearestPointOnCommand
 						tangentAngle = Math.atan2(nearestPoint.y-currentY, nearestPoint.x-currentX) * (180 / Math.PI);
						nearestPoint.a = tangentAngle
						nearestPoint.command = command.join(' ')
						nearestPoint.prev =  {x:currentX,y:currentY}
						nearestPoint.segIndex = index
					}
					currentX = x;
                    currentY = y;
					break;

                case 'A':
                    // Extract command for arc command
                    let rx = parseFloat(command[1]);
                    let ry = parseFloat(command[2]);
                    let flag1 = parseFloat(command[3]);
                    const flag2 = parseFloat(command[4]);
                    const flag3 = parseFloat(command[5]);
                    const sweepFlag = parseFloat(command[5]);
                    const EX = parseFloat(command[6]);
                    const EY = parseFloat(command[7]);
                    const x1 = currentX;
                    const y1 = currentY;
                    const x2 = EX;
                    const y2 = EY; 
					if (flag1 === 90 && rx !== ry)  {
						flag1 = 0
 						rx = parseFloat(command[2]);
						ry = parseFloat(command[1]);
					}

 					let arcParams = this.svgArcToCenterParam (x1, y1, rx, ry, flag1, flag2, flag3, EX, EY)  
					nearestPointOnCommand = this.findNearestPointOnEllipse( point.x, point.y, arcParams.cx, arcParams.cy, rx, ry, flag1)
 					let angleRad = Math.atan2(nearestPointOnCommand.y - arcParams.cy, nearestPointOnCommand.x - arcParams.cx);

                    let startAngleDeg = this.normalizedAngle( arcParams.startAngle)
                    let endAngleDeg = this.normalizedAngle(arcParams.endAngle) 
                    let angleDeg = this.normalizedAngle( angleRad )
               
                    let between=false;
                    // стрелки
                    if (sweepFlag === 0 ) {
                        if ( startAngleDeg > endAngleDeg) {
                            if (startAngleDeg > angleDeg && angleDeg > endAngleDeg) {
                                between=true;
                            }
                        } else {
                            if (startAngleDeg > angleDeg || angleDeg > endAngleDeg){
                                between=true;
                            }
                        }
                    } else {
                        if ( endAngleDeg > startAngleDeg) {
                            if (endAngleDeg> angleDeg && angleDeg > startAngleDeg) {
                                between=true;
                            }
                        } else {
                            if (endAngleDeg> angleDeg || angleDeg > startAngleDeg){
                                between=true;
                            }
                        }
                    }

					if (between) {
						let distanceArc  = this.distance({x:point.x,y:point.y}, {x:nearestPointOnCommand.x,y:nearestPointOnCommand.y})
						if (distanceArc <  minDistance) {
							minDistance = distanceArc
							nearestPoint = nearestPointOnCommand
							tangentAngle = Math.atan2(nearestPoint.y-arcParams.cy, nearestPoint.x-arcParams.cx) * (180 / Math.PI);
							nearestPoint.a = tangentAngle
							nearestPoint.command = command.join(' ')
							nearestPoint.centers = {x:arcParams.cx, y:arcParams.cy, rx:rx, ry:ry} 
							nearestPoint.prev =  {x:currentX,y:currentY}
							nearestPoint.segIndex = index
							
							
						}
					} 
				    currentX = EX;
                    currentY = EY;
                    break;
            }
			index++
        }
		//createSVG ([nearestPoint.x, nearestPoint.y])
 		return nearestPoint
	}

	parsePointsString(pointsArray, openPolygon=false, ind=0, int=2) {
		var scale = 100;
		let intend = ind > 0 ? int*=-1 : int;

		var res = []
		pointsArray = pointsArray.split(';');
 		const polygon = [pointsArray.map(point => {
			const [x, y] = point.split(',').map(Number);
			return { X: x, Y: y };
		})];

		var subj = new ClipperLib.Paths();
 		var solution = new ClipperLib.Paths();
		subj = polygon
 		ClipperLib.JS.ScaleUpPaths(subj, scale);
 		var co = new ClipperLib.ClipperOffset(2, 0.25);

 		if (openPolygon ) {
			co.AddPaths(subj, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etOpenRound);
		} else {
			co.AddPaths(subj, ClipperLib.JoinType.jtMiter, ClipperLib.EndType.etClosedPolygon);
		}
		
		co.Execute(solution, intend);
		ClipperLib.JS.ScaleDownPaths(solution, scale);

		try {
 			solution = solution.sort((a, b) => b.length - a.length)
			solution[0].map(a => res.push([a.X, a.Y]))
 			return res
		} catch (e) {
			return []
		}
	}

	findParallelLine(x, y, x1, y1, x3, y3, L) {
		// Находим угловой коэффициент прямой через точки (x, y) и (x1, y1)
		let slope;
		if (x1 !== x) {
			slope = (y1 - y) / (x1 - x);
		} else {
			slope = Infinity; // Вертикальная прямая
		}
	
		// Находим уравнение прямой, параллельной исходной, проходящей через точку (x3, y3)
		let newIntercept;
		if (slope !== Infinity) {
			newIntercept = y3 - slope * x3;
		} else {
			newIntercept = null; // Вертикальная прямая
		}
	
		// Находим координаты концов отрезка, параллельного исходному и проходящего через (x3, y3)
		let dx, dy;
		if (slope !== Infinity) {
			dx = Math.sqrt((L ** 2) / (1 + slope ** 2));
			dy = slope * dx;
		} else {
			dx = 0;
			dy = L / 2;
		}
		const x4 = x3 + dx;
		const y4 = y3 + dy;
		const x5 = x3 - dx;
		const y5 = y3 - dy;
	
		return [
			{ x: x4, y: y4 }, // Конец отрезка справа от точки (x3, y3)
			{ x: x5, y: y5 }  // Конец отрезка слева от точки (x3, y3)
		];
	}

	findNearesPoint(event) {

        let coord = this.convertScreenCoordsToSvgCoords(event.clientX, event.clientY);
        let minDistance = Infinity
        let searchResult ={}
        
        let contours = svgStore.getFiltered('contour')
        contours.forEach((contour,i)=>{
			
           	let cid= contour.cid
            let path = contour.path
            let updPath = SVGPathCommander.normalizePath(path)
            updPath.forEach((seg,i,arr)=>{               
                let x, y;                               
                if (seg.includes('A')) {
                    x = seg[6]
                    y = seg[7]
                }
                if (seg.includes('L') || seg.includes('M')  ) {
                    x = seg[1]
                    y = seg[2]
                }

                const distance = Math.sqrt(
                    Math.pow(coord.x - x, 2) +
                    Math.pow(coord.y - y, 2)
                );
                if (distance < minDistance){
                    minDistance=distance
                    //part.searchResult.distance = distance
					let next = i < arr.length - 1 ? arr[i + 1] : arr[0]; // Если последний элемент, берём первый (цикл)
					let prev = i > 0 ? arr[i - 1] : arr[arr.length - 1]; // Если первый элемент, берём последний (цикл)
					let angle = this.calculateAngleVector(x, y, next[1], next[2], prev[1], prev[2]);

                    searchResult.cid = cid
                    searchResult.point = {x,y}
                    searchResult.prevSeg = prev
                    searchResult.nextSeg = next
                    searchResult.currentSeg = arr[i]
                    searchResult.segIndex = i 
					searchResult.path = arr
					searchResult.angle= this.round (angle,2)

                }
            })
        })
		return searchResult  
    }

	addPointToPath =()=>{
					
		let updPath = SVGPathCommander.normalizePath (svgStore.selectedPointOnPath.path)
		let targetCommand = svgStore.selectedPointOnPath.command;
		let newPoint = {x:svgStore.selectedPointOnPath.x,y:svgStore.selectedPointOnPath.y}
		let commandParts = targetCommand.split(' ');
		let commandType = commandParts[0]; // Например, 'L'
		let commandIndex = updPath.findIndex(cmd => cmd.join(' ') === targetCommand );
		if (commandIndex === -1) {
			console.log("Команда для разбиения не найдена.");
			return;
		}

		if (commandType==='L'){
			let newSegment2 = ['L', newPoint.x, newPoint.y];
			updPath.splice(commandIndex, 0, newSegment2);
		} else if ((commandType==='A')) {
			let oldCom = updPath[commandIndex];
			let newSegment2 = ['A', oldCom[1], oldCom[2],oldCom[3],oldCom[4],oldCom[5],newPoint.x, newPoint.y]
			if (oldCom[4] === 1) {
				//console.log ('Large arc problem')
				let oldArcStart= updPath[commandIndex-1]
				let oldArcStartX = oldArcStart[oldArcStart.length-2]
				let oldArcStartY = oldArcStart[oldArcStart.length-1]
				let oldCenters = this.svgArcToCenterParam( oldArcStartX, oldArcStartY,oldCom[1], oldCom[2],oldCom[3],oldCom[4],oldCom[5], oldCom[6],oldCom[7], true)
				let newArc0 =this.svgArcToCenterParam( oldArcStartX, oldArcStartY,oldCom[1], oldCom[2],oldCom[3],0,oldCom[5], newPoint.x, newPoint.y, true)
				let newArc1 =this.svgArcToCenterParam( oldArcStartX, oldArcStartY,oldCom[1], oldCom[2],oldCom[3],1,oldCom[5], newPoint.x, newPoint.y, true)

				let stayArc0 =this.svgArcToCenterParam( newPoint.x, newPoint.y, oldCom[1], oldCom[2],oldCom[3],0,oldCom[5], oldCom[6],oldCom[7], true)
				let stayArc1 =this.svgArcToCenterParam( newPoint.x, newPoint.y, oldCom[1], oldCom[2],oldCom[3],1,oldCom[5], oldCom[6],oldCom[7], true)

				if (this.distance(oldCenters,newArc0 ) < this.distance(oldCenters,newArc1 )) {
					newSegment2 = ['A', oldCom[1], oldCom[2],oldCom[3],0,oldCom[5],newPoint.x, newPoint.y]
				} else {
					newSegment2 = ['A', oldCom[1], oldCom[2],oldCom[3],1,oldCom[5],newPoint.x, newPoint.y]
				}
				if (this.distance(oldCenters,stayArc0 ) < this.distance(oldCenters,stayArc1 )) {
					updPath[commandIndex] = ['A', oldCom[1], oldCom[2],oldCom[3],0,oldCom[5],oldCom[6],oldCom[7] ]
				} else {
					updPath[commandIndex] = ['A', oldCom[1], oldCom[2],oldCom[3],1,oldCom[5],oldCom[6],oldCom[7] ]
				}
			}
			updPath.splice(commandIndex, 0, newSegment2);
		} 
		return updPath.toString().replaceAll(',', ' ')	
	}

	deletePoint () {
		let searchResult = svgStore.selectedPointOnEdge	
		let updPath = searchResult.path;
		let commandIndex = searchResult.segIndex
		let commandType = searchResult.currentSeg[0]; // Например, 'L'
		if( commandType === 'M' ||updPath.length < 4) {
			//console.log ('inappropriate action')
			showToast({
				type: 'warning',
				message: 'inappropriate action',  
				autoClose: 5000,
				theme: 'dark',
			  });
			return false
		}

 		if ( updPath[commandIndex+1] && updPath[commandIndex+1][0] === 'A') {
			let next = updPath[commandIndex+1]
			let prev = updPath[commandIndex-1]
			let minRadius = 0.5*Math.sqrt(
				Math.pow(prev[prev.length-1] - next[next.length-1], 2) +
				Math.pow(prev[prev.length-2] -next[next.length-2], 2)
        	);
			updPath[commandIndex+1][1] = updPath[commandIndex+1][1] < minRadius ? minRadius : updPath[commandIndex+1][1]
			updPath[commandIndex+1][2] = updPath[commandIndex+1][2] < minRadius ? minRadius : updPath[commandIndex+1][2]
		} 

		updPath.splice(commandIndex, 1);
		let newPathData = updPath.toString().replaceAll(',', ' ')
		return newPathData; 
   	}

	createFilletArc({nextSeg, point, prevSeg, cid, currentSeg, path}=svgStore.selectedPointOnEdge) {
        if (!nextSeg || !point || !prevSeg || !currentSeg || !cid || !path) return
        const nextX = nextSeg[nextSeg.length-2];
        const nextY = nextSeg[nextSeg.length-1];
        const prevX = prevSeg[prevSeg.length-2]
        const prevY = prevSeg[prevSeg.length-1]
        const currX = currentSeg[currentSeg.length-2]
        const currY = currentSeg[currentSeg.length-1]
        const radius = +document.querySelector('#rounding_radius').value

        if ( [nextSeg, prevSeg, point, cid, currentSeg, radius].some( n=> !n)) return
        if ( nextSeg[0]=='A' ||  currentSeg[0]=='A') return
        let angle = this.calculateAngleVector(point.x, point.y, nextX, nextY, prevX, prevY)
        if (Math.abs(angle - 180) < 0.5) {
            console.log ("No scruglation signor!")
            return false
        }

		let gypLength =  radius / Math.sin( this.degreeToRadian(angle/2))
        let bisPoint = this.getBisectorPoint (point.x, point.y, nextX, nextY, prevX, prevY, gypLength)
        let k2 = gypLength * Math.cos( this.degreeToRadian(angle/2))
        let p1= this.findPointWithSameDirection( point.x, point.y, nextX, nextY, k2)
        let p2= this.findPointWithSameDirection( point.x, point.y, prevX, prevY, k2)

        let updPath = path
		let classList = svgStore.getElementByCidAndClass(cid, 'contour', 'class')
        let contourType = classList.includes('inner') ? 'inner' :'outer'
        let clockwise =SVGPathCommander.getDrawDirection(path)
        var pointIn = this.pointInSvgPath(path , bisPoint.x, bisPoint.y)        
        let arcClockwise= 0

        if ( contourType === 'inner') {
            if (clockwise) {
                //угол внешний и внутренний по точке в контуре или за контуром
                if (pointIn) {
                    arcClockwise=1                    
                } else {
                    arcClockwise=0    
                }
            } else {
                if (pointIn) {
                    arcClockwise=0                    
                } else {
                    arcClockwise=1    
                }
            }         
        } else {
            if (clockwise) {
                if (pointIn) {
                    arcClockwise=1                    
                } else {
                    arcClockwise=0    
                }
            }   else {
                if (pointIn) {
                    arcClockwise=0                    
                } else {
                    arcClockwise=1    
                }
            }   
        }

        const distance1 = Math.sqrt(
            Math.pow(currX - nextX, 2) +
            Math.pow(currY -nextY, 2)
        );

        const distance2 = Math.sqrt(
            Math.pow(currX - prevX, 2) +
            Math.pow(currY -prevY, 2)
        );
 
        if (this.round(k2) > this.round(distance1) || this.round(k2) > this.round(distance2)) {
           console.log ('El contour deformation, signor!')
           return false
        }

        // Создание команды для дуги
        const arcSeg = ['A', radius, radius, 0, 0, arcClockwise, p1.x, p1.y];    
        // Создание изменённой команды L
        const modifiedPrevSeg = ['L', p2.x, p2.y];    
        // Возвращаем обе команды
        const arcanisation = { arcSeg, modifiedPrevSeg };
        //меняем путь
        updPath.splice ( svgStore.selectedPointOnEdge.segIndex+1 ,0, arcanisation.arcSeg)
        updPath[svgStore.selectedPointOnEdge.segIndex] = arcanisation.modifiedPrevSeg
        return  updPath.toString().replaceAll(',', ' ')
    }

	pointMoving (e=false, coord=false) {
		if (!coord) coord = this.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);   
		let searchResult = svgStore.selectedPointOnEdge
		let updPath = searchResult.path
		let commandIndex = searchResult.segIndex
		let commandType = searchResult.currentSeg[0];
		let current = updPath[commandIndex]

 	 	if (commandType  === 'M') {
			//console.log ('inappropriate action')
			//TODO нужно решить позволятьь ли пользователю менять начальную точку контура которая врезка. Или нет ?Пока нет!
			return false
			updPath[0]= ['M', coord.x, coord.y]
			updPath[updPath.length-1][2] = coord.y
			updPath[updPath.length-1][1] = coord.x
		}	
		
	 	updPath[commandIndex][current.length-1] = coord.y
		updPath[commandIndex][current.length-2]= coord.x

		if ( updPath[commandIndex] && updPath[commandIndex][0] === 'A') {
			let prev = updPath[commandIndex-1]
			let minRadius = 0.5*Math.sqrt(
				Math.pow(prev[prev.length-1] -coord.y, 2) +
				Math.pow(prev[prev.length-2] -coord.x, 2)
        	);
			updPath[commandIndex][1] = minRadius 
			updPath[commandIndex][2] = minRadius 
		} 

		if ( updPath[commandIndex+1] && updPath[commandIndex+1][0] === 'A') {
			let next = updPath[commandIndex+1]
			let minRadius = 0.5*Math.sqrt(
				Math.pow(next[next.length-1] -coord.y, 2) +
				Math.pow(next[next.length-2] -coord.x, 2)
        	);
			updPath[commandIndex+1][1] = minRadius 
			updPath[commandIndex+1][2] = minRadius
		} 
		
		let newPathData = updPath.toString().replaceAll(',', ' ')
		
		if (svgStore.safeMode.mode) {
			// TODO доделать проверку столкновения
			// Дичь дикая что может наделать пользователь если править арки

			let res = inlet.getNewInletOutlet( svgStore.selectedPointOnEdge.cid, 'contour', 'path', newPathData, {angle: 0, x:0, y:0} )
			let success = inlet.applyNewPaths( res )	
			if (success) {
				//console.log (success+ '  updating POsitions')
				svgStore.setSelectedPointOnEdge({
					...svgStore.selectedPointOnEdge, 
					point: { x: coord.x, y: coord.y }
				});
			}
		} else {
			svgStore.setSelectedPointOnEdge({
				...svgStore.selectedPointOnEdge, 
				point: { x: coord.x, y: coord.y }
			});
			let res = inlet.getNewInletOutlet( svgStore.selectedPointOnEdge.cid, 'contour', 'path', newPathData, {angle: 0, x:0, y:0} )
			inlet.applyNewPaths( res )	
		}
	}

	createBoundsList () {
		let xcoords = new Set()
		let ycoords = new Set()
		let angles = new Set([0,45,135,315,30,60,120,150,210,240,270])
		
		let searchResult = svgStore.selectedPointOnEdge
		let updPath = searchResult.path
		let commandIndex = searchResult.segIndex

		for (let c in updPath){
			let cx, cy, command=updPath[c];
			if (+c !== commandIndex){
				if (command[0] === "M") {
					cx=command[1]
					cy=command[2]
				} else if (command[0] === "L") {
					cx=command[1]
					cy=command[2]
				} else if (command[0] === "A") {
					cx=command[6]
					cy=command[7]
				}
				xcoords.add(cx)
				ycoords.add(cy)
			}
			if ( +c < updPath.length-2 ) {
				let nx, ny, commandNext=updPath[+c+1];
				if (commandNext[0] === "M" || commandNext[0] === "L") {
					nx=commandNext[1]
					ny=commandNext[2]
					let angle = this.angleBetweenPoints (cx, cy, nx, ny) 
					angles.add(angle)
				}
			}
		}
		//console.log ( {x:xcoords,y:ycoords,angles:angles})
		return {x:xcoords,y:ycoords,angles:angles}
	}


	checkGuides(coord) {
		//console.log ('checking guides')
		if (svgStore.boundsList) {
			let threshold = 1
			let xx = false, yy = false, aa = false;
			for (let x of svgStore.boundsList.x) {
				if (Math.abs(x - coord.x) < threshold) {
					//console.log ('show x guide on'+x)
					xx = x
					break
				}
			}

			for (let y of svgStore.boundsList.y) {
				if (Math.abs(y - coord.y) < threshold) {
					//console.log ('show y guide on'+ y)
					yy = y
					break
				}
			}

			//console.log ( toJS (svgStore.selectedPointOnEdge))

			let nsg = svgStore.selectedPointOnEdge.nextSeg
			let psg = svgStore.selectedPointOnEdge.prevSeg

			let psgX = psg[psg.length - 2]
			let psgY = psg[psg.length - 1]
			let nsgX = nsg[nsg.length - 2]
			let nsgY = nsg[nsg.length - 1]
			let ap = this.angleBetweenPoints(psgX, psgY, coord.x, coord.y)
			let an = this.angleBetweenPoints(coord.x, coord.y, nsgX, nsgY,)

			for (let a of svgStore.boundsList.angles) {
				if (a % 90 > 0) {
					if (Math.abs((a - ap) % 180) < threshold) {
						aa = { a: a, x: psgX, y: psgY }
					}
					if (Math.abs((a - an) % 180) < threshold) {
						aa = { a: a, x: nsgX, y: nsgY }
					}
				}
			}

			let min = this.convertScreenCoordsToSvgCoords(0, 0);       
			let max = this.convertScreenCoordsToSvgCoords( window.screen.width,  window.screen.height); 

			if (aa) {
				const radians = aa.a * (Math.PI / 180);
				// Получаем размеры SVG
				const svg = document.querySelector('#svg')
				const svgWidth = svg.viewBox.baseVal.width;
				const svgHeight = svg.viewBox.baseVal.height;
				let group = document.getElementById("group");
				let matrix = group.transform.baseVal.consolidate().matrix
	
				const lineLength = Math.max(svgWidth/matrix.a, svgHeight/matrix.a); // Длина линии, чтобы она проходила через всю SVG
				const x1 = aa.x - lineLength * Math.cos(radians);
				const y1 = aa.y - lineLength * Math.sin(radians);
			
				// Конечные координаты (в другом направлении, чтобы линия пересекала весь SVG)
				const x2 = aa.x + lineLength * Math.cos(radians);
				const y2 = aa.y + lineLength * Math.sin(radians);
				aa.x1 = x1
				aa.x2 = x2
				aa.y1 = y1
				aa.y2 = y2
			}

			return {
				xx, yy, aa, min, max
			} 
		}
	}

	setGuidesPositionForPoint (e) {
	
			const { aGuide, xGuide, yGuide, selectedPointOnEdge } = svgStore;
			let x = selectedPointOnEdge.point.x;
			let y = selectedPointOnEdge.point.y;
			
			// Функция проверки видимости направляющей
			const isGuideVisible = (guide) => !Object.values(guide).every(value => value === 0);
			if ( isGuideVisible(xGuide) || isGuideVisible(yGuide) || isGuideVisible(aGuide)) {
				// Проверка на видимость направляющей по X
				if (isGuideVisible(yGuide)) {
					x = +yGuide.x1;
				}
				
				// Проверка на видимость направляющей по Y
				if (isGuideVisible(xGuide)) {
					y = +xGuide.y1;
				}
				
				// Проверка на видимость наклонной направляющей
				if (isGuideVisible(aGuide)) {
					let { x1, y1, x2, y2 } = aGuide;
				
					// Если **НЕТ** вертикальной и горизонтальной направляющих
					if (!isGuideVisible(xGuide) && !isGuideVisible(yGuide)) {
						let curPos = this.convertScreenCoordsToSvgCoords(e.clientX, e.clientY);
						let point = this.findNearestPointOnSegment(curPos.x, curPos.y, x1, y1, x2, y2);
						if (point) {
							x = point.x;
							y = point.y;
						}
					}
					// Если **ЕСТЬ** хотя бы одна из направляющих (xGuide или yGuide)
					else if (isGuideVisible(xGuide) || isGuideVisible(yGuide)) {
						let xx1, xx2, yy1, yy2;
				
						if (isGuideVisible(xGuide)) {
							({ x1: xx1, x2: xx2, y1: yy1, y2: yy2 } = xGuide);
						} else {
							({ x1: xx1, x2: xx2, y1: yy1, y2: yy2 } = yGuide);
						}
				
						let edge1 = [{ x: x1, y: y1 }, { x: x2, y: y2 }];
						let edge2 = [{ x: xx1, y: yy1 }, { x: xx2, y: yy2 }];
						let point = this.intersects(edge1, edge2);
				
						if (point) {
							x = point.x;
							y = point.y;
						}
					}
				}			
			let coord = { x, y };			
			this.pointMoving(false, coord);			
		}
		svgStore.setPointInMove(false)
	}

	selectEdge (event) {
        let coord = this.convertScreenCoordsToSvgCoords(event.clientX, event.clientY);
        let minDistance = Infinity
        let edgeSearchResult ={}
		let contours = svgStore.getFiltered('contour')

        contours.forEach((contour, index, arr) => {
			let path = contour.path;
			let cid = contour.cid;
			let nearestEdge = this.findNearestPointOnPath(path, coord);
			
			const distance = Math.sqrt(
				Math.pow(coord.x - nearestEdge.x, 2) +
				Math.pow(coord.y - nearestEdge.y, 2)
			);
		
			if (distance < minDistance) {
				minDistance = distance;
				edgeSearchResult.cid = cid;
				edgeSearchResult.command = nearestEdge.command;
				edgeSearchResult.edge = nearestEdge;
			}
		});
        return edgeSearchResult;
    }

	fakeBox (paths) {
        var fakePath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        fakePath.setAttribute("d", paths);
        fakePath.setAttribute("id", 'fakePath');
		var svg = document.getElementById("svg")
        svg.appendChild(fakePath);
        let stringBox =  document.querySelector('#fakePath').getBBox();
        stringBox.x2 = stringBox.x + stringBox.width
        stringBox.y2 = stringBox.y + stringBox.height
        stringBox.сy = stringBox.y + stringBox.height*0.5
        stringBox.сx = stringBox.x + stringBox.width*0.5
		document.querySelector('#fakePath').remove()
        return stringBox
    }

		calculatePathPercentageOptimized(cid, x, y, step = 1) {
		let closestLength = 0;
		let minDistance = Infinity;
		var fakePath = document.querySelector(`.contour[data-cid="${cid}"] path`);
 		const pathLength = fakePath.getTotalLength(fakePath);
		for (let length = 0; length <= pathLength; length += step) {
			const point = fakePath.getPointAtLength(length);
			const distance = Math.hypot(point.x - x, point.y - y);
			if (distance < minDistance) {
				minDistance = distance;
				closestLength = length;
			}
		}
 		const percentage = (closestLength / pathLength) * 100;		
		return Math.max(0, Math.min(100, percentage)); 
	} 	
} 


const utils = new Utils();
export default utils;