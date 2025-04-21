import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';

const CustomKnob = observer(() => {
	const svgRef = useRef<SVGSVGElement>(null);
	const { knobs, knobPath } = viewStore
	const [isDragging, setIsDragging] = useState(false);
	const knob = knobs[1]
	const step = knob.step
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const center = { x: 50, y: 50 };
	const rect = svgRef.current?.getBoundingClientRect();

	const handleMouseDown = (callback: () => void) => {
		callback(); // Первый вызов сразу
		intervalRef.current = setInterval(callback, 50); // Повторяем каждую 100мс
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	const startMove = () => setIsDragging(true)
	const endMove = () => setIsDragging(false);

	const move = (e: React.PointerEvent<SVGElement>) => {
		if (!rect || !isDragging) return;
	
		const x = e.clientX - rect.left;
		const y = e.clientY - rect.top;
	
		// Координаты в системе viewBox
		const svgX = (x / rect.width) * 100;
		const svgY = (y / rect.height) * 100;
	
		const dx = svgX - center.x;
		const dy = svgY - center.y;
	
		let angle = Math.atan2(dy, dx) * (180 / Math.PI); // угол в градусах
		angle = (angle + 360) % 360;
	
		// Приводим угол к диапазону [0, 270] начиная от 225°
		let normalizedAngle = (angle - 225 + 360) % 360;
	
		//if (normalizedAngle > 270) return; // игнорируем вне сектора
	
		// Масштабируем в значение
		const { min, max, step, val } = knob;
		const newValue = Math.round((normalizedAngle / 270) * (max - min) + min);
	
		if (Math.abs(newValue - val) >= step && newValue % step === 0 && newValue <= max && newValue >= min) {
			viewStore.setVal(1, newValue);
		}
	};

	useEffect(() => {
		const svg = svgRef.current;
		if (!svg) return;
	
		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			const delta = e.deltaY < 0 ? 1 : -1;
			const newVal = knob.val + delta * knob.step;
	
			if (newVal >= knob.min && newVal <= knob.max) {
				viewStore.setVal(1, newVal);
			}
		};
	
		svg.addEventListener('wheel', handleWheel);
		return () => svg.removeEventListener('wheel', handleWheel);
	}, [knob]);

	useEffect(() => {
		let path = getPath()
		viewStore.setKnobPath(1, path)
	}, [knob.val])

	const increase = () => {
		let newval = knob.val + step
		if (newval <= knob.max) viewStore.setVal(1, newval);
	}

	const decrease = () => {
		let newval = knob.val - step
		if (newval >= knob.min) viewStore.setVal(1, newval);
	}

	const getPath = () => {
		const { min, max, val } = knob;
		const r1 = 37.5;
		const r2 = 38.5;
		const cx = 50;
		const cy = 50;

		const round = (n: number) => Math.round(n * 10000) / 10000;

		const startAngle = 225;
		const sweepAngle = 270;

		const percentage = (val - min) / (max - min);
		const angle = sweepAngle * percentage;

		const polarToCartesian = (radius: number, angleDeg: number) => {
			const rad = (angleDeg - 90) * (Math.PI / 180); // SVG 0° вверх
			return {
				x: round(cx + radius * Math.cos(rad)),
				y: round(cy + radius * Math.sin(rad)),
			};
		};

		const startOuter = polarToCartesian(r2, startAngle);
		const endOuter = polarToCartesian(r2, startAngle + angle);
		const startInner = polarToCartesian(r1, startAngle);
		const endInner = polarToCartesian(r1, startAngle + angle);

		// Определяем, нужен ли флаг large-arc (больше 180°)
		const largeArcFlag = angle > 180 ? 1 : 0;

		const arcOuter = `A ${r2} ${r2} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`;
		const arcInner = `A ${r1} ${r1} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`;

		// Возвращаем замкнутый сектор
		return `
			M ${startOuter.x} ${startOuter.y}
			${arcOuter}
			L ${endInner.x} ${endInner.y}
			${arcInner}
			Z
		`;
	};

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center'>
				<Button
					variant="outline-secondary"
					onPointerDown={() => handleMouseDown(decrease)}
					onPointerUp={handleMouseUp}
					onPointerLeave={handleMouseUp}
				>
					◀
				</Button>
				<svg id="svgChart" 
					className="svgChart" version="1.1" 
					width="100%" height="100%" 
					viewBox="0 0 100 100" overflow="hidden"
					onPointerDown={startMove}
					onPointerUp={endMove}
					onPointerLeave={endMove}
					onPointerCancel={endMove}
					onPointerMove={ move }
					ref={svgRef}
					>
					<defs>
						<radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
							<stop offset="0%" stopColor="#ffffff" />
							<stop offset="100%" stopColor="#cccccc" />
						</radialGradient>
					</defs>
					<circle
						cx="50"
						cy="50"
						r="45"
						fill={"url(#circleGradient)"}
						stroke="gray"
						strokeWidth="1"
						filter="drop-shadow(0px 2px 4px rgba(0,0,0,1))"
					/>

					{(() => {
						const { min, max, step } = knob;
						const r1 = 37.5;
						const r2 = 38.5;
						const cx = 50;
						const cy = 50;

						const totalSteps = Math.floor((max - min) / step);
						const anglePerStep = 270 / totalSteps;
						const startAngle = 225;
						const endAngle = startAngle + 270;

						const round = (n: number) => Math.round(n * 10000) / 10000;

						const polarToCartesian = (radius: number, angleDeg: number) => {
							const rad = (angleDeg - 90) * (Math.PI / 180); // SVG 0° вверх
							return {
								x: round(cx + radius * Math.cos(rad)),
								y: round(cy + radius * Math.sin(rad)),
							};
						};

						// Построение кольцевого сегмента от 225° до 135°
						const startOuter = polarToCartesian(r2, startAngle);
						const endOuter = polarToCartesian(r2, endAngle);
						const startInner = polarToCartesian(r1, endAngle);
						const endInner = polarToCartesian(r1, startAngle);

						const ringPath = `
							M ${startOuter.x} ${startOuter.y}
							A ${r2} ${r2} 0 1 1 ${endOuter.x} ${endOuter.y}
							L ${startInner.x} ${startInner.y}
							A ${r1} ${r1} 0 1 0 ${endInner.x} ${endInner.y}
							Z
						`;

						return (
							<>
								{/* Кольцевая дуга */}
								<path
									d={ringPath}
									fill="rgba(0,0,0,0.05)"
								/>

								{/* Декоративные точки */}
								{Array.from({ length: totalSteps + 1 }).map((_, i) => {
									const angle = startAngle + i * anglePerStep;
									const r = (r1 + r2) / 2;
									const pos = polarToCartesian(r, angle);

									return (
										<circle
											key={i}
											cx={pos.x}
											cy={pos.y}
											r={1}
											fill={'#aaa'}
										/>
									);
								})}
							</>
						);
					})()}

					<path
						d={`${knobPath[1]}`}
						fill="orangered"
						stroke="orangered"
						strokeWidth="2"
						style={{
							filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
							transition: "none"
						}}
					/>
					<text x="80" y="60" text-anchor="end" fontSize="20" className='segments14' fill="orangered">
						{knob.val === knob.max ? 'max' : (knob.val - Math.round(knob.val) === 0 ? knob.val + '.0' : knob.val)}
					</text>
				</svg>

				<div className='d-flex'>
					<Button
						variant="outline-secondary"
						onPointerDown={() => handleMouseDown(increase)}
						onPointerUp={handleMouseUp}
						onPointerLeave={handleMouseUp}
					>
						▶</Button>
				</div>
			</div>

		</div>
	);
});

export default CustomKnob;
