import SVGPathCommander from "svg-path-commander";
import svgPath from "svgpath";

const partPreviewCache = new WeakMap();
const partCutItemCache = new WeakMap();
const sheetQueueCache = new WeakMap();
const EPSILON = 0.0001;

const hasPath = (item) => typeof item?.path === "string" && item.path.trim().length > 0;
const hasClass = (item, className) =>
	typeof item?.class === "string" && item.class.includes(className);
const getPathSize = (path) => (typeof path === "string" ? path.length : 0);

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getPartCodeSignature = (part) => {
	const partId = part?.id ?? part?.uuid ?? "unknown";
	if (!Array.isArray(part?.code)) return `${partId}:0`;

	return `${partId}:${part.code.length}:${part.code
		.map(item => `${item?.cid ?? ""}:${item?.class ?? ""}:${getPathSize(item?.path)}`)
		.join("|")}`;
};

export const getSheetCutQueueSignature = (svgData) => {
	if (!svgData) return "sheet-cut-empty";

	const positionsSignature = Array.isArray(svgData.positions)
		? svgData.positions.map(pos => {
			const { a = 1, b = 0, c = 0, d = 1, e = 0, f = 0 } = pos?.positions || {};
			return `${pos?.part_id ?? ""}:${pos?.part_code_id ?? ""}:${a}:${b}:${c}:${d}:${e}:${f}`;
		}).join("||")
		: "";

	const partsSignature = Array.isArray(svgData.part_code)
		? svgData.part_code.map(getPartCodeSignature).join("||")
		: "";

	return `${positionsSignature}##${partsSignature}`;
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

export const getSheetCutPath = (svgData) => {
	return getSheetCutQueue(svgData).segments
		.map(segment => segment.d)
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

export const getSheetCutQueue = (
	svgData,
	signature = getSheetCutQueueSignature(svgData)
) => {
	if (!svgData || !Array.isArray(svgData.positions)) {
		return {
			signature,
			segments: [],
			totalLength: 0,
		};
	}

	const cached = sheetQueueCache.get(svgData);
	if (cached?.signature === signature) {
		return cached.queue;
	}

	let totalLength = 0;
	const segments = [];

	svgData.positions.forEach((pos, orderIndex) => {
		const part = getPartByCodeId(svgData, pos?.part_code_id);
		if (!part) return;

		getCutItemsForPart(part).forEach((item, segmentIndex) => {
			const d = transformPositionPath(item.path, pos);
			if (!d) return;

			let length = 0;
			try {
				length = SVGPathCommander.getTotalLength(d);
			} catch (error) {
				console.warn("Queue segment length error:", error);
				return;
			}

			if (!Number.isFinite(length) || length <= 0) return;

			const start = totalLength;
			totalLength += length;

			segments.push({
				id: `${pos.part_id}_${segmentIndex}`,
				partId: pos.part_id,
				partCodeId: pos.part_code_id,
				partName: part?.name || `Part ${pos.part_id}`,
				orderIndex,
				segmentIndex,
				cid: item.cid,
				className: item.class,
				d,
				length,
				start,
				end: totalLength,
			});
		});
	});

	const queue = {
		signature,
		segments,
		totalLength,
	};

	sheetQueueCache.set(svgData, {
		signature,
		queue,
	});

	return queue;
};

export const getSheetCutPointAtProgress = (queue, requestedLength = 0) => {
	if (!queue?.segments?.length || !Number.isFinite(queue.totalLength) || queue.totalLength <= 0) {
		return null;
	}

	const progressLength = clamp(requestedLength, 0, queue.totalLength);
	const isAtStart = progressLength <= EPSILON;

	let left = 0;
	let right = queue.segments.length - 1;

	while (left < right) {
		const middle = Math.floor((left + right) / 2);
		if (progressLength <= queue.segments[middle].end + EPSILON) {
			right = middle;
		} else {
			left = middle + 1;
		}
	}

	const activeSegment = queue.segments[isAtStart ? 0 : left] || queue.segments[0];
	if (!activeSegment) return null;

	const localLength = clamp(
		progressLength - activeSegment.start,
		0,
		activeSegment.length
	);

	try {
		const point = SVGPathCommander.getPointAtLength(activeSegment.d, localLength);
		return {
			...activeSegment,
			localLength,
			point,
			progressLength,
			progressPercent: queue.totalLength > 0
				? (progressLength / queue.totalLength) * 100
				: 0,
		};
	} catch (error) {
		console.warn("Queue point read error:", error);
		return null;
	}
};
