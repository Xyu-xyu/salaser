import React, { useState, useMemo } from "react";
import SVGPathCommander from "svg-path-commander";
import utils from "./util";

 

class PathAnalyzer {
  constructor(pathString) {
    this.path = new SVGPathCommander(
      "M" +
        utils
          .pathToPolyline(pathString)
          .replaceAll(";", "L")
          .replaceAll(",", " ")
    );

    this.segments = this.normalizeSegments(this.path.segments);
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

    if (minDistance === Infinity) return null;

    return {
      length: minDistance,
      start: mid,
      end: {
        x: mid.x + normal.x * minDistance,
        y: mid.y + normal.y * minDistance
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
