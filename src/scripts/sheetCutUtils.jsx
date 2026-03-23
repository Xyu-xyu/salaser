import SVGPathCommander from "svg-path-commander";
import svgPath from "svgpath";
import util from "./util.jsx";

const partPreviewCache = new WeakMap();
const partCutItemCache = new WeakMap();
const positionPreviewCache = new WeakMap();
const sheetCutPositionItemCache = new WeakMap();
const EPSILON = 0.0001;
export const SHEET_CUT_DEFAULT_SECTOR_SIZE = 100;
export const SHEET_CUT_ORDER_MODES = ["current", "auto", "manual"];

const hasPath = (item) => typeof item?.path === "string" && item.path.trim().length > 0;
const hasClass = (item, className) =>
	typeof item?.class === "string" && item.class.includes(className);
const getPathSize = (path) => (typeof path === "string" ? path.length : 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

export const getMaxSheetCutSectorSize = (svgData) => {
	const width = Number(svgData?.width);
	const height = Number(svgData?.height);

	if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
		return SHEET_CUT_DEFAULT_SECTOR_SIZE;
	}

	return Math.max(1, Math.min(width, height));
};

export const clampSheetCutSectorSize = (
	svgData,
	sectorSize = SHEET_CUT_DEFAULT_SECTOR_SIZE
) => {
	return clamp(
		Number(sectorSize) || SHEET_CUT_DEFAULT_SECTOR_SIZE,
		1,
		getMaxSheetCutSectorSize(svgData)
	);
};

const getPartCodeSignature = (part) => {
	const partId = part?.id ?? part?.uuid ?? "unknown";
	if (!Array.isArray(part?.code)) return `${partId}:0`;

	return `${partId}:${part.code.length}:${part.code
		.map(item => `${item?.cid ?? ""}:${item?.class ?? ""}:${getPathSize(item?.path)}`)
		.join("|")}`;
};

export const getPartByCodeId = (svgData, partCodeId) => {
	if (!svgData || !Array.isArray(svgData.part_code)) return null;

	return (
		svgData.part_code.find(
			part => part?.id === partCodeId || part?.uuid === partCodeId
		) || null
	);
};

const getMatrix = (pos) => {
	const { a = 1, b = 0, c = 0, d = 1, e = 0, f = 0 } = pos?.positions || {};
	return [a, b, c, d, e, f];
};

const getMatrixSignature = (pos) => getMatrix(pos)
	.map(value => Number(value) || 0)
	.join(":");

const getMatrixObject = (pos) => {
	const { a = 1, b = 0, c = 0, d = 1, e = 0, f = 0 } = pos?.positions || {};
	return { a, b, c, d, e, f };
};

export const transformPositionPath = (path, pos) => {
	if (!path || !pos?.positions) return "";

	try {
		return svgPath(path).matrix(getMatrix(pos)).toString();
	} catch (error) {
		console.warn("Path transform error:", error);
		return "";
	}
};

const getCutItemsForPart = (part) => {
	if (!Array.isArray(part?.code)) return [];

	const signature = getPartCodeSignature(part);
	const cached = partCutItemCache.get(part);
	if (cached?.signature === signature) {
		return cached.items;
	}

	const items = part.code.filter(item => hasPath(item) && !hasClass(item, "macro5"));
	const contours = items.filter(item => hasClass(item, "contour"));
	const innerContours = contours.filter(
		item => hasClass(item, "inner") && !hasClass(item, "outer")
	);
	const outerContours = contours.filter(item => hasClass(item, "outer"));

	const getByCidAndClass = (cid, className) =>
		items.find(item => item?.cid === cid && hasClass(item, className));

	const cutItems = [...innerContours, ...outerContours].flatMap(contour => {
		const inlet = getByCidAndClass(contour.cid, "inlet");
		const outlet = getByCidAndClass(contour.cid, "outlet");

		return [inlet, contour, outlet].filter(Boolean);
	});

	partCutItemCache.set(part, {
		signature,
		items: cutItems,
	});

	return cutItems;
};

const getPartBaseBBox = (part, fallbackPath) => {
	if (
		Number.isFinite(part?.x) &&
		Number.isFinite(part?.y) &&
		Number.isFinite(part?.width) &&
		Number.isFinite(part?.height)
	) {
		return {
			x: part.x,
			y: part.y,
			width: part.width,
			height: part.height,
		};
	}

	if (!fallbackPath?.trim()) return null;

	try {
		return SVGPathCommander.getPathBBox(fallbackPath);
	} catch (error) {
		console.warn("Base bbox error:", error);
		return null;
	}
};

const transformPoint = (matrix, x, y) => ({
	x: matrix.a * x + matrix.c * y + matrix.e,
	y: matrix.b * x + matrix.d * y + matrix.f,
});

const transformBBox = (bbox, pos) => {
	if (!bbox) return null;

	const matrix = getMatrixObject(pos);
	const points = [
		transformPoint(matrix, bbox.x, bbox.y),
		transformPoint(matrix, bbox.x + bbox.width, bbox.y),
		transformPoint(matrix, bbox.x + bbox.width, bbox.y + bbox.height),
		transformPoint(matrix, bbox.x, bbox.y + bbox.height),
	];

	const xs = points.map(point => point.x);
	const ys = points.map(point => point.y);
	const minX = Math.min(...xs);
	const minY = Math.min(...ys);
	const maxX = Math.max(...xs);
	const maxY = Math.max(...ys);

	return {
		x: minX,
		y: minY,
		width: maxX - minX,
		height: maxY - minY,
	};
};

const getPartPreviewData = (part) => {
	if (!part || !Array.isArray(part.code)) return null;

	const signature = getPartCodeSignature(part);
	const cached = partPreviewCache.get(part);
	if (cached?.signature === signature) return cached.result;

	const contourPaths = [];
	const outerContourPaths = [];
	const innerContourPaths = [];
	const inletOutletPaths = [];

	part.code.forEach(item => {
		if (!hasPath(item) || hasClass(item, "macro5")) return;

		if (hasClass(item, "contour")) {
			contourPaths.push(item.path);
			if (hasClass(item, "outer")) {
				outerContourPaths.push(item.path);
			} else if (hasClass(item, "inner")) {
				innerContourPaths.push(item.path);
			}
		}

		if (hasClass(item, "inlet") || hasClass(item, "outlet")) {
			inletOutletPaths.push(item.path);
		}
	});

	const contourPath = contourPaths.join(" z ");
	const outerContourPath = (outerContourPaths.length ? outerContourPaths : contourPaths).join(" z ");
	const innerContourPath = innerContourPaths.join(" z ");
	const inletOutletPath = inletOutletPaths.join(" ");
	const bbox = getPartBaseBBox(part, `${contourPath} ${inletOutletPath}`);
	const result = bbox
		? {
			bbox,
			contourPath,
			outerContourPath,
			outerContourPaths: [...(outerContourPaths.length ? outerContourPaths : contourPaths)],
			innerContourPath,
			innerContourPaths: [...innerContourPaths],
			inletOutletPath,
			part,
		}
		: null;

	partPreviewCache.set(part, {
		signature,
		result,
	});

	return result;
};

export const getPositionCutPath = (svgData, pos) => {
	const part = getPartByCodeId(svgData, pos?.part_code_id);
	if (!part) return "";

	return getCutItemsForPart(part)
		.map(item => transformPositionPath(item.path, pos))
		.filter(Boolean)
		.join(" ");
};

export const getPositionPreviewData = (svgData, pos) => {
	const part = getPartByCodeId(svgData, pos?.part_code_id);
	const previewData = getPartPreviewData(part);
	if (!previewData?.bbox) return null;

	const signature = `${getPartCodeSignature(part)}:${getMatrixSignature(pos)}`;
	const cached = positionPreviewCache.get(pos);
	if (cached?.signature === signature) {
		return cached.result;
	}

	const result = {
		...previewData,
		bbox: transformBBox(previewData.bbox, pos),
		outerContourPaths: (previewData.outerContourPaths || [])
			.map(path => transformPositionPath(path, pos))
			.filter(Boolean),
		innerContourPath: transformPositionPath(previewData.innerContourPath, pos),
		innerContourPaths: (previewData.innerContourPaths || [])
			.map(path => transformPositionPath(path, pos))
			.filter(Boolean),
		outerContourPath: transformPositionPath(
			previewData.outerContourPath || previewData.contourPath,
			pos
		),
	};

	positionPreviewCache.set(pos, {
		signature,
		result,
	});

	return result;
};

const getSectorRowFromBottom = (centerY, sheetHeight, sectorSize) => {
	const distanceFromBottom = Math.max(0, sheetHeight - centerY - EPSILON);
	return Math.max(0, Math.floor(distanceFromBottom / sectorSize));
};

const sortSectorItems = (items) => [...items].sort((left, right) => {
	if (Math.abs(right.centerY - left.centerY) > EPSILON) {
		return right.centerY - left.centerY;
	}

	if (Math.abs(left.centerX - right.centerX) > EPSILON) {
		return left.centerX - right.centerX;
	}

	return (left.partId ?? 0) - (right.partId ?? 0);
});

const sortCheckerboardSectors = (sectors) => {
	const compareByGridPosition = (left, right) => {
		if (left.col !== right.col) return left.col - right.col;
		if (left.row !== right.row) return left.row - right.row;
		return 0;
	};

	const firstPhase = [...sectors]
		.filter(sector => (sector.row + sector.col) % 2 === 0)
		.sort(compareByGridPosition);
	const secondPhase = [...sectors]
		.filter(sector => (sector.row + sector.col) % 2 !== 0)
		.sort(compareByGridPosition);

	return [...firstPhase, ...secondPhase];
};

const getBBoxArea = (bbox) => Math.max(0, (bbox?.width || 0) * (bbox?.height || 0));

const getPathVertices = (path) => {
	if (!path?.trim()) {
		return [];
	}

	try {
		const points = util.pathToPolyline(path, 1)
			.split(";")
			.map(point => point.split(",").map(Number))
			.filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
			.map(([x, y]) => ({ x, y }));
		const vertices = [];

		points.forEach(point => {
			const previousPoint = vertices[vertices.length - 1];
			if (
				previousPoint &&
				Math.abs(previousPoint.x - point.x) <= EPSILON &&
				Math.abs(previousPoint.y - point.y) <= EPSILON
			) {
				return;
			}

			vertices.push(point);
		});

		if (vertices.length > 1) {
			const firstPoint = vertices[0];
			const lastPoint = vertices[vertices.length - 1];
			if (
				Math.abs(firstPoint.x - lastPoint.x) <= EPSILON &&
				Math.abs(firstPoint.y - lastPoint.y) <= EPSILON
			) {
				vertices.pop();
			}
		}

		return vertices;
	} catch (error) {
		console.warn("Path vertex detection error:", error);
		return [];
	}
};

const containsPointInVertices = (point, vertices) => {
	if (!point || !Array.isArray(vertices) || vertices.length < 3) {
		return false;
	}

	const x = Array.isArray(point) ? point[0] : point.x;
	const y = Array.isArray(point) ? point[1] : point.y;
	let inside = false;

	for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
		const xi = vertices[i].x;
		const yi = vertices[i].y;
		const xj = vertices[j].x;
		const yj = vertices[j].y;
		const intersect = ((yi > y) !== (yj > y))
			&& (x < (xj - xi) * (y - yi) / (yj - yi) + xi);

		if (intersect) inside = !inside;
	}

	return inside;
};

const containsPointInAnyPolygon = (point, polygons = []) =>
	polygons.some(vertices => containsPointInVertices(point, vertices));

const createPathPointTester = (paths) => {
	const pathList = Array.isArray(paths) ? paths : [paths];
	const polygons = pathList
		.filter(path => typeof path === "string" && path.trim().length > 0)
		.map(path => getPathVertices(path))
		.filter(vertices => vertices.length >= 3);

	if (!polygons.length) {
		return null;
	}

	return (point) => containsPointInAnyPolygon(point, polygons);
};

const getRepresentativePoint = (bbox, containsPoint) => {
	if (!bbox) {
		return { x: 0, y: 0 };
	}

	const candidates = [
		{ x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2 },
		{ x: bbox.x + bbox.width * 0.25, y: bbox.y + bbox.height * 0.25 },
		{ x: bbox.x + bbox.width * 0.75, y: bbox.y + bbox.height * 0.25 },
		{ x: bbox.x + bbox.width * 0.25, y: bbox.y + bbox.height * 0.75 },
		{ x: bbox.x + bbox.width * 0.75, y: bbox.y + bbox.height * 0.75 },
	];

	return candidates.find(point => !containsPoint || containsPoint(point)) || candidates[0];
};

const dedupePoints = (points) => {
	const seen = new Set();

	return points.filter(point => {
		if (!point || !Number.isFinite(point.x) || !Number.isFinite(point.y)) {
			return false;
		}

		const key = `${point.x.toFixed(4)}:${point.y.toFixed(4)}`;
		if (seen.has(key)) return false;
		seen.add(key);
		return true;
	});
};

const getFallbackExtremePoints = (bbox, containsPoint) => {
	if (!bbox) {
		return [{ x: 0, y: 0 }];
	}

	const points = [
		{ x: bbox.x, y: bbox.y },
		{ x: bbox.x + bbox.width, y: bbox.y },
		{ x: bbox.x, y: bbox.y + bbox.height },
		{ x: bbox.x + bbox.width, y: bbox.y + bbox.height },
		{ x: bbox.x + bbox.width / 2, y: bbox.y },
		{ x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height },
		{ x: bbox.x, y: bbox.y + bbox.height / 2 },
		{ x: bbox.x + bbox.width, y: bbox.y + bbox.height / 2 },
		getRepresentativePoint(bbox, containsPoint),
	];

	return dedupePoints(points);
};

const getExtremePoints = (paths, bbox, containsPoint) => {
	const pathList = Array.isArray(paths) ? paths : [paths];
	if (!pathList.some(path => path?.trim())) {
		return getFallbackExtremePoints(bbox, containsPoint);
	}

	try {
		const contourPoints = pathList.flatMap(path => getPathVertices(path));

		if (!contourPoints.length) {
			return getFallbackExtremePoints(bbox, containsPoint);
		}

		const xs = contourPoints.map(point => point.x);
		const ys = contourPoints.map(point => point.y);
		const minX = Math.min(...xs);
		const maxX = Math.max(...xs);
		const minY = Math.min(...ys);
		const maxY = Math.max(...ys);
		const tolerance = Math.max(EPSILON, Math.max(maxX - minX, maxY - minY) * 0.005);
		const extremePoints = contourPoints.filter(point =>
			Math.abs(point.x - minX) <= tolerance ||
			Math.abs(point.x - maxX) <= tolerance ||
			Math.abs(point.y - minY) <= tolerance ||
			Math.abs(point.y - maxY) <= tolerance
		);

		return dedupePoints([
			...extremePoints,
			getRepresentativePoint(bbox, containsPoint),
		]);
	} catch (error) {
		console.warn("Extreme point detection error:", error);
		return getFallbackExtremePoints(bbox, containsPoint);
	}
};

const getSheetCutPositionItemSignature = (svgData, pos) => {
	const part = getPartByCodeId(svgData, pos?.part_code_id);
	return `${getPartCodeSignature(part)}:${getMatrixSignature(pos)}`;
};

const getSheetCutPositionItem = (svgData, pos, index) => {
	const signature = getSheetCutPositionItemSignature(svgData, pos);
	const cached = sheetCutPositionItemCache.get(pos);
	if (cached?.signature === signature) {
		return cached.result;
	}

	const preview = getPositionPreviewData(svgData, pos);
	const bbox = preview?.bbox;
	const centerX = bbox ? bbox.x + bbox.width / 2 : Number(pos?.cx) || 0;
	const centerY = bbox ? bbox.y + bbox.height / 2 : Number(pos?.cy) || 0;
	const outerContourPath = preview?.outerContourPath || preview?.contourPath || "";
	const outerContourPaths = preview?.outerContourPaths?.length
		? preview.outerContourPaths
		: [outerContourPath];
	const containsPoint = createPathPointTester(outerContourPaths);
	const extremePoints = getExtremePoints(outerContourPaths, bbox, containsPoint);
	const result = {
		partId: pos?.part_id ?? index,
		centerX,
		centerY,
		pos,
		bbox,
		bboxArea: getBBoxArea(bbox),
		outerContourPath,
		containsPoint,
		extremePoints,
		representativePoint: extremePoints[0] || { x: centerX, y: centerY },
	};

	sheetCutPositionItemCache.set(pos, {
		signature,
		result,
	});

	return result;
};

const getSheetCutPositionItems = (svgData) =>
	(Array.isArray(svgData?.positions) ? svgData.positions : [])
		.map((pos, index) => getSheetCutPositionItem(svgData, pos, index))
		.filter(item => item?.pos);

const isPointInsideBBox = (point, bbox, tolerance = 0) => (
	Boolean(point && bbox) &&
	point.x >= bbox.x - tolerance &&
	point.x <= bbox.x + bbox.width + tolerance &&
	point.y >= bbox.y - tolerance &&
	point.y <= bbox.y + bbox.height + tolerance
);

const getSectorOrderedItems = (items, sheetHeight, sectorSize) => {
	const sectorMap = new Map();

	items.forEach(item => {
		const col = Math.max(0, Math.floor(Math.max(0, item.centerX) / sectorSize));
		const row = getSectorRowFromBottom(item.centerY, sheetHeight, sectorSize);
		const key = `${col}:${row}`;

		if (!sectorMap.has(key)) {
			sectorMap.set(key, {
				key,
				col,
				row,
				items: [],
			});
		}

		sectorMap.get(key).items.push(item);
	});

	const sectors = [...sectorMap.values()].map(sector => ({
		...sector,
		items: sortSectorItems(sector.items),
	}));

	return sortCheckerboardSectors(sectors).flatMap(sector => sector.items);
};

const isNestedInside = (outerItem, innerItem) => {
	if (outerItem.partId === innerItem.partId) return false;
	if (!outerItem.bbox || !Array.isArray(innerItem.extremePoints)) return false;
	if (outerItem.bboxArea <= innerItem.bboxArea + EPSILON) return false;

	const tolerance = Math.max(
		EPSILON,
		Math.min(outerItem.bbox.width || 0, outerItem.bbox.height || 0) * 0.01
	);
	const nestedExtremePoints = (innerItem.extremePoints || [])
		.filter(point => isPointInsideBBox(point, outerItem.bbox, tolerance));
	const contourTester = outerItem.containsPoint;

	if (!nestedExtremePoints.length || typeof contourTester !== "function") {
		return false;
	}

	return nestedExtremePoints.some(point => contourTester(point));
};

const prioritizeNestedDetailOrder = (items) => {
	const itemById = new Map(items.map(item => [item.partId, item]));
	const baseOrderIndex = new Map(items.map((item, index) => [item.partId, index]));
	const nestedPartIdsByOuterPartId = new Map(
		items.map(item => [item.partId, []])
	);

	items.forEach(outerItem => {
		const nestedPartIds = items
			.filter(innerItem => isNestedInside(outerItem, innerItem))
			.map(innerItem => innerItem.partId)
			.sort(
				(left, right) =>
					(baseOrderIndex.get(left) ?? 0) - (baseOrderIndex.get(right) ?? 0)
			);

		nestedPartIdsByOuterPartId.set(outerItem.partId, nestedPartIds);
	});

	const orderedItems = [];
	const emittedPartIds = new Set();
	const activePartIds = new Set();

	const appendItemWithNestedDetails = (item) => {
		if (!item) return;
		if (emittedPartIds.has(item.partId)) return;
		if (activePartIds.has(item.partId)) return;

		activePartIds.add(item.partId);

		(nestedPartIdsByOuterPartId.get(item.partId) || []).forEach(nestedPartId => {
			appendItemWithNestedDetails(itemById.get(nestedPartId));
		});

		activePartIds.delete(item.partId);

		if (!emittedPartIds.has(item.partId)) {
			emittedPartIds.add(item.partId);
			orderedItems.push(item);
		}
	};

	items.forEach(item => {
		appendItemWithNestedDetails(item);
	});

	return orderedItems;
};

export const getAutoSheetCutOrder = (
	svgData,
	sectorSize = SHEET_CUT_DEFAULT_SECTOR_SIZE
) => {
	if (!svgData || !Array.isArray(svgData.positions) || !svgData.positions.length) {
		return [];
	}

	const safeSectorSize = clampSheetCutSectorSize(svgData, sectorSize);
	const sheetHeight = Number(svgData?.height) || 0;
	const items = prioritizeNestedDetailOrder(
		getSectorOrderedItems(getSheetCutPositionItems(svgData), sheetHeight, safeSectorSize)
	);

	// Phase 1 starts from the bottom-left checkerboard sector, then moves vertically.
	return items.map(item => item.pos)
		.filter(Boolean);
};
