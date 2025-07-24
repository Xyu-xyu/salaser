import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useRef, useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import utils from '../scripts/util';

interface CustomKnobProps {
    param: string;
    keyParam: string;
    keyInd?: number | boolean;
}

const UniversalNamedKnob: React.FC<CustomKnobProps> = observer(({ param, keyParam }) => {
    const svgRef = useRef<SVGGElement>(null);
    const { t } = useTranslation();
    const { isVertical, macrosProperties } = viewStore;
    const { x1, x2, x4, y1, y2, y3 } = utils.getKnobLayout(isVertical);
    const property = macrosProperties.cutting.properties[param as keyof typeof macrosProperties.cutting.properties];
    const { title } = property;
    const values: string[] = property.enum;
    const val: string = viewStore.getTecnologyValue(param, keyParam);
    const index = values.indexOf(val);

    const [rotation, setRotation] = useState(0);
    // Активный сегмент вычисляется автоматически
    const activeSegment = useMemo(() => {
        // нормализация и округление
        return ((Math.round(rotation / 120) % 3) + 3) % 3;
    }, [rotation]);

    if (index === -1) {
        throw new Error(`Value "${val}" not found in enum array`);
    }

    const handleClick = (step: number) => {
        const currentVal = viewStore.getTecnologyValue(param, keyParam);
        const currentIndex = values.indexOf(currentVal);
        if (currentIndex === -1) return;

        // направление можно оставить как было
        const newIndex = step > 0
            ? (currentIndex - 1 + values.length) % values.length
            : (currentIndex + 1) % values.length;

        const newVal = values[newIndex];
        viewStore.setValString(param, newVal, keyParam);
        setRotation(prev => prev + step);
    };

    useEffect(() => {
        const svg = svgRef.current;
        if (!svg) return;

        const handleWheel = (e: WheelEvent) => {
            e.preventDefault();
            const wheelStep = e.deltaY <= 0 ? -120 : 120;
            handleClick(wheelStep);
        };

        svg.addEventListener('wheel', handleWheel);
        return () => {
            svg.removeEventListener('wheel', handleWheel);
        };
    }, []);

    return (
        <div className='w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
            <div className='col-12 h-100 d-flex align-items-center justify-content-center overflow-hidden'>
                <svg id="svgChart"
                    className="svgChart" version="1.1"
                    width="100%" height="100%"
                    viewBox="0 0 100 100" overflow="hidden"
                >
                    <g ref={svgRef}>
                        <circle
                            cx="50"
                            cy="50"
                            r="45"
                            fill={"url(#circleGradient)"}
                            stroke="gray"
                            strokeWidth=".25"
                            filter="var(--shadow)"
                        />
                        <text x={50} y={45}
                            textAnchor="middle"
                            fontSize={10}
                            fill="var(--knobMainText)" />
                    </g>

                    {t(title).split(', ')[0].split(' ').map((a: string, i: number) => (
                        <text key={i}
                            x={x4}
                            y={y3 + i * 9}
                            className="moderat"
                            fill="var(--knobMainText)"
                            fontSize={isVertical ? 10 : 7}>
                            {a}
                        </text>
                    ))}
                    {/* кнопка - */}
                    <g>
                        <circle
                            cx={x1}
                            cy={y1}
                            r="15"
                            fill={"url(#circleGradient)"}
                            stroke="gray"
                            strokeWidth=".25"
                            filter="var(--shadow)"
                            onPointerDown={() => handleClick(-120)}
                        />
                        <text
                            x={x1}
                            y={y1}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontSize="14"
                            pointerEvents="none"
                            className='moderat'
                            fill="var(--knobMainText)">
                            -
                        </text>
                    </g>
                    {/* кнопка + */}
                    <g>
                        <circle
                            cx={x2}
                            cy={y1}
                            r="15"
                            fill={"url(#circleGradient)"}
                            stroke="gray"
                            strokeWidth=".25"
                            filter="var(--shadow)"
                            onPointerDown={() => handleClick(120)}
                        />
                        <text
                            x={x2}
                            y={y1}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            fontSize="14"
                            pointerEvents="none"
                            className='moderat'
                            fill="var(--knobMainText)">
                            +
                        </text>
                    </g>

                    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
                        <path id="arcPath0" d="M15 50 A30 30 0 0 1 85 50" fill="none" />
                        <path id="arcPath1" d="M67.5 19.6891 A 30 30 0 0 1 32.5 80.3109" fill="none" />
                        <path id="arcPath2" d="M67.5 80.3109 A 30 30 0 0 1  32.5 19.6891" fill="none" />

                        <g style={{
                            transform: `rotate(${rotation}deg)`,
                            transformOrigin: '50% 50%',
                            transition: 'transform 0.5s ease-in-out',
                        }}>
                            {utils.getSticks(60, 30, 2)}
                            {utils.getTicks(0, 2, 1, 30, 30, 1, 120, 240)}
                            <text textAnchor="middle"
                                alignmentBaseline="middle"
                                fontSize="10"
                                pointerEvents="none"
                                className="moderat rotating-text"
                                fill="var(--knobMainText)">
                                <textPath
                                    key={`${param}-${keyParam}-${index}`}
                                    href="#arcPath0"
                                    startOffset="50%"
                                    fill={activeSegment === 0 ? 'var(--knobMainText)' : 'grey'}>
                                    {activeSegment === 0 ? t(val)
                                        : activeSegment === 2 ? t(values[(index - 1 + values.length) % values.length])
                                            : t(values[(index + 1) % values.length])}
                                </textPath>
                                <textPath
                                    key={`${param}-${keyParam}-${index + 1}`}
                                    href="#arcPath1"
                                    startOffset="50%"
                                    fill={activeSegment === 2 ? 'var(--knobMainText)' : 'grey'}>
                                    {activeSegment === 2 ? t(val)
                                        : activeSegment === 1 ? t(values[(index - 1 + values.length) % values.length])
                                            : t(values[(index + 1) % values.length])}
                                </textPath>
                                <textPath
                                    key={`${param}-${keyParam}-${index - 1}`}
                                    href="#arcPath2"
                                    startOffset="50%"
                                    fill={activeSegment === 1 ? 'var(--knobMainText)' : 'grey'}>
                                    {activeSegment === 1 ? t(val)
                                        : activeSegment === 0 ? t(values[(index - 1 + values.length) % values.length])
                                            : t(values[(index + 1) % values.length])}
                                </textPath>
                            </text>
                        </g>
                    </svg>
                </svg>
            </div>
        </div>
    );
});

export default UniversalNamedKnob;
