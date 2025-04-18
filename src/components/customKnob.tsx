import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef } from 'react';
import Button from 'react-bootstrap/esm/Button';

const CustomKnob = observer(() => {
	const { knobs, knobPath } = viewStore
	const knob = knobs[0]
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
		viewStore.setKnobPath( 0, path)
	}, [knob.val])

	const increase = () => {
		let newval = knobs[0].val + step
		if (newval <= knob.max) viewStore.setVal(0, newval);
	}

	const decrease = () => {
		let newval = knobs[0].val - step
		if (newval >= knob.min) viewStore.setVal(0, newval);
	}

	const getPath = () => {
		const { min, max, val } = knob;
		const r1 = 45;
		const r2 = 44;
		const cx = 50;
		const cy = 50;
	
		const round = (n: number) => Math.round(n * 10000) / 10000;
	
		// Процент заполнения и соответствующий угол
		const percentage = (val - min) / (max - min);
		const angle = 360 * percentage;
	
		// Вспомогательная функция для вычисления координат по углу и радиусу
		const polarToCartesian = (radius: number, angleDeg: number) => {
			const rad = (angleDeg + 90) * (Math.PI / 180);
			return {
				x: round(cx + radius * Math.cos(rad)),
				y: round(cy + radius * Math.sin(rad)),
			};
		};
	
		// Начальные координаты
		const startOuter = polarToCartesian(r2, 0);
		const endOuter = polarToCartesian(r2, angle);
		const startInner = polarToCartesian(r1, 0);
		const endInner = polarToCartesian(r1, angle);
	
		// Определяем, нужно ли разбить внешнюю дугу
		const arcOuter = angle > 180
			? `A ${r2} ${r2} 0 0 1 ${polarToCartesian(r2, 180).x} ${polarToCartesian(r2, 180).y}
			   A ${r2} ${r2} 0 0 1 ${endOuter.x} ${endOuter.y}`
			: `A ${r2} ${r2} 0 0 1 ${endOuter.x} ${endOuter.y}`;
	
		const arcInner = angle > 180
			? `A ${r1} ${r1} 0 0 0 ${polarToCartesian(r1, 180).x} ${polarToCartesian(r1, 180).y}
			   A ${r1} ${r1} 0 0 0 ${startInner.x} ${startInner.y}`
			: `A ${r1} ${r1} 0 0 0 ${startInner.x} ${startInner.y}`;
	
		// Финальный путь
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
				<svg id="svgChart"  className="svgChart" version="1.1" width="100%" height="100%" viewBox="0 0 100 100" overflow="hidden">
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
						fill={knob.val === knob.max ? "orangered" : "url(#circleGradient)"}
						stroke="gray"
						strokeWidth="1"
						filter="drop-shadow(0px 2px 4px rgba(0,0,0,1))"
					/>

					<circle
						cx="50"
						cy="50"
						r="30"
						fill={`var(--mainBg)`}
						stroke="gray"
						strokeWidth="1"
						filter="drop-shadow(0px 2px 4px rgba(0,0,0,1))"
					/>

					<path
					d={`${knobPath[0]}`}
					fill="orangered"
					stroke="orangered"
					strokeWidth="2"
					style={{
						filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))",
						transition: "none"
					  }}					/>
				{/* 	<g id="ticks">
					{Array.from({ length: 360 }).map((_, i) => {
						const isMajor = i % 10 === 0;
						const length = isMajor ? 6 : 3;
						const stroke = isMajor ? "#333" : "#aaa";
						return (
						<line
							key={i}
							x1="50"
							y1="5"
							x2="50"
							y2={5 + length}
							stroke={stroke}
							strokeWidth={isMajor ? 0.75 : 0.5}
							transform={`rotate(${i} 50 50)`}
						/>
						);
					})}
					</g> */}


					<text x="50" y="60" textAnchor="middle" fontSize="25" fill="orangered">
						{knobs[0].val}
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
