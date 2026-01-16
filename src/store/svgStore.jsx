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
		return

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
		//ncp.forEach((item) => { console.log(item) });

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

	line = (x2, y2, c ) => {
		const [rx2, ry2] = this.rotatePoint(x2, y2, c.base.X, c.base.Y, c.base.C);
		return ` L${rx2} ${ -ry2}`;
	};

	start = (x1, y1, c ) => {
		const [rx2, ry2] = this.rotatePoint(x1, y1, c.base.X, c.base.Y, c.base.C);
		return `M${rx2} ${ - ry2}`;
	};

	// Крест с поворотом
	cross = (x, y, size, c) => {
		const [rx, ry] = this.rotatePoint(x, y, c.base.X, c.base.Y, c.base.C);
		const yInv = - ry;
		return `M${rx - size} ${yInv - size} L${rx + size},${yInv + size} M${rx - size} ${yInv + size}L${rx + size} ${yInv - size}`;
	};

	// Арка с поворотом
	arcPath = (
		ex,
		ey,
		r,
		large,
		sweep,
		c,
 	) => {
		const [rxEnd, ryEnd] = this.rotatePoint(ex, ey, c.base.X, c.base.Y, c.base.C);
		return ` A${r} ${r} 0 ${large} ${1 - sweep} ${rxEnd} ${  - ryEnd}`;
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

	startToEdit( ncp ) {
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
		let macros= ''

		for (const c of cmds) {
			//console.log(JSON.stringify(c))

			if (c?.comment?.includes('PartCode')) {
				console.log('Part code start')
				cx = 0;
				cy = 0;

				currentPart = {
					id: result.part_code.length + 1,
					uuid: result.part_code.length + 1,
					name: "",
					code: [],
					height:0,
					width:0,
				};
				res=[]
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

				if ( !res[res.length-1].class.includes("inlet") )  {
					cid +=1
				}
	
				res.push({
						"cid": cid,
						"class": "contour inner "+ macros,
						"path": "",
						"stroke": "red",
						"strokeWidth": 0.2,
						"selected": false
				}) 
				
		 		res[res.length - 1].path = this.start(cx, cy, c );
				cx = tx; cy = ty;
				continue;


			} else if (c?.comment?.includes('</Contour>')) {

				console.log('Contour Start')
				//contourOpen = "after"
						
				res.push({
					"cid": cid,
					"class": " outlet inner"+ macros + " ",
					"path": "",
					"stroke": "red",
					"strokeWidth": 0.2,
					"selected": false
				})
				if (laserOn) res[res.length - 1].path = this.start(cx, cy, c );
				continue;				
			}

			if (typeof c.m === 'number') {

				/* if (!pendingBreakCircle) {
					if (c.m === 4) pendingBreakCircle = { type: 'in'};
					if (c.m === 5) pendingBreakCircle = { type: 'out'};
				} */

				if (c.m === 4 || c.m === 14 ) {
					console.log('laser on')
					laserOn = true;
					res[res.length - 1].path = this.start(cx, cy, c );
				}

				if (c.m === 5 || c.m === 15 ) {
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
				} else if ( g === 0 ) {

					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;
					
					if (contourOpen === "before") {
						cid+= 1
						res.push({
							"cid": cid,
							"class": " inlet inner" + macros + " ",
							"path": "",
							"stroke": "red",
							"strokeWidth": 0.2,
							"selected": false
						})						
 					} 
		

					res[res.length - 1].path = this.start(cx, cy, c);
					cx = tx; cy = ty;

				} else if ( g === 1) {

					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;
					res[res.length - 1].path += this.line(tx, ty, c);
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
					res[res.length - 1].path += this.arcPath(tx, ty, r, large, sweep, c);

					cx = tx; cy = ty;
				} else if (g === 10) {
					macros = ' macro' + c.params.S + ' '
					try {
						res[res.length - 1].class += macros	
					} catch (error) {
						console.log ("catch in macros")
					}
					//res[res.length - 1].class += macros

				} else if (g === 29) {

					//console.log('g === 29')


				} else if (g === 28) {
					// console.log('g === 28')
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
			const { X = 0, Y = 0, C = 0, L = 1 } = g.params;
			if (g.g === 28 || g.params.g === 28) {

			}
			if (g.g === 52 || g.params.g === 52) {
				// высота детали (bounding box с incut!)

				let part = result.part_code.filter( a  => a.id === Number(L))[0]
				//const partHeight = part.height
				//const partWidth = part.width
			
				if (g.g === 52 || g.params.g === 52) {

					const rad = (-C * Math.PI) / 180;
					const cos = Math.cos(rad);
					const sin = Math.sin(rad);
				
					result.positions.push({
						part_id: partPositionId++,
						part_code_id: Number(L),
						positions: {
							// M = R(+90° SVG) × R(-C)
							a:  sin,
							b: -cos,
							c:  cos,
							d:  sin,
							e: width  - Y,
							f: height - X
						}
					});
				}
	
			}
		});

		//console.log( toJS(result))
		//console.log(currentPart)
		svgStore.setGroupMatrix({a: 1, b:0,c: 0, d: 1, e: 0, f: 0});
		svgStore.setMatrix({a: 1, b:0,c: 0, d: 1, e: 0, f: 0});
		svgStore.svgData = Object.assign({}, result)

	}


}

const svgStore = new SvgStore();
export default svgStore;
