import React, { useState, useMemo } from "react";
import SVGPathCommander from "svg-path-commander";
import utils from "./util";

 

class PathAnalyzer {
  constructor(pathString) {
    this.path = new SVGPathCommander(
      pathString
           
    );

    this.segments = this.normalizeSegments(this.path.segments);
  }


  pointOnArc(px, py, cx, cy, rx, ry, arcStart, arcEnd, sweepFlag) {
	const normalize = (a) => {
	  while (a < 0) a += Math.PI * 2;
	  while (a >= Math.PI * 2) a -= Math.PI * 2;
	  return a;
	};
  
	const angle = Math.atan2((py - cy) / ry, (px - cx) / rx);
	const startAngle = Math.atan2(
	  (arcStart.y - cy) / ry,
	  (arcStart.x - cx) / rx
	);
	const endAngle = Math.atan2(
	  (arcEnd.y - cy) / ry,
	  (arcEnd.x - cx) / rx
	);
  
	let a = normalize(angle);
	let s = normalize(startAngle);
	let e = normalize(endAngle);
  
	if (sweepFlag === 1) {
	  if (e < s) e += Math.PI * 2;
	  if (a < s) a += Math.PI * 2;
	  return a >= s && a <= e;
	} else {
	  if (s < e) s += Math.PI * 2;
	  if (a < e) a += Math.PI * 2;
	  return a <= s && a >= e;
	}
  }
  

  rayArcIntersection(ray, arcStart, arcSeg) {
	const [_, rx, ry, rotation, largeArcFlag, sweepFlag, x2, y2] = arcSeg;
  
	if (rotation !== 0) return null; // пока без rotation
  
	const centers = utils.svgArcToCenterParam(
	  arcStart.x,
	  arcStart.y,
	  rx,
	  ry,
	  rotation,
	  largeArcFlag,
	  sweepFlag,
	  x2,
	  y2,
	  true
	);
  
	const cx = centers.x;
	const cy = centers.y;
  
	const dx = ray.dx;
	const dy = ray.dy;
  
	const x1 = ray.x;
	const y1 = ray.y;
  
	const A =
	  (dx * dx) / (rx * rx) +
	  (dy * dy) / (ry * ry);
  
	const B =
	  2 * (
		(dx * (x1 - cx)) / (rx * rx) +
		(dy * (y1 - cy)) / (ry * ry)
	  );
  
	const C =
	  ((x1 - cx) * (x1 - cx)) / (rx * rx) +
	  ((y1 - cy) * (y1 - cy)) / (ry * ry) -
	  1;
  
	const D = B * B - 4 * A * C;
	if (D < 0) return null;
  
	const roots = [];
	const sqrtD = Math.sqrt(D);
  
	roots.push((-B - sqrtD) / (2 * A));
	roots.push((-B + sqrtD) / (2 * A));
  
	let minT = null;
  
	for (let t of roots) {
	  if (t <= 1e-6) continue;
  
	  const px = x1 + t * dx;
	  const py = y1 + t * dy;
  
	  if (
		this.pointOnArc(
		  px,
		  py,
		  cx,
		  cy,
		  rx,
		  ry,
		  arcStart,
		  { x: x2, y: y2 },
		  sweepFlag
		)
	  ) {
		if (minT === null || t < minT) {
		  minT = t;
		}
	  }
	}
  
	return minT;
  }
  

  // =========================================
  // Нормализация и замыкание пути
  // =========================================
  normalizeSegments(segments) {
	const clean = [];
  
	for (let i = 0; i < segments.length; i++) {
	  const seg = segments[i];
  
	  // M
	  if (seg[0] === "M") {
		clean.push(["M", seg[1], seg[2]]);
	  }
  
	  // L
	  if (seg[0] === "L") {
		clean.push(["L", seg[1], seg[2]]);
	  }
  
	  // A
	  if (seg[0] === "A") {
		clean.push([
		  "A",
		  seg[1], // rx
		  seg[2], // ry
		  seg[3], // rotation
		  seg[4], // largeArcFlag
		  seg[5], // sweepFlag
		  seg[6], // x
		  seg[7]  // y
		]);
	  }
	}
  
	// замыкаем путь если нужно
	if (clean.length > 1) {
	  const first = clean[0];
	  const last = clean[clean.length - 1];
  
	  if (
		first[1] !== last[last.length - 2] ||
		first[2] !== last[last.length - 1]
	  ) {
		clean.push(["L", first[1], first[2]]);
	  }
	}
  
	return clean;
  }
  

  // =========================================
  // Главный метод
  // =========================================
  getInnerPerpendicularData() {
	const segments = this.segments;
	if (segments.length < 3) return null;
  
	const EPS = 1e-4;
  
	const firstCmd = segments[1][0];
  
	let ray = null;
	let startPoint = null;
  
	// =====================================================
	// === 1️⃣ Если первый сегмент L ========================
	// =====================================================
  
	if (firstCmd === "L") {
	  const prev = segments[0];
	  const cur = segments[1];
  
	  const x1 = prev[prev.length - 2];
	  const y1 = prev[prev.length - 1];
	  const x2 = cur[1];
	  const y2 = cur[2];
  
	  const dx = x2 - x1;
	  const dy = y2 - y1;
  
	  const len = Math.hypot(dx, dy);
	  if (len < EPS) return null;
  
	  const mid = {
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2
	  };
  
	  const orientation = this.getPolygonOrientation();
  
	  const normal =
		orientation === "CCW"
		  ? { x: -dy / len, y: dx / len }
		  : { x: dy / len, y: -dx / len };
  
	  ray = {
		x: mid.x + normal.x * EPS,
		y: mid.y + normal.y * EPS,
		dx: normal.x,
		dy: normal.y
	  };
  
	  startPoint = mid;
	}
  
	// =====================================================
	// === 2️⃣ Если первый сегмент A ========================
	// =====================================================
  
	else if (firstCmd === "A") {
	  const arc = segments[1];
  
	  const start = {
		x: segments[0][1],
		y: segments[0][2]
	  };
  
	  const centers = utils.svgArcToCenterParam(
		start.x,
		start.y,
		arc[1], // rx
		arc[2], // ry
		arc[3], // rotation
		arc[4], // largeArcFlag
		arc[5], // sweepFlag
		arc[6], // x2
		arc[7], // y2
		true
	  );
  
	  const cx = centers.x;
	  const cy = centers.y;
  
	  const dx = cx - start.x;
	  const dy = cy - start.y;
  
	  const len = Math.hypot(dx, dy);
	  if (len < EPS) return null;
  
	  const dirX = dx / len;
	  const dirY = dy / len;
  
	  ray = {
		x: start.x + dirX * EPS,
		y: start.y + dirY * EPS,
		dx: dirX,
		dy: dirY
	  };
  
	  startPoint = start;
	}
  
	else {
	  return null;
	}
  
	// =====================================================
	// === 3️⃣ Поиск ближайшего пересечения ================
	// =====================================================
  
	let minDistance = Infinity;
  
	for (let i = 1; i < segments.length; i++) {
	  const seg = segments[i];
	  const prev = segments[i - 1];
  
	  const segStart = {
		x: prev[prev.length - 2],
		y: prev[prev.length - 1]
	  };
  
	  // --- L ---
	  if (seg[0] === "L") {
		const p2 = { x: seg[1], y: seg[2] };
  
		const dist = this.rayLineIntersection(ray, segStart, p2);
  
		if (dist !== null && dist > EPS && dist < minDistance) {
		  minDistance = dist;
		  console.log (dist)
		}
	  }
  
	  // --- A ---
	  if (seg[0] === "A") {
		const dist = this.rayArcIntersection(ray, segStart, seg);
  
		if (dist !== null && dist > EPS && dist < minDistance) {
		  minDistance = dist;
		  console.log (dist)
		}
	  }
	}
  
	if (minDistance === Infinity) return null;
  
	return {
	  length: minDistance,
	  start: startPoint,
	  end: {
		x: startPoint.x + ray.dx * minDistance,
		y: startPoint.y + ray.dy * minDistance
	  }
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
}

 
export default function SvgPathTester() {
  const [pathInput, setPathInput] = useState(
    //"M156.276288 281.58802299999996 L197.052 258.054 A10 10 0 0 1 207.089 258.077 L259.367 288.567 A10 10 0 0 1 264.329 297.205 A10 10 0 0 1 254.357 306.461 L149.171 306.461 A10 10 0 0 1 139.171 296.461 A10.001 10.001 0 0 1 144.141 288.592 L156.276288 281.58802299999996"
	//"M565.75 25 A9.25 9.25 0 0 1 584.25 25 A9.25 9.25 0 0 1 565.75 25"
	//"M150 75 A75 75 0 0 0 0 75 A75 75 0 0 0 75 150 A75 75 0 0 0 150 75"
	"M 117.59339141845703 107.40660858154297L 150 75A 75 75 0 0 0 0 75A 75 75 0 0 0 75 150L 117.59339141845703 107.40660858154297"
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
