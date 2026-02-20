import React, { useState, useMemo } from "react";
import SVGPathCommander from "svg-path-commander";
import util from "./util";
import constants from "../store/constants";


class PathAnalyzer {
	constructor(pathString) {
		this.path = new SVGPathCommander(
			"M" +
			util
				.pathToPolyline(pathString)
				.replaceAll(";", "L")
				.replaceAll(",", " ")
		);

		//this.segments = this.normalizeSegments(this.path.segments);
		this.segments = this.path.segments;
	}

	// =========================================
	// Нормализация и замыкание пути
	// =========================================
	normalizeSegments(segments) {
		const EPS = 1e-4;
		const clean = [];

		for (let i = 0; i < segments.length; i++) {
			const s = segments[i];
			if (s[0] !== "M" && s[0] !== "L") continue;

			if (clean.length === 0) {
				clean.push(s);
				continue;
			}

			const prev = clean[clean.length - 1];
			const dx = s[s.length - 2] - prev[prev.length - 2];
			const dy = s[s.length - 1] - prev[prev.length - 1];

			if (Math.hypot(dx, dy) > EPS) {
				clean.push(s);
			}
		}

		// замыкаем путь
		const first = clean[0];
		const last = clean[clean.length - 1];
		if (
			Math.abs(first[1] - last[last.length - 2]) > EPS ||
			Math.abs(first[2] - last[last.length - 1]) > EPS
		) {
			clean.push(["L", first[1], first[2]]);
		}

		return clean;
	}

	// =========================================
	// Главный метод
	// =========================================
	getInnerPerpendicularData() {
		const segments = this.segments;
		if (segments.length < 3) return null;

		// ---- ищем первый сегмент с ненулевой длиной ----
		let firstSegment = null;
		let firstIndex = -1;
		const MIN_LEN = 1e-3;

		for (let i = 1; i < segments.length; i++) {
			if (segments[i][0] !== "L") continue;

			const prev = segments[i - 1];
			const cur = segments[i];
			const x1 = prev[prev.length - 2];
			const y1 = prev[prev.length - 1];
			const x2 = cur[1];
			const y2 = cur[2];

			const dx = x2 - x1;
			const dy = y2 - y1;
			const len = Math.hypot(dx, dy);

			if (len > MIN_LEN) {
				firstSegment = { x1, y1, x2, y2, dx, dy, len };
				firstIndex = i;
				break;
			}
		}

		if (!firstSegment) return null;

		// ---- середина сегмента ----
		const mid = {
			x: (firstSegment.x1 + firstSegment.x2) / 2,
			y: (firstSegment.y1 + firstSegment.y2) / 2
		};

		// ---- нормаль внутрь ----
		const orientation = this.getPolygonOrientation();
		const normal =
			orientation === "CCW"
				? { x: -firstSegment.dy / firstSegment.len, y: firstSegment.dx / firstSegment.len }
				: { x: firstSegment.dy / firstSegment.len, y: -firstSegment.dx / firstSegment.len };

		const EPS = 0.1;
		const ray = {
			x: mid.x + normal.x * EPS,
			y: mid.y + normal.y * EPS,
			dx: normal.x,
			dy: normal.y
		};

		// ---- ищем ближайшее пересечение ----
		let minDistance = Infinity;

		for (let i = 1; i < segments.length; i++) {
			if (segments[i][0] !== "L") continue;

			const p1 = {
				x: segments[i - 1][segments[i - 1].length - 2],
				y: segments[i - 1][segments[i - 1].length - 1]
			};
			const p2 = { x: segments[i][1], y: segments[i][2] };

			// исключаем соседние сегменты первого ребра
			if (
				(Math.abs(p1.x - firstSegment.x1) < 1e-6 &&
					Math.abs(p1.y - firstSegment.y1) < 1e-6) ||
				(Math.abs(p2.x - firstSegment.x1) < 1e-6 &&
					Math.abs(p2.y - firstSegment.y1) < 1e-6)
			) {
				continue;
			}

			const dist = this.rayLineIntersection(ray, p1, p2);

			if (dist !== null && dist > 0 && dist < minDistance) {
				minDistance = dist;
			}
		}

		let finalLength = minDistance;

		if (isFinite(minDistance)) {
			finalLength = Math.max(
				0,
				minDistance - constants.defaultInletIntend
			);
		}

		return {
			length: finalLength,			 
 		};
	}

	// =========================================
	// Ориентация полигона (shoelace)
	// =========================================
	getPolygonOrientation() {
		let area = 0;
		const seg = this.segments;

		for (let i = 1; i < seg.length; i++) {
			const x1 = seg[i - 1][seg[i - 1].length - 2];
			const y1 = seg[i - 1][seg[i - 1].length - 1];
			const x2 = seg[i][seg[i].length - 2];
			const y2 = seg[i][seg[i].length - 1];
			area += x1 * y2 - x2 * y1;
		}

		return area < 0 ? "CW" : "CCW";
	}

	// =========================================
	// Пересечение луча с отрезком
	// =========================================
	rayLineIntersection(ray, p1, p2) {
		const v1 = { x: ray.x - p1.x, y: ray.y - p1.y };
		const v2 = { x: p2.x - p1.x, y: p2.y - p1.y };
		const v3 = { x: -ray.dy, y: ray.dx };

		const dot = v2.x * v3.x + v2.y * v3.y;
		if (Math.abs(dot) < 1e-8) return null;

		const t1 = (v2.x * v1.y - v2.y * v1.x) / dot;
		const t2 = (v1.x * v3.x + v1.y * v3.y) / dot;

		if (t1 >= 0 && t2 >= 0 && t2 <= 1) return t1;

		return null;
	}

	/*   getInnerPerpendicularData1 (contourPath, contourType="inner") {
			let checkPoint, startPoint;
			var directionIndex, perpPoint;
			var pointIn, perpendicular;
			let contourCommand = SVGPathCommander.normalizePath( contourPath )
			let endPoint = {x:contourCommand[0][1], y:contourCommand[0][2]}
			let IL = 10
					 
			if (true) {
	
	    
				const nearestSegment= contourCommand[1]
				const commandType = nearestSegment[0]
				switch (commandType) {                
					case 'L':
						let x1=nearestSegment[1]
						let y1=nearestSegment[2]
						perpendicular=util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, IL) 
						checkPoint = util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, 0.01) 
						pointIn = util.pointInSvgPath(contourPath , checkPoint[0].x, checkPoint[0].y)
	
				  
						if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
							directionIndex=0
						} else {
							directionIndex=1
						}                    
	
					break;
					case 'A':
						const rx = parseFloat(nearestSegment[1]);
						const ry = parseFloat(nearestSegment[2]);
						const flag1 = parseFloat(nearestSegment[3]);
						const flag2 = parseFloat(nearestSegment[4]);
						const flag3 = parseFloat(nearestSegment[5]);
						const EX = parseFloat(nearestSegment[6]);
						const EY = parseFloat(nearestSegment[7]);
						let PP = this.getPrevEndPoint (contourCommand, nearestSegment);
						let arcParams= arc.svgArcToCenterParam ( PP.x, PP.y, rx, ry, flag1, flag2, flag3, EX, EY, true)
						perpPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y}, IL);
						checkPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y}, 0.01);
						pointIn = util.pointInSvgPath(contourPath , checkPoint.point1.x, checkPoint.point1.y)
						if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
							startPoint = perpPoint.point1
						}  else {
							startPoint = perpPoint.point2
						}					
					break;
				   
				} 
			}     
			
			
			let edge = [{x: contourCommand[0][1],y: contourCommand[0][2]}, {x:perpendicular[directionIndex].x, y:perpendicular[directionIndex].y}]
		  	
		 
			
	  }
	 */
	getInnerPerpendicularData1(contourPath, contourType = "inner") {

		const contourCommand = SVGPathCommander.normalizePath(contourPath);
		if (!contourCommand || contourCommand.length < 3) return null;

		const EPS = 0.0001;
		const IL = 3000; // длина перпендикуляра

		const startM = {
			x: contourCommand[0][1],
			y: contourCommand[0][2]
		};

		const nearestSegment = contourCommand[1];
		const commandType = nearestSegment[0];

		let perpendicular;
		let directionIndex = 0;

		// ============================================================
		// 1️⃣ Находим правильное направление перпендикуляра
		// ============================================================

		if (commandType === "L") {

			const x1 = nearestSegment[1];
			const y1 = nearestSegment[2];

			perpendicular = util.findPerpendicularPoints(
				startM.x, startM.y,
				x1, y1,
				IL
			);

			const checkPoint = util.findPerpendicularPoints(
				startM.x, startM.y,
				x1, y1,
				0.01
			);

			const pointIn = util.pointInSvgPath(
				contourPath,
				checkPoint[0].x,
				checkPoint[0].y
			);

			if ((pointIn && contourType === "inner") ||
				(!pointIn && contourType === "outer")) {
				directionIndex = 0;
			} else {
				directionIndex = 1;
			}
		}

		else {
			return null; // сейчас работаем только с L
		}

		// ============================================================
		// 2️⃣ Строим грань перпендикуляра
		// ============================================================

		const edgePerp = [
			startM,
			{
				x: perpendicular[directionIndex].x,
				y: perpendicular[directionIndex].y
			}
		];

		// ============================================================
		// 3️⃣ Ищем пересечения со всеми рёбрами
		// ============================================================

		let minDistance = Infinity;
		let closestPoint = null;

		for (let i = 2; i < contourCommand.length; i++) {

			if (contourCommand[i][0] !== "L") continue;

			const p1 = {
				x: contourCommand[i - 1][contourCommand[i - 1].length - 2],
				y: contourCommand[i - 1][contourCommand[i - 1].length - 1]
			};

			const p2 = {
				x: contourCommand[i][1],
				y: contourCommand[i][2]
			};

			const edge2 = [p1, p2];

			const intersection = util.intersects(edgePerp, edge2, true);

			if (!intersection) continue;

			// исключаем саму стартовую точку
			
			const dist = util.distance( startM.x, startM.y, intersection.x, intersection.y )

			if (dist < EPS) continue;

			if (dist < minDistance) {
				minDistance = dist;
				closestPoint = intersection;
			}
		}

		if (!closestPoint) return null;

		// ============================================================
		// 4️⃣ Возвращаем длину
		// ============================================================
		let finalLength = minDistance;

		if (isFinite(minDistance)) {
			finalLength = Math.max(
				0,
				minDistance - constants.defaultInletIntend
			);
		}

		console.log ("closestPoint")
		console.log (closestPoint)

		return {
			length: finalLength,			
		};


	}
}

export default PathAnalyzer;

/*  
export default function SvgPathTester() {
  const [pathInput, setPathInput] = useState(
	//"M156.276288 281.58802299999996 L197.052 258.054 A10 10 0 0 1 207.089 258.077 L259.367 288.567 A10 10 0 0 1 264.329 297.205 A10 10 0 0 1 254.357 306.461 L149.171 306.461 A10 10 0 0 1 139.171 296.461 A10.001 10.001 0 0 1 144.141 288.592 L156.276288 281.58802299999996"
	"M565.75 25 A9.25 9.25 0 0 1 584.25 25 A9.25 9.25 0 0 1 565.75 25"
  );

  const result = useMemo(() => {
	try {
	  const analyzer = new PathAnalyzer(pathInput);
	  return analyzer.getInnerPerpendicularData();
	} catch (e) {
	  return null;
	}
  }, [pathInput]);

  return (
	<div style={{ padding: 20 }}>
	  <h2>SVG Path Tester</h2>

	  <textarea
		style={{ width: "100%", height: 120 }}
		value={pathInput}
		onChange={(e) => setPathInput(e.target.value)}
	  />

	  <p>
		<strong>Length:</strong>{" "}
		{result ? result.length.toFixed(2) : "—"}
	  </p>

	  <svg
		width="1000"
		height="1000"
		viewBox="0 0 1000 1000"
		style={{ border: "1px solid #ccc" }}
	  >
		<path
		  d={pathInput}
		  fill="rgba(0,150,255,0.2)"
		  stroke="blue"
		/>

		{result && (
		  <>
			<line
			  x1={result.start.x}
			  y1={result.start.y}
			  x2={result.end.x}
			  y2={result.end.y}
			  stroke="red"
			  strokeWidth="2"
			/>

			<circle
			  cx={result.start.x}
			  cy={result.start.y}
			  r="4"
			  fill="green"
			/>
		  </>
		)}
	  </svg>
	</div>
  );
}
 */