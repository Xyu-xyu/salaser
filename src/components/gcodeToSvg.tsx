import React from "react";
import utils from "../scripts/util";

interface Props {
	gcode: string;
	strokeWidth?: number;
	stroke?: string;
	showPoints?: boolean; // для отладки — рисовать точки
}

function parseGCodeToBlocks(gcode: string) {
    let svg: string[] = []
    let currentX: number | null = null, currentY: number | null = null, newX:number|null, newY:number|null;
    let width: number = 1000, height: number = 700;
    let path: string = 'closed'
	let prevCommand:string = '' 
	let posX:number = 0
	let posY:number = 0

    let lines = gcode.split(/\r?\n/);

    for (let line of lines) {		
        if (line.includes('G0')) {
            prevCommand = 'G0'
            let x = line.match(/X(-?\d+(?:\.\d+)?)/i);
            let y = line.match(/Y(-?\d+(?:\.\d+)?)/i);
            newX = x ? parseFloat(x[1]) : currentX;
            newY = y ? parseFloat(y[1]) : currentY;

            if (newX != null && newY != null) {
                currentX = newX;
                currentY = newY;
            } 

        }  else if (line.includes('G52')) {
			let x = line.match(/X(-?\d+(?:\.\d+)?)/i);
            let y = line.match(/Y(-?\d+(?:\.\d+)?)/i);
            posX = x ? parseFloat(x[1]) : 0;
            posY = y ? parseFloat(y[1]) : 0;

		} else if (line.includes('G1') || (!line.includes('G') && prevCommand=='G1')) {
            prevCommand = 'G1'
            let x = line.match(/X(-?\d+(?:\.\d+)?)/i);
            let y = line.match(/Y(-?\d+(?:\.\d+)?)/i);

            newX = x ? parseFloat(x[1]) : currentX;
            newY = y ? parseFloat(y[1]) : currentY;

            if (newX != null && newY != null && currentX != null && currentY != null) {
                svg.push(`M${currentX+posX} ${height - (currentY+posY)} L${utils.round(newX+posX)} ${utils.round(height - (newY+posY))} `);
                currentX = newX;
                currentY = newY;
            } else if (newX != null && currentX != null && currentY != null) {
                svg.push(`M${currentX+posX} ${height - (currentY+posY)} H${utils.round(newX+posX)} `);
                currentX = newX;
            } else if (newY != null && currentX != null && currentY != null) {
                svg.push(`M${currentX+posX} ${height - (currentY+posY)} V${utils.round(height - (newY+posY))}`);
                currentY = newY;
            }
 
        } else if (line.includes('G2') || (!line.includes('G') && prevCommand=='G2')) {
            prevCommand = 'G2'
            let x = line.match(/X(-?\d+(?:\.\d+)?)/i);
            let y = line.match(/Y(-?\d+(?:\.\d+)?)/i);
            let i = line.match(/I(-?\d+(?:\.\d+)?)/i);
            let j = line.match(/J(-?\d+(?:\.\d+)?)/i);

            newX = x ? parseFloat(x[1]) : currentX;
            newY = y ? parseFloat(y[1]) : currentY;
            let offsetI = i ? parseFloat(i[1]) : 0;
            let offsetJ = j ? parseFloat(j[1]) : 0;

            if (newX != null && newY != null && currentX != null && currentY != null) {
                let r = utils.round(Math.hypot(newX - offsetI, newY - offsetJ));
                let largeArcFlag = 0;
                svg.push(`M${currentX+posX} ${height - (currentY+posY)} A${r} ${r} 0 ${largeArcFlag} 1 ${utils.round(newX+posX)} ${utils.round(height - (newY+posY))} `);
                currentX = newX;
                currentY = newY;
            }

        } else if (line.includes('G3') || (!line.includes('G') && prevCommand=='G3')) {
			prevCommand = 'G3'
            let x = line.match(/X(-?\d+(?:\.\d+)?)/i);
            let y = line.match(/Y(-?\d+(?:\.\d+)?)/i);
            let i = line.match(/I(-?\d+(?:\.\d+)?)/i);
            let j = line.match(/J(-?\d+(?:\.\d+)?)/i);

            newX = x ? parseFloat(x[1]) : currentX;
            newY = y ? parseFloat(y[1]) : currentY;
            let offsetI = i ? parseFloat(i[1]) : 0;
            let offsetJ = j ? parseFloat(j[1]) : 0;

            if (newX != null && newY != null && currentX != null && currentY != null) {
                let r = utils.round(Math.hypot(newX - offsetI, newY - offsetJ));
                let largeArcFlag = 0;
                svg.push(`M${currentX+posX} ${height - (currentY+posY)} A${r} ${r} 0 ${largeArcFlag} 0 ${utils.round(newX+posX)} ${utils.round(height - (newY+posY))} `);
                currentX = newX;
                currentY = newY;
            }
        } 
    }

    return svg;
}



const GCodeToSvg: React.FC<Props> = ({ gcode, strokeWidth = 0.8, stroke = "#333"}) => {


	return (
		<svg
			viewBox={`${0} ${0} ${700} ${1000}`}
			width="100%"
			height="100%"
			xmlns="http://www.w3.org/2000/svg"
			shapeRendering="geometricPrecision"
		>
			{parseGCodeToBlocks(gcode).map((a,i)=>{
				return <path stroke={stroke} strokeWidth={ strokeWidth} fill={'none'} d={a} key={i}></path>
			})}
		</svg>
	);
};

export default GCodeToSvg;

