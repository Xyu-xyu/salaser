import { Icon } from "@iconify/react/dist/iconify.js";
import React, { useEffect, useRef, useState } from "react";
import SampleSvg from "./../store/sampleSvg";


interface CanvasSvgViewerProps {
	svgUrl: string;
}

const CanvasSvgViewer: React.FC<CanvasSvgViewerProps> = ({ svgUrl }) => {
	const canvasRef = useRef<HTMLCanvasElement | null>(null);

	// Данные изображения
	const [image, setImage] = useState<HTMLImageElement | null>(null);
	const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

	// Цели анимации (панорамирование и масштаб)
	const targetPan = useRef({ x: 0, y: 0 });
	const targetZoom = useRef(1);

	// Текущие значения
	const currentPan = useRef({ x: 0, y: 0 });
	const currentZoom = useRef(1);

	// Перетаскивание
	const dragStart = useRef({ x: 0, y: 0 });
	const isDragging = useRef(false);

	// Touch pinch-to-zoom
	const evCache = useRef<Touch[]>([]);
	const prevDiff = useRef(-1);

	// === Загрузка SVG ===
	useEffect(() => {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => {
		  controller.abort(); // ⏳ прерываем запрос через 2 сек
		  console.warn("Загрузка SVG превысила 2 секунды. Использую SampleSvg...");
		  loadSvgFromText(SampleSvg); // fallback
		}, 2000);
	
		fetch(svgUrl, { signal: controller.signal })
		  .then((res) => res.text())
		  .then((svgText) => {
			clearTimeout(timeoutId); // успели загрузить
			loadSvgFromText(svgText);
		  })
		  .catch((err) => {
			console.error("Ошибка загрузки SVG:", err);
			clearTimeout(timeoutId);
			loadSvgFromText(SampleSvg); // fallback на ошибке
		  });
	
		return () => {
		  clearTimeout(timeoutId);
		  controller.abort();
		};
	  }, [svgUrl]);
	
	  const loadSvgFromText = (svgText: string) => {
		const blob = new Blob([svgText], { type: "image/svg+xml" });
		const url = URL.createObjectURL(blob);
		const img = new Image();
		img.onload = () => {
		  setImgSize({ w: img.width, h: img.height });
		  setImage(img);
		  URL.revokeObjectURL(url);
		};
		img.src = url;
	  };
	
	  // === Рендеринг canvas ===
	  useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;
	
		const render = () => {
		  if (!image) {
			requestAnimationFrame(render);
			return;
		  }
	
		  // Плавная интерполяция
		  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
		  currentPan.current.x = lerp(currentPan.current.x, targetPan.current.x, 0.2);
		  currentPan.current.y = lerp(currentPan.current.y, targetPan.current.y, 0.2);
		  currentZoom.current = lerp(currentZoom.current, targetZoom.current, 0.2);
	
		  ctx.clearRect(0, 0, canvas.width, canvas.height);
	
		  ctx.save();
		  ctx.translate(canvas.width / 2, canvas.height / 2);
		  ctx.scale(currentZoom.current, currentZoom.current);
		  ctx.translate(currentPan.current.x, currentPan.current.y);
		  ctx.drawImage(image, -imgSize.w / 2, -imgSize.h / 2, imgSize.w, imgSize.h);
		  ctx.restore();
	
		  requestAnimationFrame(render);
		};
	
		render();
	  }, [image, imgSize]);


	

	// === Рендеринг canvas ===
	useEffect(() => {
		const canvas = canvasRef.current;
		const ctx = canvas?.getContext("2d");
		if (!canvas || !ctx) return;

		const render = () => {
			if (!image) {
				requestAnimationFrame(render);
				return;
			}

			// Плавная интерполяция pan/zoom
			const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
			currentPan.current.x = lerp(currentPan.current.x, targetPan.current.x, 0.2);
			currentPan.current.y = lerp(currentPan.current.y, targetPan.current.y, 0.2);
			currentZoom.current = lerp(currentZoom.current, targetZoom.current, 0.2);

			ctx.clearRect(0, 0, canvas.width, canvas.height);

			ctx.save();
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.scale(currentZoom.current, currentZoom.current);
			ctx.translate(currentPan.current.x, currentPan.current.y);
			ctx.drawImage(image, -imgSize.w / 2, -imgSize.h / 2, imgSize.w, imgSize.h);
			ctx.restore();

			requestAnimationFrame(render);
		};

		render();
	}, [image, imgSize]);

	// === Сброс в fit ===
	const fit = () => {
		targetPan.current = { x: 0, y: 0 };
		targetZoom.current = 1;
	};

	// === Обработчики мыши ===
	const handleMouseDown = (e: React.MouseEvent) => {
		isDragging.current = true;
		dragStart.current = {
			x: e.clientX - targetPan.current.x,
			y: e.clientY - targetPan.current.y,
		};
	};

	const handleMouseMove = (e: React.MouseEvent) => {
		if (!isDragging.current) return;
		targetPan.current = {
			x: e.clientX - dragStart.current.x,
			y: e.clientY - dragStart.current.y,
		};
	};

	const handleMouseUp = () => {
		isDragging.current = false;
	};

	// === Колесо мыши ===
	const handleWheel = (e: React.WheelEvent) => {
		//e.preventDefault();
		const delta = -e.deltaY * 0.001;
		targetZoom.current = Math.max(0.1, targetZoom.current * (1 + delta));
	};

	// === Touch ===
	const handleTouchStart = (e: React.TouchEvent) => {
		for (let i = 0; i < e.touches.length; i++) {
			const t = e.touches[i];
			if (!evCache.current.some((c) => c.identifier === t.identifier)) {
				evCache.current.push(t);
			}
		}
		if (e.touches.length === 1) {
			isDragging.current = true;
			dragStart.current = {
				x: e.touches[0].clientX - targetPan.current.x,
				y: e.touches[0].clientY - targetPan.current.y,
			};
		}
	};

	const handleTouchMove = (e: React.TouchEvent) => {
		for (let i = 0; i < e.touches.length; i++) {
			const t = e.touches[i];
			const idx = evCache.current.findIndex((c) => c.identifier === t.identifier);
			if (idx > -1) evCache.current[idx] = t;
		}

		if (evCache.current.length === 2) {
			// Pinch zoom
			const curDiff = getDistance(evCache.current[0], evCache.current[1]);
			const center = {
				x: (evCache.current[0].clientX + evCache.current[1].clientX) / 2,
				y: (evCache.current[0].clientY + evCache.current[1].clientY) / 2,
			};
			if (prevDiff.current > 0) {
				const scaleChange = curDiff / prevDiff.current;
				targetZoom.current = Math.max(0.1, targetZoom.current * scaleChange);
				targetPan.current = {
					x: targetPan.current.x - (center.x - window.innerWidth / 2) * (scaleChange - 1),
					y: targetPan.current.y - (center.y - window.innerHeight / 2) * (scaleChange - 1),
				};
			}
			prevDiff.current = curDiff;
		} else if (evCache.current.length === 1) {
			// Pan
			const t = evCache.current[0];
			targetPan.current = {
				x: t.clientX - dragStart.current.x,
				y: t.clientY - dragStart.current.y,
			};
		}
	};

	const handleTouchEnd = (e: React.TouchEvent) => {
		for (let i = 0; i < e.changedTouches.length; i++) {
			const t = e.changedTouches[i];
			const idx = evCache.current.findIndex((c) => c.identifier === t.identifier);
			if (idx > -1) evCache.current.splice(idx, 1);
		}
		if (evCache.current.length < 2) prevDiff.current = -1;
		if (evCache.current.length === 0) isDragging.current = false;
	};

	const getDistance = (t1: Touch, t2: Touch) => {
		const dx = t1.clientX - t2.clientX;
		const dy = t1.clientY - t2.clientY;
		return Math.sqrt(dx * dx + dy * dy);
	};

	return (
		<div id="wrapper_svg" style={{ position: "relative" }}>
			<div className="d-flex flex-column position-absolute">
				<div className="mx-2 mt-1">
					<button
						onClick={fit}
						className={`violet_button navbar_button small_button40`} >
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="carbon:zoom-fit"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</div>
			</div>
			<canvas
				ref={canvasRef}
				width={window.innerWidth}
				height={window.innerHeight}
				style={{ width: "100%", height: "100%", border: "1px solid var(--color)" }}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onWheel={handleWheel}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
				onTouchCancel={handleTouchEnd}
			/>			
		</div>
	);
};

export default CanvasSvgViewer;
