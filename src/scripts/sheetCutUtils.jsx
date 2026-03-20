import SVGPathCommander from "svg-path-commander";
import svgPath from "svgpath";

const partPreviewCache = new WeakMap();
const partCutItemCache = new WeakMap();
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
	const inletOutletPaths = [];

	part.code.forEach(item => {
		if (!hasPath(item) || hasClass(item, "macro5")) return;

		if (hasClass(item, "contour")) {
			contourPaths.push(item.path);
		}

		if (hasClass(item, "inlet") || hasClass(item, "outlet")) {
			inletOutletPaths.push(item.path);
		}
	});

	const contourPath = contourPaths.join(" z ");
	const inletOutletPath = inletOutletPaths.join(" ");
	const bbox = getPartBaseBBox(part, `${contourPath} ${inletOutletPath}`);
	const result = bbox
		? { bbox, contourPath, inletOutletPath, part }
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

	return {
		...previewData,
		bbox: transformBBox(previewData.bbox, pos),
	};
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

export const getAutoSheetCutOrder = (
	svgData,
	sectorSize = SHEET_CUT_DEFAULT_SECTOR_SIZE
) => {
	if (!svgData || !Array.isArray(svgData.positions) || !svgData.positions.length) {
		return [];
	}

	const safeSectorSize = clampSheetCutSectorSize(svgData, sectorSize);
	const sheetHeight = Number(svgData?.height) || 0;
	const sectorMap = new Map();

	svgData.positions.forEach((pos, index) => {
		const preview = getPositionPreviewData(svgData, pos);
		const bbox = preview?.bbox;
		const centerX = bbox ? bbox.x + bbox.width / 2 : Number(pos?.cx) || 0;
		const centerY = bbox ? bbox.y + bbox.height / 2 : Number(pos?.cy) || 0;
		const col = Math.max(0, Math.floor(Math.max(0, centerX) / safeSectorSize));
		const row = getSectorRowFromBottom(centerY, sheetHeight, safeSectorSize);
		const key = `${col}:${row}`;

		if (!sectorMap.has(key)) {
			sectorMap.set(key, {
				key,
				col,
				row,
				items: [],
			});
		}

		sectorMap.get(key).items.push({
			index,
			partId: pos?.part_id ?? index,
			centerX,
			centerY,
			pos,
		});
	});

	const sectors = [...sectorMap.values()].map(sector => ({
		...sector,
		items: sortSectorItems(sector.items),
	}));

	// Phase 1 starts from the bottom-left checkerboard sector, then moves vertically.
	return sortCheckerboardSectors(sectors).flatMap(sector =>
		sector.items.map(item => item.pos).filter(Boolean)
	);
};
