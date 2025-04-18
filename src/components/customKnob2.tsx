import React, { useEffect, useRef, useState } from 'react';
import './knob.css'; // Предполагаем, что CSS из LESS уже адаптирован

const MIN_ANGLE = 0;
const MAX_ANGLE = 270;
const TICK_COUNT = 28;

const MousewheelKnob: React.FC = () => {
  const knobRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState<number>(0);

  const updateUI = (newAngle: number) => {
    const knob = knobRef.current;
    if (knob) {
      knob.style.transform = `rotate(${newAngle}deg)`;
    }

    const ticks = document.querySelectorAll('.tick');
    ticks.forEach(tick => tick.classList.remove('active'));
    const activeCount = Math.round(newAngle / 10) + 1;
    for (let i = 0; i < activeCount && i < ticks.length; i++) {
      ticks[i].classList.add('active');
    }

    const curr = document.getElementById('current');
    if (curr) {
      curr.innerText = `${Math.round((newAngle / MAX_ANGLE) * 100)}%`;
    }
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    setAngle(prev => {
      const next = Math.min(Math.max(prev + delta * 2, MIN_ANGLE), MAX_ANGLE);
      updateUI(next);
      return next;
    });
  };

  useEffect(() => {
    const knob = knobRef.current;
    if (knob) {
      knob.addEventListener('wheel', handleWheel);
      return () => knob.removeEventListener('wheel', handleWheel);
    }
  }, []);

  return (
    <div className=''>
      <div className="knob-surround">
        <div id="knob" className="knob" ref={knobRef}></div>
        <div id="prev">
          <span id="current" className='segments14'>0%</span>
        </div>
        <span className="min">Min</span>
        <span className="max">Max</span>
        <div className="ticks">
          {Array.from({ length: TICK_COUNT }, (_, i) => (
            <div className="tick" key={i}></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MousewheelKnob;
