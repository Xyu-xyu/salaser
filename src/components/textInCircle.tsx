import React from 'react';

interface Props {
    text: string;
    maxLineLength: number;
    fontSize: number;
    radius: number;
}

const TextInCircle: React.FC<Props> = ({ text, maxLineLength, fontSize, radius }) => {
    // Функция для разбивки текста на строки
	const breakTextIntoLines = (inputText: string, maxLength: number) => {
		const words = inputText.split(' ');
		let lines: string[] = [];
		let currentLine = '';
	
		words.forEach(word => {
			// Если слово длиннее maxLength, делим его на части
			while (word.length > maxLength) {
				// Отрезаем часть слова длиной maxLength
				currentLine += (currentLine ? ' ' : '') + word.slice(0, maxLength);
				lines.push(currentLine);
				currentLine = '';
				word = word.slice(maxLength); // оставляем оставшуюся часть слова
			}
	
			if ((currentLine + word).length <= maxLength) {
				currentLine += (currentLine ? ' ' : '') + word;
			} else {
				if (currentLine) {
					lines.push(currentLine);
				}
				currentLine = word;
			}
		});
	
		// Добавляем последнюю строку, если она не пустая
		if (currentLine) {
			lines.push(currentLine);
		}
	
		return lines;
	};

    // Разбиваем текст на строки
    const lines = breakTextIntoLines(text, maxLineLength);
    const lineHeight = fontSize * 1.25; // высота строки
    const totalHeight = lines.length * lineHeight;
    const startY = radius + (lineHeight / 2) - (totalHeight / 2)+2.5; // центрируем текст по Y

    return (
        <g>
            {lines.map((line, index) => (
                <text 
                    key={index} 
                    x={50} 
                    y={startY + index * lineHeight} 
                    textAnchor="middle" 
                    fontSize={fontSize} 
                    className='' 
                    fill="var(--knobMainText)"
                >
                    {line}
                </text>
            ))}
        </g>
    );
};

export default TextInCircle;