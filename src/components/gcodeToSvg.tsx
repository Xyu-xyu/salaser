import { useEffect, useRef, useState, ReactNode } from "react";
import svgPanZoom from "svg-pan-zoom";
import { Icon } from "@iconify/react";
//import sampleListing from '../store/listing'
import constants from "../store/constants";
import { observer } from "mobx-react-lite";
import laserStore from "../store/laserStore";
import utils from "../scripts/util";
import { Form } from "react-bootstrap";
import { showToast } from "./toast";
import { useTranslation } from 'react-i18next';
import macrosStore from "../store/macrosStore";
import Hammer from "hammerjs";

interface CustomEventsHandler {
	haltEventListeners: string[];
	hammer?: HammerManager;
	init: (options: { instance: ReturnType<typeof svgPanZoom>; svgElement: SVGSVGElement }) => void;
	destroy: () => void;
}



interface PathItem {
	path: string;
	className: string;
	n: number[];
}


const GCodeToSvg = observer(() => {

	const { loadResult } = laserStore
	const { isVertical } = macrosStore
	const containerRef = useRef<HTMLDivElement | null>(null);
 	const panZoomRef = useRef<any>(null);
	const [listing, setListing] = useState("");
	const data = JSON.parse(loadResult)
	const width = (isVertical ? Number(data.result.jobinfo.attr?.dimy) : Number(data.result.jobinfo.attr?.dimx) )|| (isVertical? 1500 : 3000);
	const height = (isVertical ? Number(data.result.jobinfo.attr?.dimx) : Number(data.result.jobinfo.attr?.dimy) ) || (isVertical? 3000 : 1500);
	const [cutSeg, setCutSeg] = useState(0);
	const [paths, setPaths] = useState<PathItem[]>([]);//useState([]);
	const [labels, setLabels] = useState<ReactNode[]>([]); // Храним готовые метки
	let groupRefs = useRef<SVGGElement[]>([]); // Рефы на группы
	const { t } = useTranslation()

	useEffect(() => {
		update()
	}, [])

	useEffect(() => {
		setCutSeg(0)
		setLabels([])
		update()
	}, [loadResult])

	useEffect(() => {
		if (!paths) return;
		setLabels(generateLabels())
	}, [paths]);

	useEffect(() => {
		if (!containerRef.current || !listing) return;
		const svgElement = containerRef.current.querySelector("svg");
		if (!svgElement) return;
		setPaths(getPath())
		if (panZoomRef.current) {
			try {
				panZoomRef.current.destroy();
			} catch (e) {
				console.warn("Ошибка destroy:", e);
			}
			panZoomRef.current = null;
		}

		const eventsHandler: CustomEventsHandler = {
			haltEventListeners: ["touchstart", "touchend", "touchmove", "touchleave", "touchcancel"],

			init(options) {
				const instance = options.instance;
				const svgElement = options.svgElement;
				let initialScale = 1;
				let pannedX = 0;
				let pannedY = 0;

				// Создаем Hammer и сохраняем в this.hammer
				this.hammer = new Hammer(svgElement);
				this.hammer.get("pinch").set({ enable: true });

				this.hammer.on("panstart panmove", (ev) => {
					if (ev.type === "panstart") {
						pannedX = 0;
						pannedY = 0;
					}
					instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY });
					pannedX = ev.deltaX;
					pannedY = ev.deltaY;
				});

				this.hammer.on("pinchstart pinchmove", (ev) => {
					if (ev.type === "pinchstart") initialScale = instance.getZoom();
					instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y });
				});

				this.hammer.on("doubletap", () => instance.zoomIn());

				svgElement.addEventListener("touchmove", (e) => e.preventDefault(), { passive: false });
			},

			destroy() {
				this.hammer?.destroy();
			},
		};

		const panZoomInstance = svgPanZoom(svgElement, {
			zoomEnabled: true,
			controlIconsEnabled: false,
			fit: true,
			center: true,
			minZoom: 0.1,
			maxZoom: 20,
			zoomScaleSensitivity: 0.4,
			customEventsHandler: eventsHandler,
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

	const  update = async () => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
			controller.abort();
			//setListing(sampleListing);
		}, 2000);

		try {
			const controller = new AbortController();		  
			const response = await fetch( constants.SERVER_URL + "/api/loadresult", {
			  signal: controller.signal,
			});
		  
			if (!response.ok) {
			  throw new Error(`Ошибка сети: ${response.status} ${response.statusText}`);
			}
		  
			const textData = await response.text();
		  
			// Сравниваем с текущим состоянием
			if (textData !== JSON.stringify(loadResult)) {
			  laserStore.setVal('loadResult', textData);
			}
		  } catch (error: any) {
			if (error.name === 'AbortError') {
			  console.warn("Запрос был отменён");
			} else {
			  showToast({
				type: 'error',
				message: "loadresult error",
				position: 'bottom-right',
				autoClose: 2500
			});
			console.log ( "loadresult error:"+ error.message || error,)		  
			}
		  }

		fetch( constants.SERVER_URL + "/api/listing", {
			signal: controller.signal,
		})
			.then((r) => r.text())
			.then((data) => {
				clearTimeout(timeoutId);
				setListing(utils.extractGcodeLines(data)  /*|| sampleListing*/);
			})
			.catch(() => {
				clearTimeout(timeoutId);
				//setListing(sampleListing);
			});

		return () => {
			clearTimeout(timeoutId);
			controller.abort();
		};
	}

	const fit = () => {
		if (!panZoomRef.current) return;
		panZoomRef.current.fit();
		panZoomRef.current.center();
	};

	const zoom = (dir: string) => {
		if (!panZoomRef.current) return;
		dir === "+" ? panZoomRef.current.zoomIn() : panZoomRef.current.zoomOut();
	};

	const getPath = () => {
		//console.log(' getPath ')
		const parseGcodeLine = utils.makeGcodeParser();
		const lines = listing.trim().split(/\n+/);
		const cmds = lines.map(parseGcodeLine);
		//console.log (cmds)

		let cx = 0, cy = 0;
		let laserOn = false;
		let partOpen = false
		console.log (laserOn)
		//let pendingBreakCircle = null;
		let res = []; // массив путей

		// Функция поворота точки вокруг центра (c.base.X, c.base.Y) на угол c.base.C
		const rotatePoint = (
			x: number,
			y: number,
			cx: number,
			cy: number,
			angleDeg: number
		): [number, number] => {
			const theta = (angleDeg * Math.PI) / 180; // переводим угол в радианы
			const dx = x - cx;
			const dy = y - cy;

			const xRot = cx + dx * Math.cos(theta) - dy * Math.sin(theta);
			const yRot = cy + dx * Math.sin(theta) + dy * Math.cos(theta);

			return [xRot, yRot];
		};

		// Линия с учётом поворота и инверсии Y
		const line = (x2: number, y2: number, c: any, height: number) => {
			const [rx2, ry2] = rotatePoint(x2, y2, c.base.X, c.base.Y, c.base.C);
			return `L${rx2} ${height - ry2}`;
		};

		const start = (x1: number, y1: number, c: any, height: number) => {
			const [rx2, ry2] = rotatePoint(x1, y1, c.base.X, c.base.Y, c.base.C);
			return `M${rx2} ${height - ry2}`;
		};

		// Крест с поворотом
		const cross = (x: number, y: number, size: number, c: any, height: number) => {
			const [rx, ry] = rotatePoint(x, y, c.base.X, c.base.Y, c.base.C);
			const yInv = height - ry;
			return `M${rx - size},${yInv - size}L${rx + size},${yInv + size}M${rx - size},${yInv + size}L${rx + size},${yInv - size}`;
		};

		// Арка с поворотом
		const arcPath = (
			ex: number,
			ey: number,
			r: number,
			large: number,
			sweep: number,
			c: any,
			height: number
		) => {
			const [rxEnd, ryEnd] = rotatePoint(ex, ey, c.base.X, c.base.Y, c.base.C);
			return `A${r},${r} 0,${large},${1 - sweep} ${rxEnd},${height - ryEnd}`;
		};

		//console.log(cmds)

		for (const c of cmds) {
			if (c?.comment?.includes('Part code')) {
				// console.log('Part code')
				partOpen = true
				res[res.length - 1].className += " groupStart "
				continue;

			} else if (c?.comment?.includes('Part End')) {
				// console.log('Part End')
				// тут уходим от относительных координат к абс...
				partOpen = false
				res[res.length - 1].className += " groupEnd "

				cx = cx + (c.base && c.base.X ||0)
				cy = cy + (c.base && c.base.Y ||0) 
				continue;
			}

			if (typeof c.m === 'number') {

				/* if (!pendingBreakCircle) {
					if (c.m === 4) pendingBreakCircle = { type: 'in', n: c.n };
					if (c.m === 5) pendingBreakCircle = { type: 'out', n: c.n };
				} */

				if (c.m === 4) {
					// console.log('laser on')
					laserOn = true;
					res[res.length - 1].className += " laserOff "
					res.push({ path: '', n: [Infinity, -Infinity], className: '' })
					res[res.length - 1].path = start(cx + (c.base && c.base.X ||0), cy + (c.base && c.base.Y ||0), c, height);
				}

				if (c.m === 5) {
					// console.log('laser off')
					laserOn = false;
					res[res.length - 1].className += " laserOn "
					res.push({ path: '', n: [Infinity, -Infinity], className: '' })
					res[res.length - 1].path = start(cx + (c.base && c.base.X ||0), cy + (c.base && c.base.Y ||0), c, height);

				}
			}

			if (typeof c.g === 'number') {
				const g = Math.floor(c.g);
				const n = c.n
				if (g === 4) {

					let crossPath = {
						path:partOpen ? cross(cx + (c.base && c.base.X ||0), cy + (c.base && c.base.Y ||0), 2.5, c, height) : cross(cx , cy , 2.5, c, height) ,
						n: [n ?? 0, n ?? 0],
						className: 'g4'
					};
					res.splice(0, 0, crossPath);
					continue;
				}
				if (g === 0 || g === 1) {

					// console.log(`g === 0 || g === 1`)

					const tx = (c.params.X !== undefined) ? (c.params.X) : cx;
					const ty = (c.params.Y !== undefined) ? (c.params.Y) : cy;
					res[res.length - 1].path += line(tx + (c.base && c.base.X ||0), ty + (c.base && c.base.Y ||0), c, height);
					if (n) {
						let n0 = res[res.length - 1].n[0]
						let n1 = res[res.length - 1].n[1]
						n < n0 ? res[res.length - 1].n[0] = n : false;
						n > n1 ? res[res.length - 1].n[1] = n : false;
					}
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
					res[res.length - 1].path += arcPath(tx + (c.base && c.base.X ||0), ty + (c.base && c.base.Y ||0), r, large, sweep, c, height);
					if (n) {
						let n0 = res[res.length - 1].n[0]
						let n1 = res[res.length - 1].n[1]
						n < n0 ? res[res.length - 1].n[0] = n : false;
						n > n1 ? res[res.length - 1].n[1] = n : false;

					}

					cx = tx; cy = ty;
				} else if (g === 10) {
					let macros = ' macros' + c.params.S + ' '
					res[res.length - 1].className += macros

				} else if (g === 29) {

					// console.log('g === 29')

				} else if (g === 28) {

					// console.log('g === 28')

				} else if (g === 52) {

					// console.log('g === 52')
					res.push({ path: '', n: [Infinity, -Infinity], className: '' })


					//yobanyi kostyl!!!!
					if (res.length > 1) {
						let [x1, y1] = utils.getLastTwoNumbers(res[res.length - 2].path)
						res[res.length - 1].path = `M${x1} ${y1}`;
					} else {
						res[res.length - 1].path = `M${cx} ${height - cy}`;
					}

				}

			}
		}

		// console.log(res)
		return res;
	};

	const generateLabels = () => {
		const newLabels: ReactNode[] = [];
		let labelNum = 0
		groupRefs.current.forEach((g, idx) => {
			if (!g) return;

			try {
				const bbox = g.getBBox();
				const cx = bbox.x + bbox.width / 2;
				const cy = bbox.y + bbox.height / 2;
				labelNum += 1
				newLabels.push(
					<g key={`label-${idx}`} pointerEvents="none" className="partLabel">
						<circle
							cx={cx}
							cy={cy}
							r={10}
							fill="var(--violet)"
							stroke="var(--violet)"
						/>
						<text
							x={cx}
							y={cy}
							fontSize={16 - 2 * Math.floor(Math.log10(Math.abs(labelNum))) - 2}
							fontWeight={700}
							textAnchor="middle"
							fill="#fff"
							stroke="none"
							dy=".35em" // сдвиг по вертикали для центрирования
							transform={isVertical ? `rotate(90, ${cx}, ${cy})` : undefined}
						>
							{labelNum}
						</text>
					</g>
				);

			} catch (e) {
				// Если getBBox не сработает, метку не рисуем
			}
		});
		return newLabels;
	};

	const [showLabels, setShowLabel] = useState(true);
	const [showInners, setShowInners] = useState(true);



	return (
		<div
			 style={{
				border: "1px solid var(--grey-progress)",
				borderRadius: "10px",
			 	width: (isVertical ? 650 : 1300)+"px",
				height: (isVertical ? 1300 : 650)+"px", 
				touchAction: "none",
				position: "relative",
				zIndex:1
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
				<div className="d-flex flex-column">
					<input
						type="range"
						className="w-full cursor-pointer accent-orange-500"
						min={0}
						max={listing.trim().split(/\n+/).length}
						step={1}
						value={cutSeg}
						onChange={(e) => setCutSeg(Number(e.target.value))}
					/>

					{/* Поле ввода */}
					<input
						type="number"
						className="w-full p-2 border rounded-md"
						min={0}
						step={1}
						value={cutSeg}
						onChange={(e) => setCutSeg(Number(e.target.value))}
					/>
				</div>

			</div>
			<div className="d-flex flex-column position-absolute mx-2 mt-2 p-2"
				style={{ right: '0px', border: "1px solid var(--grey-nav)", borderRadius: "5px", backgroundColor: "#fff" }}
			>
				<div>
					<Form>
						<Form.Check
							type="checkbox"
							id="custom-checkbox"
							label={ t("show labels")}
							checked={showLabels}
							onChange={ ()=>{ setShowLabel( !showLabels)}}
						/>
					</Form>

				</div>
				<div className="mt-2">
					<Form>
						<Form.Check
							type="checkbox"
							id="custom-checkbox1"
							label={ t("show laserOff")}
							checked={showInners}
							onChange={ ()=>{ setShowInners( !showInners)}}
						/>
					</Form>
				</div>
			</div>
			<div
				id="workarea"
				ref={containerRef}
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
								className={`sgn_main_els ${showInners ? " showInners " : " hideInners "}  ${showLabels ? " showLeabels " : " hideLabels "}`}
								transform={
									isVertical
									  ? `rotate(-90) translate(${-height},${width-height} )` 
									  : undefined
								}
								style={{
								  fill: "none",
								  strokeWidth: 0.5,
								  stroke: "black",
								}}
							>
								{paths && (() => {
									const groupedResult: ReactNode[] = [];
									const outsidePaths: ReactNode[] = [];
									let currentGroup: ReactNode[]|null = [];
									let groupIndex: number = 1;
									groupRefs.current = [];

									paths.forEach((a:PathItem, i:number) => {
										const { path, className, n } = a;
 										const pathElement = (
											<path
												d={path}
												key={i}
												className={
													className +
													(
														n[0] <= cutSeg && cutSeg <= n[1]
															? " currentCut "
															: n[0] < cutSeg
																? " cutted "
																: " uncutted "
													)
												}
											/>
										);

										if (className.includes("groupStart") || className.includes("g4")) {
											currentGroup = [];
											outsidePaths.push(pathElement);
											return;
										}

										if (className.includes("groupEnd")) {
											groupIndex += 1;
											if (currentGroup) {
												currentGroup.reverse();
												groupedResult.push(
													<g
														key={`g-${i}`}
														ref={(el) => {
															if (el) {
																groupRefs.current.push(el); // 👉 вместо i — пушим по порядку
															}
														}}
													>
														{currentGroup}
													</g>
												);
												currentGroup = null;
												outsidePaths.push(pathElement);
											}
											return;
										}

										if (currentGroup) {
											currentGroup.push(pathElement);
										}
									});

									if (currentGroup) {
										currentGroup.reverse();
										groupedResult.push(<g key="g-last">{currentGroup}</g>);
									}

									return [...groupedResult, ...outsidePaths];
								})()}
								{labels}
							</g>
						</g>
					</g>
				</svg>
			</div>
		</div>

	);
});

export default GCodeToSvg;
