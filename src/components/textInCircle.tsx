import React from 'react';

interface Props {
    text: Array<string>;
    maxLineLength: number;
    fontSize: number;
    radius: number;
}

const TextInCircle: React.FC<Props> = ({ text, fontSize, radius }) => {
 	const breakTextIntoLines =  (input: string): string[] => {
		const limits = [6, 9, 12]; 
		let text = input.trim();
	
		const lines: string[] = [];
		for (let i = 0; i < limits.length; i++) {
			if (!text) break;
	
			let limit = limits[i];
	
 			const isLast = i === limits.length - 1;
			if (isLast && text.length > limit) {
				// вычитаем 3 символа под многоточие
				limit -= 3;
			}
	
			let segment = text.slice(0, limit);
			if (!isLast) {
				const lastSpace = segment.lastIndexOf(' ');
				if (lastSpace > 0) {
					segment = segment.slice(0, lastSpace);
				}
			}
	
			lines.push(segment);
			text = text.slice(segment.length).trim();
		}
	
		if (text.length > 0) {
			const lastIndex = lines.length - 1;
			lines[lastIndex] = lines[lastIndex] + "...";
		}
	
		for (let i = 1; i < lines.length; i++) {
			if (lines[i].length < lines[i - 1].length) {
				lines[i] = lines[i].padEnd(lines[i - 1].length, ' ');
			}
		}
	
		return lines;
	};

    const lines = breakTextIntoLines( text[0] ) ;

    const lineHeight = fontSize * 1.25; 
    const totalHeight = lines.length * lineHeight;
    const startY = radius + (lineHeight / 2) - (totalHeight / 2)+2.5 - fontSize*2;

    return (
        <g>
            {lines.map((line, index) => (
                <text 
                    key={index} 
                    x={50} 
                    y={startY + (index) * lineHeight} 
                    textAnchor="middle" 
                    fontSize={fontSize} 
                    className='' 
                    fill="var(--knobMainText)"
                >
                    {line}
                </text>
            ))}  
			 <text 
                    key={22} 
                    x={50} 
                    y={65} 
                    textAnchor="middle" 
                    fontSize={13} 
                    className='' 
                    fill="var(--knobMainText)"
                >
                    {text[2]}
                </text>
				<text 
                    key={33} 
                    x={50} 
                    y={77.5} 
                    textAnchor="middle" 
                    fontSize={10} 
                    className='' 
                    fill="var(--knobMainText)"
                >
                    {text[1]}
                </text>
        </g>
    );
};

export default TextInCircle;