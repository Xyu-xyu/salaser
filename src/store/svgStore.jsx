import { makeAutoObservable, runInAction } from "mobx";
import SVGPathCommander from 'svg-path-commander';
//import { toJS } from "mobx";
import utils from "../scripts/util";
import constants from "./constants";
import jobStore from "./jobStore";


class SvgStore {
	tooltips = false;
	laserShow = {};
	highLighted = false;
	//svgData = { width: 0, height: 0, code: [], params:{id:'',uuid:'',pcode:''} }; // Хранилище объекта SVG
	svgData = {
		"name": "undefined.ncp",
		"width": 500,
		"height": 500,
		"quantity": 1,
		"presetId": 50,
		"presetName": "any_preset",
		"positions": [
			/*{
				"part_id": 1,
				"part_code_id": 1,
				"positions": { "a": 1, "b": 0, "c": 0, "d": 1, "e": 0, "f": 0 }
				cx:0
				cy:0
			}*/
		],
		"part_code": [
			/*{
				"id": 1,
				"uuid": "n2-d0170e56-3c47-411e-84de-813bb41a7245",
				"name": "12___10__2",
				"code": [
					{
						"cid": 1,
						"class": "contour outer macro0 closed1",
						"path": "M15 199.5 V254.358 A9.999969 9.999969 0 0 1 12.071 261.429 L2.929 270.571 A9.999969 9.999969 0 0 0 0 277.642 V389 A9.999993 9.999993 0 0 0 10 399 H54.555 A10.000573 10.000573 0 0 0 62.955 394.426 L65.619 390.302 A10.000073 10.000073 0 0 1 74.019 385.729 H180.981 A10.000073 10.000073 0 0 1 189.381 390.302 L192.045 394.426 A10.000573 10.000573 0 0 0 200.445 399 H245 A9.999993 9.999993 0 0 0 255 389 V277.642 A9.999969 9.999969 0 0 0 252.071 270.571 L242.929 261.429 A9.999969 9.999969 0 0 1 240 254.358 V144.642 A9.999969 9.999969 0 0 1 242.929 137.571 L252.071 128.429 A9.999969 9.999969 0 0 0 255 121.358 V10 A9.999993 9.999993 0 0 0 245 0 H200.445 A10.000573 10.000573 0 0 0 192.045 4.574 L189.381 8.698 A10.000073 10.000073 0 0 1 180.981 13.271 H74.019 A10.000073 10.000073 0 0 1 65.619 8.698 L62.955 4.574 A10.000573 10.000573 0 0 0 54.555 0 H10 A9.999993 9.999993 0 0 0 0 10 V121.358 A9.999969 9.999969 0 0 0 2.929 128.429 L12.071 137.571 A9.999969 9.999969 0 0 1 15 144.642 V199.5 ",
						"stroke": "red",
						"strokeWidth": 0.2
					},
					{
						"cid": 2,
						"class": "inlet outer macro1 pulse0",
						"path": "M7 199.5 L12.333333 197.614382 A2 2 0 0 1 15 199.5 ",
						"stroke": "red",
						"strokeWidth": 0.2
					},
					{
						"cid": 2,
						"class": "contour inner macro0 closed1",
						"path": "M100.025 283.243 V241.243 A9.999993 9.999993 0 0 1 110.025 231.243 H144.482 A9.999993 9.999993 0 0 1 154.482 241.243 V325.243 A9.999993 9.999993 0 0 1 144.482 335.243 H110.025 A9.999993 9.999993 0 0 1 100.025 325.243 V283.243",
						"stroke": "red",
						"strokeWidth": 0.2
					}

				]
			}*/

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

	get nextPartId() {
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
		form.part_id = svgStore.svgData.part_code.length + 1
		form.papams = {
			"code": "",
			"uuid": "",
			"name": utils.uuid()
		}
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
		return;
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

	svgToGcode(path, height, needStart = false, outer) {
		const res = []
		const spc = new SVGPathCommander(path).toAbsolute()
		let X, Y, G, I, J = null
		let needLaserOn = false
		let needG40= false

		spc.segments.forEach(seg => {
			const cmd = seg[0]

			if (cmd === 'M') {

				const [, x, y] = seg				
				const g = 'G0'
				let line = ''
				if (needStart) {
					let line = ''
					if (g !== G) line += g
					if (x !== X) line += "X" + x
					if (y !== Y) line += "Y" + (height- y)
					needLaserOn = true
				}
				G = g
				X = x
				Y = y
				line.length ? res.push(line) : false

			}

			if (cmd === 'L') {

				const [, x, y] = seg
				const g = 'G1'
				let line = ''

				if (g !== G) line += g
				if (x !== X) line += "X" + x
				if (y !== Y) line += "Y" + (height- y)
				if (needLaserOn) line +="M4"
				needLaserOn = false

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
				const i = Math.round(cx * 1000) / 1000
				const j = Math.round(cy * 1000) / 1000
			  
				const g = isCCW ? 'G3' : 'G2'
				let line = g
			  
				line += `X${x2}Y${y2}I${i}J${j}`
			  
				G = g
				X = x
				Y = y
				I = i
				J = j
			  
				outer ? res.push('G42') : res.push('G41')
			  
				if (needLaserOn) line += 'M4'
				needLaserOn = false			  
				res.push(line)
			}
		})
		if (needG40) res.push(`N${0}G40`)
		return res
	}

	generateSinglePart(code, progNum) {
		let res = []
		let commonPath = ''
		let currentMacro = null

		code.forEach(a => commonPath += a.path || ' ')
		const box = SVGPathCommander.getPathBBox(commonPath)
		res.push(`N${0}G28X${box.width}Y${box.height}L${progNum}P1`)

		code.forEach((item) => {

			if (!item.class.includes('contour')) return
			let outer = item.class.includes('outer')

			const inlet = this.findByCidAndClass(code, item.cid, 'inlet')
			const outlet = this.findByCidAndClass(code, item.cid, 'outlet')
			const contour = item

			// generate start 
			res.push(`N${0}G0X50Y108`)

			// ---- MACRO ----
			const macro = this.getMacro(contour.class)
			if (macro !== null && macro !== currentMacro) {
				res.push(`N${0}G10S${macro}`)
				currentMacro = macro
			}

			// ---- INLET ----
			if (inlet?.path?.length) {
				this.svgToGcode(inlet.path, +box.height, true, outer).forEach(cmd =>
					res.push(`N${0}${cmd}`)
				)
			}

			// ---- CORRECTION ----
			//const isInner = contour.class.includes('inner')
			//res.push(`N${0}${isInner ? 'G42' : 'G41'}`)

			// ---- CONTOUR ----
			res.push('(<Contour>)')

			if (contour.path?.length) {
				this.svgToGcode(contour.path, +box.height, inlet?.path?.length ? false : true, outer ).forEach(cmd =>
					res.push(`N${0}${cmd}`)
				)
			}
			
			res.push('(</Contour>)')

			// ---- OUTLET ----
			if (outlet?.path?.length) {
				this.svgToGcode(outlet.path, box.height, false, outer).forEach(cmd =>
					res.push(`N${0}${cmd}`)
				)
			}
		})

		return res
	}

	generatePositions() {
		const data = this.svgData;
		const res = [];
		// fix need workinfg area
		//res.push(`N1G29X${this.svgData.height}Y${this.svgData.width}P1H1A1`);
		res.push(`N1G29X${110}Y${118}P1H1A1`);
		let lineNumber = 2;
		let x, y, c, g, l = 0

		for (const pos of data.positions) {

			let matrix = pos.positions
			let sheetHeight = this.svgData.width
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
	cross = (x, y, size, c) => {
		const [rx, ry] = this.rotatePoint(x, y, 0, 0, 0);
		const yInv = ry;
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
			name: "undefined.ncp",
			width: 0,
			height: 0,
			quantity: 1,
			presetId: 50,
			presetName: "any_preset",
			positions: [],
			part_code: []
		};


		/* ---------------- DIMENSIONS ---------------- */
		const dimLine = lines.find(l => l.includes("DimX") && l.includes("DimY"));
		let height = 0
		let width = 0
		if (dimLine) {
			const dimX = dimLine.match(/DimX="([\d.]+)"/);
			const dimY = dimLine.match(/DimY="([\d.]+)"/);
			result.width = Number(dimY?.[1] || 0);
			result.height = Number(dimX?.[1] || 0);
			//console.log ( result.width, result.height )
			height = result.height
			width = result.width

		}

		/* ---------------- PLAN (POSITIONS) ---------------- */
		const parseGcodeLine = utils.makeGcodeParser();
		let cmds = lines.map(parseGcodeLine);


		let inPlan = false;
		let partPositionId = 1;


		/* ---------------- PART CODE ---------------- */
		//const parseGcodeLine = makeGcodeParser();

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

		for (const c of cmds) {
			//console.log(JSON.stringify(c))

			if (c?.comment?.includes('PartCode')) {
				console.log('Part code start')
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
				};
				res = []
				partOpen = true
				continue;

			} else if (c?.comment?.includes('</Part>')) {

				console.log('Part End')
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
				//currentPart.viewBox=`${box.x} ${box.y} ${box.x2} ${box.y2}`

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
				result.part_code.push(currentPart)
				continue;

			} else if (c?.comment?.includes('<Contour>')) {

				console.log('Contour Start')
				contourOpen = "open"

				const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
				const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;

				if (!res[res.length - 1].class.includes("inlet")) {
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

				console.log('Contour Start')
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

			if (typeof c.m === 'number') {

				/* if (!pendingBreakCircle) {
					if (c.m === 4) pendingBreakCircle = { type: 'in'};
					if (c.m === 5) pendingBreakCircle = { type: 'out'};
				} */

				if (c.m === 4 || c.m === 14) {
					console.log('laser on')
					laserOn = true;
					res[res.length - 1].path = this.start(cx, cy, c, partHeight);
				}

				if (c.m === 5 || c.m === 15) {
					console.log('laser off')
					laserOn = false;
					contourOpen = "before"
				}
			}

			if (typeof c.g === 'number') {
				const g = Math.floor(c.g);
				if (g === 4) {

					/* let crossPath = {
						path: partOpen ?
							this.cross(cx, cy, 2.5, c )
							:
							this.cross(cx, cy, 2.5, c ),
						class: 'g4'
					};
					res.splice(0, 0, crossPath);
					continue; */
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
					try {
						res[res.length - 1].class += macros
					} catch (error) {
						console.log("catch in macros")
					}
					//res[res.length - 1].class += macros

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
				const sheetHeight = width;

				const cx = X;
				const cy = sheetHeight - Y;

				const tx = X;
				const ty = sheetHeight - Y - partHeight;

				const dx = tx - cx;
				const dy = ty - cy;

				const transform = `rotate(${-C} ${cx} ${cy}) translate(${tx} ${ty})`;
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


				/*const XYC = this.matrixToG52 (position , sheetHeight, partHeight, cx, cy)
				if ( Math.abs ( X - XYC.X ) > 0.05 || 
					 Math.abs ( Y - XYC.Y )> 0.05 ||
					 Math.abs ( C - XYC.C ) >  0.05
					) {
						console.log ("FUCK", JSON.stringify(XYC), X, Y, C )
				} else {
					console.log ( "YEEEAH !")
				}*/
			}
		});

		svgStore.setGroupMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		svgStore.setMatrix({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 });
		svgStore.svgData = Object.assign({}, result)

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

	matrixToG52(matrix, sheetHeight, partHeight, cx, cy) {
		//console.log (arguments)
		const { a, b, e, f } = matrix;
		let C = -Math.atan2(b, a) * 180 / Math.PI;

		// нормализация
		if (Math.abs(C) < 1e-6) C = 0;
		if (Math.abs(C - 90) < 1e-6) C = 90;
		if (Math.abs(C - 180) < 1e-6) C = 180;
		if (Math.abs(C - 270) < 1e-6) C = 270;
		C = (C + 360) % 360

		const cos = a;
		const sin = b;

		// 1. убрать вклад центра вращения
		const ex = e - (cx - cos * cx + sin * cy);
		const fy = f - (cy - sin * cx - cos * cy);

		// 2. инвертировать вращение
		const tx = cos * ex + sin * fy;
		const ty = -sin * ex + cos * fy;

		// 3. вернуть координаты NCP
		const X = tx;
		const Y = sheetHeight - ty - partHeight;

		return { X, Y, C };
	}

	renumberNLines(lines, start = 1) {
		let n = start

		return lines.map(line => {
			const m = line.match(/^N\d+(.*)$/i)
			if (!m) return line

			// m[1] — всё, что после номера
			return `N${n++}${m[1]}`
		})
	}

	saveNcpFile() {

		const { selectedId } = jobStore;
		const current = jobStore.getJobById(selectedId)
		if (!current) return;
		const { loadResult, dimX, dimY, material, materialLabel, name } = current
		let parsed = JSON.parse(loadResult)
		const { thickness, jobcode } = parsed.result.jobinfo.attr

		let ncpStart = [
			`%`,
			`(<NcpProgram Version="1.0" Units="Metric">)`,
			`(<MaterialInfo Label="${material}" MaterialCode="${materialLabel}" Thickness="${thickness}" FormatType="Sheet" DimX="${dimX}" DimY="${dimY}"/>)`,
			`(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)`,
			`(<Plan JobCode="${jobcode}">)`,
			`(<Plan>)`,
		]

		let ncpPositons = this.generatePositions()
		let ncpParts = this.generateParts()
		let ncpFinish = [
			`(</NcpProgram>)`,
			`&`
		]

		let ncp = [...ncpStart, ...ncpPositons, ...ncpParts.flat(), ...ncpFinish]
		ncp = this.renumberNLines (ncp, 1)

		ncp.forEach((item) => { console.log(item) });
		//console.log ( ncp )
	}

}

const svgStore = new SvgStore();
export default svgStore;
