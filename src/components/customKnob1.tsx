import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef } from 'react';
import Button from 'react-bootstrap/esm/Button';

const CustomKnob = observer(() => {
	const { knobs, knobPath } = viewStore
	const knob = knobs[1]
	const step = knob.step
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const handleMouseDown = (callback: () => void) => {
		callback(); // Первый вызов сразу
		intervalRef.current = setInterval(callback, 50); // Повторяем каждую 100мс
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

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
				<svg id="svgChart" className="svgChart" version="1.1" width="100%" height="100%" viewBox="0 0 100 100" overflow="hidden">
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
						{knob.val === knob.max ? 'min' : (knob.val - Math.round(knob.val) === 0 ? knob.val + '.0' : knob.val)}
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
