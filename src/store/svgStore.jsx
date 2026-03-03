import { makeAutoObservable, runInAction } from "mobx";
import SVGPathCommander from 'svg-path-commander';
import { toJS } from "mobx";
import utils from "../scripts/util";
import constants from "./constants";
import jobStore from "./jobStore";


class SvgStore {
	tooltips = false;
	laserShow = {};
	highLighted = false;

	svgData = {
		"file":"",
		"name": "undefined.ncp",
		"thickness":1,
		"jobcode":"",
		"width": 500,
		"height": 500,
		"quantity": 1,
		"presetId": 55,
		"presetName": "any_preset",
		"positions": [
			/*{
				"part_id": 1,
				"part_code_id": 1,
				"positions": {
					"a": -1,
					"b": -1.2246467991473532e-16,
					"c": 1.2246467991473532e-16,
					"d": -1,
					"e": 112.99999999999999,
					"f": 120.65419999999995
				},
				"cx": 113,
				"cy": 65.65419999999995,
				"selected": false
			}*/
		],
		"part_code": [
			/*{
				"id": 1,
				"uuid": 1,
				"name": "31715200",
				"height": 55,
				"width": 113
				"code": [
					{
						"cid": 0,
						"class": "contour outer  macro0 ",
						"path": "M8 27.5 L8 51 A4 4 0 0 0 12 55 L109 55 A4 4 0 0 0 113 51 L113 4 A4 4 0 0 0 109 0 L12 0 A4 4 0 0 0 8 4 L8 27.5",
						"stroke": "red",
						"strokeWidth": 0.2,
						"selected": false
					},
					{
						"cid": 0,
						"class": " inlet inner  macro0 ",
						"path": "M0 27.5 L5.333333 25.614382 A2 2 0 0 1 8 27.5",
						"stroke": "red",
						"strokeWidth": 0.2,
						"selected": false
					},
					{
						"cid": 0,
						"class": " outlet inner macro0   groupEnd ",
						"path": "",
						"stroke": "red",
						"strokeWidth": 0.2,
						"selected": false
					}
				],

				"joints": 
				[
					{
						"cid": 1,
						"atEnd": true/false
						"quantity": number,
						"distance": number,
						"manual":[]					
					},
					{
						"cid": 2,
						"atEnd": true/false
						"quantity": number,
						"distance": number,
						"manual":[]					
					}
					
				]
			} */      
		]
	}

	matrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	groupMatrix = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
	offset = { x: 0, y: 0 }
	gridState = {
		xsGrid: {
			visibility: "visible",
			fill: "var(--gridColorFill)",
		},
		smallGrid: {
			visibility: "visible",
			fill: "none",
		},
		grid: {
			visibility: "visible",
			fill: "none",
		},
	};


	constructor() {
		makeAutoObservable(this, {
		});
	}

	get selectedPosition() {
		//console.log (this.svgData.positions.find(pos => pos.selected))
		return this.svgData.positions.find(pos => pos.selected) || false;
	}

	get nextPosId() {
		const positions = this.svgData.positions;
		if (!positions || positions.length === 0) {
			return 1;
		}

		// Находим максимальный part_id
		const maxId = Math.max(...positions.map(p => p.part_id || 0));
		return maxId + 1;
	}

	setMatrix(val) {
		Object.assign(this.matrix, val)
	}

	setGroupMatrix(val) {
		Object.assign(this.groupMatrix, val)
	}

	setOffset(val) {
		Object.assign(this.offset, val)
	}

	setGridState(val) {
		Object.assign(this.gridState, val);
	}
	setTooltips(val) {
		this.tooltips = val
	}

	setVal(objectKey, pathOrKey, newValue) {
		const target = this[objectKey];
		if (!target) throw new Error(`Object ${objectKey} not found in store`);

		// если передан просто ключ (string), конвертируем в массив
		const path = Array.isArray(pathOrKey) ? pathOrKey : [pathOrKey];

		let current = target;
		for (let i = 0; i < path.length - 1; i++) {
			if (!(path[i] in current)) {
				throw new Error(`Key ${path[i]} does not exist in ${objectKey}`);
			}
			current = current[path[i]];
		}

		const lastKey = path[path.length - 1];
		if (!(lastKey in current)) {
			throw new Error(`Key ${lastKey} does not exist in ${objectKey}`);
		}

		current[lastKey] = newValue;
	}

	fitToPage() {
		console.log("FIT TO PAGE");
	}

	addPosition(position) {
		this.svgData.positions = [...this.svgData.positions, position]
	}

	addForm(form) {

		const box = this.findBox(form.code)
		form.width = 0
		form.height = 0
		if (box) {
			form.width = box.width
			form.height = box.height
		}

		console.log(form)
		this.svgData.part_code.push(form)
	}

	findBox(code) {
		let commonPath = ''
		code.map(a => commonPath += a.path)
		return SVGPathCommander.getPathBBox(commonPath)
	}

	selectOnly = (partId) => {
		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				pos.selected = pos.part_id === partId;
			});
		});
	};

	deselect = (id = false) => {
		runInAction(() => {
			if (id === false || id === null || id === undefined) {
				// Снимаем выделение со ВСЕХ деталей
				this.svgData.positions.forEach(part => {
					part.selected = false;
				});
			} else {
				// Снимаем выделение только с конкретной детали
				const part = this.svgData.positions.find(p => p.part_id === id);
				if (part) {
					part.selected = false;
				}
			}
		});
	};

	deleteAll = (uuid) => {
		if (!uuid) {
			console.warn('deleteAll: uuid не передан');
			return;
		}

		runInAction(() => {
			svgStore.svgData.positions = svgStore.svgData.positions.filter(
				(part) => part.part_code_id !== uuid
			);
		});
	};

	isOutOfRect(bbox, rect) {
		return (
			bbox.maxX < rect.x ||
			bbox.maxY < rect.y ||
			bbox.minX > rect.x + rect.width ||
			bbox.minY > rect.y + rect.height
		);
	}


	getOuterPath(partCode) {
		return partCode.code.find(p =>
			p.class?.split(' ').includes('outer') &&
			p.class?.split(' ').includes('contour')
		);
	}

	transformPoint(x, y, m) {
		return {
			x: m.a * x + m.c * y + m.e,
			y: m.b * x + m.d * y + m.f,
		};
	}


	transformBBox(bbox, matrix) {
		const points = [
			this.transformPoint(bbox.x, bbox.y, matrix),
			this.transformPoint(bbox.x + bbox.width, bbox.y, matrix),
			this.transformPoint(bbox.x, bbox.y + bbox.height, matrix),
			this.transformPoint(bbox.x + bbox.width, bbox.y + bbox.height, matrix),
		];

		const xs = points.map(p => p.x);
		const ys = points.map(p => p.y);

		return {
			minX: Math.min(...xs),
			maxX: Math.max(...xs),
			minY: Math.min(...ys),
			maxY: Math.max(...ys),
		};
	}


	deleteOutParts = () => {
		
		const rect = { x: 0, y: 0, width: this.svgData.width, height: this.svgData.height };

		runInAction(() => {
			this.svgData.positions = this.svgData.positions.filter(pos => {
				if (!pos.selected) return true;

				// 1️⃣ найти part_code
				const partCode = this.svgData.part_code.find(
					p => p.uuid === pos.part_code_id || p.id === pos.part_code_id
				);
				if (!partCode) return true;

				// 2️⃣ найти внешний контур
				const outer = this.getOuterPath(partCode);
				if (!outer) return true;

				// 3️⃣ bbox пути
				const outerBBox = SVGPathCommander.getPathBBox(outer.path);

				// 4️⃣ применить matrix
				const worldBBox = this.transformBBox(outerBBox, pos.positions);

				// 5️⃣ проверить выход за пределы
				return !this.isOutOfRect(worldBBox, rect);
			});
		});
	};

	updateForm(uuid, newPartCodeObject) {
		//console.log( arguments );
		if (!this.svgData || !Array.isArray(this.svgData.part_code)) {
			console.error("svgData или svgData.part_code не определены или не являются массивом");
			return;
		}

		const index = this.svgData.part_code.findIndex(item => item.uuid === uuid);

		if (index === -1) {
			console.warn(`Объект с uuid "${uuid}" не найден в part_code`);
			return;
		}

		//console.log (JSON.stringify(this.svgData))
		this.svgData.part_code[index] = Object.assign({}, newPartCodeObject);
		//console.log(`Объект с uuid "${uuid}" успешно обновлён`);
		//console.log (JSON.stringify(this.svgData))
	};

	generateParts() {
		const data = this.svgData;
		const res = [];
		let lineNumber = 4; // начинаем с N4, как в примере

		// Собираем уникальные детали по part_code_id
		const uniqueParts = new Map(); // part_code_id → { partInfo, contours }

		for (const part of data.part_code) {
			const partCodeId = part.uuid || part.id;

			uniqueParts.set(partCodeId, {
				name: part.name,
				width: part.width,
				height: part.height,
				code: part.code
			});
		}
		let progNum = 1

		for (const [partCodeId, partInfo, code] of uniqueParts) {
			const { name, code } = partInfo;
			const instancesCount = data.positions.filter(p => p.part_code_id === partCodeId).length;
			res.push(`(<Part PartCode="${name}" Debit="${instancesCount}">)`);
			//res.push(`ПРОГРАММА №` + progNum);

			const contours = this.generateSinglePart(code, progNum)
			res.push(contours);

			progNum++
			lineNumber += contours.length;

			//
			res.push(`N${lineNumber}G98`);
			lineNumber++;
			res.push('(</Part>)');
		}

		return res;
	}

	findByCidAndClass(array, cid, classSubstring, caseSensitive = false) {
		if (!Array.isArray(array)) return null;
		if (typeof classSubstring !== 'string') classSubstring = '';

		const searchStr = caseSensitive ? classSubstring : classSubstring.toLowerCase();

		return array.find(item => {
			if (item.cid !== cid) return false;
			if (typeof item.class !== 'string') return false;

			const classValue = caseSensitive ? item.class : item.class.toLowerCase();
			return classValue.includes(searchStr);
		}) || null;
	}

	getMacro(cls) {
		const m = cls.match(/macro(\d+)/)
		return m ? Number(m[1]) : null
	}

	svgToGcode(contour, inlet, outlet, height, outer) {
		const res = []
		const c = contour?.path.length ? new SVGPathCommander(contour.path).toAbsolute() : {segments:[]}
		const i = inlet?.path.length ? new SVGPathCommander(inlet.path).toAbsolute() : {segments:[]}
		const o = outlet?.path.length ? new SVGPathCommander(outlet.path).toAbsolute() : {segments:[]}
		const direction = SVGPathCommander.getDrawDirection(contour.path)//true G41 false 42

		let currentMacro = false
		let currentCompensation = false

		let X, Y, G, I, J = null
		let needLaserOn = true
		let needLaserOff = false
		let needStart = true
		let g = null 

		let needG40 = false

		i?.segments.forEach(seg => {
			const cmd = seg[0]
			if (cmd === 'M') {

				const [, x, y] = seg				
				if (needStart) {
					g = 'G0'
					let line = ''
					if (g !== G) line += g
					if (x !== X) line += "X" + utils.smartRound(x)
					if (y !== Y) line += "Y" + utils.smartRound(height- y)
					needStart =  false	
					G = g
					X = x
					Y = y
					line.length ? res.push(line) : false
				}				

			}

			if (cmd === 'L') {

				const [, x, y] = seg
				g = 'G1'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound(x)
				if (y !== Y) line += "Y" + utils.smartRound(height- y)
				if (needLaserOn) {
					
					const macro = this.getMacro(inlet.class)
					if (macro !== null && macro !== currentMacro) {
						res.push(`G10S${macro}`)
						currentMacro = macro
						G = 'G10'
					}

					line +="M4"
					needLaserOn = false
					needLaserOff = true
				}

				G = g
				X = x
				Y = y
				line.length ? res.push(line) : false

			}

			if (cmd === 'A') {

				const [, rx, ry, xAxis, largeArc, sweep, x, y] = seg
				needG40 =true
				// старт и конец в координатах станка
				const x1 = X
				const y1 = height - Y
				const x2 = x
				const y2 = height - y
			  
				const r = rx // у тебя всегда rx === ry
			  
				// восстановление центра дуги
				const mx = (x1 + x2) / 2
				const my = (y1 + y2) / 2
			  
				const dx = x2 - x1
				const dy = y2 - y1
				const q = Math.hypot(dx, dy)
			  
				const h = Math.sqrt(Math.max(0, r * r - (q * q) / 4))
			  
				const nx = -dy / q
				const ny = dx / q
			  
				// ВАЖНО: инверсия sweep → G2 / G3
				const isCCW = sweep === 0   // ← это ключ
				const sign = isCCW ? 1 : -1
			  
				const cx = mx + sign * nx * h
				const cy = my + sign * ny * h
			  
				// ❗ I / J — АБСОЛЮТНЫЕ
				const i = utils.smartRound (cx) 
				const j = utils.smartRound (cy)
			  
				g = isCCW ? 'G3' : 'G2'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound (x2)
				if (y !== Y) line += "Y" + utils.smartRound (y2)
				if (i !== I) line += "I" + i
				if (j !== J) line += "J" + j
				  
			  
				G = g
				X = x
				Y = y
				I = i
				J = j
			  

				const inner = contour.class.includes("inner");
				let neededComp;

				if (needLaserOn) {

					const macro = this.getMacro(inlet.class)
					if (macro !== null && macro !== currentMacro) {
						res.push(`G10S${macro}`)
						currentMacro = macro
						G = 'G10'
					}

					line +="M4"
					needLaserOn = false
					needLaserOff = true
				}
				
				if (
					(direction === true && inner === false) ||
					(direction === false && inner === true)
				) {
					neededComp = 'G41';
				}
				else {
					neededComp = 'G42';
				}

				if (currentCompensation !== neededComp) {
					currentCompensation = neededComp;
					res.push(neededComp);
				}
				res.push(line)


			}
		})


		if (contour.class.includes("contour") && 
			!contour.class.includes("engraving") &&
			c?.segments.length > 2 && 
			i.segments.length !== 0) { 
				
				res.push('(<Contour>)');
		}

		c?.segments.forEach((seg, ind) => {
			const cmd = seg[0]
			if (cmd === 'M') {

				const [, x, y] = seg				
				
				if (needStart) {
					g = 'G0'
					let line = ''
					if (g !== G) line += g
					if (x !== X) line += "X" + utils.smartRound ( x )
					if (y !== Y) line += "Y" + utils.smartRound ( height - y )
					needStart = false
					G = g
					X = x
					Y = y
					line.length ? res.push(line) : false
				}				

			}

			if (needLaserOn && c.segments.length === 2) {
				const macro = this.getMacro(contour.class)
				if (macro !== null && macro !== currentMacro) {
					res.push(`G10S${macro}`)
					G = 'G10'
					currentMacro = macro
				}
			}

			const inner = contour.class.includes("inner");
			let neededComp;

			if (
				(direction === true && inner === false) ||
				(direction === false && inner === true)
			) {
				neededComp = 'G41';
			}
			else {
				neededComp = 'G42';
			}

			if (currentCompensation !== neededComp) {
				currentCompensation = neededComp;
				res.push(neededComp);
			}

			if (cmd === 'L') {

				const [, x, y] = seg
				g = 'G1'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound (x)
				if (y !== Y) line += "Y" + utils.smartRound (height- y)

				
				if (needLaserOn && c.segments.length == 2 ){ 
					line +="M14M4M5M15";
					needLaserOn = true
				}
				if (needLaserOn && c.segments.length > 2){
					line +="M4"
					needLaserOn = false
				} 
 
				G = g
				X = x
				Y = y
				line.length ? res.push(line) : false

			}

			if (cmd === 'A') {

				const [, rx, ry, xAxis, largeArc, sweep, x, y] = seg
				needG40 =true
				// старт и конец в координатах станка
				const x1 = X
				const y1 = height - Y
				const x2 = x
				const y2 = height - y
			  
				const r = rx // у тебя всегда rx === ry
			  
				// восстановление центра дуги
				const mx = (x1 + x2) / 2
				const my = (y1 + y2) / 2
			  
				const dx = x2 - x1
				const dy = y2 - y1
				const q = Math.hypot(dx, dy)
			  
				const h = Math.sqrt(Math.max(0, r * r - (q * q) / 4))
			  
				const nx = -dy / q
				const ny = dx / q
			  
				// ВАЖНО: инверсия sweep → G2 / G3
				const isCCW = sweep === 0   // ← это ключ
				const sign = isCCW ? 1 : -1
			  
				const cx = mx + sign * nx * h
				const cy = my + sign * ny * h
			  
				// ❗ I / J — АБСОЛЮТНЫЕ
				const i = utils.smartRound (cx)
				const j = utils.smartRound (cy)
			  
				g = isCCW ? 'G3' : 'G2'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound(x2)
				if (y !== Y) line += "Y" + utils.smartRound(y2)
				if (i !== I) line += "I" + i
				if (j !== J) line += "J" + j

				if (needLaserOn && c.segments.length == 2 ) {
					line +="M14M4M5M15";
					needLaserOn = true
				}
				if (needLaserOn && c.segments.length > 2) {
					line +="M4"
					needLaserOn = false
				}


				G = g
				X = x
				Y = y
				I = i
				J = j

			  
				if (needLaserOn) {
					line += 'M4'
					needLaserOn = false			  
				}
				res.push(line)
			}

			if (i.segments.length === 0 && ind === 0) {
				const macro = this.getMacro(contour.class)
				if (macro !== null && macro !== currentMacro) {
					res.push(`G10S${macro}`)
					G = 'G10'
					currentMacro = macro
				}
			}


			if (i.segments.length === 0	&& 
				ind === 1 &&
				c?.segments.length > 2 ) {
				res.push('(<Contour>)');
			}
		})

		if (needLaserOff && (!outlet ||o.segments.length ===0 ) && c.segments.length > 2) {
			res[res.length-1]+="M5"
			needLaserOff = false
		}


		if (needG40 && (!outlet || o.segments.length ===0 )) {
			res.push(`G40`)
			G="G40"
			needG40 = false
		}

		if (contour.class.includes("contour") 
			&& !contour.class.includes("engraving")
			&& c?.segments.length > 2

		) {
			res.push('(</Contour>)');
		}

		o?.segments.forEach(seg => {
			const cmd = seg[0]
			if (cmd === 'M') {

				const [, x, y] = seg				
				g = 'G0'
				let line = ''
				if (needStart) {
					let line = ''
					if (g !== G) line += g
					if (x !== X) line += "X" + utils.smartRound (x)
					if (y !== Y) line += "Y" + utils.smartRound (height- y)
					needLaserOn = true
					G = g
					X = x
					Y = y
					line.length ? res.push(line) : false
				}
			}

			if (cmd === 'L') {

				const [, x, y] = seg
				g = 'G1'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound (x)
				if (y !== Y) line += "Y" + utils.smartRound (height- y)

				const macro = this.getMacro(inlet.class)
					if (macro !== null && macro !== currentMacro) {
						res.push(`G10S${macro}`)
						G = 'G10'
						currentMacro = macro
				}

				if (needLaserOn) {
					line +="M4"
					needLaserOn = false
				}

				G = g
				X = x
				Y = y
				line.length ? res.push(line) : false

			}

			if (cmd === 'A') {

				const [, rx, ry, xAxis, largeArc, sweep, x, y] = seg
				needG40 =true
				// старт и конец в координатах станка
				const x1 = X
				const y1 = height - Y
				const x2 = x
				const y2 = height - y
			  
				const r = rx // у тебя всегда rx === ry
			  
				// восстановление центра дуги
				const mx = (x1 + x2) / 2
				const my = (y1 + y2) / 2
			  
				const dx = x2 - x1
				const dy = y2 - y1
				const q = Math.hypot(dx, dy)
			  
				const h = Math.sqrt(Math.max(0, r * r - (q * q) / 4))
			  
				const nx = -dy / q
				const ny = dx / q
			  
				// ВАЖНО: инверсия sweep → G2 / G3
				const isCCW = sweep === 0   // ← это ключ
				const sign = isCCW ? 1 : -1
			  
				const cx = mx + sign * nx * h
				const cy = my + sign * ny * h
			  
				// ❗ I / J — АБСОЛЮТНЫЕ
				const i = utils.smartRound (cx)
				const j = utils.smartRound (cy)
			  
				g = isCCW ? 'G3' : 'G2'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + utils.smartRound(x2)
				if (y !== Y) line += "Y" + utils.smartRound(y2)
				if (i !== I) line += "I" + i
				if (j !== J) line += "J" + j
				  
				//line += `X${x2}Y${y2}I${i}J${j}`
			  
				G = g
				X = x
				Y = y
				I = i
				J = j

				const macro = this.getMacro(inlet.class|| "")
				if (macro !== null && macro !== currentMacro) {
					res.push(`G10S${macro}`)
					currentMacro = macro
					G = "G10"
				}

				const inner = contour.class.includes("inner");
				let neededComp;

				if (
					(direction === true  && inner === false) ||
					(direction === false && inner === true)
				) {
					neededComp = 'G41';
				}
				else {
					neededComp = 'G42';
				}

				if (currentCompensation !== neededComp) {
					currentCompensation = neededComp;
					res.push(neededComp);
				}

				if (needLaserOn) {
					line += 'M4'
					needLaserOn = false			  
				}
				res.push(line)			  
				
			}
		})

		if (needLaserOff || !outlet  || o?.segments?.length) {
			res[res.length-1]+="M5"
			needLaserOff = false
		}

		if (needG40 ) res.push(`G40`)
		return res
	}

	generateSinglePart(code, progNum) {
		let res = []
		let commonPath = ''
		code.forEach(a => commonPath += a.path || ' ')
		const box = SVGPathCommander.getPathBBox(commonPath)
		res.push(`N${0}G28X${utils.smartRound(box.width)}Y${utils.smartRound(box.height)}L${progNum}P1`)

		const sorted = [...code].sort((a, b) =>
			b.class.includes('inner') - a.class.includes('inner')
	  	);

		sorted.forEach((item) => {

			if (!item.class.includes('contour')) return
			let outer = item.class.includes('outer')

			const inlet = this.findByCidAndClass(code, item.cid, 'inlet')
			const outlet = this.findByCidAndClass(code, item.cid, 'outlet')
			const contour = item
			// ебана гравировка

			// ---- MACRO ----

			if (contour.path?.length) {
				this.svgToGcode(
					contour, 
					inlet,
					outlet, 
					box.height, 
					outer)
					.forEach(cmd =>
					res.push(`N${0}${cmd}`)
				)
			}
		})

		return res
	}

	deleteSelectedPosition () {		
		runInAction(() => {
			this.svgData.positions = this.svgData.positions.filter(pos => !pos.selected);
		})	
	}

	rotateSelectedPosition(angle = 45) {
		runInAction(() => {
	  
		  const rad = angle * Math.PI / 180;
		  const cos = Math.cos(rad);
		  const sin = Math.sin(rad);
	  
		  const multiply = (m1, m2) => ([
			[
			  m1[0][0]*m2[0][0] + m1[0][1]*m2[1][0],
			  m1[0][0]*m2[0][1] + m1[0][1]*m2[1][1],
			  m1[0][0]*m2[0][2] + m1[0][1]*m2[1][2] + m1[0][2]
			],
			[
			  m1[1][0]*m2[0][0] + m1[1][1]*m2[1][0],
			  m1[1][0]*m2[0][1] + m1[1][1]*m2[1][1],
			  m1[1][0]*m2[0][2] + m1[1][1]*m2[1][2] + m1[1][2]
			],
			[0,0,1]
		  ]);
	  
		  this.svgData.positions.forEach(pos => {
			if (!pos.selected) return;
	  
			const part = this.svgData.part_code.find(p => p.id === pos.part_code_id);
			if (!part) return;
	  
			const px = part.width  / 2;
			const py = part.height / 2;
	  
			const { a, b, c, d, e, f } = pos.positions;
	  
			const oldM = [
			  [a, c, e],
			  [b, d, f],
			  [0, 0, 1]
			];
	  
			// 🔥 точно как в твоём рабочем коде
			const rotM = [
			  [cos, -sin, px*(1-cos) + py*sin],
			  [sin,  cos, py*(1-cos) - px*sin],
			  [0, 0, 1]
			];
	  
			const m = multiply(oldM, rotM); // ← КЛЮЧ
	  
			pos.positions = {
			  a: m[0][0],
			  b: m[1][0],
			  c: m[0][1],
			  d: m[1][1],
			  e: m[0][2],
			  f: m[1][2],
			};
		  });
		});
	}

	generatePositions() {
		const data = this.svgData;
		const res = [];
		// fix need workinfg area
		//res.push(`N1G29X${this.svgData.height}Y${this.svgData.width}P1H1A1`);
		let contBox = document.querySelector("#contours").getBBox()
		res.push(`N1G29X${ utils.smartRound(contBox.width + contBox.x)}Y${ utils.smartRound(contBox.height+ + contBox.y)}P1H1A1`);
		let lineNumber = 2;
		let x, y, c, g, l = 0

		for (const pos of data.positions) {

			let matrix = pos.positions
			// высота листа по оси Y в системе станка
			let sheetHeight = this.svgData.height
			let L = pos.part_code_id
			let G = 52
			let partHeight = svgStore.svgData.part_code.filter(a => a.id == L)[0].height
			let XYC = this.matrixToG52(matrix, sheetHeight, partHeight, pos.cx, pos.cy)
			let X = utils.smartRound(XYC.X)
			let Y = utils.smartRound(XYC.Y)
			let C = utils.smartRound(XYC.C)

			let g52Line = `N${lineNumber}`;
			if (g !== G) g52Line += `G${G}`
			if (x !== X) g52Line += `X${X}`
			if (y !== Y) g52Line += `Y${Y}`
			if (l !== L) g52Line += `L${L}`
			if (c !== C) g52Line += `C${C}`

			res.push(g52Line);
			g = G, l = L, x = X, y = Y, c = C;
			lineNumber++;

		}

		res.push(`N${lineNumber}G99`);
		res.push('(</Plan>)');
		return res;
	}

	// Крест с поворотом
	cross = (x, y, size, h) => {
		const [rx, ry] = this.rotatePoint(x, y, 0, 0, 0);
		const yInv = h -ry;
		return `M${rx - size} ${yInv - size} L${rx + size},${yInv + size} M${rx - size} ${yInv + size}L${rx + size} ${yInv - size}`;
	};

	line = (x2, y2, c, h) => {
		const [rx2, ry2] = this.rotatePoint(x2, y2, 0, 0, 0);;
		return ` L${rx2} ${h - ry2}`;
	};

	start = (x1, y1, c, h) => {
		const [rx2, ry2] = this.rotatePoint(x1, y1, 0, 0, 0);
		return `M${rx2} ${h - ry2}`;
	};

	// Арка с поворотом
	arcPath = (
		ex,
		ey,
		r,
		large,
		sweep,
		c,
		h
	) => {
		const [rxEnd, ryEnd] = this.rotatePoint(ex, ey, 0, 0, 0);
		return ` A${r} ${r} 0 ${large} ${1 - sweep} ${rxEnd} ${h - ryEnd}`;
	};

	rotatePoint = (
		x,
		y,
		cx,
		cy,
		angleDeg
	) => {
		const theta = (angleDeg * Math.PI) / 180; // переводим угол в радианы
		const dx = x - cx;
		const dy = y - cy;

		const xRot = cx + dx * Math.cos(theta) - dy * Math.sin(theta);
		const yRot = cy + dx * Math.sin(theta) + dy * Math.cos(theta);

		return [xRot, yRot];
	};

	startToEdit(ncp) {
		if (!ncp) {
			ncp = constants.lines
		}
		const lines = ncp.trim()
			.split(/\n+/)
			.map(line => line.trim())

		const result = {
			file:"",
			name: "undefined.ncp",
			thickness:1,
			jobcode:'',
			width: 0,
			height: 0,
			quantity: 1,
			presetId: 55,
			presetName: "any_preset",
			positions: [],
			part_code: [],
		};


		/* ---------------- DIMENSIONS ---------------- */
		const dimLine = lines.find(l => l.includes("DimX") && l.includes("DimY"));
		let height = 0;
		let width = 0;
		if (dimLine) {
			const dimX = dimLine.match(/DimX="([\d.]+)"/);
			const dimY = dimLine.match(/DimY="([\d.]+)"/);
			const Thickness = dimLine.match(/Thickness="([\d.]+)"/);

			// Используем DimX как ширину, DimY как высоту,
			// чтобы не менять их местами при повороте -90°
			result.width = Number(dimX?.[1] || 0);
			result.height = Number(dimY?.[1] || 0);
			result.thickness = Number(Thickness?.[1] || 0);

			width = result.width;
			height = result.height;
		}

		const JobCodeLine = lines.find(l => l.includes("JobCode"));
 		if (dimLine) {
			const JobCode = JobCodeLine.match(/JobCode="([\d\D]+)"/);
			result.jobcode = (JobCode?.[1] || t("no_description"));
		}

		/* ---------------- PLAN (POSITIONS) ---------------- */
		const parseGcodeLine = utils.makeGcodeParser();
		let cmds = lines.map(parseGcodeLine);


		let inPlan = false;
		let partPositionId = 1;


		/* ---------------- PART CODE ---------------- */
 		let currentPart = null;
		let cid = -1;
		let cx = 0, cy = 0;
		let partOpen = false
		let contourOpen = "before"
		let res = []; // массив путей
		let laserOn = false
		let macros = ''
		let HW = [0]
		let partHeight = 0		
		let partWidth = 0
		let joints = [] // массив джойнтов

		for (const c of cmds) {
			//console.log(JSON.stringify(c))

			if (c?.comment?.includes('PartCode')) {
				//console.log('Part code start')
				cx = 0;
				cy = 0;
				const name = c.comment.match(/PartCode="([^"]+)"/)[1];

				currentPart = {
					id: result.part_code.length + 1,
					uuid: result.part_code.length + 1,
					name: name,
					code: [],
					height: 0,
					width: 0,
					joints:[],
				};
				res = []
				joints = []

				partOpen = true
				continue;

			} else if (c?.comment?.includes('</Part>')) {

				//console.log('Part End')
				partOpen = false
				res[res.length - 1].class += " groupEnd "

				for (let i = res.length - 1; i >= 0; i--) {
					const item = res[i];

					// Проверяем наличие отдельных слов 'contour' и 'inner'
					// \b означает границу слова, чтобы не находить части слов
					const hasContour = /\bcontour\b/i.test(item.class);
					const hasInner = /\binner\b/i.test(item.class);

					if (hasContour && hasInner) {
						item.class = item.class.replace(/\binner\b/i, 'outer');
						break;
					}
				}

				let commonPath = ''
				res.map(a => a.path ? commonPath += a.path : commonPath += " ")
				let box = SVGPathCommander.getPathBBox(commonPath)
				currentPart.width = box.width
				currentPart.height = box.height
 
				const order = ['outer', 'contour', 'engraving', 'inlet', 'outlet', 'joint'].reverse();
				res = res.sort((a, b) => {
					let ac = a.class.split(' ')
						.map(cls => order.indexOf(cls))
						.sort((a, b) => b - a)[0] || -1;

					let bc = b.class.split(' ')
						.map(cls => order.indexOf(cls))
						.sort((a, b) => b - a)[0] || -1;

					return bc - ac;
				});

				res.map(a => currentPart.code.push(a))
				joints.map(a => currentPart.joints.push(a))
				result.part_code.push(currentPart)
				continue;

			} else if (c?.comment?.includes('<Contour>')) {

				//console.log('Contour Start')
				contourOpen = "open"

				const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
				const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;

				if (res.length && !res[res.length - 1].class.includes("inlet")) {
					cid += 1
				}

				res.push({
					"cid": cid,
					"class": "contour inner " + macros,
					"path": "",
					"stroke": "red",
					"strokeWidth": 0.2,
					"selected": false
				})

				res[res.length - 1].path = this.start(cx, cy, c, partHeight);
				cx = tx; cy = ty;
				continue;


			} else if (c?.comment?.includes('</Contour>')) {

				//console.log('Contour Start')
				//contourOpen = "after"

				res.push({
					"cid": cid,
					"class": " outlet inner" + macros + " ",
					"path": "",
					"stroke": "red",
					"strokeWidth": 0.2,
					"selected": false
				})
				if (laserOn) res[res.length - 1].path = this.start(cx, cy, c, partHeight);
				continue;
			}

			if (Array.isArray(c.m)) {

				const m = new Set(c.m);
			  
				const only = (...vals) =>
				vals.length === m.size && vals.every(v => m.has(v));
			  
				if (only(4) || only(4, 14) ) {
					//console.log('laser on')
					laserOn = true;
					res[res.length - 1].path = this.start(cx, cy, c, partHeight);
				}	else if (only(5) || only(5, 15) ) {

					//console.log('laser off')
					laserOn = false;
					contourOpen = "before"
				  
				} else if (only(5, 15, 4, 14) || only(5, 4)) {
				  // только M5 M15
				  	//console.log('laser on')
					laserOn = true;
					res[res.length - 1].class = 
					res[res.length - 1].class
						.replace('inlet', 'contour')
						.replace('outlet', 'contour')

					res[res.length - 1].path = this.start(cx, cy, c, partHeight);

					contourOpen = "before"
					laserOn = false;

				}
			  
			}

			if (typeof c.g === 'number') {
				const g = Math.floor(c.g);
				if (g === 4) {
					let pathLength = SVGPathCommander.getTotalLength(
						res[res.length - 1].path
					);

					// ищем существующий контейнер
					let current = {
						[String(cid)]: {
							length: constants.defaultJointSize,
							x: cy,
							y: cx-partHeight,
							d: pathLength,
						}
					};
					joints.push(current)
					continue;

				} else if (g === 0) {

					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;

					if (contourOpen === "before") {
						cid += 1
						res.push({
							"cid": cid,
							"class": " inlet inner" + macros + " ",
							"path": "",
							"stroke": "red",
							"strokeWidth": 0.2,
							"selected": false
						})
					}


					res[res.length - 1].path = this.start(cx, cy, c, partHeight);
					cx = tx; cy = ty;

				} else if (g === 1) {

					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;
					res[res.length - 1].path += this.line(tx, ty, c, partHeight);
					cx = tx; cy = ty;

				} else if (g === 2 || g === 3) {

					// console.log(`g === 2 || g === 3`)
					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;
					const ci = (c.params.I !== undefined) ? (c.params.I) : 0;
					const cj = (c.params.J !== undefined) ? (c.params.J) : 0;
					const dxs = cx - (cx + ci);
					const dys = cy - (cy + cj);
					const dxe = tx - (cx + ci);
					const dye = ty - (cy + cj);
					let r = Math.round((Math.hypot(tx - ci, ty - cj)) * 1000) / 1000;
					const a1 = Math.atan2(dys, dxs);
					const a2 = Math.atan2(dye, dxe);
					let d = utils.normalizeAngle(a2 - a1);
					const ccw = (g === 3);
					if (ccw && d < 0) d += 2 * Math.PI;
					if (!ccw && d > 0) d -= 2 * Math.PI;
					const large = 0;
					const sweep = ccw ? 1 : 0;
					res[res.length - 1].path += this.arcPath(tx, ty, r, large, sweep, c, partHeight);

					cx = tx; cy = ty;
				} else if (g === 10) {
					macros = ' macro' + c.params.S + ' '
					/*try {
						res[res.length - 1].class += macros
					} catch (error) {
						console.log("catch in macros")
					}*/

					try {

						 res[res.length - 1].class = (
							( res[res.length - 1].class || '')
								.replace(/\bmacro\d+\b/g, '')
								+ macros
						)

					} catch (error) {
						console.log("catch in macros");
					}
 
				} else if (g === 29) {

					//console.log('g === 29')


				} else if (g === 28) {
					partHeight = c.params.Y
					partWidth = c.params.X
					HW.push([partHeight, partWidth])

				} else if (g === 52) {
					// // console.log('g === 52')					
				}

			}
		}

		lines.forEach(line => {
			if (line.includes("<Plan")) {
				inPlan = true;
				return;
			}

			if (line.includes("</Plan")) {
				inPlan = false;
				return;
			}

			if (!inPlan) return;

			// обрабатываем только G-code строки
			if (!/^N\d+/i.test(line)) return;

			// 👉 stateful G-code парсинг
			const g = parseGcodeLine(line);
			if (g.g === 28 || g.params.g === 28) {

			}
			if (g.g === 52 || g.params.g === 52) {
				// высота детали (bounding box с incut!)
				const { X = 0, Y = 0, C = 0, L = 1 } = g.params;
				const rad = ((-C) * Math.PI) / 180;
				//const cos = Math.cos(rad);
				//const sin = Math.sin(rad);
				const partHeight = HW[L][0]
				// высота листа по оси Y (DimY)
				const sheetHeight = height;

				const cx = X;
				const cy = sheetHeight - Y;

				const tx = X;
				const ty = sheetHeight - Y - partHeight;

				const dx = tx - cx;
				const dy = ty - cy;

				//const transform = `rotate(${-C} ${cx} ${cy}) translate(${tx} ${ty})`;
				//console.log ( transform )
				//const position = this.svgTransformToMatrix ( transform)
				const position = this.rotateTranslateToMatrix(C, cx, cy, tx, ty)

				result.positions.push(
					{
						part_id: partPositionId++,
						part_code_id: Number(L),
						positions: position,
						cx,
						cy
					}
				);
			}
		});

		svgStore.setGroupMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		svgStore.setMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		let result1 = this.defineInlets (result)
		// adding joints
		
		svgStore.svgData = Object.assign({}, result1)

	}

	defineInlets(result) {
	
	  const EPS = 0.001
	
	  const pointsEqual = (a, b) =>
		Math.abs(a[0] - b[0]) < EPS &&
		Math.abs(a[1] - b[1]) < EPS
	
	
	  const getStartPoint = (segments) => {
		const [, x, y] = segments[0] // M x y
		return [x, y]
	  }
	
	
	  // безопасно для любых команд (A/C/Q/...)
	  const getEndPoint = (cmd) => {
		const len = cmd.getTotalLength()
		const { x, y } = cmd.getPointAtLength(len)
		return [x, y]
	  }
	
	
	  const removeFirstMove = (segments) =>
		segments[0][0] === 'M' ? segments.slice(1) : segments
	
	
	  // =====================================================
	
	  for (const part of result.part_code) {
	
		const contours = part.code.filter(c => c.class.includes('contour'))
	
		// ⚡ быстрее чем find каждый раз
		const inletMap = new Map(
		  part.code
			.filter(c => c.class.includes('inlet') && c.path)
			.map(i => [i.cid, i])
		)
	
	
		for (const contour of contours) {
	
		  if (
			!contour.path ||
			contour.class.includes('macro2') ||
			utils.isPathClosed(contour.path)
		  ) continue
	
	
		  const inlet = inletMap.get(contour.cid)
		  if (!inlet) continue
	
	
		  // ✅ normalize обязателен
		  const contourCmd = new SVGPathCommander(contour.path).normalize()
		  const inletCmd   = new SVGPathCommander(inlet.path).normalize()
	
		  const contourSeg = contourCmd.segments
		  const inletSeg   = inletCmd.segments
	
	
		  const contourStart = getStartPoint(contourSeg)
		  const contourEnd   = getEndPoint(contourCmd)
	
		  const inletStart = getStartPoint(inletSeg)
		  const inletEnd   = getEndPoint(inletCmd)
	
	
		  let mergedSegments = null
	
	
		  // inlet -> contour
		  if (pointsEqual(inletEnd, contourStart)) {
			mergedSegments = [
			  ...inletSeg,
			  ...removeFirstMove(contourSeg)
			]
		  }
	
		  // contour -> inlet
		  else if (pointsEqual(contourEnd, inletStart)) {
			mergedSegments = [
			  ...contourSeg,
			  ...removeFirstMove(inletSeg)
			]
		  }
	
	
		  if (!mergedSegments) continue
	
	
		  // ✅ ПРАВИЛЬНАЯ сборка пути
		  contour.path = new SVGPathCommander(mergedSegments).toString()
	
		  // очищаем inlet
		  inlet.path = ''
		}
	  }
	
	  return result
	}

	rotateTranslateToMatrix(C, cx, cy, tx, ty) {
		const rad = (-C * Math.PI) / 180;

		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		// R
		const a = cos;
		const b = sin;
		const c = -sin;
		const d = cos;

		// e, f с учётом центра вращения и translate
		const e =
			cos * tx - sin * ty +
			cx - cos * cx + sin * cy;

		const f =
			sin * tx + cos * ty +
			cy - sin * cx - cos * cy;

		return { a, b, c, d, e, f };
	}

 	matrixToG52(matrix, sheetHeight, partHeight) {
		//console.log (arguments)
		const {a, b, c, d, e, f} = matrix;
		let C = -Math.atan2(b, a) * 180 / Math.PI;

		// нормализация
		if (Math.abs(C) < 1e-6) C = 0;
		if (Math.abs(C - 90) < 1e-6) C = 90;
		if (Math.abs(C - 180) < 1e-6) C = 180;
		if (Math.abs(C - 270) < 1e-6) C = 270;
		C = (C + 360) % 360
		let x = 0
		let y = partHeight

		const xNew = a * x + c * y + e;
		const yNew = b * x + d * y + f;

		// 3. вернуть координаты NCP
		const X = utils.smartRound(xNew);
		const Y = utils.smartRound ( sheetHeight - yNew );
		return { X, Y, C };
	} 

	renumberNLines(lines, start = 1) {
		let n = start

		return lines.map(line => {
			const m = line.match(/^N\d+(.*)$/i)
			if (!m) return line

			const rest = m[1].trim()

			// ❗ не нумеруем теги Contour
			if (
				rest === '(<Contour>)' ||
				rest === '(</Contour>)'
			) {
				return rest
			}

			return `N${n++}${m[1]}`
		})
	}
	  

	saveNcpFile() {
		
		const { selectedId } = jobStore;
		let ncpStart;

		if (selectedId === 'newSheet') {

			let material = "Mild steel" 
			let materialLabel = "S235JR"

			ncpStart = [
				`%`,
				`(<NcpProgram Version="1.0" Units="Metric">)`,
				`(<MaterialInfo Label="${material}" MaterialCode="${materialLabel}" Thickness="${this.svgData.thickness}" FormatType="Sheet" DimX="${this.svgData.width}" DimY="${this.svgData.height}"/>)`,
				`(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)`,
				`(<Plan JobCode="${this?.svgData.jobcode ? this.svgData.jobcode : "no_discrition"}">)`,
			]			

		} else {

			const current = jobStore.getJobById(selectedId)
			if (!current) return;
			const { material, materialLabel } = current
			const { thickness, jobcode } = svgStore.svgData
			ncpStart = [
				`%`,
				`(<NcpProgram Version="1.0" Units="Metric">)`,
				`(<MaterialInfo Label="${material}" MaterialCode="${materialLabel}" Thickness="${thickness}" FormatType="Sheet" DimX="${this.svgData.width}" DimY="${this.svgData.height}"/>)`,
				`(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)`,
				`(<Plan JobCode="${jobcode}">)`,
			]
		}

		let ncpPositons = this.generatePositions()
		let ncpParts = this.generateParts()
		let ncpFinish = [
			`(</NcpProgram>)`,
			`& \n`
		]

		let ncp = [...ncpStart, ...ncpPositons, ...ncpParts.flat(), ...ncpFinish]
		ncp = this.renumberNLines (ncp, 1)

		//ncp.forEach((item) => { console.log(item) });
		//return
		if (selectedId ==='newSheet' ) {
			jobStore.saveNcpAsNewSheet(ncp)
		} else {
			jobStore.saveNcpToServer(ncp)
		}
	}

}

const svgStore = new SvgStore();
export default svgStore;