import { makeAutoObservable, runInAction } from "mobx";
import SVGPathCommander from 'svg-path-commander';
import { toJS } from "mobx";
import utils from "../scripts/util";


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
		  const contours = part.code.filter(c => c.path && c.path.trim() !== '');
	  
		  // Разделяем по типу
		  const inlet = contours.find(c => c.class.includes('inlet'));
		  const contour = contours.find(c => c.class.includes('contour'));
		  const outlet = contours.find(c => c.class.includes('outlet') && c.path.trim() !== '');
	  
		  uniqueParts.set(partCodeId, {
			name: utils.uuid(),
			width: part.width,
			height: part.height,
			inlet,
			contour,
			outlet
		  });
		}
		let progNum = 1

		for (const [partCodeId, partInfo] of uniqueParts) {
		  const { name, inlet, contour, outlet } = partInfo;
  		  const instancesCount = data.positions.filter(p => p.part_code_id === partCodeId).length;
		  res.push(`(<Part PartCode="${name}" Debit="${instancesCount}">)`);
	  
		  res.push(`N${lineNumber} G28 X0.00 Y0.00 L${progNum}P1`);
		  progNum++
		  lineNumber++;
	  
		  // Последовательность: inlet → contour → outlet (только если есть path)
	  
 		  const sequence = [];
		  if (inlet) sequence.push(inlet);
		  if (contour) sequence.push(contour);
		  if (outlet) sequence.push(outlet);
	  
		  for (const cont of sequence) {
			//const blockLines = this.generateContourBlock(cont, lineNumber, cont === contour);
			//res.push(...blockLines);
			lineNumber += blockLines.length;
		  }
	   
		  // Завершение детали
		  res.push(`N${lineNumber} G98`);
		  lineNumber++;
	  
		  res.push('(</Part>)');
		}
	  
		return res;
	  }
	  
	  // Вспомогательная функция — генерация одного <Contour> блока
	  generateContourBlock(contour, startLine, isMainContour = false) {
		const lines = [];
		let n = startLine;
	  
		const commands = this.parseSvgPathToGCode(contour.path);
	  
		if (commands.length === 0) return lines; // пустой контур — ничего не генерируем
	  
		const startX = commands[0].x.toFixed(6);
		const startY = commands[0].y.toFixed(6);
	  
		// Перемещение к стартовой точке без резки
		lines.push(`N${n} G0 X${startX} Y${startY}`);
		n++;
	  
		// Выключить лазер
		lines.push(`N${n} G10 S0`);
		n++;
	  
		// Для основного контура (contour) — включаем компенсацию и lead-in
		if (isMainContour) {
		  // Если это inlet — он уже является lead-in, поэтому для contour просто начинаем резать
		  // Но если inlet отдельно — то здесь просто включаем лазер
		  lines.push(`N${n} G1 X${startX} Y${startY} M4`); // включить лазер
		  n++;
		  lines.push(`N${n} G42`); // компенсация вправо
		  n++;
		} else {
		  // Для inlet/outlet — тоже включаем лазер
		  lines.push(`N${n} G1 X${startX} Y${startY} M4`);
		  n++;
		  if (contour.class.includes('contour')) {
			lines.push(`N${n} G42`);
			n++;
		  }
		}
	  
		lines.push('(<Contour>)');
	  
		// Основные команды контура
		let currentX = commands[0].x;
		let currentY = commands[0].y;
	  
		for (let i = 0; i < commands.length; i++) {
		  const cmd = commands[i];
		  if (cmd.type === 'L') {
			lines.push(`N${n} G1 X${cmd.x.toFixed(6)} Y${cmd.y.toFixed(6)}`);
			currentX = cmd.x;
			currentY = cmd.y;
		  } else if (cmd.type === 'A') {
			// Дуга (Arc) — переводим в G2/G3
			// A rx ry x-axis-rotation large-arc-flag sweep-flag x y
			const next = commands[i + 1];
			if (next && next.type === 'L') {
			  const rx = cmd.rx;
			  const ry = cmd.ry;
			  const xRot = cmd.rot;
			  const large = cmd.large;
			  const sweep = cmd.sweep;
			  const endX = next.x;
			  const endY = next.y;
	  
			  // Упрощённо: если sweep=1 → G3 (по часовой), sweep=0 → G2
			  const gCode = sweep ? 'G3' : 'G2';
			  // Вычисляем центр дуги (очень упрощённо, для кругов rx=ry и rot=0)
			  if (rx === ry && xRot === 0) {
				const dx = endX - currentX;
				const dy = endY - currentY;
				const iOffset = large ? -sweep * dy / 2 : sweep * dy / 2;
				const jOffset = large ? sweep * dx / 2 : -sweep * dx / 2;
				lines.push(`N${n} ${gCode} X${endX.toFixed(6)} Y${endY.toFixed(6)} I${iOffset.toFixed(6)} J${jOffset.toFixed(6)}`);
			  } else {
				// сложный случай — fallback на G1
				lines.push(`N${n} G1 X${endX.toFixed(6)} Y${endY.toFixed(6)}`);
			  }
			  currentX = endX;
			  currentY = endY;
			  i++; // пропускаем следующий L
			}
		  }
		  n++;
		}
	  
		// Возврат в стартовую точку и выключение
		lines.push(`N${n} G1 X${startX} Y${startY} M5`);
		n++;
		lines.push(`N${n} G40`);
		n++;
	  
		lines.push('(</Contour>)');
	  
		return lines;
	  }
	  
	  // Улучшенный парсер SVG path с поддержкой дуг (A)
	  parseSvgPathToGCode(path) {
		if (!path) return [];
	  
		const commands = [];
		const tokens = path.trim().replace(/,/g, ' ').split(/\s+/);
		let i = 0;
		let currentX = 0, currentY = 0;
	  
		while (i < tokens.length) {
		  let token = tokens[i++];
	  
		  if (/^[MLHVAZ]$/i.test(token)) {
			const type = token.toUpperCase();
			if (type === 'M') {
			  currentX = parseFloat(tokens[i++]);
			  currentY = parseFloat(tokens[i++]);
			  commands.push({ type: 'M', x: currentX, y: currentY });
			} else if (type === 'L') {
			  currentX = parseFloat(tokens[i++]);
			  currentY = parseFloat(tokens[i++]);
			  commands.push({ type: 'L', x: currentX, y: currentY });
			} else if (type === 'A') {
			  const rx = parseFloat(tokens[i++]);
			  const ry = parseFloat(tokens[i++]);
			  const rot = parseFloat(tokens[i++]);
			  const large = parseFloat(tokens[i++]);
			  const sweep = parseFloat(tokens[i++]);
			  const x = parseFloat(tokens[i++]);
			  const y = parseFloat(tokens[i++]);
			  commands.push({ type: 'A', rx, ry, rot, large, sweep, x, y });
			  currentX = x;
			  currentY = y;
			}
		  } else {
			// число без команды — считаем L
			i--;
			currentX = parseFloat(tokens[i++]);
			currentY = parseFloat(tokens[i++]);
			commands.push({ type: 'L', x: currentX, y: currentY });
		  }
		}
	  
		// Убираем M, оставляем только траекторию
		return commands.filter(c => c.type !== 'M');
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

		let ncp = [...ncpStart, ...ncpPositons, ...ncpParts, ...ncpFinish]
		ncp.forEach((item) => { console.log(item) });

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



/*


%
(<NcpProgram Version="1.0" Units="Metric">)
(<MaterialInfo Label="Mild steel" MaterialCode="S235JR" Thickness="2" FormatType="Sheet" DimX="250" DimY="125"/>)
(<ProcessInfo CutTechnology="Laser" Clamping="False"/>)
(<Plan JobCode="1683027664_1683027633_0_23348__S235JR_2.0mm_1_owner">)
(<Plan>)
N1G29X110Y118P1H1A1
N2G52X10Y10L1C0
N3G99
(</Plan>)
(<Part PartCode="box" Debit="1">)
N4G28X100Y108L1P1
N5G0X50Y108
N6G10S0
N7G1X51.885618Y102.666667M4
N8G42
N9G2X50Y100I50J102
(<Contour>)
N10G1X0
N11Y0
N12X100
N13Y100
N14X50M5
N15G40
(</Contour>)
N16G98
(</Part>)
(</NcpProgram>)
&

*/