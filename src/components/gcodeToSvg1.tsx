import { useEffect, useRef, useState } from "react";
import svgPanZoom from "svg-pan-zoom";
import { Icon } from "@iconify/react";
import sampleListing from '../store/listing'


function toUnits(mm) {
	return mm
}

function normalizeAngle(a) {
	while (a > Math.PI) a -= 2 * Math.PI;
	while (a < -Math.PI) a += 2 * Math.PI;
	return a;
}

function makeGcodeParser() {
	let last = { g: undefined, m: undefined, params: {} };
	let base = { X: 0, Y: 0, C: 0 }; // базовые значения из строки перед Part code

	return function parseGcodeLine(raw) {
		let s = String(raw).trim();
		s = s.replace(/^\d+\s*/, '');

		const out = { n: undefined, g: undefined, m: undefined, params: {} };

		const commentMatch = s.match(/\(([^)]*)\)/);
		if (commentMatch) {
			out.comment = commentMatch[1];
			s = s.replace(/\([^)]*\)/g, ' ');
		}

		const nMatch = s.match(/N(\d+)/i);
		if (nMatch) out.n = parseInt(nMatch[1], 10);

		// G/M
		const gMatch = s.match(/G(-?\d+(?:\.\d+)?)/i);
		out.g = gMatch ? Number(gMatch[1]) : last.g;
		const mMatch = s.match(/M(-?\d+(?:\.\d+)?)/i);
		out.m = mMatch ? Number(mMatch[1]) : last.m;

		// Параметры
		const keys = ['X', 'Y', 'I', 'J', 'S', 'P', 'H', 'A', 'L', 'C'];
		for (const k of keys) {
			const r = new RegExp(`${k}(-?\\d+(?:\\.\\d+)?)`, 'i');
			const m = s.match(r);
			if (m) {
				out.params[k] = Number(m[1]);
			} else if (last.params[k] !== undefined) {
				out.params[k] = last.params[k];
			}
		}

		if (/(Part End)/i.test(s)) {
			out.base = { X: 0, Y: 0, C: 0 };
		}

		// Если это строка с G52 — сохраняем её как базовую
		if (/G52/i.test(s)) {
			base.X = out.params.X;
			base.Y = out.params.Y;
			base.C = out.params.C;
			out.base = base
		} else {
			out.base = { ...base }
		}

		// Обновляем last
		last.g = out.g;
		last.m = out.m;
		last.params = { ...last.params, ...out.params };
		//console.log(out)
		return out;
	};
}


const GCodeToSvg1 = () => {

	const containerRef = useRef<HTMLDivElement | null>(null);
	const cutSeg = 10;
	const panZoomRef = useRef(null);
	const [listing, setListing] = useState("");
	const [width, setwidth] = useState("1300");
	const [height, setHeigth] = useState("650");


	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			setListing(sampleListing);
		}, 2000);

		fetch("http://192.168.11.251/gcore/0/listing", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId);
				setListing(data || sampleListing);
			})
			.catch(() => {
				clearTimeout(timeoutId);
				setListing(sampleListing);
			});

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	}, [])

	useEffect(() => {
		if (!containerRef.current || !listing) return;
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
	}, [listing]);

	const fit = () => {
		if (!panZoomRef.current) return;
		panZoomRef.current.fit();
		panZoomRef.current.center();
	};

	const zoom = (dir: string) => {
		if (!panZoomRef.current) return;
		dir === "+" ? panZoomRef.current.zoomIn() : panZoomRef.current.zoomOut();
	};

	// Дописанная версия getPath для сборки массива путей (PathData)
	const getPath = () => {
		const parseGcodeLine = makeGcodeParser();
		const lines = listing.trim().split(/\n+/);
		const cmds = lines.map(parseGcodeLine);

		let cx = 0, cy = 0;
		let laserOn = false;
		let pendingBreakCircle = null;
		let partStarted = false;
		let res = []; // массив путей
		let newPath = { path: '', n: [0, 0], className: '' };

		const line = (x1, y1, x2, y2) => `L${x2} ${y2}`;
		const cross = (x, y, size) => `M${x - size},${y - size}L${x + size},${y + size}M${x - size},${y + size}L${x + size},${y - size}`;
		const arcPath = (sx, sy, ex, ey, r, large, sweep) => `A${r},${r} 0,${large},${sweep} ${ex},${ey}`;

		for (const c of cmds) {
			if ( c?.comment?.includes('Part code')) {
		 		partStarted = true;
			/*	if (newPath.path) res.push({ ...newPath });
				newPath = { path: '', n: [c.n ?? 0, c.n ?? 0], className: '' };
				continue; */
			} else if (c?.comment?.includes('Part end')) {
				partStarted = false;
				if (newPath.path) res.push({ ...newPath });
				newPath = { path: '', n: [0, 0], className: '' };
				continue;
			}

			if (typeof c.m === 'number') {
				if (!pendingBreakCircle) {
					if (c.m === 4) pendingBreakCircle = { type: 'in', n: c.n };
					if (c.m === 5) pendingBreakCircle = { type: 'out', n: c.n };
				}
				if (c.m === 4) laserOn = true;
				if (c.m === 5) laserOn = false;
			}

			const cls = laserOn ? `sgn_mv sgn_mv${c.g} gline_${c.n ?? 0}` : `sgn_fm gline_${c.n ?? 0}`;
			newPath.className = cls;

			if (typeof c.g === 'number') {
				const g = Math.floor(c.g);
				if (g === 4) {
					newPath.path += cross(cx + c.base.X, cy + c.base.Y, mjl);
					continue;
				}
				if (g === 0 || g === 1) {
					const tx = (c.params.X !== undefined) ? toUnits(c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? toUnits(c.params.Y) : cy;
					if (!newPath.path) newPath.path = `M${cx + c.base.X} ${cy + c.base.Y}`;
					newPath.path += line(cx + c.base.X, cy + c.base.Y, tx + c.base.X, ty + c.base.Y);
					cx = tx; cy = ty;
				} else if (g === 2 || g === 3) {
					const tx = (c.params.X !== undefined) ? toUnits(c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? toUnits(c.params.Y) : cy;
					const ci = (c.params.I !== undefined) ? toUnits(c.params.I) : 0;
					const cj = (c.params.J !== undefined) ? toUnits(c.params.J) : 0;
					const dxs = cx - (cx + ci);
					const dys = cy - (cy + cj);
					const dxe = tx - (cx + ci);
					const dye = ty - (cy + cj);
					let r = Math.round((Math.hypot(tx - ci, ty - cj)) * 1000) / 1000;
					const a1 = Math.atan2(dys, dxs);
					const a2 = Math.atan2(dye, dxe);
					let d = normalizeAngle(a2 - a1);
					const ccw = (g === 3);
					if (ccw && d < 0) d += 2 * Math.PI;
					if (!ccw && d > 0) d -= 2 * Math.PI;
					const large = 0;
					const sweep = ccw ? 1 : 0;
					if (!newPath.path) newPath.path = `M${cx + c.base.X} ${cy + c.base.Y}`;
					newPath.path += arcPath(cx + c.base.X, cy + c.base.Y, tx + c.base.X, ty + c.base.Y, r, large, sweep);
					cx = tx; cy = ty;
				} else if ( g === 29) {
					newPath.path = `M${0} ${0}`;
				}
			}
		}

		if (newPath.path) res.push({ ...newPath });
		return res;
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
				{/* SVG */}
				<svg
					width={width}
					height={height}
					baseProfile="full"
					viewBox={`${0} ${0} ${width} ${height}`}
					style={{ overflow: "visible" }}
					xmlns="http://www.w3.org/2000/svg"
				>
					<g className="svg-pan-zoom_viewport">
						<g className="sgn_main_pv" style={{ transformOrigin: "center" }}>
							<rect
								className="sgn_sheet"
								x={0}
								y={0}
								width={width}
								height={height}
								fill="url(#grid_pattern)"
							/>
							<g
								className="sgn_main_els"
								style={{ fill: "none", strokeWidth: 1, stroke: "red" }}
							>
								{getPath().map((a, i) => {
									const { path, className, n } = a;
									return (
										<path
											d={path}
											key={i}
											className={
												className +

													(n[0] < cutSeg && cutSeg < n[1])
													?
													" currentCut "
													:
													n[0] < cutSeg ? " cutted " : " uncutted "
											}
										/>
									)
								})
								}
							</g>
						</g>
					</g>
				</svg>
			</div>
		</div>

	);
};

export default GCodeToSvg1;


