import React, { useEffect, useRef, useState } from "react";
import svgPanZoom from "svg-pan-zoom";
import SampleSvg from "../store/sampleSvg";
import { Icon } from "@iconify/react";
import parse from "html-react-parser";

const listing: string = `1N1G29X3000Y1250P0H4A1
2N2G52X2485.319600Y863.913800L3C270.000000
3(Part code="1611802418161421297775id30mm506sht")
4N113G28X476Y134L3P38
5N114G0X70Y120
6N115G10S0
7M4
8N116G1X70.987802Y119.052917
9N117G41
10N118G3X73.058165Y119.894056I71.834899J119.936434
11N119G1X73.06Y120
12N120G3X66.94I70J120
13N121X73.058165Y119.894056
14M5
15N122G40
16N123G0X126Y120
17N124G10S0
18M4
19N125G1X126.987802Y119.052917
20N126G41
21N127G3X129.058165Y119.894056I127.834899J119.936434
22N128G1X129.06Y120
23N129G3X122.94I126J120
24N130X129.058165Y119.894056
25M5
26N131G40
27N132G0X182Y120
28N133G10S0
29M4
30N134G1X182.987802Y119.052917
31N135G41
32N136G3X185.058165Y119.894056I183.834899J119.936434
33N137G1X185.06Y120
34N138G3X178.94I182J120
35N139X185.058165Y119.894056
36M5
37N140G40
38N141G0X238Y120
39N142G10S0
40M4
41N143G1X238.987802Y119.052917
42N144G41
43N145G3X241.058165Y119.894056I239.834899J119.936434
44N146G1X241.06Y120
45N147G3X234.94I238J120
46N148X241.058165Y119.894056
47M5
48N149G40
49N150G0X294Y120
50N151G10S0
51M4
52N152G1X294.987802Y119.052917
53N153G41
54N154G3X297.058165Y119.894056I295.834899J119.936434
55N155G1X297.06Y120
56N156G3X290.94I294J120
57N157X297.058165Y119.894056
58M5
59N158G40
60N159G0X350Y120
61N160G10S0
62M4
63N161G1X350.987802Y119.052917
64N162G41
65N163G3X353.058165Y119.894056I351.834899J119.936434
66N164G1X353.06Y120
67N165G3X346.94I350J120
68N166X353.058165Y119.894056
69M5
70N167G40
71N168G0X406Y120
72N169G10S0
73M4
74N170G1X406.987802Y119.052917
75N171G41
76N172G3X409.058165Y119.894056I407.834899J119.936434
77N173G1X409.06Y120
78N174G3X402.94I406J120
79N175X409.058165Y119.894056
80M5
81N176G40
82N177G0X462Y120
83N178G10S0
84M4
85N179G1X461.087684Y118.98
86N180G41
87N181G3X462Y116.94I462J118.164
88N182X465.06Y120J120
89N183X458.94
90N184X462Y116.94
91M5
92N185G40
93N186G0Y67
94N187G10S0
95M4
96N188G1X461.087684Y65.98
97N189G41
98N190G3X462Y63.94J65.164
99N191X465.06Y67J67
100N192X458.94
101N193X462Y63.94
102M5
103N194G40
104N195G0Y14
105N196G10S0
106M4
107N197G1X460.949025Y14.876454
108N198G41
109N199G3X458.941835Y13.894056I460.165101J13.936434
110N200X465.06Y14I462J14
111N201X458.94
112N202G1X458.941835Y13.894056
113M5
114N203G40
115N204G0X406Y14
116N205G10S0
117M4
118N206G1X404.949025Y14.876454
119N207G41
120N208G3X402.941835Y13.894056I404.165101J13.936434
121N209X409.06Y14I406J14
122N210X402.94
123N211G1X402.941835Y13.894056
124M5
125N212G40
126N213G0X350Y14
127N214G10S0
128M4
129N215G1X348.949025Y14.876454
130N216G41
131N217G3X346.941835Y13.894056I348.165101J13.936434
132N218X353.06Y14I350J14
133N219X346.94
134N220G1X346.941835Y13.894056
135M5
136N221G40
137N222G0X294Y14
138N223G10S0
139M4
140N224G1X292.949025Y14.876454
141N225G41
142N226G3X290.941835Y13.894056I292.165101J13.936434
143N227X297.06Y14I294J14
144N228X290.94
145N229G1X290.941835Y13.894056
146M5
147N230G40
148N231G0X238Y14
149N232G10S0
150M4
151N233G1X236.949025Y14.876454
152N234G41
153N235G3X234.941835Y13.894056I236.165101J13.936434
154N236X241.06Y14I238J14
155N237X234.94
156N238G1X234.941835Y13.894056
157M5
158N239G40
159N240G0X182Y14
160N241G10S0
161M4
162N242G1X180.949025Y14.876454
163N243G41
164N244G3X178.941835Y13.894056I180.165101J13.936434
165N245X185.06Y14I182J14
166N246X178.94
167N247G1X178.941835Y13.894056
168M5
169N248G40
170N249G0X126Y14
171N250G10S0
172M4
173N251G1X124.949025Y14.876454
174N252G41
175N253G3X122.941835Y13.894056I124.165101J13.936434
176N254X129.06Y14I126J14
177N255X122.94
178N256G1X122.941835Y13.894056
179M5
180N257G40
181N258G0X70Y14
182N259G10S0
183M4
184N260G1X68.949025Y14.876454
185N261G41
186N262G3X66.941835Y13.894056I68.165101J13.936434
187N263X73.06Y14I70J14
188N264X66.94
189N265G1X66.941835Y13.894056
190M5
191N266G40
192N267G0X14Y14
193N268G10S0
194M4
195N269G1X15.366354Y14.076144
196N270G41
197N271G3X16.163747Y16.163747I15.298248J15.298248
198N272X10.94Y14I14J14
199N273X17.06
200N274X16.163747Y16.163747
201M5
202N275G40
203N276G0X27Y67
204N277G10S0
205M4
206N278G1X25.333333Y68.490712
207N279G41
208N280G3X22Y67I24J67
209N281G1Y27
210N282G3X27Y22I27J27
211N283G1X449
212N284G3X454Y27I449
213N285G1Y107
214N286G3X449Y112J107
215N287G1X27
216N288G3X22Y107I27
217N289G1Y67
218M5
219N290G40
220N291G0X14
221N292G10S0
222M4
223N293G1X14.912316Y68.02
224N294G41
225N295G3X14Y70.06I14J68.836
226N296X10.94Y67J67
227N297X17.06
228N298X14Y70.06
229M5
230N299G40
231N300G0Y120
232N301G10S0
233M4
234N302G1X12.796991Y119.347705
235N303G41
236N304G3X12.967368Y117.119501I13.380421J118.271701
237N305X17.06Y120I14J120
238N306X10.94
239N307X12.967368Y117.119501
240M5
241N308G40
242N309G0X2.32233Y131.67767
243N310G10S0
244M4
245N311G1X4.554934Y131.553251
246N312G42
247N313G2X5.857864Y128.142136I4.443651J129.556349
248N314G3X0Y114I20J114
249N315G1Y20
250N316G3X20Y0J20
251N317G1X456
252N318G3X476Y20I456
253N319G1Y114
254N320G3X456Y134J114
255N321G1X20
256N322G3X5.857864Y128.142136I20
257M5
258N323G40
259(Part End)
260N3G99`


function toUnits(mm, pulsesPerMM) {
	// Используем безопасное целочисленное деление вместо побитового сдвига для больших чисел
	return mm
	return Math.floor((mm * pulsesPerMM) / 4);
}

/** Нормализация угла в интервал [-PI, PI] */
function normalizeAngle(a) {
	while (a > Math.PI) a -= 2 * Math.PI;
	while (a < -Math.PI) a += 2 * Math.PI;
	return a;
}

function parseGcodeLine(raw) {
	// Пример входа может начинаться с «1N1...», где первая цифра — просто номер строки файла
	let s = String(raw).trim();
	// Удаляем возможный префикс «число» перед N
	s = s.replace(/^\d+\s*/, '');

	const out = { n: undefined, g: undefined, m: undefined, params: {} };

	// Вырезаем комментарии в круглых скобках (но сохраним как out.comment)
	const commentMatch = s.match(/\(([^)]*)\)/);
	if (commentMatch) {
		out.comment = commentMatch[1];
		s = s.replace(/\([^)]*\)/g, ' ');
	}

	// N-номер
	const nMatch = s.match(/N(\d+)/i);
	if (nMatch) out.n = parseInt(nMatch[1], 10);

	// Основные коды G/M (берём первый встреченный каждого типа)
	const gMatch = s.match(/G(-?\d+(?:\.\d+)?)/i);
	if (gMatch) out.g = Number(gMatch[1]);
	const mMatch = s.match(/M(-?\d+(?:\.\d+)?)/i);
	if (mMatch) out.m = Number(mMatch[1]);

	// Параметры осей и центров
	const keys = ['X', 'Y', 'I', 'J', 'S', 'P', 'H', 'A', 'L', 'C'];
	for (const k of keys) {
		const r = new RegExp(`${k}(-?\\d+(?:\\.\\d+)?)`, 'i');
		const m = s.match(r);
		if (m) out.params[k] = Number(m[1]);
	}
	//console.log (out)

	return out;
}

function gcodeGenSVG(lines, opts = {}) {
	const svgId = opts.svgId || null;
	const noRealSize = !!opts.noRealSize;
	const pulsesPerMM = typeof opts.pulsesPerMM === 'number' ? opts.pulsesPerMM : 1000;
	let sheetDim = opts.sheetDim ? { ...opts.sheetDim } : null;

	// Парсим все строки сразу
	const cmds = lines.map(parseGcodeLine);

	// Если sheetDim не задан, попробуем вытащить из первой G29 с X/Y
	if (!sheetDim) {
		const g29 = cmds.find(c => c.g === 29 && c.params && (c.params.X || c.params.Y));
		if (g29 && g29.params.X && g29.params.Y) {
			sheetDim = { x: g29.params.X, y: g29.params.Y };
		}
	}
	// Значения по умолчанию, если не удалось определить
	if (!sheetDim) sheetDim = { x: 3000, y: 1500 };

	// Геометрия листа
	const x0 = 0, y0 = 0;
	const x1 = sheetDim.x, y1 = sheetDim.y;
	const dimx = x1 - x0;
	const dimy = y1 - y0;

	// Перевод в «устройства» для viewBox и контура листа, как в C-версии
	const vx0 = toUnits(x0, pulsesPerMM);
	const vy0 = toUnits(y0, pulsesPerMM);
	const vx1 = toUnits(x1, pulsesPerMM);
	const vy1 = toUnits(y1, pulsesPerMM);

	// Толщина обводки равна pulsesPerMM (см. C-код) — применим к стилю группы контуров
	const strokeWidth = '1px'//pulsesPerMM;

	// Параметры маркеров
	const ddr = Math.floor((3 * pulsesPerMM) / 4); // как ddr в C (3 * pulses >> 2)
	let mjl = Math.max((Math.max(dimx, dimy) * 0.005), 5); // мм
	mjl = Math.floor((mjl * pulsesPerMM) / 4); // в «устройствах»

	// Сборка SVG по строкам
	const out = [];
	const push = (s) => out.push(s);

	push('<?xml version="1.0" encoding="utf-8" ?>');
	let attrs = [`baseProfile="full"`];
	if (svgId) attrs.push(`id="${svgId}"`);
	if (!noRealSize) attrs.push(`width="${dimx.toFixed(2)}" height="${dimy.toFixed(2)}"`);
	attrs.push(`viewBox="${vx0} ${vy0} ${vx1} ${vy1}"`);
	attrs.push(`style="overflow:visible;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:ev="http://www.w3.org/2001/xml-events" xmlns:xlink="http://www.w3.org/1999/xlink"`);
	push(`<svg ${attrs.join(' ')}>`);
	push(`<g class="svg-pan-zoom_viewport">`);
	push(`<g class="sgn_main_pv" style="transform: scale(1,-1);transform-origin: center;">`);
	push(`<rect class="sgn_sheet" x="${vx0}" y="${vy0}" width="${vx1}" height="${vy1}"/>`);
	push(`<g class="sgn_main_els" style="fill:none;stroke-width:${strokeWidth};stroke:red;">`);

	// Состояние траекторий
	let cx = vx0, cy = vy0; // текущая точка (в "устройствах"); допустим старт = (0,0)
	let laserOn = false;     // аналог line->laseron
	let pendingBreakCircle = null; // M4/M5 кружки в точке до следующего движения

	// Хелперы рисования
	const circ = (x, y, rPct, cls) => push(`<circle cx="${x}" cy="${y}" r="${rPct}%" class="${cls}"/>`);
	const line = (x1, y1, x2, y2, cls) => push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="${cls}"/>`);
	const cross = (x, y, size, cls) => {
		push(`<path d="M${x - size},${y - size}L${x + size},${y + size}M${x - size},${y + size}L${x + size},${y - size}" class="${cls}"/>`);
	};
	const arcPath = (sx, sy, ex, ey, r, large, sweep, cls) => {
		push(`<path d="M${sx},${sy}A${r},${r} 0,${large},${sweep} ${ex},${ey}" class="${cls}"/>`);
	};

	// Обход команд
	for (const c of cmds) {
		// Комментарии вида (Part ...) нам не мешают — игнорируем в геометрии

		// Обработка M-кодов (до движений)
		if (typeof c.m === 'number') {
			if (!pendingBreakCircle) {
				if (c.m === 4) { // начало реза
					pendingBreakCircle = { type: 'in', n: c.n };
				} else if (c.m === 5) { // конец реза
					pendingBreakCircle = { type: 'out', n: c.n };
				}
			}
			// Смена состояния лазера (предположительно)
			if (c.m === 4) laserOn = true;
			if (c.m === 5) laserOn = false;
		}

		// Обработка G-кодов
		if (typeof c.g === 'number') {
			const g = Math.floor(c.g);

			// Моментальные маркеры «breaking»: G4 — как в C ведём крест и сбрасываем флаг
			if (g === 4) {
				cross(cx, cy, mjl, 'sgn_mj');
				// После специального маркера не двигаем точку
				continue;
			}

			// Если был M4/M5 до движения — выведем маленький кружок один раз
			if (pendingBreakCircle) {
				if (pendingBreakCircle.type === 'in') {
					circ(cx, cy, 0.15, `sgn_brk sgn_incut gline_${c.n ?? 0}`);
				} else {
					circ(cx, cy, 0.1, `sgn_brk sgn_cutend gline_${c.n ?? 0}`);
				}
				pendingBreakCircle = null;
			}

			// Класс стиля в зависимости от "рез/холостой"
			const cls = laserOn ? `sgn_mv sgn_mv${g} gline_${c.n ?? 0}` : `sgn_fm gline_${c.n ?? 0}`;

			if (g === 0 || g === 1) {
				// Линейное перемещение
				const tx = (c.params.X !== undefined) ? toUnits(c.params.X, pulsesPerMM) : cx;
				const ty = (c.params.Y !== undefined) ? toUnits(c.params.Y, pulsesPerMM) : cy;
				line(cx, cy, tx, ty, cls);
				cx = tx; cy = ty;
			} else if (g === 2 || g === 3) {
				// Дуговое перемещение по центру I/J (версия без R-параметра)
				const tx = (c.params.X !== undefined) ? toUnits(c.params.X, pulsesPerMM) : cx;
				const ty = (c.params.Y !== undefined) ? toUnits(c.params.Y, pulsesPerMM) : cy;
				const ci = (c.params.I !== undefined) ? toUnits(c.params.I, pulsesPerMM) : 0;
				const cj = (c.params.J !== undefined) ? toUnits(c.params.J, pulsesPerMM) : 0;
				const cx0 = cx + ci; // центр в «устройствах»
				const cy0 = cy + cj;
				const dxs = cx - cx0;
				const dys = cy - cy0;
				const dxe = tx - cx0;
				const dye = ty - cy0;
				const rs = Math.hypot(dxs, dys);
				const re = Math.hypot(dxe, dye);
				//const r = Math.round((rs + re) / 2); // усредняем радиус на всякий случай

				let r = (Math.hypot(tx - ci, ty - cj));
				// Углы старта/финиша
				const a1 = Math.atan2(dys, dxs);
				const a2 = Math.atan2(dye, dxe);
				let d = normalizeAngle(a2 - a1);
				const ccw = (g === 3);
				if (ccw && d < 0) d += 2 * Math.PI;
				if (!ccw && d > 0) d -= 2 * Math.PI;
				const large = 0//(Math.abs(d) > Math.PI) ? 1 : 0;
				//const sweep = ccw ? 1 : 0;
				const sweep = g === 3 ? 1 : 0;
				arcPath(cx, cy, tx, ty, r, large, sweep, cls);
				cx = tx; cy = ty;
			} else if (g === 41 || g === 42 || g === 40) {
				// Компенсация инструмента — геометрию здесь не меняем
				// Ничего не рисуем
			} else if (g === 28 || g === 52 || g === 99) {
				// Служебные — в визуализацию не добавляем (дом, смещения, окончание и пр.)
			} else {
				// Неизвестное G — пропустим молча (в C-версии могли бы ставить предупреждение)
			}
		}
	}

	// Закрывающие теги
	push('</g>'); // .sgn_main_els
	push('</g>'); // .sgn_main_pv
	push('</g>'); // .svg-pan-zoom_viewport
	push('</svg>');

	return out.join('\n');
}



const GCodeToSvg1 = () => {

	const containerRef = useRef<HTMLDivElement | null>(null);
	const panZoomRef = useRef(null);
	const [svg, setSvg] = useState("");

	useEffect(() => {

		setSvg(gcodeGenSVG(listing.trim().split(/\n+/), { svgId: 'xui', pulsesPerMM: 1000 }))

	}, [])

	useEffect(() => {
		if (!containerRef.current || !svg) return;
		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;

		// Удаляем старый инстанс
		if (panZoomRef.current) {
			try {
				panZoomRef.current.destroy();
			} catch (e) {
				console.warn("Ошибка destroy:", e);
			}
			panZoomRef.current = null;
		}

		const panZoomInstance = svgPanZoom(svgElement, {
			zoomEnabled: true,
			controlIconsEnabled: false,
			fit: true,
			center: true,
			minZoom: 0.1,
			maxZoom: 20,
		});

		panZoomRef.current = panZoomInstance;

		setTimeout(() => {
			panZoomInstance.resize();
			panZoomInstance.fit();
			panZoomInstance.center();
		}, 0);

		return () => {
			try {
				panZoomInstance.destroy();
			} catch (e) {
				console.warn("Ошибка destroy:", e);
			}
		};
	}, [svg]);

	const fit = () => {
		if (!panZoomRef.current) return;
		panZoomRef.current.fit();
		panZoomRef.current.center();
	};

	const zoom = (dir: string) => {
		if (!panZoomRef.current) return;
		dir === "+" ? panZoomRef.current.zoomIn() : panZoomRef.current.zoomOut();
	};


	return (
		<div
			style={{
				border: "2px solid grey",
				borderRadius: "10px",
				width: "1300px",
				height: "650px",
				touchAction: "none", // 🔥 обязательно для pinch
				position: "relative",
			}}
		>
			{/* Кнопки */}
			<div className="d-flex flex-column position-absolute">
				<div className="mx-2 mt-1">
					<button
						onClick={fit}
						className={`violet_button navbar_button small_button40`} >
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="carbon:zoom-fit"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
				<div className="mx-2 mt-1">
					<button
						onClick={() => zoom('-')}
						className={`violet_button navbar_button small_button40`} >
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="carbon:zoom-out"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
				<div className="mx-2 mt-1">
					<button
						onClick={() => zoom('+')}
						className={`violet_button navbar_button small_button40`} >
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="carbon:zoom-in"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
			</div>

			{/* SVG */}
			<div
				id="workarea"
				ref={containerRef}
				style={{
					border: "none",
					width: "1300px",
					height: "650px",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{parse(svg)}
			</div>
		</div>

	);
};

export default GCodeToSvg1;

