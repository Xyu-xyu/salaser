import { makeAutoObservable, runInAction } from "mobx";
import SVGPathCommander from 'svg-path-commander';
import { toJS } from "mobx";
import utils from "../scripts/util";
import constants from "./constants";


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
			"uuid": ""
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

	deleteOutParts = () => {
		const { width, height } = this.svgData;

		// Если холст не задан — выходим
		if (!width || !height) {
			console.warn('deleteOutParts: размеры холста не заданы');
			return;
		}

		runInAction(() => {
			this.svgData.positions = this.svgData.positions.filter(part => {
				// Проверяем только выделенные
				if (!part.selected) {
					return true; // оставляем
				}
				const x = part.positions.e;
				const y = part.positions.f;
				const formId = part.part_code_id
				const form = this.svgData.part_code.filter(f => formId === f.uuid)
				const widthF = form[0].width
				const heightF = form[0].height

				// Условие: центр детали за пределами холста
				const isOut =
					x + widthF < 0 ||
					y + heightF < 0 ||
					x > width ||
					y > height;

				// Если за пределами — удаляем (filter возвращает false)
				return !isOut;
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
				name: utils.uuid(),
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
			res.push(`ПРОГРАММА №` + progNum);

			const contours = this.generateSinglePart(code, lineNumber, progNum)
			res.push(contours);

			progNum++
			lineNumber += contours.length;

			//
			res.push(`N${lineNumber} G98`);
			lineNumber++;

			res.push('(</Part>)');
		}

		return res;
	}

	findByCidAndClass(array, cid, classSubstring, caseSensitive = false) {
		if (!Array.isArray(array)) {
			return [];
		}
		if (typeof classSubstring !== 'string') {
			classSubstring = '';
		}

		const searchStr = caseSensitive ? classSubstring : classSubstring.toLowerCase();

		return array.filter(item => {
			// Проверка cid
			if (item.cid !== cid) {
				return false;
			}

			// Проверка class
			if (typeof item.class !== 'string') {
				return false;
			}

			const classValue = caseSensitive ? item.class : item.class.toLowerCase();
			return classValue.includes(searchStr)[0] || false;
		});
	}

	generateSinglePart(code, lineNumber, progNum) {
		let res = []
		let commonPath = ''

		code.map(a => a.path ? commonPath += a.path : commonPath += " ")
		let box = SVGPathCommander.getPathBBox(commonPath)
		res.push(`N${lineNumber + res.length + 1} G28 X${box.width} Y${box.height} L${progNum}P1`);

		code.forEach((item) => {

			if (item.class.includes('contour')) {
				res.push("(<Contour>)")
				let inlet = this.findByCidAndClass(code, item.cid, 'inlet')
				let outlet = this.findByCidAndClass(code, item.cid, 'outlet')
				let contour = item

				if (inlet && inlet.hasOwnProperty('path') && inlet.path.length) {
					res.push(`N${lineNumber + res.length + 1} INLET`);

				}

				if (contour && contour.hasOwnProperty('path') && contour.path.length) {
					res.push(`N${lineNumber + res.length + 1} contour`);
				}


				if (outlet && outlet.hasOwnProperty('path') && outlet.path.length) {
					res.push(`N${lineNumber + res.length + 1} OUTLET`);
				}

				res.push("(</Contour>)")

			}


		})


		return res;

	}


	generatePositions() {
		const data = this.svgData;
		const res = [];

		// Начало плана
		res.push('(<Plan>)');

		// Инициализация / возврат в начало (как в твоём примере)
		res.push('N1 G29 X0.00 Y0.00 P1 H1 A1');

		let lineNumber = 2; // следующая строка после N1

		// Карта для определения номера L (порядковый номер уникальной детали по part_code_id)
		const partCodeToL = new Map(); // part_code_id → L (начиная с 1)

		// Проходим по всем позициям деталей на листе
		for (const pos of data.positions) {
			const partCodeId = pos.part_code_id;

			// Определяем L: если эта деталь уже встречалась — берём существующий номер, иначе новый
			let L = partCodeToL.get(partCodeId);
			if (L === undefined) {
				L = partCodeToL.size + 1;
				partCodeToL.set(partCodeId, L);
			}

			// Извлекаем параметры матрицы преобразования: a, b, c, d, e, f
			// Это аффинное преобразование: X' = a*X + c*Y + e;  Y' = b*X + d*Y + f
			const { a = 1, b = 0, c = 0, d = 1, e = 0, f = 0 } = pos.positions;

			// Смещение (X, Y) — это e и f
			const X = e.toFixed(2);
			const Y = f.toFixed(2);

			// Угол поворота в градусах вычисляем из матрицы (a, b, c, d)
			// Поворот определяется подматрицей [[a, c], [b, d]]
			// Угол = atan2(b, a) — это угол поворота (в радианах), если масштаб = 1
			const angleRad = Math.atan2(b, a);
			const angleDeg = (angleRad * 180 / Math.PI).toFixed(2);

			// Генерируем строку G52
			// Первый раз для новой детали — G52 с X Y L C
			// Последующие копии той же детали тоже с G52 (по твоей логике)
			const g52Line = `N${lineNumber} G52 X${X} Y${Y} L${L} C${angleDeg}`;
			res.push(g52Line);

			lineNumber++;
		}

		// Конец сектора/плана — завершающая команда
		res.push(`N${lineNumber} G99`);

		// Закрывающий тег
		res.push('(</Plan>)');

		return res;
	}

	saveNewFile() {
		console.log("printStore:", toJS(this));
		let ncpStart = [
			`%`,
			`(<NcpProgram Version="1.0" Units="Metric">)`,
			`(<MaterialInfo Label="Mild steel" MaterialCode="S235JR" Thickness="${1}" FormatType="Sheet" DimX="${this.svgData.width}" DimY="${this.svgData.height}"/>)`,
			`(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)`,
			`(<Plan JobCode="${this.svgData.name}">)`,
		]


		let ncpPositons = this.generatePositions()
		let ncpParts = this.generateParts()
		let ncpFinish = [
			`(</NcpProgram>)`,
			`&`
		]

		let ncp = [...ncpStart, ...ncpPositons, ...ncpParts.flat(), ...ncpFinish]
		ncp.forEach((item) => { console.log(item) });

	}

	buildMatrixFromXYC(x = 0, y = 0, c = 0) {
		const rad = (c * Math.PI) / 180;
		const cos = Math.cos(rad);
		const sin = Math.sin(rad);

		return {
			a: cos,
			b: sin,
			c: -sin,
			d: cos,
			e: x,
			f: y
		};
	}


	makeGcodeParser() {
		let last = {
			g: undefined,
			m: undefined,
			params: {}
		};

		let base = { X: 0, Y: 0, C: 0 };

		return function parseGcodeLine(raw) {
			let s = String(raw).trim();

			const out = {
				n: undefined,
				g: undefined,
				m: undefined,
				params: {},
				base: {}
			};

			// комментарий
			s = s.replace(/\([^)]*\)/g, " ");

			// N
			const nMatch = s.match(/^N(\d+)/i);
			if (nMatch) out.n = Number(nMatch[1]);

			// G / M
			const gMatch = s.match(/G(-?\d+(?:\.\d+)?)/i);
			out.g = gMatch ? Number(gMatch[1]) : last.g;

			const mMatch = s.match(/M(-?\d+(?:\.\d+)?)/i);
			out.m = mMatch ? Number(mMatch[1]) : last.m;

			// параметры
			const keys = ["X", "Y", "I", "J", "S", "P", "H", "A", "L", "C", "G"];
			for (const k of keys) {
				const r = new RegExp(`${k}(-?\\d+(?:\\.\\d+)?)`, "i");
				const m = s.match(r);

				if (m) {
					out.params[k] = Number(m[1]);
				} else if (last.params[k] !== undefined) {
					out.params[k] = last.params[k];
				}
			}

			// G52 — база
			if (/G52/i.test(s)) {
				base = {
					X: out.params.X ?? 0,
					Y: out.params.Y ?? 0,
					C: out.params.C ?? 0
				};
			}

			out.base = { ...base };

			last = {
				g: out.g,
				m: out.m,
				params: { ...last.params, ...out.params }
			};

			return out;
		};
	}


	degToRad(a) {
		return (a * Math.PI) / 180;
	}

	rotatePoint(x, y, angleDeg) {
		const r = this.degToRad(angleDeg);
		const cos = Math.cos(r);
		const sin = Math.sin(r);

		return {
			x: x * cos - y * sin,
			y: x * sin + y * cos
		};
	}

	toWorld(x, y, base) {
		const p = this.rotatePoint(x, y, base?.C || 0);
		return {
			x: p.x + (base?.X || 0),
			y: p.y + (base?.Y || 0)
		};
	}


	startToEdit() {
		const lines = constants.lines
		const result = {
			name: "undefined.ncp",
			width: 100,
			height: 100,
			quantity: 1,
			presetId: 50,
			presetName: "any_preset",
			positions: [],
			part_code: []
		};


		/* ---------------- DIMENSIONS ---------------- */
		const dimLine = lines.find(l => l.includes("DimX") && l.includes("DimY"));
		if (dimLine) {
			const dimX = dimLine.match(/DimX="([\d.]+)"/);
			const dimY = dimLine.match(/DimY="([\d.]+)"/);
			result.width = Number(dimX?.[1] || 0);
			result.height = Number(dimY?.[1] || 0);
		}


		/* ---------------- PLAN (POSITIONS) ---------------- */
		const parseGcodeLine = this.makeGcodeParser();
		let inPlan = false;
		let partPositionId = 1;

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
			const { X = 0, Y = 0, C = 0, L = 1 } = g.params;
			if (g.g === 29 || g.params.g === 29) {
				result.positions.push({
					part_id: partPositionId++,
					part_code_id: Number(L),
					positions: {
						a: Math.cos((C * Math.PI) / 180),
						b: Math.sin((C * Math.PI) / 180),
						c: -Math.sin((C * Math.PI) / 180),
						d: Math.cos((C * Math.PI) / 180),
						e: X,
						f: Y
					}
				});
			}


		});


		/* ---------------- PART CODE ---------------- */
		//const parseGcodeLine = makeGcodeParser();

		let inPart = false;
		let currentPart = null;
		let cid = 1;
		
		let cx = 0;
		let cy = 0;

		lines.forEach(line => {

			/* ---------- PART START ---------- */
			if (line.includes("<Part")) {
				inPart = true;
				cid = 1;
				cx = 0;
				cy = 0;

				currentPart = {
					id: result.part_code.length + 1,
					uuid: "",
					name: "",
					code: []
				};
				return;
			}

			/* ---------- PART END ---------- */
			if (line.includes("</Part>")) {
				result.part_code.push(currentPart);
				currentPart = null;
				inPart = false;
				return;
			}

			if (!inPart) return;
			if (!/^N\d+/i.test(line)) return;

			const c = parseGcodeLine(line);

			if (typeof c.m === "number") {

				const wp = this.toWorld(cx, cy, c.base);

				if (c.m === 4) {
					currentPart.code.push({
						cid,
						class: "inlet",
						path: `M${wp.x} ${wp.y}`,
						stroke: "red",
						strokeWidth: 0.2
					});
				}

				if (c.m === 5) {
					currentPart.code.push({
						cid,
						class: "outlet",
						path: `M${wp.x} ${wp.y}`,
						stroke: "red",
						strokeWidth: 0.2
					});
					cid++;
				}
			}


			if (typeof c.g === "number") {
				const g = Math.floor(c.g);

				let contour = currentPart.code.find(
					p => p.cid === cid && p.class === "contour"
				);

				if (!contour) {
					const wp = this.toWorld(cx, cy, c.base);
					contour = {
						cid,
						class: "contour",
						path: `M${wp.x} ${wp.y}`,
						stroke: "red",
						strokeWidth: 0.2
					};
					currentPart.code.push(contour);
				}

				if (g === 0 || g === 1) {
					const tx = c.params.X ?? cx;
					const ty = c.params.Y ?? cy;

					const wp = this.toWorld(tx, ty, c.base);
					contour.path += ` L${wp.x} ${wp.y}`;

					cx = tx;
					cy = ty;
				}

				else if (g === 2 || g === 3) {
					const tx = c.params.X ?? cx;
					const ty = c.params.Y ?? cy;
					const ci = c.params.I ?? 0;
					const cj = c.params.J ?? 0;

					// центр дуги в локале
					const centerLocal = {
						x: cx + ci,
						y: cy + cj
					};

					// переводим в мир
					const startW =this.toWorld(cx, cy, c.base);
					const endW =this.toWorld(tx, ty, c.base);
					const centerW =this.toWorld(centerLocal.x, centerLocal.y, c.base);

					const r = Math.hypot(
						startW.x - centerW.x,
						startW.y - centerW.y
					);

					const sweep = g === 3 ? 1 : 0;
					const large = 0;

					contour.path +=
						` A${r} ${r} 0 ${large} ${sweep} ${endW.x} ${endW.y}`;

					cx = tx;
					cy = ty;
				}
			}
		});
			  
		

		console.log(result)
		svgStore.svgData = Object.assign({}, result)



	}


}

const svgStore = new SvgStore();
export default svgStore;

/*

	/*{
			"name": "new_plan",
			"width": 900,
			"height": 600,
			"quantity": 1,
			"presetId": 55,
			"presetName": "Steel_1.5",
			"positions": [
				{
					"part_id": 1,
					"part_code_id": "7f4cdcc4-103c-437e-9c17-69936aadc8f6",
					"selected": false,
					"positions": {
						"a": 1,
						"b": 0,
						"c": 0,
						"d": 1,
						"e": 375,
						"f": 225
					}
				}
			],
			"part_code": [
				{
					"id": "7f4cdcc4-103c-437e-9c17-69936aadc8f6",
					"uuid": "7f4cdcc4-103c-437e-9c17-69936aadc8f6",
					"name": "12___10__2",
					"code": [
						{
							"cid": 1,
							"class": "contour outer macro0 closed1",
							"path": "M75 0H150V150H0L0 0 75 0",
							"stroke": "red",
							"strokeWidth": 0.2,
							"selected": false
						},
						{
							"cid": 1,
							"class": "inlet outer macro0 closed1",
							"path": "",
							"stroke": "red",
							"strokeWidth": 0.2,
							"selected": false
						},
						{
							"cid": 1,
							"class": "outlet outer macro0 closed1",
							"path": "",
							"stroke": "lime",
							"strokeWidth": 0.2,
							"selected": false
						}
					],
					"part_id": 1,
					"papams": {
						"code": "",
						"uuid": ""
					},
					"width": 150,
					"height": 150
				}
			]
		}
*/


