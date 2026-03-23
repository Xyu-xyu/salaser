import { memo } from "react";
import { observer } from "mobx-react-lite";
import SVGPathCommander from "svg-path-commander";
import svgStore from "./../../store/svgStore.jsx";
import editorStore from "./../../store/editorStore.jsx";

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
	if (event.buttons === 1 && selected && editorStore.mode !== "dragging") {
		editorStore.setMode("dragging");
	}
};

const getOverlayPartIds = (activePartId = null, hoverPartId = null) => {
	if (activePartId === null && hoverPartId === null) {
		return [];
	}

	if (hoverPartId === null || hoverPartId === activePartId) {
		return activePartId === null ? [] : [activePartId];
	}

	if (activePartId === null) {
		return [hoverPartId];
	}

	return [activePartId, hoverPartId];
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
							strokeWidth={2}
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
}) => {
	const isFocused = isHovered || isActive;
	const fillColor = isHovered
		? "var(--violet)"
		: isActive
			? "rgba(255, 106, 0, 0.42)"
			: isCompleted
				? "rgba(253, 126, 20, 0.8)"
				: selected
					? "var(--violetTransparent)"
					: "var(--grey-nav)";
	const strokeColor = isActive
		? "#ff5a00"
		: isCompleted
			? "#fd7e14"
			: selected
				? "var(--violetTransparent)"
				: "var(--grey-nav)";
	const strokeWidth = isActive
		? 3
		: isFocused || isCompleted
			? 2.5
			: undefined;
	const opacity = isHovered
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
			onMouseDown={() => handlePartSelection(partId)}
			onMouseMove={(event) => handlePartMove(event, selected)}
			onTouchStart={(event) => {
				handlePartSelection(partId);
				handlePartMove(event, selected);
				editorStore.setMode("dragging");
			}}
		>
			<use
				href={`#part_${partCodeId}`}
				fill={fillColor}
				stroke={strokeColor}
				strokeWidth={strokeWidth}
				opacity={opacity}
				pointerEvents="visiblePainted"
			/>
		</g>
	);
});

const PositionInstancesLayer = observer(() => {
	const positions = svgStore.svgData.positions;
	const activePartId = svgStore.laserShowVisual.activePartId ?? null;
	const hoverPartId = svgStore.laserShowVisual.hoverPartId ?? null;
	const completedCount = Math.max(
		0,
		Math.min(
			Number(svgStore.laserShowVisual.completedCount) || 0,
			positions.length
		)
	);
	const overlayPartIds = getOverlayPartIds(activePartId, hoverPartId);
	const overlayPartIdSet = new Set(overlayPartIds);
	const overlayItemsById = new Map();
	const unselectedPositions = [];
	const selectedPositions = [];

	positions.forEach((pos, index) => {
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
		};

		if (overlayPartIdSet.has(pos.part_id)) {
			overlayItemsById.set(pos.part_id, itemProps);
			return;
		}

		if (itemProps.selected) {
			selectedPositions.push(itemProps);
			return;
		}

		unselectedPositions.push(itemProps);
	});

	const overlayPositions = overlayPartIds
		.map(partId => overlayItemsById.get(partId))
		.filter(Boolean);

	return (
		<>
			{unselectedPositions.map(pos => (
				<SheetPositionInstance
					key={`form_${pos.partId}`}
					partId={pos.partId}
					partCodeId={pos.partCodeId}
					transform={pos.transform}
					selected={pos.selected}
					isActive={pos.isActive}
					isHovered={pos.isHovered}
					isCompleted={pos.isCompleted}
				/>
			))}
			{selectedPositions.map(pos => (
				<SheetPositionInstance
					key={`form_selected_${pos.partId}`}
					partId={pos.partId}
					partCodeId={pos.partCodeId}
					transform={pos.transform}
					selected={pos.selected}
					isActive={pos.isActive}
					isHovered={pos.isHovered}
					isCompleted={pos.isCompleted}
				/>
			))}
			{overlayPositions.map(pos => (
				<SheetPositionInstance
					key={`form_focused_${pos.partId}`}
					partId={pos.partId}
					partCodeId={pos.partCodeId}
					transform={pos.transform}
					selected={pos.selected}
					isActive={pos.isActive}
					isHovered={pos.isHovered}
					isCompleted={pos.isCompleted}
				/>
			))}
		</>
	);
});

const SimpleReturnComponent = memo(() => (
	<>
		<StaticPartDefinitions />
		<PositionInstancesLayer />
	</>
));

export default SimpleReturnComponent;