import SVGPathCommander from "svg-path-commander";
import svgPath from "svgpath";
import ClipperLib from "clipper-lib";
import util from "./util.jsx";

const partPreviewCache = new WeakMap();
const partCutItemCache = new WeakMap();
const positionPreviewCache = new WeakMap();
const sheetCutPositionItemCache = new WeakMap();
const partSafetyGeometryCache = new WeakMap();
const partSafetyModelCache = new WeakMap();
const positionSafetyGeometryCache = new WeakMap();
const EPSILON = 0.0001;
const SHEET_SAFETY_CLIPPER_SCALE = 1000;
const SHEET_SAFETY_AREA_EPSILON = 0.01;
const SHEET_SAFETY_MIN_CELL_SIZE = 25;
const SHEET_SAFETY_MIN_OPEN_PATH_RADIUS = 0.001;
const SHEET_SAFETY_MODEL_MATRIX_TOLERANCE = 0.001;
export const SHEET_CUT_DEFAULT_SECTOR_SIZE = 100;
export const SHEET_CUT_ORDER_MODES = ["current", "auto", "manual"];
export const SHEET_SAFETY_DEFAULT_CLEARANCE = 10;

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

const getContourGroupsForPart = (part) => {
	if (!Array.isArray(part?.code)) return [];

	const items = part.code.filter(item => hasPath(item) && !hasClass(item, "macro5"));
	const contours = items.filter(item => hasClass(item, "contour"));
	const orderedContours = [
		...contours.filter(item => hasClass(item, "inner") && !hasClass(item, "outer")),
		...contours.filter(item => hasClass(item, "outer")),
	];

	return orderedContours.map(contour => {
		const linkedItems = items.filter(item => (
			item !== contour &&
			item?.cid === contour?.cid &&
			(hasClass(item, "inlet") || hasClass(item, "outlet"))
		));

		return {
			contour,
			isOuter: hasClass(contour, "outer"),
			isInner: hasClass(contour, "inner") && !hasClass(contour, "outer"),
			linkedItems,
		};
	});
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

	const cutItems = getContourGroupsForPart(part).flatMap(({ contour, linkedItems }) => {
		const inletItems = linkedItems.filter(item => hasClass(item, "inlet"));
		const outletItems = linkedItems.filter(item => hasClass(item, "outlet"));
		return [...inletItems, contour, ...outletItems].filter(Boolean);
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

export const normalizeSheetSafetyClearance = (clearance = SHEET_SAFETY_DEFAULT_CLEARANCE) => {
	const numericClearance = Number(clearance);
	return Math.max(
		0,
		Number.isFinite(numericClearance) ? numericClearance : SHEET_SAFETY_DEFAULT_CLEARANCE
	);
};

const getSheetSafetyRadius = (clearance) => normalizeSheetSafetyClearance(clearance) / 2;

const canUsePartSafetyModelForPosition = (pos) => {
	const { a = 1, b = 0, c = 0, d = 1 } = getMatrixObject(pos);
	const firstAxisLength = Math.hypot(a, b);
	const secondAxisLength = Math.hypot(c, d);
	const axisDot = (a * c) + (b * d);

	return (
		Math.abs(firstAxisLength - 1) <= SHEET_SAFETY_MODEL_MATRIX_TOLERANCE &&
		Math.abs(secondAxisLength - 1) <= SHEET_SAFETY_MODEL_MATRIX_TOLERANCE &&
		Math.abs(axisDot) <= SHEET_SAFETY_MODEL_MATRIX_TOLERANCE
	);
};

const cloneClipperPath = (path = []) => path.map(point => ({
	X: Number(point?.X) || 0,
	Y: Number(point?.Y) || 0,
}));

const cloneClipperPaths = (paths = []) => paths.map(path => cloneClipperPath(path));

const hasMeaningfulClipperOpenPath = (path = []) => (
	Array.isArray(path) &&
	path.length >= 2 &&
	path.some((point, index) => {
		if (index === 0) return false;

		const previousPoint = path[index - 1];
		return Math.hypot(
			(Number(point?.X) || 0) - (Number(previousPoint?.X) || 0),
			(Number(point?.Y) || 0) - (Number(previousPoint?.Y) || 0)
		) > EPSILON;
	})
);

const filterMeaningfulClipperOpenPaths = (paths = []) =>
	(Array.isArray(paths) ? paths : [])
		.map(path => cloneClipperPath(path))
		.filter(hasMeaningfulClipperOpenPath);

const getClipperPathArea = (path = []) => {
	if (!Array.isArray(path) || path.length < 3) {
		return 0;
	}

	let area = 0;

	for (let index = 0; index < path.length; index += 1) {
		const currentPoint = path[index];
		const nextPoint = path[(index + 1) % path.length];
		area += (Number(currentPoint?.X) || 0) * (Number(nextPoint?.Y) || 0);
		area -= (Number(nextPoint?.X) || 0) * (Number(currentPoint?.Y) || 0);
	}

	return area / 2;
};

const hasMeaningfulClipperPath = (path = []) =>
	Array.isArray(path) &&
	path.length >= 3 &&
	Math.abs(getClipperPathArea(path)) > SHEET_SAFETY_AREA_EPSILON;

const filterMeaningfulClipperPaths = (paths = []) =>
	(Array.isArray(paths) ? paths : [])
		.map(path => cloneClipperPath(path))
		.filter(hasMeaningfulClipperPath);

const scaleClipperValue = (value) => Math.round((Number(value) || 0) * SHEET_SAFETY_CLIPPER_SCALE);

const scaleUpClipperPaths = (paths = []) =>
	filterMeaningfulClipperPaths(paths)
		.map(path => path.map(point => ({
			X: scaleClipperValue(point.X),
			Y: scaleClipperValue(point.Y),
		})));

const scaleUpClipperOpenPaths = (paths = []) =>
	filterMeaningfulClipperOpenPaths(paths)
		.map(path => path.map(point => ({
			X: scaleClipperValue(point.X),
			Y: scaleClipperValue(point.Y),
		})));

const scaleDownClipperPaths = (paths = []) =>
	(Array.isArray(paths) ? paths : [])
		.map(path => path.map(point => ({
			X: (Number(point?.X) || 0) / SHEET_SAFETY_CLIPPER_SCALE,
			Y: (Number(point?.Y) || 0) / SHEET_SAFETY_CLIPPER_SCALE,
		})));

const executeClipper = (
	subjectPaths = [],
	clipPaths = [],
	clipType = ClipperLib.ClipType.ctUnion
) => {
	const scaledSubjectPaths = scaleUpClipperPaths(subjectPaths);
	if (!scaledSubjectPaths.length) {
		return [];
	}

	const clipper = new ClipperLib.Clipper();
	clipper.StrictlySimple = true;
	clipper.AddPaths(scaledSubjectPaths, ClipperLib.PolyType.ptSubject, true);

	const scaledClipPaths = scaleUpClipperPaths(clipPaths);
	if (scaledClipPaths.length) {
		clipper.AddPaths(scaledClipPaths, ClipperLib.PolyType.ptClip, true);
	}

	const solution = new ClipperLib.Paths();
	clipper.Execute(
		clipType,
		solution,
		ClipperLib.PolyFillType.pftNonZero,
		ClipperLib.PolyFillType.pftNonZero
	);

	return filterMeaningfulClipperPaths(scaleDownClipperPaths(solution));
};

const unionClipperPaths = (paths = []) => executeClipper(paths, [], ClipperLib.ClipType.ctUnion);

const differenceClipperPaths = (subjectPaths = [], clipPaths = []) => (
	Array.isArray(clipPaths) && clipPaths.length
		? executeClipper(subjectPaths, clipPaths, ClipperLib.ClipType.ctDifference)
		: cloneClipperPaths(subjectPaths)
);

const intersectClipperPaths = (subjectPaths = [], clipPaths = []) => {
	const intersectedPaths = executeClipper(
		subjectPaths,
		clipPaths,
		ClipperLib.ClipType.ctIntersection
	);

	return intersectedPaths.some(hasMeaningfulClipperPath);
};

const offsetClipperPaths = (paths = [], delta = 0) => {
	const filteredPaths = filterMeaningfulClipperPaths(paths);
	if (!filteredPaths.length) {
		return [];
	}

	if (Math.abs(delta) <= EPSILON) {
		return filteredPaths;
	}

	const clipperOffset = new ClipperLib.ClipperOffset(
		2,
		scaleClipperValue(0.25)
	);
	const scaledPaths = scaleUpClipperPaths(filteredPaths);
	const solution = new ClipperLib.Paths();

	clipperOffset.AddPaths(
		scaledPaths,
		ClipperLib.JoinType.jtRound,
		ClipperLib.EndType.etClosedPolygon
	);
	clipperOffset.Execute(solution, scaleClipperValue(delta));

	return filterMeaningfulClipperPaths(scaleDownClipperPaths(solution));
};

const offsetOpenClipperPaths = (paths = [], delta = 0) => {
	const filteredPaths = filterMeaningfulClipperOpenPaths(paths);
	if (!filteredPaths.length) {
		return [];
	}

	const safeDelta = Math.max(
		Math.abs(Number(delta) || 0),
		SHEET_SAFETY_MIN_OPEN_PATH_RADIUS
	);
	const clipperOffset = new ClipperLib.ClipperOffset(
		2,
		scaleClipperValue(0.25)
	);
	const scaledPaths = scaleUpClipperOpenPaths(filteredPaths);
	const solution = new ClipperLib.Paths();

	clipperOffset.AddPaths(
		scaledPaths,
		ClipperLib.JoinType.jtRound,
		ClipperLib.EndType.etOpenRound
	);
	clipperOffset.Execute(solution, scaleClipperValue(safeDelta));

	return filterMeaningfulClipperPaths(scaleDownClipperPaths(solution));
};

const getClipperPathsBBox = (paths = []) => {
	if (!Array.isArray(paths) || !paths.length) {
		return null;
	}

	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	paths.forEach(path => {
		path.forEach(point => {
			const x = Number(point?.X);
			const y = Number(point?.Y);
			if (!Number.isFinite(x) || !Number.isFinite(y)) return;

			minX = Math.min(minX, x);
			minY = Math.min(minY, y);
			maxX = Math.max(maxX, x);
			maxY = Math.max(maxY, y);
		});
	});

	if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
		return null;
	}

	return {
		x: minX,
		y: minY,
		width: Math.max(0, maxX - minX),
		height: Math.max(0, maxY - minY),
	};
};

const doBBoxesOverlap = (leftBBox, rightBBox, tolerance = 0) => (
	Boolean(leftBBox && rightBBox) &&
	leftBBox.x <= rightBBox.x + rightBBox.width + tolerance &&
	leftBBox.x + leftBBox.width + tolerance >= rightBBox.x &&
	leftBBox.y <= rightBBox.y + rightBBox.height + tolerance &&
	leftBBox.y + leftBBox.height + tolerance >= rightBBox.y
);

const isBBoxInsideRect = (bbox, rect, tolerance = EPSILON) => (
	Boolean(bbox && rect) &&
	rect.width >= 0 &&
	rect.height >= 0 &&
	bbox.x >= rect.x - tolerance &&
	bbox.y >= rect.y - tolerance &&
	bbox.x + bbox.width <= rect.x + rect.width + tolerance &&
	bbox.y + bbox.height <= rect.y + rect.height + tolerance
);

const pathToClipperPath = (path) => {
	const vertices = getPathVertices(path);
	if (vertices.length < 3) {
		return null;
	}

	return vertices.map(point => ({
		X: point.x,
		Y: point.y,
	}));
};

const pathToClipperOpenPath = (path) => {
	const vertices = getPathVertices(path);
	if (vertices.length < 2) {
		return null;
	}

	return vertices.map(point => ({
		X: point.x,
		Y: point.y,
	}));
};

const pathsToClipperPaths = (paths = []) => (
	(Array.isArray(paths) ? paths : [paths])
		.filter(path => typeof path === "string" && path.trim().length > 0)
		.map(pathToClipperPath)
		.filter(hasMeaningfulClipperPath)
);

const pathsToClipperOpenPaths = (paths = []) => (
	(Array.isArray(paths) ? paths : [paths])
		.filter(path => typeof path === "string" && path.trim().length > 0)
		.map(pathToClipperOpenPath)
		.filter(hasMeaningfulClipperOpenPath)
);

const getPartSafetyGeometry = (part) => {
	if (!part) {
		return {
			outerPaths: [],
			innerPaths: [],
			openPaths: [],
		};
	}

	const signature = getPartCodeSignature(part);
	const cached = partSafetyGeometryCache.get(part);
	if (cached?.signature === signature) {
		return cached.result;
	}

	const contourGroups = getContourGroupsForPart(part);
	const result = contourGroups.reduce((geometry, group) => {
		const contourPath = pathToClipperPath(group.contour?.path);
		if (group.isOuter && contourPath) {
			geometry.outerPaths.push(contourPath);
		}
		if (group.isInner && contourPath) {
			geometry.innerPaths.push(contourPath);
		}
		if (group.linkedItems.length) {
			geometry.openPaths.push(
				...pathsToClipperOpenPaths(group.linkedItems.map(item => item.path))
			);
		}

		return geometry;
	}, {
		outerPaths: [],
		innerPaths: [],
		openPaths: [],
	});

	partSafetyGeometryCache.set(part, {
		signature,
		result,
	});

	return result;
};

const buildSafetyGeometryFromBasePaths = (
	outerPaths = [],
	innerPaths = [],
	openPaths = [],
	radius = 0
) => {
	const safeOuterSourcePaths = radius > EPSILON
		? offsetClipperPaths(outerPaths, radius)
		: cloneClipperPaths(outerPaths);
	const safeOuterPaths = unionClipperPaths(safeOuterSourcePaths);
	const safeHoleSourcePaths = !innerPaths.length
		? []
		: radius > EPSILON
			? offsetClipperPaths(innerPaths, -radius)
			: cloneClipperPaths(innerPaths);
	const safeHolePaths = unionClipperPaths(safeHoleSourcePaths);
	const safeOpenPaths = openPaths.length
		? unionClipperPaths(offsetOpenClipperPaths(openPaths, radius))
		: [];
	const safeSolidBasePaths = safeHolePaths.length
		? differenceClipperPaths(safeOuterPaths, safeHolePaths)
		: cloneClipperPaths(safeOuterPaths);
	const safeSolidPaths = safeOpenPaths.length
		? unionClipperPaths([...safeSolidBasePaths, ...safeOpenPaths])
		: safeSolidBasePaths;
	const safeOuterCollisionPaths = safeOpenPaths.length
		? unionClipperPaths([...safeOuterPaths, ...safeOpenPaths])
		: safeOuterPaths;

	return {
		safeOpenPaths,
		safeOuterPaths: safeOuterCollisionPaths.length
			? safeOuterCollisionPaths
			: cloneClipperPaths(safeOuterPaths),
		safeSolidPaths: safeSolidPaths.length
			? safeSolidPaths
			: cloneClipperPaths(safeOuterCollisionPaths.length ? safeOuterCollisionPaths : safeOuterPaths),
	};
};

const buildPositionSafetyGeometryResult = ({
	partId = null,
	pos = null,
	part = null,
	clearance = SHEET_SAFETY_DEFAULT_CLEARANCE,
	radius = getSheetSafetyRadius(clearance),
	safeOpenPaths = [],
	safeOuterPaths = [],
	safeSolidPaths = [],
}) => {
	const normalizedOpenPaths = filterMeaningfulClipperPaths(safeOpenPaths);
	const normalizedOuterPaths = filterMeaningfulClipperPaths(safeOuterPaths);
	const normalizedSolidPaths = filterMeaningfulClipperPaths(safeSolidPaths);
	const fallbackOuterPaths = normalizedOuterPaths.length
		? normalizedOuterPaths
		: cloneClipperPaths(normalizedOpenPaths);
	const fallbackSolidPaths = normalizedSolidPaths.length
		? normalizedSolidPaths
		: cloneClipperPaths(fallbackOuterPaths);
	const safeOuterBBox = getClipperPathsBBox(fallbackOuterPaths);
	const safeSolidBBox = getClipperPathsBBox(fallbackSolidPaths) || safeOuterBBox;

	return {
		partId,
		pos,
		part,
		clearance,
		radius,
		safeOpenPaths: normalizedOpenPaths,
		safeOuterPaths: fallbackOuterPaths,
		safeSolidPaths: fallbackSolidPaths,
		safeOuterBBox,
		safeSolidBBox,
	};
};

const getPartSafetyModel = (
	part,
	clearance = SHEET_SAFETY_DEFAULT_CLEARANCE
) => {
	const normalizedClearance = normalizeSheetSafetyClearance(clearance);
	const radius = getSheetSafetyRadius(normalizedClearance);
	if (!part) {
		return buildPositionSafetyGeometryResult({
			partId: null,
			pos: null,
			part: null,
			clearance: normalizedClearance,
			radius,
		});
	}

	const signature = `${getPartCodeSignature(part)}:${normalizedClearance}`;
	const cached = partSafetyModelCache.get(part);
	if (cached?.signature === signature) {
		return cached.result;
	}

	const partGeometry = getPartSafetyGeometry(part);
	const result = buildPositionSafetyGeometryResult({
		partId: part?.id ?? part?.uuid ?? null,
		pos: null,
		part,
		clearance: normalizedClearance,
		radius,
		...buildSafetyGeometryFromBasePaths(
			partGeometry.outerPaths,
			partGeometry.innerPaths,
			partGeometry.openPaths,
			radius
		),
	});

	partSafetyModelCache.set(part, {
		signature,
		result,
	});

	return result;
};

const transformClipperPaths = (paths = [], pos) => {
	const matrix = getMatrixObject(pos);

	return (Array.isArray(paths) ? paths : [])
		.map(path => (Array.isArray(path) ? path : []).map(point => ({
			X: matrix.a * point.X + matrix.c * point.Y + matrix.e,
			Y: matrix.b * point.X + matrix.d * point.Y + matrix.f,
		})))
		.filter(hasMeaningfulClipperPath);
};

const transformClipperOpenPaths = (paths = [], pos) => {
	const matrix = getMatrixObject(pos);

	return (Array.isArray(paths) ? paths : [])
		.map(path => (Array.isArray(path) ? path : []).map(point => ({
			X: matrix.a * point.X + matrix.c * point.Y + matrix.e,
			Y: matrix.b * point.X + matrix.d * point.Y + matrix.f,
		})))
		.filter(hasMeaningfulClipperOpenPath);
};

const buildPositionSafetyGeometryFromPartGeometry = (
	part,
	pos,
	normalizedClearance = SHEET_SAFETY_DEFAULT_CLEARANCE
) => {
	const radius = getSheetSafetyRadius(normalizedClearance);
	const partGeometry = getPartSafetyGeometry(part);

	return buildPositionSafetyGeometryResult({
		partId: pos?.part_id ?? null,
		pos,
		part,
		clearance: normalizedClearance,
		radius,
		...buildSafetyGeometryFromBasePaths(
			transformClipperPaths(partGeometry.outerPaths, pos),
			transformClipperPaths(partGeometry.innerPaths, pos),
			transformClipperOpenPaths(partGeometry.openPaths, pos),
			radius
		),
	});
};

const buildPositionSafetyGeometryFromPartModel = (
	part,
	pos,
	normalizedClearance = SHEET_SAFETY_DEFAULT_CLEARANCE
) => {
	const partSafetyModel = getPartSafetyModel(part, normalizedClearance);

	return buildPositionSafetyGeometryResult({
		partId: pos?.part_id ?? null,
		pos,
		part,
		clearance: normalizedClearance,
		radius: partSafetyModel.radius,
		safeOpenPaths: transformClipperPaths(partSafetyModel.safeOpenPaths, pos),
		safeOuterPaths: transformClipperPaths(partSafetyModel.safeOuterPaths, pos),
		safeSolidPaths: transformClipperPaths(partSafetyModel.safeSolidPaths, pos),
	});
};

const getPositionSafetyGeometry = (
	svgData,
	pos,
	clearance = SHEET_SAFETY_DEFAULT_CLEARANCE
) => {
	const part = getPartByCodeId(svgData, pos?.part_code_id);
	if (!part) {
		return null;
	}

	const normalizedClearance = normalizeSheetSafetyClearance(clearance);
	const signature = `${getSheetCutPositionItemSignature(svgData, pos)}:${normalizedClearance}`;
	const cached = positionSafetyGeometryCache.get(pos);
	if (cached?.signature === signature) {
		return cached.result;
	}

	const result = canUsePartSafetyModelForPosition(pos)
		? buildPositionSafetyGeometryFromPartModel(part, pos, normalizedClearance)
		: buildPositionSafetyGeometryFromPartGeometry(part, pos, normalizedClearance);

	positionSafetyGeometryCache.set(pos, {
		signature,
		result,
	});

	return result;
};

const getSheetSafetyItems = (
	svgData,
	clearance = SHEET_SAFETY_DEFAULT_CLEARANCE
) => (
	(Array.isArray(svgData?.positions) ? svgData.positions : [])
		.map(pos => getPositionSafetyGeometry(svgData, pos, clearance))
		.filter(item => item?.partId !== null && item?.safeOuterBBox)
);

const getSpatialHashCellSize = (items = [], clearance = SHEET_SAFETY_DEFAULT_CLEARANCE) => {
	const fallbackSize = Math.max(
		SHEET_SAFETY_MIN_CELL_SIZE,
		normalizeSheetSafetyClearance(clearance)
	);
	const dominantSizes = items
		.map(item => Math.max(item?.safeOuterBBox?.width || 0, item?.safeOuterBBox?.height || 0))
		.filter(size => Number.isFinite(size) && size > 0);

	if (!dominantSizes.length) {
		return fallbackSize;
	}

	const averageSize = dominantSizes.reduce((total, size) => total + size, 0) / dominantSizes.length;
	return Math.max(fallbackSize, Math.min(averageSize, 250));
};

const getBBoxCellRange = (bbox, cellSize) => {
	if (!bbox || !Number.isFinite(cellSize) || cellSize <= 0) {
		return null;
	}

	return {
		minCol: Math.floor(bbox.x / cellSize),
		maxCol: Math.floor((bbox.x + bbox.width) / cellSize),
		minRow: Math.floor(bbox.y / cellSize),
		maxRow: Math.floor((bbox.y + bbox.height) / cellSize),
	};
};

const buildSpatialHash = (items = [], cellSize = SHEET_SAFETY_MIN_CELL_SIZE) => {
	const hash = new Map();

	items.forEach(item => {
		const range = getBBoxCellRange(item.safeOuterBBox, cellSize);
		if (!range) return;

		for (let col = range.minCol; col <= range.maxCol; col += 1) {
			for (let row = range.minRow; row <= range.maxRow; row += 1) {
				const key = `${col}:${row}`;
				if (!hash.has(key)) {
					hash.set(key, []);
				}

				hash.get(key).push(item.partId);
			}
		}
	});

	return hash;
};

const getCandidatePairItems = (
	items = [],
	movingPartIds = [],
	clearance = SHEET_SAFETY_DEFAULT_CLEARANCE
) => {
	const itemById = new Map(items.map(item => [item.partId, item]));
	const movingIdSet = new Set(
		(Array.isArray(movingPartIds) ? movingPartIds : [])
			.filter(partId => itemById.has(partId))
	);
	const sourceItems = movingIdSet.size
		? items.filter(item => movingIdSet.has(item.partId))
		: items;
	const cellSize = getSpatialHashCellSize(items, clearance);
	const spatialHash = buildSpatialHash(items, cellSize);
	const pairKeySet = new Set();
	const pairs = [];

	sourceItems.forEach(item => {
		const range = getBBoxCellRange(item.safeOuterBBox, cellSize);
		if (!range) return;

		const candidateIds = new Set();
		for (let col = range.minCol; col <= range.maxCol; col += 1) {
			for (let row = range.minRow; row <= range.maxRow; row += 1) {
				const bucket = spatialHash.get(`${col}:${row}`) || [];
				bucket.forEach(partId => {
					candidateIds.add(partId);
				});
			}
		}

		candidateIds.forEach(candidateId => {
			if (candidateId === item.partId) return;

			const candidateItem = itemById.get(candidateId);
			if (!candidateItem) return;
			if (!doBBoxesOverlap(item.safeOuterBBox, candidateItem.safeOuterBBox)) return;

			const leftId = Math.min(item.partId, candidateId);
			const rightId = Math.max(item.partId, candidateId);
			const pairKey = `${leftId}:${rightId}`;
			if (pairKeySet.has(pairKey)) return;

			pairKeySet.add(pairKey);
			pairs.push([itemById.get(leftId), itemById.get(rightId)]);
		});
	});

	return {
		cellSize,
		pairs,
	};
};

const getSheetSafetyRect = (svgData, radius = 0) => {
	const width = Number(svgData?.width);
	const height = Number(svgData?.height);
	if (!Number.isFinite(width) || !Number.isFinite(height)) {
		return null;
	}

	return {
		x: radius,
		y: radius,
		width: width - radius * 2,
		height: height - radius * 2,
	};
};

const createDangerEntry = (dangerById, partId) => {
	if (!dangerById[partId]) {
		dangerById[partId] = {
			partId,
			edge: false,
			collisionIds: [],
		};
	}

	return dangerById[partId];
};

const addCollisionDanger = (dangerById, leftPartId, rightPartId) => {
	const leftEntry = createDangerEntry(dangerById, leftPartId);
	const rightEntry = createDangerEntry(dangerById, rightPartId);

	if (!leftEntry.collisionIds.includes(rightPartId)) {
		leftEntry.collisionIds.push(rightPartId);
	}

	if (!rightEntry.collisionIds.includes(leftPartId)) {
		rightEntry.collisionIds.push(leftPartId);
	}
};

const addEdgeDanger = (dangerById, partId) => {
	createDangerEntry(dangerById, partId).edge = true;
};

const sortNumericIds = (values = []) => (
	[...new Set(values.map(value => Number(value)).filter(Number.isFinite))]
		.sort((left, right) => left - right)
);

export const getSheetSafetyEvaluation = (
	svgData,
	{
		partIds = null,
		clearance = SHEET_SAFETY_DEFAULT_CLEARANCE,
		allowPartInPart = true,
	} = {}
) => {
	const normalizedClearance = normalizeSheetSafetyClearance(clearance);
	const movingPartIds = sortNumericIds(Array.isArray(partIds) ? partIds : []);
	const movingIdSet = new Set(movingPartIds);
	const items = getSheetSafetyItems(svgData, normalizedClearance);
	const dangerById = {};
	const collisionPairs = [];
	const edgePartIds = [];

	if (!items.length) {
		return {
			partIds: movingPartIds,
			clearance: normalizedClearance,
			candidateCellSize: getSpatialHashCellSize([], normalizedClearance),
			candidatePairsCount: 0,
			dangerPartIds: [],
			edgePartIds: [],
			collisionPairs: [],
			reasonsById: {},
		};
	}

	const { cellSize, pairs } = getCandidatePairItems(items, movingPartIds, normalizedClearance);

	pairs.forEach(([leftItem, rightItem]) => {
		if (!leftItem || !rightItem) return;

		const leftPaths = allowPartInPart ? leftItem.safeSolidPaths : leftItem.safeOuterPaths;
		const rightPaths = allowPartInPart ? rightItem.safeSolidPaths : rightItem.safeOuterPaths;
		const leftBBox = allowPartInPart ? leftItem.safeSolidBBox : leftItem.safeOuterBBox;
		const rightBBox = allowPartInPart ? rightItem.safeSolidBBox : rightItem.safeOuterBBox;

		if (!doBBoxesOverlap(leftBBox, rightBBox)) {
			return;
		}

		if (!intersectClipperPaths(leftPaths, rightPaths)) {
			return;
		}

		collisionPairs.push([leftItem.partId, rightItem.partId]);
		addCollisionDanger(dangerById, leftItem.partId, rightItem.partId);
	});

	const sheetSafetyRect = getSheetSafetyRect(svgData, getSheetSafetyRadius(normalizedClearance));
	items.forEach(item => {
		if (movingIdSet.size && !movingIdSet.has(item.partId)) {
			return;
		}

		if (!isBBoxInsideRect(item.safeOuterBBox, sheetSafetyRect)) {
			edgePartIds.push(item.partId);
			addEdgeDanger(dangerById, item.partId);
		}
	});

	const reasonsById = Object.fromEntries(
		Object.entries(dangerById).map(([partId, reason]) => [
			partId,
			{
				edge: Boolean(reason.edge),
				collisionIds: sortNumericIds(reason.collisionIds),
			},
		])
	);

	return {
		partIds: movingPartIds,
		clearance: normalizedClearance,
		candidateCellSize: cellSize,
		candidatePairsCount: pairs.length,
		dangerPartIds: sortNumericIds([
			...edgePartIds,
			...collisionPairs.flat(),
		]),
		edgePartIds: sortNumericIds(edgePartIds),
		collisionPairs: collisionPairs
			.map(([leftPartId, rightPartId]) => [
				Math.min(leftPartId, rightPartId),
				Math.max(leftPartId, rightPartId),
			])
			.sort((left, right) => (
				left[0] !== right[0]
					? left[0] - right[0]
					: left[1] - right[1]
			)),
		reasonsById,
	};
};

function getPathVertices(path) {
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
}

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
