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
		<div id="ProgressBarContainer" className="w-100" style={{ position: 'relative' }}>
			<ProgressBar
				striped
				variant="info"
				now={progress}
				className="m-2"
				style={{ height: '66.6px' }}
			/>
			<div style={{
				position: 'absolute',
				top: '40px',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				color: 'black', // или другой цвет для лучшей видимости
 				width: '100%',
				textAlign: 'center',
				pointerEvents: 'none' // чтобы клики проходили сквозь текст
			}}>
				Current work 06.08 1,5мм-01 2 mm Steel {progress}%
			</div>
		</div>
	);
};

export default ProgressBarContainer;
