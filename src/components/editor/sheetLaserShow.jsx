import React, { useCallback, useEffect, useRef } from "react";
import { observer } from "mobx-react-lite";
import svgStore from "./../../store/svgStore.jsx";
import {
	getSheetCutPointAtProgress,
	getSheetCutQueue,
	getSheetCutQueueSignature,
} from "./../../scripts/sheetCutUtils.jsx";

const VISIBILITY_CHECK_INTERVAL = 250;
const TAIL_POINT_LIMIT = 36;
const STORE_SYNC_INTERVAL = 100;
const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

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
	const tailPointsRef = useRef([]);
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
		tailPointsRef.current = [];

		if (tailRef.current) {
			tailRef.current.setAttribute("d", "");
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

	const updateTail = useCallback((point, resetTail = false) => {
		if (!tailRef.current) return;

		const nextPoint = {
			x: Number(point.x.toFixed(3)),
			y: Number(point.y.toFixed(3)),
		};

		if (resetTail || !tailPointsRef.current.length) {
			tailPointsRef.current = [nextPoint];
		} else {
			const lastPoint = tailPointsRef.current[tailPointsRef.current.length - 1];
			if (!lastPoint || lastPoint.x !== nextPoint.x || lastPoint.y !== nextPoint.y) {
				tailPointsRef.current.push(nextPoint);
			}
			if (tailPointsRef.current.length > TAIL_POINT_LIMIT) {
				tailPointsRef.current.shift();
			}
		}

		if (tailPointsRef.current.length < 2) {
			tailRef.current.setAttribute("d", "");
			tailRef.current.style.display = "none";
			return;
		}

		const tailPath = tailPointsRef.current.map((tailPoint, index) => (
			index === 0
				? `M ${tailPoint.x} ${tailPoint.y}`
				: `L ${tailPoint.x} ${tailPoint.y}`
		)).join(" ");

		tailRef.current.style.display = "block";
		tailRef.current.setAttribute("d", tailPath);
	}, []);

	const renderAtLength = useCallback((requestedLength, options = {}) => {
		const { resetTail = false, forceSync = false } = options;
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
		updateTail(pointInfo.point, resetTail);
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
		const resetTail = !tailPointsRef.current.length || progressToRender <= 0;

		renderAtPercent(progressToRender, {
			resetTail,
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
			resetTail: true,
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
			<path
				ref={tailRef}
				id="sheetLaserShowTail"
				className="cutDot"
				fill="none"
				stroke="red"
				strokeWidth="1"
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
