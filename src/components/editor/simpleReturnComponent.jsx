import { memo } from "react";
import { observer } from "mobx-react-lite";
import SVGPathCommander from "svg-path-commander";
import svgStore, {
	LASER_SHOW_PART_ACTIVE,
	LASER_SHOW_PART_COMPLETED,
	LASER_SHOW_PART_HOVERED,
} from "./../../store/svgStore.jsx";
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

const handlePartMove = (event, position) => {
	if (event.buttons === 1 && position?.selected && editorStore.mode !== "dragging") {
		editorStore.setMode("dragging");
	}
};

const getOverlayPartIds = () => {
	const activePartId = svgStore.laserShow.activePartId ?? null;
	const hoverPartId = svgStore.laserShow.hoverPartId ?? null;

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

const SheetPositionInstance = observer(({ pos, suppressFocused = false }) => {
	const { a = 1, b = 0, c = 0, d = 1, e = 0, f = 0 } = pos.positions || {};
	const flags = svgStore.getLaserShowPartFlags(pos.part_id);
	const isActive = Boolean(flags & LASER_SHOW_PART_ACTIVE);
	const isHovered = Boolean(flags & LASER_SHOW_PART_HOVERED);
	const isCompleted = Boolean(flags & LASER_SHOW_PART_COMPLETED);
	const isFocused = isHovered || isActive;

	if (suppressFocused && isFocused) {
		return null;
	}

	const fillColor = isHovered
		? "var(--violet)"
		: isActive
			? "rgba(255, 106, 0, 0.42)"
			: isCompleted
				? "rgba(253, 126, 20, 0.28)"
				: pos.selected
					? "var(--violetTransparent)"
					: "var(--grey-nav)";
	const strokeColor = isActive
		? "#ff5a00"
		: isCompleted
			? "#fd7e14"
			: pos.selected
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
			transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
			data-part-id={pos.part_id}
			onMouseDown={() => handlePartSelection(pos.part_id)}
			onMouseMove={(event) => handlePartMove(event, pos)}
			onTouchStart={(event) => {
				handlePartSelection(pos.part_id);
				handlePartMove(event, pos);
				editorStore.setMode("dragging");
			}}
		>
			<use
				href={`#part_${pos.part_code_id}`}
				fill={fillColor}
				stroke={strokeColor}
				strokeWidth={strokeWidth}
				opacity={opacity}
				pointerEvents="visiblePainted"
			/>
		</g>
	);
});

const FocusedPositionOverlay = observer(() => {
	const overlayPartIds = getOverlayPartIds();
	if (!overlayPartIds.length) return null;

	return (
		<>
			{overlayPartIds.map(partId => {
				const overlayPosition = svgStore.svgData.positions.find(
					pos => pos.part_id === partId
				);
				if (!overlayPosition) return null;

				return (
					<SheetPositionInstance
						key={`form_focused_${partId}`}
						pos={overlayPosition}
					/>
				);
			})}
		</>
	);
});

const PositionInstancesLayer = observer(() => {
	const positions = svgStore.svgData.positions;
	const unselectedPositions = [];
	const selectedPositions = [];

	positions.forEach(pos => {
		if (pos.selected) {
			selectedPositions.push(pos);
			return;
		}

		unselectedPositions.push(pos);
	});

	return (
		<>
			{unselectedPositions.map(pos => (
				<SheetPositionInstance
					key={`form_${pos.part_id}`}
					pos={pos}
					suppressFocused
				/>
			))}
			{selectedPositions.map(pos => (
				<SheetPositionInstance
					key={`form_selected_${pos.part_id}`}
					pos={pos}
					suppressFocused
				/>
			))}
			<FocusedPositionOverlay />
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