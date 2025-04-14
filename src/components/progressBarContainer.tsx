import { useEffect, useState } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';

const ProgressBarContainer = () => {
	const [progress, setProgress] = useState(0);
	const [direction, setDirection] = useState<'up' | 'down'>('up');
	const [target, setTarget] = useState(Math.floor(Math.random() * 100) + 1);

	useEffect(() => {
		const interval = setInterval(() => {
			setProgress((prev) => {
				if (direction === 'up') {
					if (prev < target) {
						return prev + 1;
					} else {
						// достигли цели — переключаемся на убывание
						setDirection('down');
						return prev;
					}
				} else {
					if (prev > 0) {
						return prev - 1;
					} else {
						// достигли 0 — задаем новую цель и снова вверх
						const newTarget = Math.floor(Math.random() * 100) + 1;
						setTarget(newTarget);
						setDirection('up');
						return 0;
					}
				}
			});
		}, 100); // скорость анимации

		return () => clearInterval(interval);
	}, [direction, target]);


	return (
		<div id="ProgressBarContainer" className="m-0 mb-3 p-0" style={{ position: 'relative' }}>
			<ProgressBar
				striped
				variant="info"
				now={progress}
				id="ProgressBar"
				className="m-2"
				style={{ height: '66.6px' }}
			/>
			{/* Текст по центру */}
			<div
				style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -33%)',
					color: 'rgb(117, 117, 117);', 
					fontSize: "20px"
				}}
			>
				{progress}%
			</div>
		</div>
	);
};

export default ProgressBarContainer;
