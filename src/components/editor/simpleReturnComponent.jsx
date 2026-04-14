import { memo } from "react";
import { observer } from "mobx-react-lite";
import SVGPathCommander from "svg-path-commander";
import svgStore from "./../../store/svgStore.jsx";
import editorStore from "./../../store/editorStore.jsx";
import ResidualCutLayer from "./residualCutLayer.jsx";

const getJointPath = (x, y) => `M${x} ${y} l2 2 -4 -4 2 2 2 -2 -4 4`;
const partDefinitionCache = new WeakMap();

const getPartDefinitionSignature = (part) => {
	const partId = part?.id ?? part?.uuid ?? "unknown";
	if (!Array.isArray(part?.code)) return `${partId}:0`;

	return `${partId}:${part.code.length}:${part.code.map(item => [
		item?.cid ?? "",
		item?.class ?? "",
		typeof item?.path === "string" ? item.path.length : 0,
		Array.isArray(item?.joints) ? item.joints.join(",") : "",
	].join(":")).join("|")}`;
};

const buildCompoundPath = (code = []) => {
	const outer = [];
	const inner = [];
	const inletOutlet = [];
	const engraving = [];

	for (const item of code) {
		if (!item?.path) continue;

		if (item.class.includes("macro2")) {
			engraving.push(item.path.trim());
		} else if (item.class.includes("outer") && item.class.includes("contour")) {
			outer.push(item.path.trim());
		} else if (item.class.includes("inner") && item.class.includes("contour")) {
			inner.push(item.path.trim());
		} else if (item.class.includes("inlet") || item.class.includes("outlet")) {
			inletOutlet.push(item.path.trim());
		}
	}

	return {
		contours: [...outer, ...inner].join(" z "),
		inletOutlet,
		engraving,
	};
};

const getStaticPartDefinitionData = (part) => {
	if (!part) {
		return {
			contours: "",
			inletOutletPath: "",
			engravingPath: "",
			jointPaths: [],
		};
	}

	const signature = getPartDefinitionSignature(part);
	const cached = partDefinitionCache.get(part);
	if (cached?.signature === signature) {
		return cached.result;
	}

	const { contours, inletOutlet, engraving } = buildCompoundPath(part.code);
	const jointPaths = [];

	(part.code || []).forEach((item, itemIndex) => {
		if (!item.joints?.length || !item.path) return;

		item.joints.forEach((length, jointIndex) => {
			const point = SVGPathCommander.getPointAtLength(item.path, length);
			jointPaths.push({
				key: `joint_${part.id}_${itemIndex}_${jointIndex}`,
				path: getJointPath(point.x, point.y),
			});
		});
	});

	const result = {
		contours,
		inletOutletPath: inletOutlet.join(" "),
		engravingPath: engraving.join(" "),
		jointPaths,
	};

	partDefinitionCache.set(part, {
		signature,
		result,
	});

	return result;
};

const handlePartSelection = (partId) => {
	const { mode } = editorStore;

	if (mode === "resize") {
		const position = svgStore.svgData.positions.find(pos => pos.part_id === partId);
		if (position?.selected) return;
		svgStore.selectOnly(partId);
		return;
	}

	if (mode === "selectionPlus") {
		svgStore.selectPlus(partId);
		return;
	}

	if (mode === "selectionMinus") {
		svgStore.selectMinus(partId);
	}
};

const handlePartMove = (event, selected) => {
	if (event.buttons === 1 && selected && editorStore.mode === "resize") {
		editorStore.setMode("dragging");
	}
};

const handlePartTouchStart = (partId) => {
	const { mode } = editorStore;

	handlePartSelection(partId);
	if (mode === "resize") {
		editorStore.setMode("dragging");
	}
};

const getUniquePartIds = (values = []) => (
	[...new Set(values.map(value => Number(value)).filter(Number.isFinite))]
		.sort((left, right) => left - right)
);

const getOverlayPartIds = (
	activePartId = null,
	hoverPartId = null,
	dangerPartIds = []
) => {
	const overlayPartIds = getUniquePartIds(
		(Array.isArray(dangerPartIds) ? dangerPartIds : [])
			.filter(partId => partId !== null && partId !== undefined)
	);
	const prioritizePartId = (partId) => {
		if (partId === null || partId === undefined) {
			return;
		}

		const existingIndex = overlayPartIds.indexOf(partId);
		if (existingIndex >= 0) {
			overlayPartIds.splice(existingIndex, 1);
		}

		overlayPartIds.push(partId);
	};

	prioritizePartId(activePartId);
	prioritizePartId(hoverPartId);

	return overlayPartIds;
};

const StaticPartDefinitions = observer(() => {
	const parts = svgStore.svgData.part_code;

	return (
		<defs>
			{parts.map(part => {
				const {
					contours,
					inletOutletPath,
					engravingPath,
					jointPaths,
				} = getStaticPartDefinitionData(part);

				return (
					<g key={`defs_part_${part.id}`} id={`part_${part.id}`}>
						<path
							d={contours}
							fillRule="evenodd"
							stroke="currentColor"
							strokeWidth={0.2}
							strokeLinecap="round"
							vectorEffect="non-scaling-stroke"
						/>
						<path
							d={inletOutletPath}
							fill="none"
							stroke="currentColor"
							strokeWidth={.5}
							strokeLinecap="round"
							vectorEffect="non-scaling-stroke"
						/>
						<path
							d={engravingPath}
							fill="none"
							stroke="limegreen"
							strokeWidth={1}
							strokeLinecap="round"
						/>
						{jointPaths.map(joint => (
							<g
								key={joint.key}
								className="joint"
								fill="none"
								stroke="red"
								strokeWidth={0.5}
								vectorEffect="non-scaling-stroke"
							>
								<path d={joint.path} />
							</g>
						))}
					</g>
				);
			})}
		</defs>
	);
});

const SheetPositionInstance = memo(({
	partId,
	partCodeId,
	transform,
	selected,
	isActive,
	isHovered,
	isCompleted,
	isDangerous,
	interactive = true,
}) => {
	const isFocused = isHovered || isActive;
	const fillColor = isDangerous
		? isActive
			? "rgba(220, 53, 69, 0.38)"
			: isHovered
				? "rgba(220, 53, 69, 0.32)"
				: selected
					? "rgba(220, 53, 69, 0.24)"
					: "rgba(220, 53, 69, 0.18)"
		: isHovered
			? "var(--violet)"
			: isActive
				? "rgba(255, 106, 0, 0.42)"
				: isCompleted
					? "rgba(253, 126, 20, 0.8)"
					: selected
						? "var(--violetTransparent)"
						: "var(--grey-nav)";
	const strokeColor = isDangerous
		? "#dc3545"
		: isActive
			? "#ff5a00"
			: isCompleted
				? "#fd7e14"
				: selected
					? "var(--violetTransparent)"
					: "var(--grey-nav)";
	const strokeWidth = isDangerous
		? isFocused
			? 3
			: 2.5
		: isActive
			? 3
			: isFocused || isCompleted
				? 2.5
				: undefined;
	const opacity = isDangerous
		? 1
		: isHovered
			? 0.8
			: isActive
				? 1
				: isCompleted
					? 0.95
					: 1;

	return (
		<g
			transform={transform}
			data-part-id={partId}
			pointerEvents={interactive ? undefined : "none"}
			onMouseDown={interactive ? () => handlePartSelection(partId) : undefined}
			onMouseMove={interactive ? (event) => handlePartMove(event, selected) : undefined}
			onTouchStart={interactive ? () => handlePartTouchStart(partId) : undefined}
		>
			<use
				href={`#part_${partCodeId}`}
				fill={fillColor}
				stroke={strokeColor}
				strokeWidth={strokeWidth}
				opacity={opacity}
				pointerEvents={interactive ? "visiblePainted" : "none"}
			/>
		</g>
	);
});

const PositionInstancesLayer = observer(() => {
	const positions = svgStore.svgData.positions;
	const activePartId = svgStore.laserShowVisual.activePartId ?? null;
	const hoverPartId = svgStore.laserShowVisual.hoverPartId ?? null;
	const dangerPartIds = Array.isArray(svgStore.sheetSafetyState?.dangerPartIds)
		? svgStore.sheetSafetyState.dangerPartIds
		: [];
	const dangerPartIdSet = new Set(dangerPartIds);
	const completedCount = Math.max(
		0,
		Math.min(
			Number(svgStore.laserShowVisual.completedCount) || 0,
			positions.length
		)
	);
	const overlayPartIds = getOverlayPartIds(activePartId, hoverPartId, dangerPartIds);
	const overlayPartIdSet = new Set(overlayPartIds);
	const overlayItemsById = new Map();
	const basePositions = [];

	const positionsWithIndex = positions.map((pos, index) => ({ pos, index }));
	const paintOrder = svgStore.isShowDangersEnabled()
		? positionsWithIndex
		: [
			...positionsWithIndex.filter(({ pos: p }) => !p.selected),
			...positionsWithIndex.filter(({ pos: p }) => p.selected),
		];

	paintOrder.forEach(({ pos, index }) => {
		const isActive = activePartId === pos.part_id;
		const isHovered = hoverPartId === pos.part_id;
		const itemProps = {
			partId: pos.part_id,
			partCodeId: pos.part_code_id,
			transform: `matrix(${pos.positions?.a ?? 1} ${pos.positions?.b ?? 0} ${pos.positions?.c ?? 0} ${pos.positions?.d ?? 1} ${pos.positions?.e ?? 0} ${pos.positions?.f ?? 0})`,
			selected: Boolean(pos.selected),
			isActive,
			isHovered,
			isCompleted: index < completedCount,
			isDangerous: dangerPartIdSet.has(pos.part_id),
		};

		if (overlayPartIdSet.has(pos.part_id)) {
			overlayItemsById.set(pos.part_id, itemProps);
		}
		basePositions.push(itemProps);
	});

	const overlayPositions = overlayPartIds
		.map(partId => overlayItemsById.get(partId))
		.filter(Boolean);

	return (
		<>
			{basePositions.map(pos => (
				<SheetPositionInstance
					key={`part_${pos.partId}`}
					partId={pos.partId}
					partCodeId={pos.partCodeId}
					transform={pos.transform}
					selected={pos.selected}
					isActive={pos.isActive}
					isHovered={pos.isHovered}
					isCompleted={pos.isCompleted}
					isDangerous={pos.isDangerous}
				/>
			))}
			{overlayPositions.map(pos => (
				<SheetPositionInstance
					key={`part_overlay_${pos.partId}`}
					partId={pos.partId}
					partCodeId={pos.partCodeId}
					transform={pos.transform}
					selected={pos.selected}
					isActive={pos.isActive}
					isHovered={pos.isHovered}
					isCompleted={pos.isCompleted}
					isDangerous={pos.isDangerous}
					interactive={false}
				/>
			))}
		</>
	);
});

const SheetSelectionRectLayer = observer(() => {
	const rect = svgStore.selectionRect;

	if (!rect) {
		return null;
	}

	return (
		<rect
			x={rect.x}
			y={rect.y}
			width={rect.width}
			height={rect.height}
			fill="rgba(111, 66, 193, 0.12)"
			stroke="var(--violet)"
			strokeWidth={1}
			strokeDasharray="4 2"
			vectorEffect="non-scaling-stroke"
			pointerEvents="none"
		/>
	);
});

const SimpleReturnComponent = memo(() => (
	<>
		<StaticPartDefinitions />
		<PositionInstancesLayer />
		<SheetSelectionRectLayer />
		<ResidualCutLayer />
	</>
));

export default SimpleReturnComponent;