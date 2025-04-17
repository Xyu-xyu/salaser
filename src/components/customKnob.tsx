import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useState, useRef } from 'react';
import Button from 'react-bootstrap/esm/Button';

const CustomKnob = observer(() => {
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
		console.log ("useEffect  "+ knob.val)
		let path = getPath()
		console.log ( path )
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

	const round  =(n: number) =>{
		return Math.round( n * 10**4 ) / 10**4

	}

	const getPath = () => {
		const cx = 50;
		const cy = 50;
		const r1 = 30; // внутренний радиус
		const r2 = 45; // внешний радиус

		const knob = knobs[0]; 
		const percentage = (knob.val - knob.min) / (knob.max - knob.min); // от 0 до 1
		const angle = 360 * percentage;
		const largeArcFlag = angle >= 180 ? 1 : 0;


		if (knob.val === knob.max) return "M0 0"

		const startAngle = -270; 
		const endAngle = startAngle + angle;

		// Внешняя дуга
		const startOuterX = cx + r2 * Math.cos((Math.PI / 180) * startAngle);
		const startOuterY = cy + r2 * Math.sin((Math.PI / 180) * startAngle);
		const endOuterX = cx + r2 * Math.cos((Math.PI / 180) * endAngle);
		const endOuterY = cy + r2 * Math.sin((Math.PI / 180) * endAngle);

		// Внутренняя дуга (в обратную сторону)
		const endInnerX = cx + r1 * Math.cos((Math.PI / 180) * endAngle);
		const endInnerY = cy + r1 * Math.sin((Math.PI / 180) * endAngle);
		const startInnerX = cx + r1 * Math.cos((Math.PI / 180) * startAngle);
		const startInnerY = cy + r1 * Math.sin((Math.PI / 180) * startAngle);

		/* return `
			M ${round (startOuterX) } ${startOuterY}
			A ${r2} ${r2} 0 ${largeArcFlag} 1 ${endOuterX} ${endOuterY}
			L ${endInnerX} ${endInnerY}
			A ${r1} ${r1} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
			Z
		`; */


		return `
			M ${round(startOuterX)} ${round(startOuterY)}
			A ${round(r2)} ${round(r2)} 0 ${largeArcFlag} 1 ${round(endOuterX)} ${round(endOuterY)}
			L ${round(endInnerX)} ${round(endInnerY)}
			A ${round(r1)} ${round(r1)} 0 ${largeArcFlag} 0 ${round(startInnerX)} ${round(startInnerY)}
			Z
		`;

	};


	return (
		<div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
			<div className='col-12 col-md-6 h-100 d-flex align-items-center justify-content-center'>
				<Button
					variant="outline-secondary"
					onPointerDown={() => handleMouseDown(decrease)}
					onPointerUp={handleMouseUp}
					onPointerLeave={handleMouseUp}
				>
				◀
				</Button>
				<svg id="svgChart" version="1.1" width="100%" height="100%" viewBox="0 0 100 100" overflow="hidden">
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
						d={`${knob1}`}
						fill="orangered"
						stroke="orangered"
						strokeWidth="2"
						filter="drop-shadow(0px 1px 2px rgba(0,0,0,1))"
					/>

					<text x="50" y="55" textAnchor="middle" fontSize="20" fill="white">
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
