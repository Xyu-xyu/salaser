import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef, useState } from 'react';
import Button from 'react-bootstrap/esm/Button';

const CustomKnob = observer(() => {
	const svgRef = useRef<SVGGElement>(null);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const rect = svgRef.current?.getBoundingClientRect();


	const { knobs, knobPath } = viewStore
	const [isDragging, setIsDragging] = useState(false);

	const knob = knobs[1]
	const { minimum, maximum, val, title } = knob;
	const step = (maximum - minimum) /50

	const r1 = 37.5;
	const r2 = 38.5;
	const center = { x: 50, y: 50 };
	const startAngle = 225;
	const sweepAngle = 270;

	let fontSize =  80 / Math.max( (`${minimum - step}`).length, (`${minimum + step}`).length, (`${maximum - step}`).length, (`${maximum + step}`).length )  
	fontSize = fontSize > 22.5 ? 22.5 : fontSize

	const handleMouseDown = (callback: () => void) => {
		callback(); 
		intervalRef.current = setInterval(callback, 50);
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
	
 		let normalizedAngle = (angle - 225 + 360) % 360;
		const newValue = Math.round((normalizedAngle / 270) * (maximum - minimum) + minimum);
		viewStore.setVal(1, newValue);
		
	};

	useEffect(() => {
		let path = getPath()
		viewStore.setKnobPath(1, path)
		const svg = svgRef.current;
		if (!svg) return;
	
		const handleWheel = (e: WheelEvent) => {
			e.preventDefault();
			const delta = e.deltaY < 0 ? 1 : -1;
			const newVal = val + delta * step;
			viewStore.setVal(1, newVal);
			
		};
	
		svg.addEventListener('wheel', handleWheel);
		return () => svg.removeEventListener('wheel', handleWheel);
	}, [val]);


	const increase = () => {
		let newval = val + step
		viewStore.setVal(1, newval);
	}

	const decrease = () => {
		let newval = val - step
		viewStore.setVal(1, newval);
	}

	const polarToCartesian = (radius: number, angleDeg: number) => {
		const rad = (angleDeg - 90) * (Math.PI / 180); // SVG 0° вверх
		return {
			x: round(center.x + radius * Math.cos(rad)),
			y: round(center.y + radius * Math.sin(rad)),
		};
	};

	const round = (n: number) => Math.round(n * 10000) / 10000;

	const getPath = () => {
		
		const percentage = (val - minimum) / (maximum - minimum);
		const angle = sweepAngle * percentage;

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

	const getTicks =() => {
	
			const totalSteps = Math.floor((maximum - minimum) / step);
			const anglePerStep = 270 / totalSteps;
			const startAngle = 225;
			const endAngle = startAngle + 270;

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
		

	}

	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 h-100 d-flex align-items-center justify-content-center'>
				
				
			{/* 	<Button
					variant="outline-secondary"
					onPointerDown={() => handleMouseDown(decrease)}
					onPointerUp={handleMouseUp}
					onPointerLeave={handleMouseUp}
				>
					◀
				</Button> */}
				<svg id="svgChart" 
					className="svgChart" version="1.1" 
					width="100%" height="100%" 
					viewBox="0 0 100 100" overflow="hidden"
					onPointerDown={startMove}
					onPointerUp={endMove}
					onPointerLeave={endMove}
					onPointerCancel={endMove}
					onPointerMove={ move }
					>
					<defs>
						<radialGradient id="circleGradient" cx="50%" cy="50%" r="50%">
							<stop offset="0%" stopColor="#ffffff" />
							<stop offset="100%" stopColor="#cccccc" />
						</radialGradient>
					</defs>

					<g ref={svgRef}>
						<circle
							cx="50"
							cy="50"
							r="45"
							fill={"url(#circleGradient)"}
							stroke="gray"
							strokeWidth="1"
							filter="drop-shadow(0px 2px 4px rgba(0,0,0,1))"

						/>

						{ getTicks() }

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
						<text x="83" y="60" textAnchor="end" fontSize={fontSize} className='segments14' fill="orangered">
							{ val === maximum ? 'max' : val}
						</text>
					</g>
					<text x="0" y="-5" className='moderat' fill="orangered" fontSize={fontSize}>
						{ title.split(', ')[0] }
					</text>
					<text x="30" y="85" className='moderat' fontSize={fontSize} fill="orangered">
						{ title.split(', ')[1] }
					</text>
					<text x="65" y="105" textAnchor="start" className='moderat' fontSize={fontSize*.5} fill="orangered">
						{ maximum }
					</text>
					<text x="35" y="105" textAnchor="end" className='moderat' fontSize={fontSize*.5} fill="orangered">
						{ minimum }
					</text>
				</svg>

				{/* <div className='d-flex'>
					<Button
						variant="outline-secondary"
						onPointerDown={() => handleMouseDown(increase)}
						onPointerUp={handleMouseUp}
						onPointerLeave={handleMouseUp}
					>
						▶</Button>
				</div> */}
				
			</div>

		</div>
	);
});

export default CustomKnob;
