import { useCallback, useEffect, useMemo, useRef } from "react";
import { observer } from "mobx-react-lite";
import svgStore from "../../store/svgStore.jsx";
import editorStore from "../../store/editorStore.jsx";
import util from "../../scripts/util.jsx";
import { showToast } from "../toast.jsx";
import {
	buildResidualCutGeometry,
	doesResidualCutAreaCollideWithParts,
	normalizeResidualCutArea,
	normalizeResidualCutPoint,
	snapResidualCutAreaToBounds,
	snapResidualCutAreaToExistingEdges,
	toResidualCutPolylinePoints,
} from "../../scripts/residualCutUtils.jsx";

const RESIDUAL_SIMULATION_MIN_DURATION = 120;
const RESIDUAL_SIMULATION_BASE_SPEED = 120;
const RESIDUAL_SIMULATION_SPEED_FACTOR = 12;

const getClientPointFromEvent = (event) => (
	event?.touches?.[0] ||
	event?.changedTouches?.[0] ||
	event
);

const getInterpolatedPoint = (start, end, progress = 0) => ({
	x: start.x + (end.x - start.x) * progress,
	y: start.y + (end.y - start.y) * progress,
});

const toClosedResidualAreaPoints = (path = []) => {
	if (!Array.isArray(path) || !path.length) {
		return "";
	}

	const points = [...path];
	const firstPoint = path[0];
	const lastPoint = path[path.length - 1];

	if (
		firstPoint &&
		lastPoint &&
		(firstPoint.x !== lastPoint.x || firstPoint.y !== lastPoint.y)
	) {
		points.push(firstPoint);
	}

	return toResidualCutPolylinePoints(points);
};

const ResidualCutSimulationController = observer(() => {
	const frameRef = useRef(null);
	const sequence = svgStore.residualCutSimulation.sequence;
	const simulationOn = Boolean(svgStore.residualCutSimulation.on);
	const segmentIndex = Math.max(
		0,
		Number(svgStore.residualCutSimulation.segmentIndex) || 0
	);
	const speed = Math.max(1, Number(svgStore.laserShowPlayback.speed) || 50);

	const stopFrame = useCallback(() => {
		if (frameRef.current !== null) {
			window.cancelAnimationFrame(frameRef.current);
			frameRef.current = null;
		}
	}, []);

	useEffect(() => () => {
		stopFrame();
	}, [stopFrame]);

	useEffect(() => {
		stopFrame();

		if (!simulationOn || !Array.isArray(sequence) || !sequence.length) {
			return undefined;
		}

		const activeSegment = sequence[segmentIndex];
		if (!activeSegment?.start || !activeSegment?.end) {
			svgStore.stopResidualCutSimulation();
			return undefined;
		}

		const segmentLength = Math.hypot(
			activeSegment.end.x - activeSegment.start.x,
			activeSegment.end.y - activeSegment.start.y
		);
		const pixelsPerSecond = RESIDUAL_SIMULATION_BASE_SPEED + speed * RESIDUAL_SIMULATION_SPEED_FACTOR;
		const durationMs = Math.max(
			RESIDUAL_SIMULATION_MIN_DURATION,
			(Math.max(segmentLength, 1) / pixelsPerSecond) * 1000
		);
		const startedAt = performance.now();

		const tick = (now) => {
			const progress = Math.min(1, (now - startedAt) / durationMs);
			svgStore.setResidualCutSimulation({
				on: true,
				segmentIndex,
				segmentProgress: progress,
			});

			if (progress >= 1) {
				if (segmentIndex >= sequence.length - 1) {
					svgStore.stopResidualCutSimulation();
					return;
				}

				svgStore.setResidualCutSimulation({
					on: true,
					segmentIndex: segmentIndex + 1,
					segmentProgress: 0,
				});
				return;
			}

			frameRef.current = window.requestAnimationFrame(tick);
		};

		frameRef.current = window.requestAnimationFrame(tick);
		return stopFrame;
	}, [segmentIndex, sequence, simulationOn, speed, stopFrame]);

	return null;
});

const ResidualCutLayer = observer(() => {
	const sheetWidth = Math.max(0, Number(svgStore.svgData?.width) || 0);
	const sheetHeight = Math.max(0, Number(svgStore.svgData?.height) || 0);
	const residualCut = svgStore.svgData?.residualCut || { areas: [] };
	const areas = Array.isArray(residualCut.areas) ? residualCut.areas : [];
	const safetyClearance = svgStore.getSheetSafetyClearance();
	const geometry = useMemo(() => buildResidualCutGeometry(areas, sheetWidth, sheetHeight), [
		areas,
		sheetHeight,
		sheetWidth,
	]);
	const isManualMode = editorStore.mode === "residualCut";
	const draftPoints = Array.isArray(svgStore.residualCutDraft.points)
		? svgStore.residualCutDraft.points
		: [];
	const cursorPoint = svgStore.residualCutDraft.cursorPoint;
	const simulation = svgStore.residualCutSimulation;

	const previewArea = useMemo(() => {
		if (!isManualMode || draftPoints.length !== 1 || !cursorPoint) {
			return null;
		}

		const baseArea = normalizeResidualCutArea(
			{
				left: draftPoints[0].x,
				top: draftPoints[0].y,
				right: cursorPoint.x,
				bottom: cursorPoint.y,
				manual: true,
			},
			sheetWidth,
			sheetHeight
		);
		const boundedArea = snapResidualCutAreaToBounds(baseArea, sheetWidth, sheetHeight);
		return snapResidualCutAreaToExistingEdges(boundedArea, areas);
	}, [areas, cursorPoint, draftPoints, isManualMode, sheetHeight, sheetWidth]);

	const getPointerPosition = useCallback((event) => {
		const sourceEvent = getClientPointFromEvent(event);
		if (!sourceEvent) {
			return null;
		}

		return normalizeResidualCutPoint(
			util.convertScreenCoordsToSvgCoords(sourceEvent.clientX, sourceEvent.clientY),
			sheetWidth,
			sheetHeight
		);
	}, [sheetHeight, sheetWidth]);

	const stopPointerEvent = useCallback((event) => {
		event?.stopPropagation?.();

		if (event?.cancelable) {
			event.preventDefault();
		}
	}, []);

	const handlePointerMove = useCallback((event) => {
		if (!isManualMode) {
			return;
		}

		stopPointerEvent(event);
		svgStore.setResidualCutCursor(getPointerPosition(event));
	}, [getPointerPosition, isManualMode, stopPointerEvent]);

	const handlePointerLeave = useCallback(() => {
		if (!isManualMode) {
			return;
		}

		svgStore.setResidualCutCursor(null);
	}, [isManualMode]);

	const handlePointerDown = useCallback((event) => {
		if (!isManualMode) {
			return;
		}

		stopPointerEvent(event);
		const point = getPointerPosition(event);
		if (!point) {
			return;
		}

		if (!draftPoints.length) {
			svgStore.setResidualCutDraftPoints([point]);
			svgStore.setResidualCutCursor(point);
			return;
		}

		const rawArea = normalizeResidualCutArea(
			{
				left: draftPoints[0].x,
				top: draftPoints[0].y,
				right: point.x,
				bottom: point.y,
				manual: true,
			},
			sheetWidth,
			sheetHeight
		);
		const boundedArea = snapResidualCutAreaToBounds(rawArea, sheetWidth, sheetHeight);
		const nextArea = snapResidualCutAreaToExistingEdges(boundedArea, areas);

		if (
			nextArea &&
			!doesResidualCutAreaCollideWithParts(
				svgStore.svgData,
				nextArea,
				safetyClearance
			)
		) {
			svgStore.setResidualCutAreas([...areas, nextArea]);
		} else if (nextArea) {
			showToast({
				type: "warning",
				message: "Residual cut overlaps parts",
			});
		}

		svgStore.resetResidualCutDraft();
		svgStore.setResidualCutCursor(point);
	}, [
		areas,
		draftPoints,
		getPointerPosition,
		isManualMode,
		safetyClearance,
		sheetHeight,
		sheetWidth,
		stopPointerEvent,
	]);

	const completedSegments = Array.isArray(simulation.sequence)
		? simulation.sequence.slice(0, Math.min(simulation.segmentIndex, simulation.sequence.length))
		: [];
	const activeSegment = Array.isArray(simulation.sequence)
		? simulation.sequence[simulation.segmentIndex]
		: null;
	const activeSegmentEndPoint = activeSegment?.start && activeSegment?.end
		? getInterpolatedPoint(
			activeSegment.start,
			activeSegment.end,
			Math.max(0, Math.min(Number(simulation.segmentProgress) || 0, 1))
		)
		: null;

	return (
		<>
			<ResidualCutSimulationController />
			<defs>
				<pattern
					id="residualCutHatch"
					width="10"
					height="10"
					patternUnits="userSpaceOnUse"
					patternTransform="rotate(45 0 0)"
				>

					<line
						x1="0"
						y1="0"
						x2="0"
						y2="10"
						stroke="gray"
						strokeWidth="1"
					/>
				</pattern>
			</defs>

			{geometry.unionPaths.length ? (
				<g
					className="residuals_areas"
					fill="url(#residualCutHatch)"
					stroke="var(--grey-nav)"
					strokeWidth="1"
					opacity={0.95}
					pointerEvents="none"
				>
					{geometry.unionPaths.map((path, index) => (
						<polyline
							key={`residual_area_${index}`}
							className="residual_area"
							points={toClosedResidualAreaPoints(path)}
							vectorEffect="non-scaling-stroke"
						/>
					))}
				</g>
			) : null}

			{geometry.displayPaths.map((path, index) => (
				<polyline
					key={`residual_cut_${index}`}
					points={toResidualCutPolylinePoints(path)}
					fill="none"
					stroke="red"
					strokeWidth="1.5"
					strokeDasharray="4 2"
					vectorEffect="non-scaling-stroke"
					opacity={simulation.on ? 0.35 : 1}
					pointerEvents="none"
				/>
			))}

			{completedSegments.map((segment, index) => (
				<line
					key={`residual_cut_sim_completed_${index}`}
					x1={segment.start.x}
					y1={segment.start.y}
					x2={segment.end.x}
					y2={segment.end.y}
					stroke={segment.kind === "move" ? "#198754" : "#ff3b30"}
					strokeWidth={segment.kind === "move" ? 2.5 : 4}
					strokeDasharray={segment.kind === "move" ? "8 6" : undefined}
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
					pointerEvents="none"
				/>
			))}

			{activeSegment?.start && activeSegmentEndPoint ? (
				<line
					x1={activeSegment.start.x}
					y1={activeSegment.start.y}
					x2={activeSegmentEndPoint.x}
					y2={activeSegmentEndPoint.y}
					stroke={activeSegment.kind === "move" ? "#198754" : "#ff3b30"}
					strokeWidth={activeSegment.kind === "move" ? 2.5 : 4}
					strokeDasharray={activeSegment.kind === "move" ? "8 6" : undefined}
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
					pointerEvents="none"
				/>
			) : null}

			{draftPoints.map((point, index) => (
				<circle
					key={`residual_cut_point_${index}`}
					cx={point.x}
					cy={point.y}
					r="3"
					fill="yellow"
					stroke="red"
					strokeWidth="2"
					vectorEffect="non-scaling-stroke"
					pointerEvents="none"
				/>
			))}

			{isManualMode && !draftPoints.length && cursorPoint ? (
				<>
					<line
						x1={0}
						y1={cursorPoint.y}
						x2={sheetWidth}
						y2={cursorPoint.y}
						stroke="#02feff"
						strokeWidth="1.5"
						strokeDasharray="5 5"
						vectorEffect="non-scaling-stroke"
						pointerEvents="none"
					/>
					<line
						x1={cursorPoint.x}
						y1={0}
						x2={cursorPoint.x}
						y2={sheetHeight}
						stroke="#02feff"
						strokeWidth="1.5"
						strokeDasharray="5 5"
						vectorEffect="non-scaling-stroke"
						pointerEvents="none"
					/>
				</>
			) : null}

			{isManualMode && previewArea ? (
				<rect
					x={previewArea.left}
					y={previewArea.top}
					width={previewArea.right - previewArea.left}
					height={previewArea.bottom - previewArea.top}
					fill="url(#residualCutHatch)"
					stroke="var(--violet)"
					strokeWidth="1.25"
					strokeDasharray="5 5"
					opacity={0.95}
					vectorEffect="non-scaling-stroke"
					pointerEvents="none"
				/>
			) : null}

			{isManualMode ? (
				<rect
					x={0}
					y={0}
					width={sheetWidth}
					height={sheetHeight}
					fill="transparent"
					pointerEvents="all"
					style={{ cursor: "crosshair" }}
					onMouseDown={handlePointerDown}
					onMouseMove={handlePointerMove}
					onMouseLeave={handlePointerLeave}
					onTouchStart={handlePointerDown}
					onTouchMove={handlePointerMove}
					onTouchEnd={handlePointerLeave}
				/>
			) : null}
		</>
	);
});

export default ResidualCutLayer;
