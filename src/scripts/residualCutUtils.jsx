import ClipperLib from "clipper-lib";
import svgPath from "svgpath";
import SVGPathCommander from "svg-path-commander";
import util from "./util.jsx";
import { normalizeSheetSafetyClearance } from "./sheetCutUtils.jsx";

export const RESIDUAL_CUT_PART_CODE = "ResidualSheetCuts";
export const RESIDUAL_CUT_DEFAULT_STEP = 100;
export const RESIDUAL_CUT_MIN_STEP = 10;
export const RESIDUAL_CUT_MAX_STEP = 100;
export const RESIDUAL_CUT_SNAP_DISTANCE = 19;
export const RESIDUAL_CUT_DISPLAY_OFFSET = 10;
export const RESIDUAL_CUT_SOURCE_NONE = "none";
export const RESIDUAL_CUT_SOURCE_NCP = "ncp";
export const RESIDUAL_CUT_SOURCE_USER = "user";

const AUTO_MAX_RECTANGLES = 50;
const CLIPPER_SCALE = 1000;
const EPSILON = 0.001;

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const sanitizeNumber = (value, fallback = 0) => {
	const numericValue = Number(value);
	return Number.isFinite(numericValue) ? numericValue : fallback;
};
const roundCoord = (value) => Math.round(sanitizeNumber(value) * 1000) / 1000;
const samePoint = (left, right) => (
	Boolean(left) &&
	Boolean(right) &&
	Math.abs(sanitizeNumber(left.x) - sanitizeNumber(right.x)) <= EPSILON &&
	Math.abs(sanitizeNumber(left.y) - sanitizeNumber(right.y)) <= EPSILON
);

const dedupePolyline = (points = []) => (
	(Array.isArray(points) ? points : [])
		.filter(Boolean)
		.filter((point, index, items) => index === 0 || !samePoint(point, items[index - 1]))
		.map(point => ({
			x: roundCoord(point.x),
			y: roundCoord(point.y),
		}))
);

const getPathMidPoint = (path = []) => {
	if (!Array.isArray(path) || !path.length) {
		return { x: 0, y: 0 };
	}

	const firstPoint = path[0];
	const lastPoint = path[path.length - 1] || firstPoint;

	return {
		x: roundCoord((sanitizeNumber(firstPoint.x) + sanitizeNumber(lastPoint.x)) / 2),
		y: roundCoord((sanitizeNumber(firstPoint.y) + sanitizeNumber(lastPoint.y)) / 2),
	};
};

const getPathDistanceToOrigin = (path = []) => util.distance(
	getPathMidPoint(path),
	{ x: 0, y: 0 }
);

const getSignedArea = (points = []) => {
	if (!Array.isArray(points) || points.length < 3) {
		return 0;
	}

	let area = 0;

	for (let index = 0; index < points.length; index += 1) {
		const currentPoint = points[index];
		const nextPoint = points[(index + 1) % points.length];
		area += sanitizeNumber(currentPoint.x) * sanitizeNumber(nextPoint.y);
		area -= sanitizeNumber(nextPoint.x) * sanitizeNumber(currentPoint.y);
	}

	return area / 2;
};

const buildRectanglePath = (area) => ([
	{ x: area.left, y: area.top },
	{ x: area.right, y: area.top },
	{ x: area.right, y: area.bottom },
	{ x: area.left, y: area.bottom },
]);

const getSafetyMargin = (clearance = 0) => normalizeSheetSafetyClearance(clearance) / 2;

const expandAreaByMargin = (area, margin = 0) => {
	const safeMargin = Math.max(0, Number(margin) || 0);
	return safeMargin > EPSILON
		? {
			left: sanitizeNumber(area?.left) - safeMargin,
			top: sanitizeNumber(area?.top) - safeMargin,
			right: sanitizeNumber(area?.right) + safeMargin,
			bottom: sanitizeNumber(area?.bottom) + safeMargin,
		}
		: area;
};

const scaleClipperPath = (points = []) => (
	points.map(point => ({
		X: Math.round(sanitizeNumber(point.x) * CLIPPER_SCALE),
		Y: Math.round(sanitizeNumber(point.y) * CLIPPER_SCALE),
	}))
);

const scaleDownClipperPath = (points = []) => (
	points.map(point => ({
		x: roundCoord(sanitizeNumber(point.X) / CLIPPER_SCALE),
		y: roundCoord(sanitizeNumber(point.Y) / CLIPPER_SCALE),
	}))
);

const getPathPoints = (path = "", minimumPoints = 2) => {
	if (!path?.trim()) {
		return [];
	}

	try {
		const points = util.pathToPolyline(path, 1)
			.split(";")
			.map(point => point.split(",").map(Number))
			.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
			.map(([x, y]) => ({
				x: roundCoord(x),
				y: roundCoord(y),
			}));

		const vertices = [];

		points.forEach(point => {
			const previousPoint = vertices[vertices.length - 1];
			if (previousPoint && samePoint(previousPoint, point)) {
				return;
			}

			vertices.push(point);
		});

		if (vertices.length > 1 && samePoint(vertices[0], vertices[vertices.length - 1])) {
			vertices.pop();
		}

		return vertices.length >= minimumPoints ? vertices : [];
	} catch (error) {
		return [];
	}
};

const getPathVertices = (path = "") => getPathPoints(path, 3);

const transformPath = (path = "", matrix = {}) => (
	svgPath(path)
		.matrix([
			sanitizeNumber(matrix.a, 1),
			sanitizeNumber(matrix.b, 0),
			sanitizeNumber(matrix.c, 0),
			sanitizeNumber(matrix.d, 1),
			sanitizeNumber(matrix.e, 0),
			sanitizeNumber(matrix.f, 0),
		])
		.toString()
);

const getBBoxFromPoints = (points = []) => {
	if (!Array.isArray(points) || !points.length) {
		return null;
	}

	let left = Infinity;
	let top = Infinity;
	let right = -Infinity;
	let bottom = -Infinity;

	points.forEach(point => {
		left = Math.min(left, sanitizeNumber(point?.x));
		top = Math.min(top, sanitizeNumber(point?.y));
		right = Math.max(right, sanitizeNumber(point?.x));
		bottom = Math.max(bottom, sanitizeNumber(point?.y));
	});

	return {
		left: roundCoord(left),
		top: roundCoord(top),
		right: roundCoord(right),
		bottom: roundCoord(bottom),
	};
};

const mergeBBoxes = (boxes = []) => {
	const validBoxes = (Array.isArray(boxes) ? boxes : []).filter(Boolean);
	if (!validBoxes.length) {
		return null;
	}

	return {
		left: Math.min(...validBoxes.map(box => sanitizeNumber(box.left))),
		top: Math.min(...validBoxes.map(box => sanitizeNumber(box.top))),
		right: Math.max(...validBoxes.map(box => sanitizeNumber(box.right))),
		bottom: Math.max(...validBoxes.map(box => sanitizeNumber(box.bottom))),
	};
};

const hasMeaningfulPolygon = (points = []) => (
	Array.isArray(points) &&
	points.length >= 3 &&
	Math.abs(getSignedArea(points)) > EPSILON
);

const hasPolygonIntersection = (subjectPolygon = [], clipPolygon = []) => {
	if (!hasMeaningfulPolygon(subjectPolygon) || !hasMeaningfulPolygon(clipPolygon)) {
		return false;
	}

	const clipper = new ClipperLib.Clipper();
	clipper.StrictlySimple = true;
	clipper.AddPaths([scaleClipperPath(subjectPolygon)], ClipperLib.PolyType.ptSubject, true);
	clipper.AddPaths([scaleClipperPath(clipPolygon)], ClipperLib.PolyType.ptClip, true);

	const solution = new ClipperLib.Paths();
	clipper.Execute(
		ClipperLib.ClipType.ctIntersection,
		solution,
		ClipperLib.PolyFillType.pftNonZero,
		ClipperLib.PolyFillType.pftNonZero
	);

	return (Array.isArray(solution) ? solution : []).some(path => (
		Array.isArray(path) &&
		path.length >= 3 &&
		Math.abs(ClipperLib.Clipper.Area(path)) > 1
	));
};

const isPointInsideArea = (point, area) => (
	Boolean(point) &&
	sanitizeNumber(point.x) >= sanitizeNumber(area.left) - EPSILON &&
	sanitizeNumber(point.x) <= sanitizeNumber(area.right) + EPSILON &&
	sanitizeNumber(point.y) >= sanitizeNumber(area.top) - EPSILON &&
	sanitizeNumber(point.y) <= sanitizeNumber(area.bottom) + EPSILON
);

const segmentIntersectsArea = (startPoint, endPoint, area) => {
	const x1 = sanitizeNumber(startPoint?.x);
	const y1 = sanitizeNumber(startPoint?.y);
	const x2 = sanitizeNumber(endPoint?.x);
	const y2 = sanitizeNumber(endPoint?.y);
	const left = sanitizeNumber(area.left);
	const right = sanitizeNumber(area.right);
	const top = sanitizeNumber(area.top);
	const bottom = sanitizeNumber(area.bottom);

	if (isPointInsideArea(startPoint, area) || isPointInsideArea(endPoint, area)) {
		return true;
	}

	const dx = x2 - x1;
	const dy = y2 - y1;
	let t0 = 0;
	let t1 = 1;

	const p = [-dx, dx, -dy, dy];
	const q = [x1 - left, right - x1, y1 - top, bottom - y1];

	for (let index = 0; index < 4; index += 1) {
		if (Math.abs(p[index]) <= EPSILON) {
			if (q[index] < -EPSILON) {
				return false;
			}
			continue;
		}

		const ratio = q[index] / p[index];
		if (p[index] < 0) {
			if (ratio > t1) {
				return false;
			}
			if (ratio > t0) {
				t0 = ratio;
			}
		} else {
			if (ratio < t0) {
				return false;
			}
			if (ratio < t1) {
				t1 = ratio;
			}
		}
	}

	return true;
};

const doesPolylineIntersectArea = (points = [], area) => {
	if (!Array.isArray(points) || points.length < 2) {
		return false;
	}

	for (let index = 0; index < points.length - 1; index += 1) {
		if (segmentIntersectsArea(points[index], points[index + 1], area)) {
			return true;
		}
	}

	return false;
};

const doesAreaIntersectContours = (area, contours = [], clearance = 0) => {
	const collisionArea = expandAreaByMargin(area, getSafetyMargin(clearance));
	const areaPolygon = buildRectanglePath(collisionArea);

	return (Array.isArray(contours) ? contours : []).some(contour => {
		if (!doesCellIntersectBBox(collisionArea, contour.bbox)) {
			return false;
		}

		if (!hasMeaningfulPolygon(contour.vertices) && !Array.isArray(contour.leadPolylines)) {
			return true;
		}

		const polygonIntersection = hasMeaningfulPolygon(contour.vertices)
			? hasPolygonIntersection(areaPolygon, contour.vertices)
			: false;
		const leadIntersection = (Array.isArray(contour.leadPolylines) ? contour.leadPolylines : [])
			.some(leadPolyline => (
				doesCellIntersectBBox(collisionArea, leadPolyline.bbox) &&
				doesPolylineIntersectArea(leadPolyline.points, collisionArea)
			));

		if (!hasMeaningfulPolygon(contour.vertices) && !leadIntersection) {
			return true;
		}

		return polygonIntersection || leadIntersection;
	});
};

const buildUnionPaths = (areas = []) => {
	const normalizedAreas = (Array.isArray(areas) ? areas : []).filter(Boolean);
	if (!normalizedAreas.length) {
		return [];
	}

	const clipper = new ClipperLib.Clipper();
	clipper.StrictlySimple = true;
	clipper.AddPaths(
		normalizedAreas.map(area => scaleClipperPath(buildRectanglePath(area))),
		ClipperLib.PolyType.ptSubject,
		true
	);

	const solution = new ClipperLib.Paths();
	clipper.Execute(
		ClipperLib.ClipType.ctUnion,
		solution,
		ClipperLib.PolyFillType.pftNonZero,
		ClipperLib.PolyFillType.pftNonZero
	);

	return (Array.isArray(solution) ? solution : [])
		.map(scaleDownClipperPath)
		.filter(path => Math.abs(getSignedArea(path)) > EPSILON);
};

const isValueOnBorder = (value, maxValue) => (
	Math.abs(sanitizeNumber(value)) <= EPSILON ||
	Math.abs(sanitizeNumber(value) - sanitizeNumber(maxValue)) <= EPSILON
);

export const isResidualCutPointOnBorder = (point, sheetWidth, sheetHeight) => (
	Boolean(point) &&
	(
		isValueOnBorder(point.x, sheetWidth) ||
		isValueOnBorder(point.y, sheetHeight)
	)
);

const isBorderEdge = (startPoint, endPoint, sheetWidth, sheetHeight) => (
	(
		isValueOnBorder(startPoint?.x, sheetWidth) &&
		isValueOnBorder(endPoint?.x, sheetWidth) &&
		Math.abs(sanitizeNumber(startPoint?.x) - sanitizeNumber(endPoint?.x)) <= EPSILON
	) ||
	(
		isValueOnBorder(startPoint?.y, sheetHeight) &&
		isValueOnBorder(endPoint?.y, sheetHeight) &&
		Math.abs(sanitizeNumber(startPoint?.y) - sanitizeNumber(endPoint?.y)) <= EPSILON
	)
);

const extendDisplayPoint = (point, sheetWidth, sheetHeight) => {
	let nextX = sanitizeNumber(point?.x);
	let nextY = sanitizeNumber(point?.y);

	if (Math.abs(nextX) <= EPSILON) {
		nextX = -RESIDUAL_CUT_DISPLAY_OFFSET;
	} else if (Math.abs(nextX - sheetWidth) <= EPSILON) {
		nextX = sanitizeNumber(sheetWidth) + RESIDUAL_CUT_DISPLAY_OFFSET;
	}

	if (Math.abs(nextY) <= EPSILON) {
		nextY = -RESIDUAL_CUT_DISPLAY_OFFSET;
	} else if (Math.abs(nextY - sheetHeight) <= EPSILON) {
		nextY = sanitizeNumber(sheetHeight) + RESIDUAL_CUT_DISPLAY_OFFSET;
	}

	return {
		x: roundCoord(nextX),
		y: roundCoord(nextY),
	};
};

const splitRingIntoCutPaths = (ring = [], sheetWidth, sheetHeight) => {
	const points = dedupePolyline(ring);
	if (points.length < 2) {
		return [];
	}

	const edges = points.map((point, index) => ({
		start: point,
		end: points[(index + 1) % points.length],
	}));
	const firstBorderEdgeIndex = edges.findIndex(edge => (
		isBorderEdge(edge.start, edge.end, sheetWidth, sheetHeight)
	));
	const hasBorderEdges = firstBorderEdgeIndex >= 0;
	const orderedEdges = hasBorderEdges
		? [
			...edges.slice(firstBorderEdgeIndex + 1),
			...edges.slice(0, firstBorderEdgeIndex + 1),
		]
		: edges;
	const paths = [];
	let currentPath = [];

	const pushCurrentPath = (closePath = false) => {
		const nextPath = dedupePolyline(currentPath);
		currentPath = [];

		if (nextPath.length < 2) {
			return;
		}

		if (closePath && !samePoint(nextPath[0], nextPath[nextPath.length - 1])) {
			nextPath.push({
				x: nextPath[0].x,
				y: nextPath[0].y,
			});
		}

		paths.push(nextPath);
	};

	orderedEdges.forEach(edge => {
		if (isBorderEdge(edge.start, edge.end, sheetWidth, sheetHeight)) {
			pushCurrentPath(false);
			return;
		}

		if (!currentPath.length) {
			currentPath = [edge.start, edge.end];
			return;
		}

		if (!samePoint(currentPath[currentPath.length - 1], edge.start)) {
			currentPath.push(edge.start);
		}

		currentPath.push(edge.end);
	});

	pushCurrentPath(!hasBorderEdges);

	return paths;
};

const buildFillPath = (rings = []) => (
	(Array.isArray(rings) ? rings : [])
		.filter(path => Array.isArray(path) && path.length >= 3)
		.map(path => (
			`M${path.map(point => `${roundCoord(point.x)} ${roundCoord(point.y)}`).join(" L")} Z`
		))
		.join(" ")
);

const getBorderPointCount = (path = [], sheetWidth, sheetHeight) => (
	(Array.isArray(path) ? path : [])
		.filter(point => isResidualCutPointOnBorder(point, sheetWidth, sheetHeight))
		.length
);

const sortResidualCutPaths = (paths = [], sheetWidth, sheetHeight) => {
	const innerPaths = [];
	const outerPaths = [];

	(Array.isArray(paths) ? paths : []).forEach(path => {
		if (!Array.isArray(path) || path.length < 2) {
			return;
		}

		if (path.some(point => isResidualCutPointOnBorder(point, sheetWidth, sheetHeight))) {
			outerPaths.push(path);
			return;
		}

		innerPaths.push(path);
	});

	innerPaths.sort((leftPath, rightPath) => (
		getPathDistanceToOrigin(leftPath) - getPathDistanceToOrigin(rightPath)
	));

	outerPaths.sort((leftPath, rightPath) => {
		const borderCountDifference = (
			getBorderPointCount(leftPath, sheetWidth, sheetHeight) -
			getBorderPointCount(rightPath, sheetWidth, sheetHeight)
		);

		if (borderCountDifference !== 0) {
			return borderCountDifference;
		}

		return getPathDistanceToOrigin(leftPath) - getPathDistanceToOrigin(rightPath);
	});

	return [...innerPaths, ...outerPaths];
};

const getResidualCutEdgeKey = (startPoint, endPoint) => {
	const startKey = `${roundCoord(startPoint?.x)}:${roundCoord(startPoint?.y)}`;
	const endKey = `${roundCoord(endPoint?.x)}:${roundCoord(endPoint?.y)}`;
	return startKey < endKey
		? `${startKey}|${endKey}`
		: `${endKey}|${startKey}`;
};

const buildResidualCutAreaOutlinePaths = (areas = [], sheetWidth, sheetHeight) => {
	const seenEdges = new Set();
	const outlinePaths = [];

	(Array.isArray(areas) ? areas : []).forEach(area => {
		const rectanglePath = buildRectanglePath(area);
		if (rectanglePath.length < 4) {
			return;
		}

		rectanglePath.forEach((startPoint, index) => {
			const endPoint = rectanglePath[(index + 1) % rectanglePath.length];
			if (isBorderEdge(startPoint, endPoint, sheetWidth, sheetHeight)) {
				return;
			}

			const nextPath = dedupePolyline([startPoint, endPoint]);
			if (nextPath.length < 2) {
				return;
			}

			const edgeKey = getResidualCutEdgeKey(nextPath[0], nextPath[1]);
			if (seenEdges.has(edgeKey)) {
				return;
			}

			seenEdges.add(edgeKey);
			outlinePaths.push(nextPath);
		});
	});

	return sortResidualCutPaths(outlinePaths, sheetWidth, sheetHeight);
};

const getOuterContours = (svgData) => {
	const parts = Array.isArray(svgData?.part_code) ? svgData.part_code : [];
	const positions = Array.isArray(svgData?.positions) ? svgData.positions : [];
	const partMap = new Map(parts.map(part => [part?.id ?? part?.uuid, part]));

	return positions.map(position => {
		const part = (
			partMap.get(position?.part_code_id) ||
			parts.find(item => item?.uuid === position?.part_code_id)
		);
		const outerContour = Array.isArray(part?.code)
			? part.code.find(item => (
				typeof item?.class === "string" &&
				item.class.includes("contour") &&
				item.class.includes("outer") &&
				typeof item?.path === "string" &&
				item.path.trim().length > 0
			))
			: null;

		if (!outerContour?.path) {
			return null;
		}

		const matrix = position?.positions || {};
		const transformedPath = transformPath(outerContour.path, matrix);
		const leadPolylines = (Array.isArray(part?.code) ? part.code : [])
			.filter(item => (
				item !== outerContour &&
				item?.cid === outerContour.cid &&
				typeof item?.class === "string" &&
				(
					item.class.includes("inlet") ||
					item.class.includes("outlet")
				) &&
				typeof item?.path === "string" &&
				item.path.trim().length > 0
			))
			.map(item => {
				const transformedLeadPath = transformPath(item.path, matrix);
				const points = getPathPoints(transformedLeadPath, 2);
				return {
					points,
					bbox: getBBoxFromPoints(points),
				};
			})
			.filter(item => item.points.length >= 2 && item.bbox);

		try {
			const bbox = SVGPathCommander.getPathBBox(transformedPath);
			const contourBbox = {
				left: sanitizeNumber(bbox?.x),
				top: sanitizeNumber(bbox?.y),
				right: sanitizeNumber(bbox?.x) + sanitizeNumber(bbox?.width),
				bottom: sanitizeNumber(bbox?.y) + sanitizeNumber(bbox?.height),
			};

			return {
				path: transformedPath,
				bbox: mergeBBoxes([contourBbox, ...leadPolylines.map(item => item.bbox)]),
				vertices: getPathVertices(transformedPath),
				leadPolylines,
			};
		} catch (error) {
			return null;
		}
	}).filter(Boolean);
};

const doesCellIntersectBBox = (cell, bbox) => !(
	sanitizeNumber(bbox?.right) <= cell.left + EPSILON ||
	sanitizeNumber(bbox?.left) >= cell.right - EPSILON ||
	sanitizeNumber(bbox?.bottom) <= cell.top + EPSILON ||
	sanitizeNumber(bbox?.top) >= cell.bottom - EPSILON
);

const isGridCellOccupied = (cell, contours = [], clearance = 0) => (
	doesAreaIntersectContours(cell, contours, clearance)
);

const findLargestEmptyRectangle = (grid = []) => {
	if (!Array.isArray(grid) || !grid.length || !Array.isArray(grid[0]) || !grid[0].length) {
		return { area: 0 };
	}

	const rowCount = grid.length;
	const columnCount = grid[0].length;
	const heights = new Array(columnCount).fill(0);
	let bestRectangle = { area: 0 };

	for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
		for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
			heights[columnIndex] = grid[rowIndex][columnIndex]
				? 0
				: heights[columnIndex] + 1;
		}

		const stack = [];

		for (let columnIndex = 0; columnIndex <= columnCount; columnIndex += 1) {
			const currentHeight = columnIndex === columnCount ? 0 : heights[columnIndex];
			let startIndex = columnIndex;

			while (stack.length && stack[stack.length - 1].height > currentHeight) {
				const previousItem = stack.pop();
				const width = columnIndex - previousItem.index;
				const area = previousItem.height * width;

				if (area > bestRectangle.area) {
					bestRectangle = {
						area,
						left: previousItem.index,
						right: columnIndex - 1,
						top: rowIndex - previousItem.height + 1,
						bottom: rowIndex,
					};
				}

				startIndex = previousItem.index;
			}

			if (!stack.length || stack[stack.length - 1].height < currentHeight) {
				stack.push({
					index: startIndex,
					height: currentHeight,
				});
			}
		}
	}

	return bestRectangle;
};

const normalizeAreaCollection = (areas = [], sheetWidth, sheetHeight) => (
	(Array.isArray(areas) ? areas : [])
		.map(area => normalizeResidualCutArea(area, sheetWidth, sheetHeight))
		.filter(Boolean)
);

export const clampResidualCutStep = (value) => {
	const numericValue = Number(value);

	if (!Number.isFinite(numericValue)) {
		return RESIDUAL_CUT_DEFAULT_STEP;
	}

	return clamp(
		Math.round(numericValue),
		RESIDUAL_CUT_MIN_STEP,
		RESIDUAL_CUT_MAX_STEP
	);
};

export const normalizeResidualCutSource = (source, hasAreas = false) => {
	if (!hasAreas) {
		return RESIDUAL_CUT_SOURCE_NONE;
	}

	if (source === RESIDUAL_CUT_SOURCE_NCP || source === RESIDUAL_CUT_SOURCE_USER) {
		return source;
	}

	return RESIDUAL_CUT_SOURCE_USER;
};

export const createEmptyResidualCutState = (step = RESIDUAL_CUT_DEFAULT_STEP) => ({
	step: clampResidualCutStep(step),
	areas: [],
	source: RESIDUAL_CUT_SOURCE_NONE,
});

export const normalizeResidualCutPoint = (point, sheetWidth, sheetHeight) => {
	if (!point) {
		return null;
	}

	return {
		x: roundCoord(clamp(sanitizeNumber(point.x), 0, sanitizeNumber(sheetWidth))),
		y: roundCoord(clamp(sanitizeNumber(point.y), 0, sanitizeNumber(sheetHeight))),
	};
};

const normalizeResidualCutDisplayPoint = (point) => {
	const x = Number(point?.x);
	const y = Number(point?.y);

	if (!Number.isFinite(x) || !Number.isFinite(y)) {
		return null;
	}

	return {
		x: roundCoord(x),
		y: roundCoord(y),
	};
};

export const normalizeResidualCutDisplayPaths = (paths = []) => (
	(Array.isArray(paths) ? paths : [])
		.map(path => dedupePolyline(
			(Array.isArray(path) ? path : [])
				.map(normalizeResidualCutDisplayPoint)
				.filter(Boolean)
		))
		.filter(path => path.length >= 2)
);

export const normalizeResidualCutArea = (area, sheetWidth, sheetHeight) => {
	if (!area) {
		return null;
	}

	const maxX = Math.max(0, sanitizeNumber(sheetWidth));
	const maxY = Math.max(0, sanitizeNumber(sheetHeight));
	const leftValue = sanitizeNumber(area.left ?? area.x1);
	const rightValue = sanitizeNumber(area.right ?? area.x2);
	const topValue = sanitizeNumber(area.top ?? area.y1);
	const bottomValue = sanitizeNumber(area.bottom ?? area.y2);
	const left = clamp(Math.min(leftValue, rightValue), 0, maxX);
	const right = clamp(Math.max(leftValue, rightValue), 0, maxX);
	const top = clamp(Math.min(topValue, bottomValue), 0, maxY);
	const bottom = clamp(Math.max(topValue, bottomValue), 0, maxY);

	if (right - left < EPSILON || bottom - top < EPSILON) {
		return null;
	}

	return {
		left: roundCoord(left),
		top: roundCoord(top),
		right: roundCoord(right),
		bottom: roundCoord(bottom),
		manual: Boolean(area.manual),
	};
};

export const snapResidualCutAreaToBounds = (
	area,
	sheetWidth,
	sheetHeight,
	snapDistance = RESIDUAL_CUT_SNAP_DISTANCE
) => {
	const normalizedArea = normalizeResidualCutArea(area, sheetWidth, sheetHeight);
	if (!normalizedArea) {
		return null;
	}

	let { left, top, right, bottom } = normalizedArea;
	const maxX = sanitizeNumber(sheetWidth);
	const maxY = sanitizeNumber(sheetHeight);

	if (left <= snapDistance) {
		left = 0;
	}
	if (top <= snapDistance) {
		top = 0;
	}
	if (Math.abs(maxX - right) <= snapDistance) {
		right = maxX;
	}
	if (Math.abs(maxY - bottom) <= snapDistance) {
		bottom = maxY;
	}

	return normalizeResidualCutArea(
		{ left, top, right, bottom, manual: normalizedArea.manual },
		sheetWidth,
		sheetHeight
	);
};

export const snapResidualCutAreaToExistingEdges = (
	area,
	existingAreas = [],
	snapDistance = RESIDUAL_CUT_SNAP_DISTANCE
) => {
	if (!area) {
		return null;
	}

	const xCandidates = [];
	const yCandidates = [];

	(Array.isArray(existingAreas) ? existingAreas : []).forEach(item => {
		if (!item) {
			return;
		}

		if (Number.isFinite(Number(item.left))) {
			xCandidates.push(Number(item.left));
		}
		if (Number.isFinite(Number(item.right))) {
			xCandidates.push(Number(item.right));
		}
		if (Number.isFinite(Number(item.top))) {
			yCandidates.push(Number(item.top));
		}
		if (Number.isFinite(Number(item.bottom))) {
			yCandidates.push(Number(item.bottom));
		}
	});

	const snapValue = (value, candidates) => {
		let nextValue = value;
		let minDistance = snapDistance + EPSILON;

		candidates.forEach(candidate => {
			const distance = Math.abs(value - candidate);
			if (distance <= snapDistance && distance < minDistance) {
				nextValue = candidate;
				minDistance = distance;
			}
		});

		return nextValue;
	};

	return normalizeResidualCutArea({
		...area,
		left: roundCoord(snapValue(sanitizeNumber(area.left), xCandidates)),
		right: roundCoord(snapValue(sanitizeNumber(area.right), xCandidates)),
		top: roundCoord(snapValue(sanitizeNumber(area.top), yCandidates)),
		bottom: roundCoord(snapValue(sanitizeNumber(area.bottom), yCandidates)),
	}, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
};

export const buildResidualCutGeometry = (areas = [], sheetWidth, sheetHeight) => {
	const normalizedAreas = normalizeAreaCollection(areas, sheetWidth, sheetHeight);
	const unionPaths = buildUnionPaths(normalizedAreas);
	const areaOutlinePaths = buildResidualCutAreaOutlinePaths(
		normalizedAreas,
		sheetWidth,
		sheetHeight
	);
	const cutPaths = sortResidualCutPaths(
		unionPaths.flatMap(path => splitRingIntoCutPaths(path, sheetWidth, sheetHeight)),
		sheetWidth,
		sheetHeight
	);
	const displayPaths = cutPaths.map(path => (
		path.map((point, index) => {
			const isEndpoint = index === 0 || index === path.length - 1;
			return isEndpoint && isResidualCutPointOnBorder(point, sheetWidth, sheetHeight)
				? extendDisplayPoint(point, sheetWidth, sheetHeight)
				: {
					x: roundCoord(point.x),
					y: roundCoord(point.y),
				};
		})
	));

	return {
		areas: normalizedAreas,
		unionPaths,
		areaOutlinePaths,
		fillPath: buildFillPath(unionPaths),
		cutPaths,
		displayPaths,
	};
};

export const generateAutoResidualCutAreas = (
	svgData,
	step = RESIDUAL_CUT_DEFAULT_STEP,
	safetyClearance = 0
) => {
	const sheetWidth = Math.max(0, sanitizeNumber(svgData?.width));
	const sheetHeight = Math.max(0, sanitizeNumber(svgData?.height));
	const normalizedStep = clampResidualCutStep(step);

	if (!sheetWidth || !sheetHeight) {
		return [];
	}

	const contours = getOuterContours(svgData);
	if (!contours.length) {
		return [];
	}

	const columnCount = Math.max(1, Math.ceil(sheetWidth / normalizedStep));
	const rowCount = Math.max(1, Math.ceil(sheetHeight / normalizedStep));
	const grid = Array.from({ length: rowCount }, () => Array(columnCount).fill(0));

	for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
		for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
			const cell = {
				left: columnIndex * normalizedStep,
				top: rowIndex * normalizedStep,
				right: Math.min(sheetWidth, (columnIndex + 1) * normalizedStep),
				bottom: Math.min(sheetHeight, (rowIndex + 1) * normalizedStep),
			};

			grid[rowIndex][columnIndex] = isGridCellOccupied(cell, contours, safetyClearance) ? 1 : 0;
		}
	}

	const nextAreas = [];

	for (let attempt = 0; attempt < AUTO_MAX_RECTANGLES; attempt += 1) {
		const rectangle = findLargestEmptyRectangle(grid);
		if (!rectangle.area) {
			break;
		}

		const area = normalizeResidualCutArea(
			{
				left: rectangle.left * normalizedStep,
				top: rectangle.top * normalizedStep,
				right: Math.min(sheetWidth, (rectangle.right + 1) * normalizedStep),
				bottom: Math.min(sheetHeight, (rectangle.bottom + 1) * normalizedStep),
			},
			sheetWidth,
			sheetHeight
		);

		if (!area) {
			break;
		}

		const areaWidth = sanitizeNumber(area.right) - sanitizeNumber(area.left);
		const areaHeight = sanitizeNumber(area.bottom) - sanitizeNumber(area.top);
		if (areaWidth + EPSILON < normalizedStep || areaHeight + EPSILON < normalizedStep) {
			break;
		}

		nextAreas.push(area);

		for (let rowIndex = rectangle.top; rowIndex <= rectangle.bottom; rowIndex += 1) {
			for (let columnIndex = rectangle.left; columnIndex <= rectangle.right; columnIndex += 1) {
				grid[rowIndex][columnIndex] = 1;
			}
		}
	}

	return nextAreas;
};

export const doesResidualCutAreaCollideWithParts = (
	svgData,
	area,
	safetyClearance = 0
) => {
	const normalizedArea = normalizeResidualCutArea(
		area,
		svgData?.width,
		svgData?.height
	);

	if (!normalizedArea) {
		return false;
	}

	return doesAreaIntersectContours(
		normalizedArea,
		getOuterContours(svgData),
		safetyClearance
	);
};

const getResidualCutPathRoleRank = (item) => {
	const className = String(item?.class || "").toLowerCase();

	if (className.includes("inlet")) {
		return 0;
	}

	if (className.includes("contour")) {
		return 1;
	}

	if (className.includes("outlet")) {
		return 2;
	}

	return 3;
};

const normalizeLegacyResidualCutPolyline = (points = [], sheetWidth, sheetHeight) => (
	dedupePolyline(
		(Array.isArray(points) ? points : [])
			.map(normalizeResidualCutDisplayPoint)
			.filter(Boolean)
	)
);

const tryAttachPolylineToEnd = (basePath = [], nextPath = []) => {
	if (!basePath.length) {
		return nextPath;
	}

	if (!nextPath.length) {
		return basePath;
	}

	if (samePoint(basePath[basePath.length - 1], nextPath[0])) {
		return [...basePath, ...nextPath.slice(1)];
	}

	if (samePoint(basePath[basePath.length - 1], nextPath[nextPath.length - 1])) {
		return [...basePath, ...[...nextPath].reverse().slice(1)];
	}

	return null;
};

const tryAttachPolylineToStart = (basePath = [], nextPath = []) => {
	if (!basePath.length) {
		return nextPath;
	}

	if (!nextPath.length) {
		return basePath;
	}

	if (samePoint(basePath[0], nextPath[nextPath.length - 1])) {
		return [...nextPath.slice(0, -1), ...basePath];
	}

	if (samePoint(basePath[0], nextPath[0])) {
		return [...[...nextPath].reverse().slice(0, -1), ...basePath];
	}

	return null;
};

const stitchResidualCutPolylines = (polylines = []) => {
	const queue = (Array.isArray(polylines) ? polylines : [])
		.map(path => dedupePolyline(path))
		.filter(path => path.length >= 2);
	const stitched = [];

	while (queue.length) {
		let currentPath = queue.shift();
		let hasMerged = true;

		while (hasMerged) {
			hasMerged = false;

			for (let index = 0; index < queue.length; index += 1) {
				const nextPath = queue[index];
				const mergedToEnd = tryAttachPolylineToEnd(currentPath, nextPath);
				const mergedToStart = mergedToEnd
					? null
					: tryAttachPolylineToStart(currentPath, nextPath);
				const mergedPath = mergedToEnd || mergedToStart;

				if (!mergedPath) {
					continue;
				}

				currentPath = dedupePolyline(mergedPath);
				queue.splice(index, 1);
				hasMerged = true;
				break;
			}
		}

		stitched.push(currentPath);
	}

	return stitched.filter(path => path.length >= 2);
};

const getResidualCutPolylinesFromPart = (part, position, sheetWidth, sheetHeight) => {
	if (!part || !Array.isArray(part.code)) {
		return [];
	}

	const groupedByCid = new Map();

	part.code.forEach(item => {
		if (!item?.path) {
			return;
		}

		const className = String(item.class || "").toLowerCase();
		if (
			!className.includes("contour") &&
			!className.includes("inlet") &&
			!className.includes("outlet")
		) {
			return;
		}

		const cid = Number(item.cid);
		if (!Number.isFinite(cid)) {
			return;
		}

		if (!groupedByCid.has(cid)) {
			groupedByCid.set(cid, []);
		}

		groupedByCid.get(cid).push(item);
	});

	const matrix = position?.positions || { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	const polylines = [];

	groupedByCid.forEach(items => {
		const pointGroups = items
			.slice()
			.sort((leftItem, rightItem) => (
				getResidualCutPathRoleRank(leftItem) - getResidualCutPathRoleRank(rightItem)
			))
			.map(item => normalizeLegacyResidualCutPolyline(
				getPathPoints(transformPath(item.path, matrix), 2),
				sheetWidth,
				sheetHeight
			))
			.filter(path => path.length >= 2);

		stitchResidualCutPolylines(pointGroups).forEach(path => {
			polylines.push(path);
		});
	});

	return polylines;
};

const sortNumericCoordinates = (values = [], minValue = 0, maxValue = Number.MAX_SAFE_INTEGER) => (
	[...new Set(
		(Array.isArray(values) ? values : [])
			.map(value => roundCoord(value))
			.filter(value => Number.isFinite(value) && value >= minValue - EPSILON && value <= maxValue + EPSILON)
	)]
		.map(value => clamp(value, minValue, maxValue))
		.sort((left, right) => left - right)
		.filter((value, index, items) => index === 0 || Math.abs(value - items[index - 1]) > EPSILON)
);

const getSegmentOverlap = (startA, endA, startB, endB) => (
	Math.min(Math.max(startA, endA), Math.max(startB, endB)) -
	Math.max(Math.min(startA, endA), Math.min(startB, endB))
);

const buildResidualCutSegments = (polylines = []) => (
	(Array.isArray(polylines) ? polylines : []).flatMap(path => (
		path.slice(0, -1).map((point, index) => ({
			start: point,
			end: path[index + 1],
		}))
	))
		.filter(segment => (
			segment.start &&
			segment.end &&
			(
				Math.abs(segment.start.x - segment.end.x) > EPSILON ||
				Math.abs(segment.start.y - segment.end.y) > EPSILON
			)
		))
);

const hasVerticalBarrier = (x, top, bottom, segments = []) => (
	(Array.isArray(segments) ? segments : []).some(segment => (
		Math.abs(sanitizeNumber(segment.start?.x) - sanitizeNumber(segment.end?.x)) <= EPSILON &&
		Math.abs(sanitizeNumber(segment.start?.x) - x) <= EPSILON &&
		getSegmentOverlap(
			sanitizeNumber(segment.start?.y),
			sanitizeNumber(segment.end?.y),
			top,
			bottom
		) > EPSILON
	))
);

const hasHorizontalBarrier = (y, left, right, segments = []) => (
	(Array.isArray(segments) ? segments : []).some(segment => (
		Math.abs(sanitizeNumber(segment.start?.y) - sanitizeNumber(segment.end?.y)) <= EPSILON &&
		Math.abs(sanitizeNumber(segment.start?.y) - y) <= EPSILON &&
		getSegmentOverlap(
			sanitizeNumber(segment.start?.x),
			sanitizeNumber(segment.end?.x),
			left,
			right
		) > EPSILON
	))
);

const getLegacyResidualCutPolylines = (
	svgData,
	partCode = RESIDUAL_CUT_PART_CODE
) => {
	const sheetWidth = Math.max(0, sanitizeNumber(svgData?.width));
	const sheetHeight = Math.max(0, sanitizeNumber(svgData?.height));
	const parts = Array.isArray(svgData?.part_code) ? svgData.part_code : [];
	const positions = Array.isArray(svgData?.positions) ? svgData.positions : [];
	const residualPart = parts.find(part => part?.name === partCode);

	if (!sheetWidth || !sheetHeight || !residualPart) {
		return [];
	}

	const residualPartId = residualPart.id ?? residualPart.uuid;
	const residualPositions = positions.filter(position => position?.part_code_id === residualPartId);
	const fallbackPosition = residualPositions.length
		? []
		: [{ positions: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 } }];

	return [...residualPositions, ...fallbackPosition]
		.flatMap(position => getResidualCutPolylinesFromPart(
			residualPart,
			position,
			sheetWidth,
			sheetHeight
		))
		.filter(path => path.length >= 2);
};

export const buildResidualCutPathsFromLegacyPart = (
	svgData,
	partCode = RESIDUAL_CUT_PART_CODE
) => normalizeResidualCutDisplayPaths(
	getLegacyResidualCutPolylines(svgData, partCode)
);

export const buildResidualCutAreasFromLegacyPart = (
	svgData,
	partCode = RESIDUAL_CUT_PART_CODE
) => {
	const sheetWidth = Math.max(0, sanitizeNumber(svgData?.width));
	const sheetHeight = Math.max(0, sanitizeNumber(svgData?.height));
	const parts = Array.isArray(svgData?.part_code) ? svgData.part_code : [];
	const positions = Array.isArray(svgData?.positions) ? svgData.positions : [];
	const residualPart = parts.find(part => part?.name === partCode);

	if (!sheetWidth || !sheetHeight || !residualPart) {
		return [];
	}

	const residualPartId = residualPart.id ?? residualPart.uuid;
	const residualPolylines = getLegacyResidualCutPolylines(svgData, partCode);

	if (!residualPolylines.length) {
		return [];
	}

	const collisionSvgData = {
		...svgData,
		part_code: parts.filter(part => part !== residualPart),
		positions: positions.filter(position => position?.part_code_id !== residualPartId),
	};
	const collisionContours = getOuterContours(collisionSvgData);
	const xCoordinates = [0, sheetWidth];
	const yCoordinates = [0, sheetHeight];

	residualPolylines.forEach(path => {
		path.forEach(point => {
			xCoordinates.push(point.x);
			yCoordinates.push(point.y);
		});
	});

	const xValues = sortNumericCoordinates(xCoordinates, 0, sheetWidth);
	const yValues = sortNumericCoordinates(yCoordinates, 0, sheetHeight);
	if (xValues.length < 2 || yValues.length < 2) {
		return [];
	}

	const segments = buildResidualCutSegments(residualPolylines);
	const rowCount = yValues.length - 1;
	const columnCount = xValues.length - 1;
	const cells = Array.from({ length: rowCount }, () => Array(columnCount).fill(null));

	for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
		for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
			const cell = normalizeResidualCutArea(
				{
					left: xValues[columnIndex],
					top: yValues[rowIndex],
					right: xValues[columnIndex + 1],
					bottom: yValues[rowIndex + 1],
				},
				sheetWidth,
				sheetHeight
			);

			if (!cell) {
				continue;
			}

			cells[rowIndex][columnIndex] = cell;
		}
	}

	const visited = Array.from({ length: rowCount }, () => Array(columnCount).fill(false));
	const recoveredAreas = [];
	const getCellKey = (rowIndex, columnIndex) => `${rowIndex}:${columnIndex}`;

	for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
		for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
			if (!cells[rowIndex][columnIndex] || visited[rowIndex][columnIndex]) {
				continue;
			}

			const queue = [[rowIndex, columnIndex]];
			const componentCells = [];
			const componentKeySet = new Set();
			visited[rowIndex][columnIndex] = true;

			while (queue.length) {
				const [currentRow, currentColumn] = queue.shift();
				const currentCell = cells[currentRow][currentColumn];
				if (!currentCell) {
					continue;
				}

				componentCells.push({
					row: currentRow,
					column: currentColumn,
					cell: currentCell,
				});
				componentKeySet.add(getCellKey(currentRow, currentColumn));

				if (currentColumn + 1 < columnCount && cells[currentRow][currentColumn + 1] && !visited[currentRow][currentColumn + 1]) {
					const edgeX = xValues[currentColumn + 1];
					if (!hasVerticalBarrier(edgeX, currentCell.top, currentCell.bottom, segments)) {
						visited[currentRow][currentColumn + 1] = true;
						queue.push([currentRow, currentColumn + 1]);
					}
				}

				if (currentColumn - 1 >= 0 && cells[currentRow][currentColumn - 1] && !visited[currentRow][currentColumn - 1]) {
					const edgeX = xValues[currentColumn];
					if (!hasVerticalBarrier(edgeX, currentCell.top, currentCell.bottom, segments)) {
						visited[currentRow][currentColumn - 1] = true;
						queue.push([currentRow, currentColumn - 1]);
					}
				}

				if (currentRow + 1 < rowCount && cells[currentRow + 1][currentColumn] && !visited[currentRow + 1][currentColumn]) {
					const edgeY = yValues[currentRow + 1];
					if (!hasHorizontalBarrier(edgeY, currentCell.left, currentCell.right, segments)) {
						visited[currentRow + 1][currentColumn] = true;
						queue.push([currentRow + 1, currentColumn]);
					}
				}

				if (currentRow - 1 >= 0 && cells[currentRow - 1][currentColumn] && !visited[currentRow - 1][currentColumn]) {
					const edgeY = yValues[currentRow];
					if (!hasHorizontalBarrier(edgeY, currentCell.left, currentCell.right, segments)) {
						visited[currentRow - 1][currentColumn] = true;
						queue.push([currentRow - 1, currentColumn]);
					}
				}
			}

			if (!componentCells.length) {
				continue;
			}

			const minRow = Math.min(...componentCells.map(item => item.row));
			const maxRow = Math.max(...componentCells.map(item => item.row));
			const minColumn = Math.min(...componentCells.map(item => item.column));
			const maxColumn = Math.max(...componentCells.map(item => item.column));
			let isSolidRectangle = true;

			for (let checkRow = minRow; checkRow <= maxRow && isSolidRectangle; checkRow += 1) {
				for (let checkColumn = minColumn; checkColumn <= maxColumn; checkColumn += 1) {
					if (
						!cells[checkRow][checkColumn] ||
						!componentKeySet.has(getCellKey(checkRow, checkColumn))
					) {
						isSolidRectangle = false;
						break;
					}
				}
			}

			if (!isSolidRectangle) {
				continue;
			}

			const area = normalizeResidualCutArea(
				{
					left: xValues[minColumn],
					top: yValues[minRow],
					right: xValues[maxColumn + 1],
					bottom: yValues[maxRow + 1],
					manual: false,
				},
				sheetWidth,
				sheetHeight
			);

			if (area && !doesAreaIntersectContours(area, collisionContours, 0)) {
				recoveredAreas.push(area);
			}
		}
	}

	return recoveredAreas.sort((firstArea, secondArea) => {
		const firstValue = (
			(sanitizeNumber(firstArea?.right) - sanitizeNumber(firstArea?.left)) *
			(sanitizeNumber(firstArea?.bottom) - sanitizeNumber(firstArea?.top))
		);
		const secondValue = (
			(sanitizeNumber(secondArea?.right) - sanitizeNumber(secondArea?.left)) *
			(sanitizeNumber(secondArea?.bottom) - sanitizeNumber(secondArea?.top))
		);

		if (Math.abs(secondValue - firstValue) > EPSILON) {
			return secondValue - firstValue;
		}

		if (Math.abs(sanitizeNumber(firstArea?.left) - sanitizeNumber(secondArea?.left)) > EPSILON) {
			return sanitizeNumber(firstArea?.left) - sanitizeNumber(secondArea?.left);
		}

		return sanitizeNumber(firstArea?.top) - sanitizeNumber(secondArea?.top);
	});
};

export const toResidualCutPolylinePoints = (path = []) => (
	(Array.isArray(path) ? path : [])
		.map(point => `${roundCoord(point.x)},${roundCoord(point.y)}`)
		.join(" ")
);

export const buildResidualCutSimulationSequence = (displayPaths = []) => {
	const sequence = [];
	let previousPoint = null;

	(Array.isArray(displayPaths) ? displayPaths : []).forEach(path => {
		const cleanPath = dedupePolyline(path);
		if (cleanPath.length < 2) {
			return;
		}

		if (previousPoint && !samePoint(previousPoint, cleanPath[0])) {
			sequence.push({
				kind: "move",
				start: { ...previousPoint },
				end: { ...cleanPath[0] },
			});
		}

		for (let index = 0; index < cleanPath.length - 1; index += 1) {
			if (samePoint(cleanPath[index], cleanPath[index + 1])) {
				continue;
			}

			sequence.push({
				kind: "cut",
				start: { ...cleanPath[index] },
				end: { ...cleanPath[index + 1] },
			});
		}

		previousPoint = cleanPath[cleanPath.length - 1];
	});

	return sequence;
};

export const buildResidualCutMetadataLines = (residualCut, sheetWidth, sheetHeight) => {
	const step = clampResidualCutStep(residualCut?.step);
	const areas = normalizeAreaCollection(residualCut?.areas, sheetWidth, sheetHeight);

	if (!areas.length && step === RESIDUAL_CUT_DEFAULT_STEP) {
		return [];
	}

	return [
		`(<ResidualCut Step="${step}">)`,
		...areas.map(area => (
			`(<ResidualCutArea Left="${roundCoord(area.left)}" Top="${roundCoord(area.top)}" Right="${roundCoord(area.right)}" Bottom="${roundCoord(area.bottom)}" Manual="${area.manual ? 1 : 0}">)`
		)),
		`(</ResidualCut>)`,
	];
};

export const parseResidualCutMetadata = (
	lines,
	fallbackStep = RESIDUAL_CUT_DEFAULT_STEP,
	sheetWidth = 0,
	sheetHeight = 0
) => {
	const rawLines = Array.isArray(lines) ? lines : [];
	const stepLine = rawLines.find(line => /<ResidualCut Step=/i.test(line));
	const stepMatch = stepLine?.match(/Step="([^"]+)"/i);
	const step = clampResidualCutStep(stepMatch?.[1] ?? fallbackStep);
	const areas = [];

	rawLines.forEach(line => {
		const areaMatch = line.match(
			/<ResidualCutArea Left="([^"]+)" Top="([^"]+)" Right="([^"]+)" Bottom="([^"]+)"(?: Manual="([^"]+)")?/i
		);

		if (!areaMatch) {
			return;
		}

		const area = normalizeResidualCutArea(
			{
				left: areaMatch[1],
				top: areaMatch[2],
				right: areaMatch[3],
				bottom: areaMatch[4],
				manual: areaMatch[5] === "1",
			},
			sheetWidth,
			sheetHeight
		);

		if (area) {
			areas.push(area);
		}
	});

	return {
		step,
		areas,
		source: areas.length ? RESIDUAL_CUT_SOURCE_NCP : RESIDUAL_CUT_SOURCE_NONE,
	};
};

export const buildResidualCutPartLines = ({
	displayPaths = [],
	programNumber,
	sheetWidth,
	sheetHeight,
}) => {
	const validProgramNumber = Math.max(0, Math.trunc(sanitizeNumber(programNumber)));
	const width = Math.max(0, sanitizeNumber(sheetWidth));
	const height = Math.max(0, sanitizeNumber(sheetHeight));
	const paths = (Array.isArray(displayPaths) ? displayPaths : [])
		.map(dedupePolyline)
		.filter(path => path.length >= 2);

	if (!validProgramNumber || !paths.length || !width || !height) {
		return [];
	}

	const lines = [
		`(<Part PartCode="${RESIDUAL_CUT_PART_CODE}" Debit="1">)`,
		`N0G28X${roundCoord(width)}Y${roundCoord(height)}L${validProgramNumber}P1`,
	];

	paths.forEach(path => {
		lines.push(`(<Contour>)`);
		lines.push(
			`N0G0X${roundCoord(path[0].x)}Y${roundCoord(height - path[0].y)}`
		);

		for (let index = 1; index < path.length; index += 1) {
			const point = path[index];
			const suffix = index === 1 ? "M4" : "";
			lines.push(
				`N0G1X${roundCoord(point.x)}Y${roundCoord(height - point.y)}${suffix}`
			);
		}

		lines.push(`N0M5`);
		lines.push(`(</Contour>)`);
	});

	lines.push(`N0G98`);
	lines.push(`(</Part>)`);

	return lines;
};

export const buildResidualCutPlanLine = (programNumber) => {
	const validProgramNumber = Math.max(0, Math.trunc(sanitizeNumber(programNumber)));
	return validProgramNumber
		? `N0G52X0Y0L${validProgramNumber}C0`
		: null;
};
