import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useEffect, useRef } from 'react';
import utils from '../scripts/util';


type ResultItem = {
	name: string;
	'focus, mm'?: number;
	'height, mm'?: number;
	'pressure, bar'?: number;
	'power, kWt'?: number;
	enabled: boolean;
	power: number;
	power_W_s: number;
	delay_s: number;
};

const Timer = observer(() => {
	const { atEnd, isPaused, isAnimating, selectedPiercingMacro, elapsed, animProgress } = viewStore;

	// Текущее время в секундах (с дробной частью)
	const timerRef = useRef<any | null>(null);
	const data: ResultItem[] = utils.getChartData(selectedPiercingMacro);

	const totalTime = data.reduce((acc, item) => {
		if (!item.enabled) return acc;
		const time = item.delay_s + (item.power_W_s / item.power || 0);
		return acc + time;
	}, 0);

	// Форматируем время в "SS:CC"
	const formatTime = (seconds: number) => {
		if (seconds > totalTime){
			const s = Math.floor(totalTime % 60).toString().padStart(2, '0');
			const cs = Math.floor((totalTime % 1) * 100).toString().padStart(2, '0');
			return `${s}:${cs}`;
		} 
		const s = Math.floor(seconds % 60).toString().padStart(2, '0');
		const cs = Math.floor((seconds % 1) * 100).toString().padStart(2, '0');
		return `${s}:${cs}`;
	};

	useEffect(() => {
		// Если конец анимации → останавливаем таймер
		if (atEnd) {
			if (timerRef.current) clearInterval(timerRef.current);
			viewStore.setElapsed(totalTime)
			return;
		}

		// Если анимация идёт → запускаем счётчик
		if (isAnimating && !isPaused) {
			const start = Date.now() - elapsed * 1000; // чтобы продолжать с паузы
			timerRef.current = setInterval(() => {
				viewStore.setElapsed( ((Date.now() - start) / 1000) % totalTime ) ;
			}, 10);
		}

		// Если ставим на паузу → останавливаем счётчик
		if (isPaused || !isAnimating) {
			if (timerRef.current) {
				clearInterval(timerRef.current);
				timerRef.current = null;
			}
		}

		return () => {
			if (timerRef.current) clearInterval(timerRef.current);
		};
	}, [isAnimating, isPaused, atEnd, data, animProgress]);

	return (
		<div  className='mx-1 d-flex align-items-center'>
			<div>
				<p className="segments14 text-white mb-0">{formatTime(elapsed)}</p>
			</div>
		</div>
	);
});

export default Timer;
