import React, { useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import svgStore from "./../../store/svgStore.jsx";
import {
	getSheetCutPointAtProgress,
	getSheetCutQueue,
	getSheetCutQueueSignature,
} from "./../../scripts/sheetCutUtils.jsx";

const VISIBILITY_CHECK_INTERVAL = 250;
const TAIL_LENGTH = 20;
const TAIL_MIN_VISIBLE_LENGTH = 0.01;
const STORE_SYNC_INTERVAL = 100;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const formatTailValue = (value) => Number(value.toFixed(3));

const getFixedTailSegments = (queue, requestedLength) => {
	if (!queue?.segments?.length || !Number.isFinite(queue.totalLength) || queue.totalLength <= 0) {
		return [];
	}

	const currentLength = clamp(requestedLength, 0, queue.totalLength);
	if (currentLength <= 0) return [];

	const tailStart = Math.max(0, currentLength - TAIL_LENGTH);

	return queue.segments.reduce((segments, segment) => {
		const visibleStart = Math.max(segment.start, tailStart);
		const visibleEnd = Math.min(segment.end, currentLength);
		const visibleLength = visibleEnd - visibleStart;

		if (!Number.isFinite(visibleLength) || visibleLength <= TAIL_MIN_VISIBLE_LENGTH) {
			return segments;
		}

		const localStart = clamp(visibleStart - segment.start, 0, segment.length);
		segments.push({
			id: `${segment.id}_${formatTailValue(localStart)}_${formatTailValue(visibleLength)}`,
			d: segment.d,
			length: formatTailValue(segment.length),
			dasharray: [
				formatTailValue(localStart),
				formatTailValue(visibleLength),
				formatTailValue(segment.length),
			].join(" "),
		});

		return segments;
	}, []);
};

const SheetLaserShow = observer(() => {
	const { laserShow, svgData } = svgStore;
	const isLaserOn = Boolean(laserShow.on);
	const isPaused = Boolean(laserShow.paused);
	const requestedProgress = Number(laserShow.seek) || 0;
	const seekVersion = Number(laserShow.seekVersion) || 0;
	const queueSignature = getSheetCutQueueSignature(svgData);

	const markerRef = useRef(null);
	const tailRef = useRef(null);
	const animationFrameRef = useRef(null);
	const visibilityTimerRef = useRef(null);
	const lastFrameRef = useRef(null);
	const lastStoreSyncRef = useRef(0);
	const progressLengthRef = useRef(0);
	const queueRef = useRef({
		signature: "",
		segments: [],
		totalLength: 0,
	});

	const stopAnimation = useCallback(() => {
		if (animationFrameRef.current) {
			cancelAnimationFrame(animationFrameRef.current);
			animationFrameRef.current = null;
		}
		lastFrameRef.current = null;
	}, []);

	const stopVisibilityWatch = useCallback(() => {
		if (visibilityTimerRef.current) {
			clearInterval(visibilityTimerRef.current);
			visibilityTimerRef.current = null;
		}
	}, []);

	const clearVisuals = useCallback(() => {
		if (tailRef.current) {
			tailRef.current.replaceChildren();
			tailRef.current.style.display = "none";
		}

		if (markerRef.current) {
			markerRef.current.style.display = "none";
		}
	}, []);

	const syncLaserShowState = useCallback((patch, force = false) => {
		const now = typeof performance !== "undefined"
			? performance.now()
			: Date.now();

		if (force || now - lastStoreSyncRef.current >= STORE_SYNC_INTERVAL) {
			lastStoreSyncRef.current = now;
			svgStore.setLaserShow(patch);
		}
	}, []);

	const ensureQueue = useCallback(() => {
		if (queueRef.current.signature === queueSignature) {
			return queueRef.current;
		}

		const queue = getSheetCutQueue(svgData, queueSignature);
		queueRef.current = queue;

		if ((Number(svgStore.laserShow.totalLength) || 0) !== queue.totalLength) {
			svgStore.setLaserShow({ totalLength: queue.totalLength });
		}

		return queue;
	}, [queueSignature, svgData]);

	const isLaserVisible = useCallback(() => {
		if (typeof window === "undefined" || typeof document === "undefined") return false;
		if (document.visibilityState !== "visible") return false;

		const svgElement = markerRef.current?.ownerSVGElement || document.getElementById("svg");
		if (!svgElement || !svgElement.isConnected) return false;

		const hiddenByStyle = (element) => {
			const style = window.getComputedStyle(element);
			return (
				style.display === "none" ||
				style.visibility === "hidden" ||
				style.visibility === "collapse" ||
				Number(style.opacity) === 0
			);
		};

		if (hiddenByStyle(svgElement)) return false;

		const rect = svgElement.getBoundingClientRect();
		if (rect.width <= 0 || rect.height <= 0) return false;

		const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

		return (
			rect.bottom > 0 &&
			rect.right > 0 &&
			rect.top < viewportHeight &&
			rect.left < viewportWidth
		);
	}, []);

	const updateMarker = useCallback((point) => {
		if (!markerRef.current) return;

		markerRef.current.style.display = "block";
		markerRef.current.setAttribute("cx", `${point.x}`);
		markerRef.current.setAttribute("cy", `${point.y}`);
	}, []);

	const updateTail = useCallback((queue, progressLength) => {
		if (!tailRef.current) return;

		const tailSegments = getFixedTailSegments(queue, progressLength);
		tailRef.current.replaceChildren();

		if (!tailSegments.length) {
			tailRef.current.style.display = "none";
			return;
		}

		const svgNS = "http://www.w3.org/2000/svg";
		tailSegments.forEach(segment => {
			const pathElement = document.createElementNS(svgNS, "path");
			pathElement.setAttribute("d", segment.d);
			pathElement.setAttribute("fill", "none");
			pathElement.setAttribute("stroke", "red");
			pathElement.setAttribute("stroke-width", "1");
			pathElement.setAttribute("stroke-linecap", "round");
			pathElement.setAttribute("stroke-linejoin", "round");
			pathElement.setAttribute("vector-effect", "non-scaling-stroke");
			pathElement.setAttribute("pathLength", `${segment.length}`);
			pathElement.setAttribute("stroke-dasharray", segment.dasharray);
			tailRef.current.appendChild(pathElement);
		});

		tailRef.current.style.display = "block";
	}, []);

	const renderAtLength = useCallback((requestedLength, options = {}) => {
		const { forceSync = false } = options;
		const queue = ensureQueue();

		if (!queue.totalLength || !queue.segments.length) {
			progressLengthRef.current = 0;
			clearVisuals();
			syncLaserShowState({
				progress: 0,
				activePartId: null,
				currentOrder: 0,
				totalLength: 0,
			}, true);
			return null;
		}

		const pointInfo = getSheetCutPointAtProgress(queue, requestedLength);
		if (!pointInfo?.point) {
			progressLengthRef.current = 0;
			clearVisuals();
			syncLaserShowState({
				progress: 0,
				activePartId: null,
				currentOrder: 0,
				totalLength: queue.totalLength,
			}, true);
			return null;
		}

		progressLengthRef.current = pointInfo.progressLength;
		updateMarker(pointInfo.point);
		updateTail(queue, pointInfo.progressLength);
		syncLaserShowState({
			progress: pointInfo.progressPercent,
			activePartId: pointInfo.partId,
			currentOrder: pointInfo.orderIndex + 1,
			totalLength: queue.totalLength,
		}, forceSync);

		return pointInfo;
	}, [clearVisuals, ensureQueue, syncLaserShowState, updateMarker, updateTail]);

	const renderAtPercent = useCallback((progressPercent, options = {}) => {
		const queue = ensureQueue();
		const clampedProgress = clamp(Number(progressPercent) || 0, 0, 100);
		return renderAtLength((queue.totalLength * clampedProgress) / 100, options);
	}, [ensureQueue, renderAtLength]);

	const deactivateLaserShow = useCallback(() => {
		stopAnimation();
		stopVisibilityWatch();
		clearVisuals();
		progressLengthRef.current = 0;

		svgStore.setLaserShow({
			on: false,
			paused: false,
			progress: 0,
			seek: 0,
			activePartId: null,
			currentOrder: 0,
		});
	}, [clearVisuals, stopAnimation, stopVisibilityWatch]);

	const startVisibilityWatch = useCallback(() => {
		stopVisibilityWatch();

		visibilityTimerRef.current = window.setInterval(() => {
			if (!isLaserVisible()) {
				deactivateLaserShow();
			}
		}, VISIBILITY_CHECK_INTERVAL);
	}, [deactivateLaserShow, isLaserVisible, stopVisibilityWatch]);

	const finishPlayback = useCallback(() => {
		stopAnimation();
		const queue = ensureQueue();
		const pointInfo = renderAtLength(queue.totalLength, { forceSync: true });

		svgStore.setLaserShow({
			on: true,
			paused: true,
			progress: 100,
			seek: 100,
			activePartId: pointInfo?.partId ?? null,
			currentOrder: queue.segments.length
				? queue.segments[queue.segments.length - 1].orderIndex + 1
				: 0,
			totalLength: queue.totalLength,
		});
	}, [ensureQueue, renderAtLength, stopAnimation]);

	const animate = useCallback((timestamp) => {
		if (!svgStore.laserShow.on || svgStore.laserShow.paused) {
			stopAnimation();
			return;
		}

		if (!isLaserVisible()) {
			deactivateLaserShow();
			return;
		}

		const queue = ensureQueue();
		if (!queue.totalLength) {
			deactivateLaserShow();
			return;
		}

		if (lastFrameRef.current === null) {
			lastFrameRef.current = timestamp;
		}

		const delta = timestamp - lastFrameRef.current;
		lastFrameRef.current = timestamp;

		const speed = Number(svgStore.laserShow.speed) || 50;
		const unitsPerSecond = 1000 / Math.max(1, 101 - speed);
		const nextLength = progressLengthRef.current + (unitsPerSecond * delta) / 1000;

		if (nextLength >= queue.totalLength) {
			finishPlayback();
			return;
		}

		renderAtLength(nextLength);
		animationFrameRef.current = requestAnimationFrame(animate);
	}, [deactivateLaserShow, ensureQueue, finishPlayback, isLaserVisible, renderAtLength, stopAnimation]);

	const startAnimation = useCallback(() => {
		stopAnimation();
		lastFrameRef.current = null;
		animationFrameRef.current = requestAnimationFrame(animate);
	}, [animate, stopAnimation]);

	useEffect(() => {
		if (!isLaserOn) {
			stopAnimation();
			stopVisibilityWatch();
			progressLengthRef.current = 0;
			clearVisuals();
			return undefined;
		}

		if (!isLaserVisible()) {
			deactivateLaserShow();
			return undefined;
		}

		const queue = ensureQueue();
		if (!queue.totalLength) {
			deactivateLaserShow();
			return undefined;
		}

		startVisibilityWatch();

		const progressToRender = !isPaused && requestedProgress >= 100
			? 0
			: requestedProgress;

		renderAtPercent(progressToRender, {
			forceSync: true,
		});

		if (!isPaused) {
			startAnimation();
		} else {
			stopAnimation();
		}

		return () => {
			stopAnimation();
		};
	}, [
		clearVisuals,
		deactivateLaserShow,
		ensureQueue,
		isLaserOn,
		isLaserVisible,
		isPaused,
		queueSignature,
		renderAtPercent,
		requestedProgress,
		startAnimation,
		startVisibilityWatch,
		stopAnimation,
		stopVisibilityWatch,
	]);

	useEffect(() => {
		if (!isLaserOn || !seekVersion || !isPaused) return undefined;

		if (!isLaserVisible()) {
			deactivateLaserShow();
			return undefined;
		}

		const queue = ensureQueue();
		if (!queue.totalLength) {
			deactivateLaserShow();
			return undefined;
		}

		stopAnimation();
		startVisibilityWatch();
		renderAtPercent(requestedProgress, {
			forceSync: true,
		});

		return undefined;
	}, [
		deactivateLaserShow,
		ensureQueue,
		isLaserOn,
		isPaused,
		isLaserVisible,
		renderAtPercent,
		requestedProgress,
		seekVersion,
		startVisibilityWatch,
		stopAnimation,
	]);

	useEffect(() => {
		if (!isLaserOn) return undefined;

		const stopOnKeyDown = () => {
			deactivateLaserShow();
		};

		const stopOnWindowHide = () => {
			deactivateLaserShow();
		};

		const stopOnVisibilityChange = () => {
			if (document.visibilityState !== "visible") {
				deactivateLaserShow();
			}
		};

		window.addEventListener("keydown", stopOnKeyDown);
		window.addEventListener("blur", stopOnWindowHide);
		window.addEventListener("beforeunload", stopOnWindowHide);
		window.addEventListener("pagehide", stopOnWindowHide);
		document.addEventListener("visibilitychange", stopOnVisibilityChange);

		return () => {
			window.removeEventListener("keydown", stopOnKeyDown);
			window.removeEventListener("blur", stopOnWindowHide);
			window.removeEventListener("beforeunload", stopOnWindowHide);
			window.removeEventListener("pagehide", stopOnWindowHide);
			document.removeEventListener("visibilitychange", stopOnVisibilityChange);
		};
	}, [deactivateLaserShow, isLaserOn]);

	useEffect(() => {
		return () => {
			deactivateLaserShow();
		};
	}, [deactivateLaserShow]);

	return (
		<>
			<g
				ref={tailRef}
				id="sheetLaserShowTail"
				className="cutDot"
				pointerEvents="none"
				style={{ display: "none", opacity: 0.55 }}
			/>
			<circle
				ref={markerRef}
				id="sheetLaserShowMarker"
				r="2.5"
				fill="red"
				stroke="white"
				strokeWidth="0.6"
				pointerEvents="none"
				style={{ display: "none" }}
			/>
		</>
	);
});

export default SheetLaserShow;
