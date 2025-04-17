import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef } from 'react';
import Button from 'react-bootstrap/esm/Button';
import { Icon } from '@iconify/react/dist/iconify.js';


const CustomKnob1 = observer(() => {
	const { knobs, knob1 } = viewStore
	const knob = knobs[0]
	const step = knob.step
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const handleMouseDown = (callback: () => void) => {
		callback(); // Первый вызов сразу
		intervalRef.current = setInterval(callback, 200); // Повторяем каждую 100мс
	};

	const handleMouseUp = () => {
		if (intervalRef.current) clearInterval(intervalRef.current);
	};

	/* 	useEffect(() => {
			console.log ("useEffect000  "+ knob.val)
			viewStore.setKnob1(getPath())
		}, [])
	 */
	useEffect(() => {
		console.log("useEffect  " + knob.val)
		let path = getPath()
		console.log(path)
		viewStore.setKnob1(path)
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
		const r1 = 34;
		const r2 = 42;
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

	const startMove  = ()=> {

	}

	const endMove = () => {
		
	}


	return (
		<div className='col-12 h-100 d-flex align-items-center justify-content-center py-2'>
			<div className='col-12 h-100 d-flex flex-column align-items-center justify-content-evenly'>

				<Button
					variant="outline-secondary"
					onPointerDown={() => handleMouseDown(increase)}
					onPointerUp={handleMouseUp}
					onPointerLeave={handleMouseUp}
					className='ms-6 btn-lg'
				>
					<Icon icon="fluent:triangle-12-filled" width="24" height="24" style={{ color: 'white' }} />
				</Button>
				<svg id="svgChart" version="1.1" width="100%" height="50%" viewBox="0 0 100 100" overflow="hidden">
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
						fill={knob.val === knob.max ? "limegreen" : "url(#circleGradient)"}
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
						d={`${knob1}`}
						fill="limegreen"
						stroke="limegreen"
						strokeWidth="2"
						style={{ filter: "drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.5))" }}
						onPointerDown={ startMove }
						onPointerUp={ endMove }
						onPointerLeave={ endMove }
						onPointerCancel={ endMove }
					/>
					<g id="ticks">
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
					</g>
					<text x="50" y="60" textAnchor="middle" fontSize="25" fill="white">
						{knobs[0].val}
					</text>
				</svg>

				<Button
					variant="outline-secondary"
					onPointerDown={() => handleMouseDown(decrease)}
					onPointerUp={handleMouseUp}
					onPointerLeave={handleMouseUp}
					className='me-6 btn-lg'
				>
					<Icon
						icon="fluent:triangle-12-filled"
						width="24"
						height="24"
						style={{
							color: "white",
							transform: "rotate(180deg)"
						}}
					/>
				</Button>
			</div>
		</div>


	);
});

export default CustomKnob1;
