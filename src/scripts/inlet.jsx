import util from './../scripts/util.jsx';
import SVGPathCommander from 'svg-path-commander';
import arc from './arc.jsx';
import CONSTANTS from './../store/constants.jsx';
import partStore from './../store/partStore.jsx';
//import editorStore from './../store/editorStore.jsx';
import { addToLog } from './../scripts/addToLog';
import PathAnalyzer from "./pathAnalyzer.jsx"


class Inlet {
    pointIndex (x, y, x1, y1, fx, fy) {
        let pointIndex
        let d1 = util.distance( {x:x, y: y}, {x:fx, y:fy})
        let d2 = util.distance( {x:x1, y:y1}, {x:fx, y:fy})     
        if (d1 < d2)  {
            pointIndex=0
        } else {
            pointIndex=1   
        }
        return pointIndex               
    }

    randomSVGColor() {
        // Генерируем случайные значения R, G, B (от 0 до 255)
        let r = Math.floor(Math.random() * 256);
        let g = Math.floor(Math.random() * 256);
        let b = Math.floor(Math.random() * 256);

        // Конвертируем в шестнадцатеричный формат и возвращаем в виде #RRGGBB
        return `rgb(${r},${g},${b})`;
    }

    createSVG(coords, color="green", id="idz") {
        return;
        /* try {
            let element = document.getElementById(id)
            if (element) element.remove();
        } catch (e) {
        }
        var svg = document.querySelector('#group')
        var polygon = document.createElementNS("http://www.w3.org/2000/svg", "path");
        polygon.setAttribute("d", 'M'+coords.join(' '));
        polygon.setAttribute("fill", "none");
        polygon.setAttribute("stroke", this.randomSVGColor());
        polygon.setAttribute("stroke-width", "0.2");
        svg.appendChild(polygon);         */
    }

    detectInletType (selectedInletPath) {
        let inletMode = "Straight"
        try {
            if (selectedInletPath) {
                let path = SVGPathCommander.normalizePath(selectedInletPath).map(a => a.join(' ')).join(' ')
                if (path && path.length) {
                    if (path.includes('L') || path.includes('H') || path.includes('V')) {
                        inletMode = 'Direct'
                        if (path.includes('A')) {
                            inletMode = 'Hook'
                        }
                        /*                     
                        // пока рисуем треугольник определяем так
                        if (path.match(/L/g) && path.match(/L/gm).length && path.match(/L/gm).length === 3) {
                        inletMode= Straight      
                        } */
                    } else if (path.includes('A')) {
                        inletMode = 'Tangent'
                    }
                }
            }
            return inletMode

        } catch (e) {
            return "Straight"
        }
		
    }

    detectInletLength (path, contourPath='') {
        console.log ("detectInletLength for ...." + contourPath )
        let type = this.detectInletType ( path )
        let IL = CONSTANTS.defaultInletLength
        path = SVGPathCommander.normalizePath( path )
        if (type === 'Tangent') {
            path.forEach( seg=>{     
                if (seg.includes('A')){                    
                    IL = seg[2]*2
                }
            })
        } else if (type === 'Hook' || type === 'Direct') {
            let start = {x: path[0][1], y: path[0][2]}
            let lastSeg = path[path.length-1]
            let end = {x: lastSeg[lastSeg.length-2], y: lastSeg[lastSeg.length-1]}
            IL =  util.distance (start, end)
        } else if (type === 'Straight' ) {
            if (contourPath){
                let box = SVGPathCommander.getPathBBox(contourPath)
                let minSide = Math.min (box.width, box.height ) * 0.5
                const analyzer = new PathAnalyzer(contourPath);
                let minInCoolision =  analyzer.getInnerPerpendicularData()?.length|| Infinity;
                console.log ( "DDDDDDDRRRRRRRRUUUMMMMMMM")
                console.log ( minInCoolision, minSide, CONSTANTS.defaultInletLength)
                IL = Math.min (minInCoolision-CONSTANTS.defaultInletIntend,/* minSide,*/ CONSTANTS.defaultInletLength)
            }
            

        }
        //console.log ('Detected length ' + Math.round(IL*1000)/1000)
        return Math.round(IL*1000)/1000
    }

    inletTangentR (radius, arcLength, inletPath) {
        console.log ("inletTangentR")
        let x1, y1, x2, y2 ,flag1, flag2, flag3, rO; 
        if (radius <= 0 || arcLength <= 0 || 2*Math.PI*radius < arcLength ) {
            //throw Error ("radius it too small")
            return false
        }

        let pathArc  = SVGPathCommander.normalizePath (inletPath)
        if (pathArc.length) {
			pathArc.forEach( seg=>{
				if ( seg.includes('A')) {
                    flag1=seg[3]
                    flag2=seg[4]
                    flag3=seg[5]
				 	x2=seg[6]
					y2=seg[7]
                    rO=seg[1]
				}
				if ( seg.includes('M')) {
					x1=seg[1]
					y1=seg[2]
				}
			}) 
		}

        if ( x1 === x2 && y1===y2 ) return false;
        var centers = util.svgArcToCenterParam (x1, y1, rO, rO, flag1, flag2, flag3, x2, y2, true) 
        if (!centers) return false
        var newCenters =  util.getNewEndPoint(centers.x, centers.y, x2, y2, radius)
        let endPoint = util.calculateEndPoint( newCenters.x, newCenters.y, radius, x2, y2, arcLength, flag3);

        if ( pathArc.length && pathArc[1].includes("A") ) {
            pathArc[1][1]=radius
            pathArc[1][2]=radius
        }

        if ( pathArc.length && pathArc[0].includes("M") ) {
            pathArc[0][1]=endPoint.x
            pathArc[0][2]=endPoint.y   
        }

        if ( Math.abs(arcLength) > Math.PI*radius) {
            pathArc[1][4]=1
        } else {
            pathArc[1][4]=0 
        }

        if ( pathArc[1][6] === endPoint.x && pathArc[1][7] === endPoint.y ) {
            return false
        }

        pathArc = pathArc.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath(pathArc)) return false;
        let maxArcLength =Math.PI*radius*2
        if ( arcLength > maxArcLength ) {
             return false
        }

        let resp ={}
        resp.newInleType = "Tangent"
		resp.oldInletType = "Tangent"
		resp.newInletPath = pathArc
		resp.action = 'change'
        return resp
    }

    inletTangentL (arcLength, inletPath) {
        console.log ("inletTangentL"+ arcLength)
        let radius, x1, y1, x2, y2 ,flag1, flag2, flag3;
		let pathArc  = SVGPathCommander.normalizePath (inletPath)
		if (pathArc.length) {
			pathArc.forEach( seg=>{
				if ( seg.includes('A')) {
                    flag1=seg[3]
                    flag2=seg[4]
                    flag3=seg[5]
					radius=seg[1]
					x2=seg[6]
					y2=seg[7]
				}
				if ( seg.includes('M')) {
					x1=seg[1]
					y1=seg[2]
				}
			}) 
		}

        if (radius <= 0 || arcLength <= 0  || arcLength > 2*Math.PI*radius ) {
            return false
        } 

        if (x1 === x2 && y1===y2) return false;
        var centers = util.svgArcToCenterParam(x1, y1, radius, radius, flag1, flag2, flag3, x2, y2, true) 
        if (!centers) return false;
        let endPoint = util.calculateEndPoint(centers.x, centers.y, radius, x2, y2, arcLength, flag3);

        if ( pathArc.length && pathArc[0].includes("M") ) {
            pathArc[0][1]=endPoint.x
            pathArc[0][2]=endPoint.y   
        }
        if ( Math.abs(arcLength) > Math.PI*radius) {
            pathArc[1][4]=1
        } else {
            pathArc[1][4]=0 
        }
        pathArc = pathArc.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( pathArc )) return false;

        let resp ={}
        resp.newInleType = "Tangent"
		resp.oldInletType = "Tangent"
        resp.action = 'change'
		resp.newInletPath = pathArc
		return resp
    }

    inletDirectA(newAxis, inletPath, contourPath, outerInner='inner') {

        if (newAxis < 0 || newAxis > 180 ) return false;
        let MX, MY, LX, LY, PX, PY;
        let path =  SVGPathCommander.normalizePath(inletPath)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                }
                if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } 
            }) 
        }

        let contour =  SVGPathCommander.normalizePath(contourPath)
        contour.forEach((seg, i)=>{
            if (i<2){
                if (seg.includes('M')) {
                    PX=seg[1]
                    PY=seg[2]
                } else if ( seg.includes('L')) {
                    PX=seg[1]
                    PY=seg[2]    
                } else if (seg.includes('A')) {
                    PX=seg[6]
                    PY=seg[7]
                }
            }
        })

        let oldAxis = util.calculateAngleVector( LX, LY, MX, MY, PX, PY )

        if (contour[1][0] === 'A') {
            console.log('Arc position detected')
            let nearestSegment = contour[1]
            const rx = parseFloat(nearestSegment[1]);
            const ry = parseFloat(nearestSegment[2]);
            const flag1 = parseFloat(nearestSegment[3]);
            const flag2 = parseFloat(nearestSegment[4]);
            const flag3 = parseFloat(nearestSegment[5]);
            const EX = parseFloat(nearestSegment[6]);
            const EY = parseFloat(nearestSegment[7]);
            let C = util.svgArcToCenterParam (LX, LY, rx, ry, flag1, flag2, flag3, EX, EY, true)   
            let OP = util.rotatePoint(  C.x, C.y,  LX, LY,0, 270)
            oldAxis = Math.round(util.calculateAngleVector ( LX, LY, MX, MY, OP.x, OP.y)*100)/100
            console.log('Arc position detected in degree '+ oldAxis)
        }
        let pathDirection = Number(SVGPathCommander.getDrawDirection(contour))
        console.log (newAxis,oldAxis)
        if (pathDirection === 1 && outerInner === 'outer'){
             newAxis=180-newAxis
             oldAxis=180-oldAxis
        }
        
        let newEndPoint= util.rotatePoint(MX, MY, LX, LY, oldAxis, newAxis)
        if (inletPath.includes("NaN")) {
            return false
        }

        //if (!SVGPathCommander.isValidPath( `M${newEndPoint.x} ${newEndPoint.y} L${LX} ${LY}` )) return false;
        let resp ={}
        resp.newInleType = "Direct"
		resp.oldInletType = "Direct"
 		resp.newInletPath = `M${newEndPoint.x} ${newEndPoint.y} L${LX} ${LY}`
 		return resp
    }

    inletDirectL(D, inletPath) {
        console.log (D)
        let MX, MY, LX, LY;
        let path =  SVGPathCommander.normalizePath(inletPath)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                }
                if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } else if (seg.includes('V')) {
                    LY=seg[1]
                    LX=MX 
                } else if (seg.includes('H')) {
                    LY=MY
                    LX=seg[1]
                }
            }) 
        }

        let newEndPoint = util.getNewEndPoint(MX, MY, LX, LY, D);
        path.forEach( seg=>{
            if ( seg.includes('M')) {
                seg[1]=newEndPoint.x
                seg[2]=newEndPoint.y    
            } 
        }) 
        path = path.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( path )) return false;
        let resp ={}
        resp.newInleType = "Direct"
		resp.oldInletType = "Direct"
 		resp.newInletPath = path
 		resp.action = 'change'
        return resp
 
    }

    inletHookL (D, radius, inletPath) {
        if (D <= 0  || D * 0.5 <= radius ) {
            return false
        }
        let MX, MY, LX, LY, EX, EY, r;
        let path =  SVGPathCommander.normalizePath(inletPath)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                }
                if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } else if (seg.includes('A')){
                    EX=seg[6]
                    EY=seg[7]
                    r=seg[2]
                }
            }) 
        }

        let newEndPoint = util.getNewEndPoint(MX, MY, EX, EY, D);
        let centers = util.findPointWithSameDirection (EX, EY, MX, MY, r)
        let tangent = util.findTangentPoints(centers.x, centers.y, radius, newEndPoint.x, newEndPoint.y) 
        if (!tangent)return false;
        let d1 = util.distance(LX, LY, tangent[0].x, tangent[0].y)
        let d2 = util.distance(LX, LY, tangent[1].x, tangent[1].y)
        let pointIndex = d1 > d2 ? 1 : 0

        path.forEach( seg=>{
            if ( seg.includes('M')) {
                seg[1]=newEndPoint.x
                seg[2]=newEndPoint.y    
            } 

            if ( seg.includes('L')) {
                seg[1]=tangent[pointIndex].x
                seg[2]=tangent[pointIndex].y
            } 
        }) 
        path = path.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( path )) return false;
        let resp ={}
        resp.newInleType = "Hook"
		resp.oldInletType = "Hook"
 		resp.newInletPath = path
 		resp.action = 'change'
        return resp
    }

    inletHookR (radius, inletLength, inletPath) {
        let MX, MY, LX, LY, R, EX, EY, flag1, flag2, flag3;
        let path =  SVGPathCommander.normalizePath(inletPath)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                }
                if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } 
                if (seg.includes('A')){
                    R=seg[1]
                    EX=seg[6]
                    EY=seg[7]
                    flag1=seg[3]
                    flag2=seg[4]
                    flag3=seg[5]
                }
            }) 
        }

        if (radius <= 0 ) {
            return false
        }

        if ( radius > inletLength*0.5 ) {
            return false
        }
             
        let centers = util.svgArcToCenterParam (LX, LY, R, R, flag1, flag2, flag3, EX, EY, true) 
        if (!centers) return false;
        let newCenters =  util.getNewEndPoint(centers.x, centers.y, EX, EY, radius)
        let c = util.distance (newCenters.x,newCenters.y, MX, MY)
		let b = radius
		let a = Math.sqrt((c**2) - (b**2) )
		let theta = Math.PI - Math.atan(a/b)
		let arcLength = radius * theta;
        let endPoint = util.calculateEndPoint( newCenters.x, newCenters.y, radius, EX, EY, arcLength, flag3);

        if ( path.length && path[1].includes("L") ) {
            path[1][1]=endPoint.x
            path[1][2]=endPoint.y
        }

        if ( path.length && path[2].includes("A") ) {
            path[2][1]=radius
            path[2][2]=radius
        }

        path = path.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( path )) return false;
        let resp ={}
        resp.newInleType = "Hook"
		resp.oldInletType = "Hook"
 		resp.newInletPath = path
 		resp.action = 'change'
       
        return resp
    }

    detectPreviousPoint(segments, currentIndex) {
		let currentX = 0;
		let currentY = 0;
		let index = 0
		for (const command of segments) {
			const commandType = command[0]
			if (commandType === 'M') {
				const mx = parseFloat(command[1]);
				const my = parseFloat(command[2]);
				currentX = mx;
				currentY = my;
			} else if (commandType === 'L') {
				const x = parseFloat(command[1]);
				const y = parseFloat(command[2]);
				currentX = x;
				currentY = y;
			} else if (commandType === 'H') {
				const hx = parseFloat(command[1]);
				currentX = hx;
			} else if (commandType === 'V') {
				const vy = parseFloat(command[1]);
				currentY = vy;
			} else if (commandType === 'A') {
				const EX = parseFloat(command[6]);
				const EY = parseFloat(command[7]);
				currentX = EX;
				currentY = EY;
			}

			if (index === currentIndex) {
				return { currentX, currentY }
			}
			index += 1
		}
	}

    getNewInletOutlet(cid, className, val, newVal, angle=false) {
		if (!angle) {
			angle ={angle: 0, x:0, y:0}
		}

		const inletC = partStore.getElementByCidAndClass (cid, 'inlet')
		const outletC = partStore.getElementByCidAndClass (cid, 'outlet')
		let start =  SVGPathCommander.normalizePath(newVal)[0]
		let contourStart =  {x: start[start.length-2], y: start[start.length-1]}
		let contour = partStore.getElementByCidAndClass (cid, 'contour')
		let contourType = contour.class.includes ('inner') ? 'inner' : 'outer'
        let newVals = {}
        newVals.cid = cid
        newVals.contour = newVal

		if (inletC && inletC.path) {
			let type = this.detectInletType (inletC.path)
			let resp = this.setInletType ( type, contourStart, 'update', newVal, inletC.path, contourType) 
			if ( resp ) {
                    newVals.inlet = resp.newInletPath
				} else {
					console.log ('Invalid PATH')
			}
		}

		if (outletC && outletC.path) {			
			let type = this.detectInletType (outletC.path)
			let resp = this.setOutletType ( type, contourStart, 'update', newVal, outletC.path, contourType) 
			if ( resp ) {
                    newVals.outlet = resp.newOutletPath 
				} else {
					console.log ('Invalid PATH')
			}
		} 
        return newVals
	}

    updateContourPathInMove (pp, nearest) {
        let lastString;
        let res = {}
        let point = {x: nearest.x,y: nearest.y}
        res.pathCommands = SVGPathCommander.normalizePath(pp)
        res.command = SVGPathCommander.normalizePath( nearest.command )[0]
        for (let i=0;i<res.pathCommands.length;i++) {
            if ( util.arraysAreEqual(res.pathCommands[i], res.command)) {
                //console.log ("New Index " + i)
                res.index=i
            }
        }

        let segments= []
		if (!res) return;
        let till = res.pathCommands.length-1;
        let start = res.pathCommands[1]
        let finish = res.pathCommands[res.pathCommands.length-1]
        if (start[0] !== finish[0]){
            till ++
        } else {
            
            if (start[0] ===  'L') {
                let x0 = res.pathCommands[0][1]
                let y0 = res.pathCommands[0][2]
                let x1 = start[1]
                let y1 = start[2]
                let preFin = res.pathCommands[res.pathCommands.length-2]
                let x2 = preFin[preFin.length-2]
                let y2 = preFin[preFin.length-1]
                // проверяем коллинеарность
                if ( util.round((x1 - x0) * (y2 - y0)) !== util.round((y1 - y0) * (x2 - x0))) till++;
            }

            if (start[0] ===  'A') {
                if (    util.round(start[1]) !== util.round(finish[1]) ||
                        util.round(start[2]) !== util.round(finish[2]) ||
                        start[3] !== finish[3] || 
                        //start[4] !== finish[4] ||
                        start[5] !== finish[5]
                        ){
                    till++
                }
            }
        }

        res.pathCommands.forEach((seg, index) =>{
            if (index === 0 &&  seg.includes("M")) {
                segments.push (["M", point.x, point.y])
            } else if (index >= res.index && index < till) {
				segments.push(seg)
            } 
        })

        res.pathCommands.forEach((seg, index) =>{
           if (index < res.index && !seg.includes("M") ) {
                segments.push(seg)
            }
        })

        const commandType = res.command[0]
        if (commandType === "M") return;
        switch (commandType) {
            case 'M':
                lastString=''
                break;
            case 'L':
                lastString=['L', point.x, point.y]              
                break;
            case 'A':
                const rx = parseFloat(res.command[1]);
                const ry = parseFloat(res.command[2]);
                const flag1 = parseFloat(res.command[3]);
                const flag2 = parseFloat(res.command[4]);
                const flag3 = parseFloat(res.command[5]);
                lastString=['A', rx, ry, flag1, flag2, flag3, point.x, point.y]   
                break;
        }

        if (lastString) segments.push(lastString);  
		segments.forEach((seg, index, arr) =>{
			if (seg.includes('A') ) {
				const rx = parseFloat(seg[1]);
				const ry = parseFloat(seg[2]);
				const flag1 = parseFloat(seg[3]);
				let flag2 = parseFloat(seg[4]);
				const flag3 = parseFloat(seg[5]);
				const x2 = parseFloat(seg[6]);
				const y2 = parseFloat(seg[7]);
				let current = this.detectPreviousPoint ( segments, index-1 )
				//this.centers;
                if (index){

                    let oIndex = (index+res.index-1)%(segments.length-1)
                    if (oIndex === 0 ) oIndex=1
                    if (index+res.index > segments.length)
                    oIndex = index+res.index - segments.length+1
                    let ocurrent = this.detectPreviousPoint ( res.pathCommands, oIndex-1 < 0 ? 1 : oIndex-1 )
                    let OV= res.pathCommands[oIndex]
                    let orx = OV[1]
                    let ory = OV[2]
                    let oflag1 = OV[3]
                    let oflag2 = OV[4]
                    let oflag3 = OV[5]
                    let ox2 = OV[6]
                    let oy2 = OV[7]
                    try {
                        this.centers = util.svgArcToCenterParam (ocurrent.currentX, ocurrent.currentY, orx, ory, oflag1, oflag2, oflag3, ox2, oy2, true);
 					    flag2 = this.calculateAngle ( this.centers.x, this.centers.y,  current.currentX, current.currentY, x2, y2,  Boolean(flag3), oflag1)
                         segments[index]=['A', rx, ry, flag1, flag2, flag3, x2, y2] 
                    } catch (e) {
                        console.log (`bitch`)
                    }
				}
			}
		})
        return segments.join('').replaceAll(',', ' ')
    } 

    splitLargeArc(segment, segments, i) {
        if (segment[0] !== 'A') return [segment]; // Если не дуга, возвращаем как есть
    
        let [_, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x2, y2] = segment.map(Number);
        
        if (largeArcFlag === 0) return [segment]; // Если уже меньше 180°, оставляем
    
        // Найти центр и углы начальной и конечной точки
        let prevPoint = this.detectPreviousPoint(segments, i-1)
        let { cx, cy, startAngle, endAngle, deltaAngle } = arc.svgArcToCenterParam(prevPoint.currentX, prevPoint.currentY, rx, ry, xAxisRotation, largeArcFlag, sweepFlag, x2, y2);
    
        // Вычисляем средний угол
        let midAngle =  startAngle + deltaAngle / 2;
        
        // Вычисляем координаты средней точки дуги
        let midX = cx + rx * Math.cos(midAngle);
        let midY = cy + ry * Math.sin(midAngle);
    
        // Создаем две дуги по 180° или меньше
        let arc1 = ['A', rx, ry, xAxisRotation, 0, sweepFlag, midX, midY];
        let arc2 = ['A', rx, ry, xAxisRotation, 0, sweepFlag, x2, y2];
    
        return [arc1, arc2];
    }
    
/*     calculateAngle(centerX, centerY, x1, y1, x2, y2, clockwise) {
        // Вычисляем векторы между центром и точками
        const vector1X = x1 - centerX;
        const vector1Y =  (y1*-1 - centerY*-1);
        const vector2X = x2 - centerX;
        const vector2Y = (y2*-1 - centerY*-1);
    
        // Вычисляем угол между векторами
        let angle = Math.atan2(vector1X * vector2Y - vector2X * vector1Y, vector1X * vector2X + vector1Y * vector2Y);
    
        // Приводим угол к диапазону [0, 2π]
        angle = (angle + 2 * Math.PI) % (2 * Math.PI);
    
        // Проверяем направление угла
        if (clockwise) {
        // Если угол идет по часовой стрелке, переворачиваем его
           angle = 2 * Math.PI - angle;
        }

        //console.log (util.radianToDegree(angle)+ " "+ `${angle > Math.PI ? 1 : 0}`)    
        return angle >= Math.PI ? 1 : 0;
    } */

    calculateAngle(centerX, centerY, x1, y1, x2, y2, clockwise, xAxisRotation) {
        // Преобразование угла из градусов в радианы
        const rotationRad = xAxisRotation * Math.PI / 180;
    
        // Функция для поворота точки относительно центра
        const rotatePoint = (x, y, cx, cy, angleRad) => {
            const cosA = Math.cos(angleRad);
            const sinA = Math.sin(angleRad);
            const dx = x - cx;
            const dy = y - cy;
            return {
                x: cx + dx * cosA - dy * sinA,
                y: cy + dx * sinA + dy * cosA
            };
        };
    
        // Поворачиваем начальную и конечную точки на x-axis-rotation
        const p1 = rotatePoint(x1, y1, centerX, centerY, -rotationRad);
        const p2 = rotatePoint(x2, y2, centerX, centerY, -rotationRad);
    
        // Вычисляем векторы между центром и повернутыми точками
        const vector1X = p1.x - centerX;
        const vector1Y = p1.y - centerY;
        const vector2X = p2.x - centerX;
        const vector2Y = p2.y - centerY;
    
        // Вычисляем угол между векторами
        let angle = Math.atan2(vector1X * vector2Y - vector2X * vector1Y, vector1X * vector2X + vector1Y * vector2Y);
    
        // Приводим угол к диапазону [0, 2π]
        angle = (angle + 2 * Math.PI) % (2 * Math.PI);
    
        // Проверяем направление угла
        if (clockwise) {
            angle = 2 * Math.PI - angle;
        }
    
        // Возвращаем флаг large-arc-flag (1, если угол ≥ 180°, иначе 0)
        return angle >= Math.PI ? 0 : 1;
    }
    
    getPrevEndPoint (path, segment) {
        for (let i=0; i< path.length ;i++) {
            let curr = path[i]
            if ( util.arraysAreEqual(curr, segment)) {
                curr=path[ i-1 < 0 ? 0 : i-1]
                return {x: curr[curr.length-2], y: curr[curr.length-1]}
            }
        }
    }
    
    setInletType (newInleType, endPoint=false, action='set', contourPath, oldInletPath,contourType='inner') {
        //debugger
        if ('move' === action && !endPoint.hasOwnProperty('x')) return false;
        //console.log (arguments)
        let centers, checkPoint;
        let IL = this.detectInletLength ( oldInletPath, contourPath )
        let newInletPath = ''
        let contourCommand = SVGPathCommander.normalizePath( contourPath )
        var clockwise = Number(SVGPathCommander.getDrawDirection(contourCommand))
        let oldInletPathSegs = SVGPathCommander.normalizePath(oldInletPath)
        if (!endPoint) {
            endPoint = {x:contourCommand[0][1], y:contourCommand[0][2]}
        }

        const oldInletType = inlet.detectInletType(oldInletPath)
        if ( action === 'set') {
            if (!oldInletType || !newInleType || (newInleType === oldInletType)) {
                return
            }
        }
        let nearestSegment =  contourCommand[1]
         if (action === 'move') nearestSegment= SVGPathCommander.normalizePath( endPoint.command)[0]
         if (newInleType === "Straight") {
             newInletPath =`M ${endPoint.x} ${endPoint.y} `
        } 
        else if (newInleType === "Direct") {
            const commandType = nearestSegment[0]
            let x1, y1;
            switch (commandType) {       
                case 'L':
                    x1=nearestSegment[1]
                    y1=nearestSegment[2]
                    if ( endPoint.x===x1 && endPoint.y=== y1) {
                        return
                    }
                    let perpendicular = util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, IL)
                    checkPoint = util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, 1)
                    var pointIn = util.pointInSvgPath(contourPath , checkPoint[0].x, checkPoint[0].y)

                    if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                        pointIndex=0
                    } else {
                        pointIndex=1
                    }
                    // TODO если был повернут то нужно повернуть мутная хрень -  подвинул повернул на нужный угол
                    newInletPath= `M ${perpendicular[pointIndex].x} ${perpendicular[pointIndex].y} L ${endPoint.x} ${endPoint.y}`
                    break;
                case 'A':
                    const rx = parseFloat(nearestSegment[1]);
                    const ry = parseFloat(nearestSegment[2]);
                    const flag1 = parseFloat(nearestSegment[3]);
                    const flag2 = parseFloat(nearestSegment[4]);
                    const flag3 = parseFloat(nearestSegment[5]);
                    const EX = parseFloat(nearestSegment[6]);
                    const EY = parseFloat(nearestSegment[7]);
                    let PP = this.getPrevEndPoint (contourCommand, nearestSegment);
                    let arcParams= arc.svgArcToCenterParam ( PP.x, PP.y, rx, ry, flag1, flag2, flag3, EX, EY, true)
					let perpPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y},IL);
					let startPoint 
					pointIn = util.pointInSvgPath(contourPath , perpPoint.point1.x, perpPoint.point1.y)
					if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
						startPoint = perpPoint.point1
					}  else {
						startPoint = perpPoint.point2
					} 
                    // TODO если был повернут то нужно повернуть мутная хрень -  подвинул повернул на нужный угол
					newInletPath= `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}` 
                break;
            } 
        } 
        else if (newInleType === "Tangent") {
          
            if (contourType==='outer') clockwise=Number(!Boolean(clockwise));
            let r = IL*0.5
            let detectOldInletType = this.detectInletType(oldInletPath)
            const commandType = nearestSegment[0]
            switch (commandType) {                
                case 'L':
                    let x1=nearestSegment[1]
                    let y1=nearestSegment[2]
                    let perpendicular=util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, r*2) 
                    checkPoint=util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, 1) 
                    pointIn = util.pointInSvgPath(contourPath , (checkPoint[0].x), (checkPoint[0].y))
                    if ( endPoint.x===x1 && endPoint.y=== y1) {
                        return
                    }
                    if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                        pointIndex=0
                    } else {
                        pointIndex=1
                    }
                    newInletPath= `M ${perpendicular[pointIndex].x} ${perpendicular[pointIndex].y} A ${r} ${r} 0 0 ${clockwise} ${endPoint.x} ${endPoint.y}`                   

                    if (detectOldInletType === "Tangent") {
                        let arcLength =  util.arcLength(oldInletPath)
                        let radius, flag2, flag3;
                        if (oldInletPathSegs.length) {
                            oldInletPathSegs.forEach( seg=>{
                                if ( seg.includes('A')) {
                                    flag2=seg[4]
                                    flag3=seg[5]
                                    radius=seg[1]                             
                                }                                
                            }) 
                        }
                        if (radius <= 0 || arcLength <= 0 || arcLength > 2*Math.PI*radius ) {
                            newInletPath= oldInletPath
                        }
                        centers={}
                        perpendicular=util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, r)
                        checkPoint = util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, 1) 
                        pointIn = util.pointInSvgPath(contourPath , checkPoint[0].x, checkPoint[0].y)
                        if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                            centers.x=perpendicular[0].x
                            centers.y=perpendicular[0].y    
                        } else {
                            centers.x=perpendicular[1].x
                            centers.y=perpendicular[1].y
                        }
                        if ( Math.abs(arcLength) > Math.PI*radius) {
                            flag2=1
                        } else {
                            flag2=0
                        }
                        let pp = util.calculateEndPoint(centers.x, centers.y, radius, endPoint.x, endPoint.y, arcLength, clockwise);               
                        newInletPath= `M ${pp.x} ${pp.y} A ${radius} ${radius}  0  ${flag2} ${clockwise} ${endPoint.x}, ${endPoint.y}`   
                    }               
                    break;

                case 'A':
                    const rx = parseFloat(nearestSegment[1]);
                    const ry = parseFloat(nearestSegment[2]);
                    const flag1 = parseFloat(nearestSegment[3]);
                    const flag2 = parseFloat(nearestSegment[4]);
                    const flag3 = parseFloat(nearestSegment[5]);
                    const EX = parseFloat(nearestSegment[6]);
                    const EY = parseFloat(nearestSegment[7]);

                    let PP = this.getPrevEndPoint (contourCommand, nearestSegment);
                    let arcParams= arc.svgArcToCenterParam ( PP.x, PP.y, rx, ry, flag1, flag2, flag3, EX, EY, true)
					let perpPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y},IL);
                    let startPoint 
                    pointIn = util.pointInSvgPath(contourPath , perpPoint.point1.x, perpPoint.point1.y)
                    if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                        startPoint = perpPoint.point1
                    }  else {
                        startPoint = perpPoint.point2
                    }  
                    let inletPoint= util.findPointWithSameDirection( endPoint.x, endPoint.y, startPoint.x, startPoint.y, IL)
                    newInletPath= `M ${inletPoint.x} ${inletPoint.y} A ${r} ${r} 0 0 ${clockwise} ${endPoint.x} ${endPoint.y}`                   
        
                    if (detectOldInletType === "Tangent") {
                        let arcLength =  util.arcLength(oldInletPath)
                        let radius, flag2, flag3;
                        if (oldInletPathSegs.length) {
                            oldInletPathSegs.forEach( seg=>{
                                if ( seg.includes('A')) {
                                    flag2=seg[4]
                                    flag3=seg[5]
                                    radius=seg[1]                             
                                }                                
                            }) 
                        }
                        if (radius <= 0 || arcLength <= 0 || arcLength > 2*Math.PI*radius ) {
                            newInletPath= oldInletPath
                        }

                        inletPoint= util.findPointWithSameDirection( endPoint.x, endPoint.y, startPoint.x, startPoint.y, radius)
                        checkPoint = util.findPointWithSameDirection( endPoint.x, endPoint.y, startPoint.x, startPoint.y, 1)
                        var pointIn = util.pointInSvgPath(contourPath , checkPoint.x, checkPoint.y)
                        if (Math.abs(arcLength) > Math.PI*radius) {
                            flag2=1
                        } else {
                            flag2=0
                        } 
                        
                        if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                            let pp = util.calculateEndPoint(inletPoint.x, inletPoint.y, radius, endPoint.x, endPoint.y, arcLength, clockwise);               
                            newInletPath= `M ${pp.x} ${pp.y} A ${r} ${r} 0 ${flag2} ${clockwise} ${endPoint.x} ${endPoint.y}`   
                        } else {
                            inletPoint= util.findPointWithSameDirection( arcParams.cx, arcParams.cy, endPoint.x, endPoint.y, radius+rx)
                            let pp = util.calculateEndPoint(inletPoint.x, inletPoint.y, radius, endPoint.x, endPoint.y, arcLength, clockwise);               
                            newInletPath= `M ${pp.x} ${pp.y} A ${r} ${r} 0 ${flag2} ${clockwise} ${endPoint.x} ${endPoint.y}`  
                        }
                               
    
                } 
                break;
            } 
        } 
        else if (newInleType === "Hook") {
            if (contourType==='outer') clockwise=Number(!Boolean(clockwise));
            let r = IL*0.25
            if (oldInletType === newInleType)  {
               oldInletPathSegs.forEach((seg)=>{
                    if (seg[0] === "A" ) {
                        r=seg[1]
                        if (Math.round(r*2) >= Math.round(IL)) {
                            r = IL*0.25 
                        }
                    }
                })
            } 

            var pointIndex, directionIndex;
            var midPoint;
            var pointOn, pointIn, perpendicular, direction;
            var fakePath, fakePoint
            let x1, y1;

            const commandType = nearestSegment[0]
            //console.log ( 'commandType ' +commandType )
             switch (commandType) {                
                case 'L':
                    let x1=nearestSegment[1]
                    let y1=nearestSegment[2]
                    perpendicular=util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, IL) 
                    checkPoint = util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, 1) 
                    pointIn = util.pointInSvgPath(contourPath , checkPoint[0].x, checkPoint[0].y)

                    if ( endPoint.x===x1 && endPoint.y=== y1) {
                        return
                    }
                    if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                        directionIndex=0
                    } else {
                        directionIndex=1
                    }

                    pointOn =  util.findPointWithSameDirection( perpendicular[directionIndex].x, perpendicular[directionIndex].y, endPoint.x, endPoint.y, IL-r)
                    midPoint= util.findTangentPoints(pointOn.x, pointOn.y, r, perpendicular[directionIndex].x, perpendicular[directionIndex].y)
                    fakePath =  document.createElementNS("http://www.w3.org/2000/svg", "path");
                    fakePath.setAttribute('d',  `M ${perpendicular[directionIndex].x} ${perpendicular[directionIndex].y}  A ${IL*0.5} ${IL*0.5} 0 0 ${clockwise} ${endPoint.x} ${endPoint.y}`)
                    fakePoint  = fakePath.getPointAtLength( fakePath.getTotalLength()*.5 );
                    pointIndex = this.pointIndex (midPoint[0].x, midPoint[0].y, midPoint[1].x, midPoint[1].y,fakePoint.x,fakePoint.y )

                    newInletPath= `M ${perpendicular[directionIndex].x} ${perpendicular[directionIndex].y}
                    L ${midPoint[pointIndex].x} ${midPoint[pointIndex].y}
                    A ${r} ${r} 0 0 ${clockwise} ${endPoint.x} ${endPoint.y}`

                break;
                case 'A':
                    const rx = parseFloat(nearestSegment[1]);
                    const ry = parseFloat(nearestSegment[2]);
                    const flag1 = parseFloat(nearestSegment[3]);
                    const flag2 = parseFloat(nearestSegment[4]);
                    const flag3 = parseFloat(nearestSegment[5]);
                    const EX = parseFloat(nearestSegment[6]);
                    const EY = parseFloat(nearestSegment[7]);
                    let PP = this.getPrevEndPoint (contourCommand, nearestSegment);
                    let arcParams= arc.svgArcToCenterParam ( PP.x, PP.y, rx, ry, flag1, flag2, flag3, EX, EY, true)
					let perpPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y},IL);
					let startPoint 
					pointIn = util.pointInSvgPath(contourPath , perpPoint.point1.x, perpPoint.point1.y)
					if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
						startPoint = perpPoint.point1
					}  else {
						startPoint = perpPoint.point2
					} 
					pointOn = util.findPointWithSameDirection( startPoint.x,startPoint.y, endPoint.x, endPoint.y, IL-r) 
					midPoint= util.findTangentPoints(pointOn.x, pointOn.y, r, startPoint.x, startPoint.y,)
					fakePath =  document.createElementNS("http://www.w3.org/2000/svg", "path");
                    
                    let fuckPath = `M ${startPoint.x} ${startPoint.y}  A ${IL*0.5} ${IL*0.5} 0 0 ${clockwise} ${endPoint.x} ${endPoint.y}`
                    if (fuckPath.includes('NaN')) return false;
					
                    fakePath.setAttribute('d',  `M ${startPoint.x} ${startPoint.y}  A ${IL*0.5} ${IL*0.5} 0 0 ${clockwise} ${endPoint.x} ${endPoint.y}`)
					fakePoint  = fakePath.getPointAtLength( fakePath.getTotalLength()*.5 );
					pointIndex = this.pointIndex (midPoint[0].x, midPoint[0].y, midPoint[1].x, midPoint[1].y,fakePoint.x,fakePoint.y )
					newInletPath= `M ${startPoint.x} ${startPoint.y} L ${ midPoint[pointIndex].x } ${ midPoint[pointIndex].y } A ${r} ${r} 0 0 ${clockwise} ${endPoint.x} ${endPoint.y}`  

                break;
               
            } 
        }
        //console.log (newInletPath)
        if (newInletPath.includes('NaN') ) return false;
        let resp={}
        resp.newInleType = newInleType
		resp.oldInletType = oldInletType
		resp.oldInletPath = oldInletPath
		resp.newInletPath = newInletPath
		resp.action = action
        resp.contourType = contourType
        return resp     
    }

    setOutletType (newOutleType, endPoint=false, action='set', contourPath, oldOutletPath, contourType='inner'){
        //debugger
        //console.log (arguments)
        if ('move' === action && !endPoint.hasOwnProperty('x')) return false;

        let centers, checkPoint; 
        let IL = this.detectInletLength ( oldOutletPath, contourPath )
        let newOutletPath = ''
        let contourCommand  = SVGPathCommander.normalizePath( contourPath )
        var clockwise = Number(SVGPathCommander.getDrawDirection(contourCommand))
        let oldOutletPathSegs =  SVGPathCommander.normalizePath( oldOutletPath )
        if (!endPoint) {
            endPoint = {x:contourCommand[0][1], y:contourCommand[0][2]}
        }
        const oldOutletType = inlet.detectInletType(oldOutletPath)
        if ( action === 'set') {
            if (!oldOutletType || !newOutleType || (newOutleType === oldOutletType)) {
                return false
            }
        }
        let nearestSegment =  contourCommand[1]
        if (action === 'move') nearestSegment= SVGPathCommander.normalizePath( endPoint.command)[0]
        if (newOutleType === "Straight") {
            newOutletPath= `M ${endPoint.x} ${endPoint.y}`
        } else if (newOutleType === "Direct")  {
            const commandType = nearestSegment[0]
            let x1, y1;
            let path =  SVGPathCommander.normalizePath( oldOutletPath )
            switch (commandType) {       
                
                case 'L':
                    if ( typeof inlet.outletAngle !== 'number') {
                        inlet.outletAngle = util.angleBetwenContourAndInlet (path, contourCommand, false)
                    }    
                    x1=nearestSegment[1]
                    y1=nearestSegment[2]
                    if ( endPoint.x===x1 && endPoint.y=== y1) {
                        return
                    }
                    let perpendicular = util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, IL)
                    checkPoint = util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, 1)
                    var pointIn = util.pointInSvgPath(contourPath , checkPoint[0].x, checkPoint[0].y)
                    if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                        pointIndex=0
                    } else {
                        pointIndex=1
                    }
                    // TODO если был повернут то нужно повернуть мутная хрень -  подвинул повернул на нужный угол
                    newOutletPath= `M${endPoint.x} ${endPoint.y} L${perpendicular[pointIndex].x} ${perpendicular[pointIndex].y}`

                break;
                case 'A':
                    const rx = parseFloat(nearestSegment[1]);
                    const ry = parseFloat(nearestSegment[2]);
                    const flag1 = parseFloat(nearestSegment[3]);
                    const flag2 = parseFloat(nearestSegment[4]);
                    const flag3 = parseFloat(nearestSegment[5]);
                    const EX = parseFloat(nearestSegment[6]);
                    const EY = parseFloat(nearestSegment[7]);
                    let PP = this.getPrevEndPoint (contourCommand, nearestSegment);
                    let arcParams= arc.svgArcToCenterParam ( PP.x, PP.y, rx, ry, flag1, flag2, flag3, EX, EY, true)
					let perpPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y},IL);
                    let startPoint 
                    pointIn = util.pointInSvgPath(contourPath , perpPoint.point1.x, perpPoint.point1.y)
                    if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                        startPoint = perpPoint.point1
                    }  else {
                        startPoint = perpPoint.point2
                    } 
                    // TODO если был повернут то нужно повернуть мутная хрень -  подвинул повернул на нужный угол
                    newOutletPath= `M ${endPoint.x} ${endPoint.y} L${startPoint.x} ${startPoint.y}` 
                break;
             } 
        } else if (newOutleType === "Tangent")  {

			if (contourType === 'outer') clockwise = Number(!Boolean(clockwise));
			let r = IL * 0.5
			const commandType = nearestSegment[0]
			switch (commandType) {
				case 'L':
					let x1 = nearestSegment[1]
					let y1 = nearestSegment[2]
					let perpendicular = util.findPerpendicularPoints(endPoint.x, endPoint.y, x1, y1, IL)
					checkPoint = util.findPerpendicularPoints(endPoint.x, endPoint.y, x1, y1, 1)
					pointIn = util.pointInSvgPath(contourPath, (checkPoint[0].x), (checkPoint[0].y))
                    if ( endPoint.x===x1 && endPoint.y=== y1) {
                        return
                    }
                    if ((pointIn && contourType === 'inner') || (!pointIn && contourType === 'outer')) {
						newOutletPath = `M ${endPoint.x} ${endPoint.y} A ${r} ${r} 0 0 ${clockwise} ${perpendicular[0].x} ${perpendicular[0].y}`
					} else {
						newOutletPath = `M ${endPoint.x} ${endPoint.y} A ${r} ${r} 0 0 ${clockwise} ${perpendicular[1].x} ${perpendicular[1].y}`
					}

					if (oldOutletType === "Tangent") {
						let arcLength = util.arcLength(oldOutletPath)
						let radius, flag2, flag3;
						if (oldOutletPathSegs.length) {
							oldOutletPathSegs.forEach(seg => {
								if (seg.includes('A')) {
									flag2 = seg[4]
									flag3 = seg[5]
									radius = seg[1]
								}
							})
						}
						if (radius <= 0 || arcLength <= 0 || arcLength > 2 * Math.PI * radius) {
							newOutletPath = oldOutletPath
						}
						centers = {}
						perpendicular = util.findPerpendicularPoints(endPoint.x, endPoint.y, x1, y1, r)
						checkPoint = util.findPerpendicularPoints(endPoint.x, endPoint.y, x1, y1, 1)
						pointIn = util.pointInSvgPath(contourPath, checkPoint[0].x, checkPoint[0].y)
						if ((pointIn && contourType === 'inner') || (!pointIn && contourType === 'outer')) {
							centers.x = perpendicular[0].x
							centers.y = perpendicular[0].y
						} else {
							centers.x = perpendicular[1].x
							centers.y = perpendicular[1].y
						}
						if (Math.abs(arcLength) > Math.PI * radius) {
							flag2 = 1
						} else {
							flag2 = 0
						}
						let pp = util.calculateEndPoint(centers.x, centers.y, radius, endPoint.x, endPoint.y, arcLength, clockwise === 0 ? 1 : 0);
						newOutletPath = `M ${endPoint.x}, ${endPoint.y} A ${radius} ${radius}  0  ${flag2} ${clockwise} ${pp.x} ${pp.y} `
					}
					break;
				case 'A':
					const rx = parseFloat(nearestSegment[1]);
					const ry = parseFloat(nearestSegment[2]);
					const flag1 = parseFloat(nearestSegment[3]);
					const flag2 = parseFloat(nearestSegment[4]);
					const flag3 = parseFloat(nearestSegment[5]);
					const EX = parseFloat(nearestSegment[6]);
					const EY = parseFloat(nearestSegment[7]);
					// Calculate the center of the arc


                    let PP = this.getPrevEndPoint (contourCommand, nearestSegment);
                    let arcParams= arc.svgArcToCenterParam ( PP.x, PP.y, rx, ry, flag1, flag2, flag3, EX, EY, true)
					let perpPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y},IL);
 					let startPoint
					pointIn = util.pointInSvgPath(contourPath, perpPoint.point1.x, perpPoint.point1.y)
					if ((pointIn && contourType === 'inner') || (!pointIn && contourType === 'outer')) {
						startPoint = perpPoint.point1
					} else {
						startPoint = perpPoint.point2
					}
					let outletPoint = util.findPointWithSameDirection(endPoint.x, endPoint.y, startPoint.x, startPoint.y, IL)
					newOutletPath = `M ${endPoint.x} ${endPoint.y} A ${r} ${r} 0 0 ${clockwise} ${outletPoint.x} ${outletPoint.y}`

					if (oldOutletType === "Tangent") {
						let arcLength = util.arcLength(oldOutletPath)
						let radius, flag2, flag3;
						if (oldOutletPathSegs.length) {
							oldOutletPathSegs.forEach(seg => {
								if (seg.includes('A')) {
									flag2 = seg[4]
									flag3 = seg[5]
									radius = seg[1]
								}
							})
						}
						if (radius <= 0 || arcLength <= 0 || arcLength > 2 * Math.PI * radius) {
							newOutletPath = oldOutletPath
						}

						outletPoint = util.findPointWithSameDirection(endPoint.x, endPoint.y, startPoint.x, startPoint.y, radius)
						checkPoint = util.findPointWithSameDirection(endPoint.x, endPoint.y, startPoint.x, startPoint.y, 1)
						var pointIn = util.pointInSvgPath(contourPath, checkPoint.x, checkPoint.y)
						if (Math.abs(arcLength) > Math.PI * radius) {
							flag2 = 1
						} else {
							flag2 = 0
						}

						if ((pointIn && contourType === 'inner') || (!pointIn && contourType === 'outer')) {
							let pp = util.calculateEndPoint(outletPoint.x, outletPoint.y, radius, endPoint.x, endPoint.y, arcLength, clockwise === 0 ? 1 : 0);
							newOutletPath = `M ${endPoint.x} ${endPoint.y} A ${r} ${r} 0 ${flag2} ${clockwise} ${pp.x} ${pp.y}`
						} else {
							outletPoint = util.findPointWithSameDirection(arcParams.cx, arcParams.cy, endPoint.x, endPoint.y, radius + rx)
							let pp = util.calculateEndPoint(outletPoint.x, outletPoint.y, radius, endPoint.x, endPoint.y, arcLength, clockwise === 0 ? 1 : 0);
							newOutletPath = `M ${endPoint.x} ${endPoint.y} A ${r} ${r} 0 ${flag2} ${clockwise} ${pp.x} ${pp.y}`
						}
					}              
                break;
             } 
        } else if (newOutleType === "Hook")  {
            if (contourType==='outer') clockwise=Number(!Boolean(clockwise));
            let r = IL*0.25
            oldOutletPathSegs.forEach((seg)=>{
                if (seg[0] === "A" ) {
                    r=seg[1]
                    if (Math.round(r*2) >= Math.round(IL)) {
                        r = IL*0.25 
                    }
                }
            })
    
            var pointIndex, directionIndex;
            var midPoint;
            var pointOn, pointIn, perpendicular;
            var fakePath, fakePoint
    
            const commandType = nearestSegment[0]
            switch (commandType) {                
                case 'L':
                    let x1=nearestSegment[1]
                    let y1=nearestSegment[2]
                    perpendicular=util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, IL) 
                    checkPoint=util.findPerpendicularPoints( endPoint.x,endPoint.y, x1, y1, 1) 
                    pointIn = util.pointInSvgPath(contourPath , checkPoint[0].x, checkPoint[0].y)
                    //здесь обрабатывается тот редкий случай когда точка совпадает с началом линии и к ней никак не построить перпендикуляр
                    if ( endPoint.x===x1 && endPoint.y=== y1) {
                        return false                        
                    }
                    if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
                        directionIndex=0
                    } else {
                        directionIndex=1
                    }
    
                    pointOn =  util.findPointWithSameDirection( perpendicular[directionIndex].x, perpendicular[directionIndex].y, endPoint.x, endPoint.y, IL-r)
                    midPoint= util.findTangentPoints(pointOn.x, pointOn.y, r, perpendicular[directionIndex].x, perpendicular[directionIndex].y)
                    fakePath =  document.createElementNS("http://www.w3.org/2000/svg", "path");
                    
                    let fuckPath = `M ${endPoint.x} ${endPoint.y}   A ${IL*0.5} ${IL*0.5} 0 0 ${clockwise} ${perpendicular[directionIndex].x} ${perpendicular[directionIndex].y}`
                    if (fuckPath.includes('NaN')) return false;
                    
                    fakePath.setAttribute('d',  `M ${endPoint.x} ${endPoint.y}   A ${IL*0.5} ${IL*0.5} 0 0 ${clockwise} ${perpendicular[directionIndex].x} ${perpendicular[directionIndex].y}`)
                    fakePoint  = fakePath.getPointAtLength( fakePath.getTotalLength()*.5 );
                    pointIndex = this.pointIndex (midPoint[0].x, midPoint[0].y, midPoint[1].x, midPoint[1].y,fakePoint.x,fakePoint.y )
                    newOutletPath= `M ${endPoint.x} ${endPoint.y}
                    A ${r} ${r} 0 0 ${clockwise}  ${midPoint[pointIndex].x} ${midPoint[pointIndex].y}
                    L ${perpendicular[directionIndex].x} ${perpendicular[directionIndex].y}`
                    
    
                break;
                
                case 'A':
                    const rx = parseFloat(nearestSegment[1]);
                    const ry = parseFloat(nearestSegment[2]);
                    const flag1 = parseFloat(nearestSegment[3]);
                    const flag2 = parseFloat(nearestSegment[4]);
                    const flag3 = parseFloat(nearestSegment[5]);
                    const EX = parseFloat(nearestSegment[6]);
                    const EY = parseFloat(nearestSegment[7]);
                    let PP = this.getPrevEndPoint (contourCommand, nearestSegment);
                    let arcParams= arc.svgArcToCenterParam ( PP.x, PP.y, rx, ry, flag1, flag2, flag3, EX, EY, true)
					let perpPoint = util.getPerpendicularCoordinatesToPoint(arcParams, {x:endPoint.x,y:endPoint.y},IL);
					let startPoint 
					pointIn = util.pointInSvgPath(contourPath , perpPoint.point1.x, perpPoint.point1.y)
					if ((pointIn && contourType==='inner') ||(!pointIn && contourType==='outer')){
						startPoint = perpPoint.point1
					}  else {
						startPoint = perpPoint.point2
					} 
					pointOn = util.findPointWithSameDirection( endPoint.x, endPoint.y, startPoint.x,startPoint.y, r) 
					midPoint= util.findTangentPoints(pointOn.x, pointOn.y, r, startPoint.x, startPoint.y,)
					fakePath =  document.createElementNS("http://www.w3.org/2000/svg", "path");
					fakePath.setAttribute('d',  `M${endPoint.x} ${endPoint.y} A ${IL*0.5} ${IL*0.5} 0 0 ${clockwise}  ${startPoint.x} ${startPoint.y}`)
					fakePoint  = fakePath.getPointAtLength( fakePath.getTotalLength()*.5 );
					pointIndex = this.pointIndex (midPoint[0].x, midPoint[0].y, midPoint[1].x, midPoint[1].y, fakePoint.x,fakePoint.y )
					newOutletPath= `M ${endPoint.x} ${endPoint.y}  A ${r} ${r} 0 0 ${clockwise}  ${ midPoint[pointIndex].x }  ${ midPoint[pointIndex].y } L ${startPoint.x} ${startPoint.y}`  

                
                break;
            } 
        }
        if (newOutletPath.includes('NaN') ) return false;
        let resp={}
        resp.newOutleType =  newOutleType
		resp.oldOutletType = oldOutletType
		resp.oldOutletPath = oldOutletPath
		resp.newOutletPath = newOutletPath
        resp.contourType = contourType
		resp.action = action
        return resp     
        
    }

    outletTangentR (radius,  arcLength, path) {
        console.log ("outletTangentR")
        let x1, y1, x2, y2 ,flag1, flag2, flag3, rO;
        if (radius <= 0 || arcLength <= 0 || 2*Math.PI*radius < arcLength ) {
            //throw Error ("radius it too small")
            return false
        }

        let pathArc  = SVGPathCommander.normalizePath( path )
        if (pathArc.length) {
			pathArc.forEach( seg=>{
				if ( seg.includes('A')) {
                    flag1=seg[3]
                    flag2=seg[4]
                    flag3=seg[5]
				 	x2=seg[6]
					y2=seg[7]
                    rO=seg[1]
				}
				if ( seg.includes('M')) {
					x1=seg[1]
					y1=seg[2]
				}
			}) 
		}

        if ( x1 === x2 && y1===y2 ) return;
        let centers, endPoint, newCenters
        centers = util.svgArcToCenterParam (x1, y1, rO, rO, flag1, flag2, flag3, x2, y2, true) 
        if (!centers) return false
        newCenters =  util.findPointWithSameDirection (x1, y1, centers.x, centers.y,  radius) 
        endPoint = util.calculateEndPoint( newCenters.x, newCenters.y, radius, x1, y1, arcLength, flag3 ===1 ? 0:1);
      
        if ( pathArc.length && pathArc[1].includes("A") ) {
            pathArc[1][1]=radius
            pathArc[1][2]=radius
            pathArc[1][6]=endPoint.x
            pathArc[1][7]=endPoint.y   
        }        
        if ( Math.abs(arcLength) > Math.PI*radius) {
            pathArc[1][4]=1
        } else {
            pathArc[1][4]=0 
        } 

        let maxArcLength =Math.PI*radius*2
        if ( arcLength > maxArcLength ) {
            return false
        }

        if ( pathArc[0][1] === endPoint.x && pathArc[0][2] === endPoint.y ) {
            return false
        }

        pathArc = pathArc.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( pathArc )) return false;

        let resp ={}
        resp.newOutleType = "Tangent"
		resp.oldOutletType = "Tangent"
 		resp.newOutletPath = pathArc.toString().replaceAll(',', ' ')
		resp.action = 'change'
        return resp
    }

    outletTangentL (arcLength, path) {
        let radius, x1, y1, x2, y2 ,flag1, flag2, flag3;
        let pathArc  = SVGPathCommander.normalizePath( path )
		if (pathArc.length) {
			pathArc.forEach( seg=>{
				if ( seg.includes('A')) {
                    flag1=seg[3]
                    flag2=seg[4]
                    flag3=seg[5]
					radius=seg[1]
					x2=seg[6]
					y2=seg[7]
				}
				if ( seg.includes('M')) {
					x1=seg[1]
					y1=seg[2]
				}
			}) 
		}

        if (radius <= 0 || arcLength <= 0 || arcLength > 2*Math.PI*radius ) {
            return false
        }
         if (x1 === x2 && y1===y2) return false;
        let centers =	util.svgArcToCenterParam(x1, y1, radius, radius, flag1, flag2, flag3, x2, y2, true) 
        if (!centers) return false;
        let endPoint = util.calculateEndPoint( centers.x, centers.y, radius, x1, y1, arcLength, Number(!Boolean(flag3)));

        //console.log ( endPoint )
        if ( pathArc.length && pathArc[1].includes("A") ) {
            pathArc[1][6]=endPoint.x
            pathArc[1][7]=endPoint.y   
        }
        if ( Math.abs(arcLength) > Math.PI*radius) {
            pathArc[1][4]=1
        } else {
            pathArc[1][4]=0 
        }

        pathArc = pathArc.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( pathArc )) return false;
        let resp ={}
        resp.newOutleType = "Tangent"
		resp.oldOutletType = "Tangent"
		resp.newOutletPath = pathArc
		resp.action = 'change'
        return resp

    }

    outletHookR ( radius, outletLength, path ) {
        console.log ('outletHookR   '+radius)
        radius = Number(radius)
        let MX, MY, LX, LY, R, EX, EY, flag1, flag2, flag3;
        path =  SVGPathCommander.normalizePath( path)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                }
                if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } else if (seg.includes('V')) {
                    LY=seg[1]
                    LX=MX 
                } else if (seg.includes('H')) {
                    LY=MY
                    LX=seg[1]
                } else if (seg.includes('A')){
                    R=seg[1]
                    EX=seg[6]
                    EY=seg[7]
                    flag1=seg[3]
                    flag2=seg[4]
                    flag3=seg[5]
                }
            }) 
        }

        if (radius <= 0  ) {
            return false
        }

        if ( radius > outletLength*0.5 ) {
            return false
        }
        
        let centers = util.svgArcToCenterParam (MX, MY, R, R, flag1, flag2, flag3, EX, EY, true) 
        if (!centers) return false
        let newCenters =  util.findPointWithSameDirection (MX, MY, centers.x, centers.y, radius) 
        let c = util.distance (newCenters.x,newCenters.y, LX, LY)
		let b = radius
		let a = Math.sqrt((c**2) - (b**2) )
		let theta = Math.PI*2 -(Math.PI - Math.atan(a/b))
		let arcLength = radius * theta;
        let endPoint = util.calculateEndPoint( newCenters.x, newCenters.y, radius, MX, MY, arcLength, flag3);
        if ( radius > outletLength*0.5 ) {
            return
        }

        if ( path.length && path[1].includes("A") ) {
            path[1][1]=radius
            path[1][2]=radius
            path[1][6]=endPoint.x
            path[1][7]=endPoint.y
        }
        path = path.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( path )) return false;
        let resp ={}
        resp.newOutleType = "Hook"
		resp.oldOutletType = "Hook"
 		resp.newOutletPath = path
 		resp.action = 'change'
        return resp
    }

    outletHookL (D, radius, path) {
        if (D <= 0 || D * 0.5 < radius ) {
            return false
        }

        let MX, MY, LX, LY, EX, EY, r;
        path =  SVGPathCommander.normalizePath(path)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                } else if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } else if (seg.includes('A')){
                    EX=seg[6]
                    EY=seg[7]
                    r=seg[2]
                }
            }) 
        }

        let newEndPoint = util.findPointWithSameDirection (MX, MY, LX, LY,  D);
        let centers = util.findPointWithSameDirection (MX, MY, LX, LY, r)
        let tangent = util.findTangentPoints(centers.x, centers.y, radius, newEndPoint.x , newEndPoint.y) 
        if (!tangent)return false;
        let d1 = util.distance(EX, EY, tangent[0].x, tangent[0].y)
        let d2 = util.distance(EX, EY, tangent[1].x, tangent[1].y)
        let pointIndex = d1 > d2 ? 1 : 0

        path.forEach( seg=>{
            if ( seg.includes('L')) {
                seg[1]=newEndPoint.x
                seg[2]=newEndPoint.y    
            } 
            if ( seg.includes('A')) {
                seg[6]=tangent[pointIndex].x
                seg[7]=tangent[pointIndex].y
            } 
        }) 

        path = path.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( path )) return false;
        let resp ={}
        resp.newOutleType = "Hook"
		resp.oldOutletType = "Hook"
 		resp.newOutletPath = path
		resp.action = 'change'
        return resp
    }

    outletDirectL(D, path) {
        console.log (D)
        let MX, MY, LX, LY;
        path =  SVGPathCommander.normalizePath(path)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                }
                if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } else if (seg.includes('V')) {
                    LY=seg[1]
                    LX=MX 
                } else if (seg.includes('H')) {
                    LY=MY
                    LX=seg[1]
                }
            }) 
        }

        let newEndPoint = util.getNewEndPoint(LX, LY, MX, MY,  D);
        path.forEach( seg=>{
            if ( seg.includes('L')) {
                seg[1]=newEndPoint.x
                seg[2]=newEndPoint.y    
            } 
        }) 
        path = path.toString().replaceAll(',', ' ')
        //if (!SVGPathCommander.isValidPath( path )) return false;
        let resp ={}
        resp.newOutleType = "Direct"
		resp.oldOutletType = "Direct"
		resp.newOutletPath = path
 		resp.action = 'change'
        return resp
    }

    outletDirectA(newAxis, path, contourPath, outerInner='inner' ) {
    if (newAxis < 0 || newAxis > 180 ) return false;
        let MX, MY, LX, LY, PX, PY;
        path =  SVGPathCommander.normalizePath(path)
        if (path.length) {
            path.forEach( seg=>{
                if ( seg.includes('M')) {
                    MX=seg[1]
                    MY=seg[2]
                }
                if ( seg.includes('L')) {
                    LX=seg[1]
                    LY=seg[2]    
                } 
            }) 
        }

        let contour =  SVGPathCommander.normalizePath(contourPath)
        contour.forEach((seg, i)=>{
            if (i<2){
                if (seg.includes('M')) {
                    PX=seg[1]
                    PY=seg[2]
                } else if ( seg.includes('L')) {
                    PX=seg[1]
                    PY=seg[2]    
                } else if (seg.includes('A')) {
                    PX=seg[6]
                    PY=seg[7]
                }
            }
        })

        let oldAxis  = util.calculateAngleVector( MX, MY,LX, LY, PX, PY )
         if (contour[1][0] === 'A') {
            //console.log('Arc position detected')
            let nearestSegment = contour[1]
            const rx = parseFloat(nearestSegment[1]);
            const ry = parseFloat(nearestSegment[2]);
            const flag1 = parseFloat(nearestSegment[3]);
            const flag2 = parseFloat(nearestSegment[4]);
            const flag3 = parseFloat(nearestSegment[5]);
            const EX = parseFloat(nearestSegment[6]);
            const EY = parseFloat(nearestSegment[7]);

            let C = util.svgArcToCenterParam (MX, MY, rx, ry, flag1, flag2, flag3, EX, EY, true)   
            let OP = util.rotatePoint(  C.x, C.y,  MX, MY,0, 270)
            oldAxis = Math.round(util.calculateAngleVector ( MX, MY, LX, LY, OP.x, OP.y)*100)/100
            console.log('Arc position detected in degree '+ oldAxis)
        }
        let pathDirection = Number(SVGPathCommander.getDrawDirection(contour))
        if (pathDirection === 1 && outerInner === 'outer'){
             newAxis=180-newAxis
             oldAxis=180-oldAxis
        }
        
        let newEndPoint= util.rotatePoint(LX, LY, MX, MY, oldAxis, newAxis)
        if (path.includes("NaN")) {
            return false
        }
        //if (!SVGPathCommander.isValidPath( `M${MX} ${MY} L${ newEndPoint.x} ${newEndPoint.y}` )) return false;
        let resp ={}
        resp.newOutleType = "Direct"
		resp.oldOutletType = "Direct"
		resp.newOutletPath = `M${MX} ${MY} L${ newEndPoint.x} ${newEndPoint.y}`
 		return resp
    }

    findDangerInletsOutlets () {
        return
        let inlets = partStore.getFiltered('inlet')
        let outlets = partStore.getFiltered('outlet')

        let collInl = []
        let collOutl = []

        inlets.forEach( element =>{

            //console.log (element)
           
            let oldInletPath = element.path
            let resp={}
            resp.newInleType =  this.detectInletType(oldInletPath)
            resp.oldInletType = resp.newInleType
            resp.oldInletPath = oldInletPath
            resp.newInletPath = oldInletPath
            resp.cid = element.cid            
            resp.action = 'check'
            let contour = partStore.getElementByCidAndClass( element.cid, 'contour')
            resp.contourType =  contour.class.includes('inner') ? 1 : 0
            //resp.element=element
            let check = this.checkInletIntend (resp)
            if (!check) {
                //console.log ('findDangerInletsOutlets InletCheck is...  ' + check)
                collInl.push(element.cid)
            }
            inlet.contourEdges = ''
            inlet.contourEdges1 = '' 
        })

        outlets.forEach( element =>{
           
            let oldPath = element.path
            let contour = partStore.getElementByCidAndClass( element.cid, 'contour')
            let contourType =  contour.class.includes('inner') ? 'inner' : 'outer'
            let outletType = this.detectInletType ( oldPath )
            let check = this.checkInletPosition ( contour.path  , element.path, contourType, outletType , 'outlet')             
            if (!check) {
                collOutl.push(element.cid)
            }
            inlet.contourEdges = ''
            inlet.contourEdges1 = '' 
        })


        if (collOutl.length === 0) {            
            console.log ("All outlets are Ok!", false, true)
            //util.messaging ("All inlets are Ok!", false, true)
        } else {
            console.log ( "Some outlets have danger position!"+ collInl)
            //util.messaging ( "Some inlets have danger position!", true, false)
            collOutl.forEach((cid)=>{
                let collider  =  partStore.getElementByCidAndClass( cid, 'outlet', 'class')
                collider += ' collisionInlet'
                partStore.updateElementValue(cid, 'outlet', 'class', collider)
            })
    
            setTimeout(()=>{
                collOutl.forEach((cid)=>{
                    let collider  =  partStore.getElementByCidAndClass( cid, 'outlet', 'class')
                    collider = collider.replace(' collisionInlet', '')
                    partStore.updateElementValue(cid, 'outlet', 'class', collider)
                })
    
            },5000)
        } 

        if (collInl.length === 0) {            
            console.log ("All inlets are Ok!", false, true)
            //util.messaging ("All inlets are Ok!", false, true)
        } else {
            console.log ( "Some inlets have danger position!"+ collInl)
            //util.messaging ( "Some inlets have danger position!", true, false)
            collInl.forEach((cid)=>{
                let collider  =  partStore.getElementByCidAndClass( cid, 'inlet', 'class')
                collider += ' collisionInlet'
                partStore.updateElementValue(cid, 'inlet', 'class', collider)
            })
    
            setTimeout(()=>{
                collInl.forEach((cid)=>{
                    let collider  =  partStore.getElementByCidAndClass( cid, 'inlet', 'class')
                    collider = collider.replace(' collisionInlet', '')
                    partStore.updateElementValue(cid, 'inlet', 'class', collider)
                })
    
            },5000)
        } 

        let contours  = [...new Set ([...collInl, ...collOutl])]   
        contours.forEach((cid)=>{
            let collider  =  partStore.getElementByCidAndClass( cid, 'contour', 'class')
            collider += ' collisionInlet'
            partStore.updateElementValue(cid, 'contour', 'class', collider)
        })

        setTimeout(()=>{
            contours.forEach((cid)=>{
                let collider  =  partStore.getElementByCidAndClass( cid, 'contour', 'class')
                collider = collider.replace(' collisionInlet', '')
                partStore.updateElementValue(cid, 'contour', 'class', collider)
            })

        },5000) 
    }

    checkInletIntend (inl, contourPath =false) {
        let needCheck = partStore.safeMode.mode
        let intend = partStore.safeMode.intend
        let contourInner = inl.contourType
        if (!contourPath) contourPath = partStore.getElementByCidAndClass (inl.cid, 'contour', 'path')
             

        if (!needCheck && inl.action !=='check') return true
		if (inl.newInleType === "Straight") {
			return  true	
		} 

        let contourPoints=util.pathToPolyline (contourPath, 1);
  		
		if ( !this.contourEdges ) {		
			this.contourEdges = util.parsePointsString(contourPoints, false, contourInner, intend*100)
            this.contourEdges.push(this.contourEdges[0])
 		}

		if ( !this.contourEdges1 ) {		
			this.contourEdges1 = util.parsePointsString(contourPoints, false, contourInner, intend*100+100 )
			this.contourEdges1.push(this.contourEdges1[0])
 		}
        inlet.createSVG(this.contourEdges, 'blue',  'contInt')
        inlet.createSVG(this.contourEdges1, 'pink',  'contInt1')
		let MX,MY,EX,EY,distance,radius,cuttedInlet,inletPoint,inletPoints,CX,CY,flag1,flag2,flag3,intersection, nesIntesect;
        if (inl.newInleType === "Hook" ) {
			cuttedInlet = SVGPathCommander.normalizePath( inl.newInletPath)
			cuttedInlet.forEach((seg) =>{
				if ( seg.includes('M')) {
					MX=seg[1]
					MY=seg[2]    
				} else if (seg.includes('A')) {
					radius=seg[1]
                    EX=seg[6]
                    EY=seg[7]
				} 
			})

			distance = util.distance({x:MX,y:MY},{x:EX,y:EY})
			inletPoint= util.findPointWithSameDirection( MX, MY, EX, EY, distance-intend-0.5)

            let perpendicular=util.findPerpendicularPoints( EX, EY, MX, MY, 10)
			CX = perpendicular[0].x
			CY = perpendicular[0].y

			let PP = util.findParallelLine(EX, EY, CX, CY,  inletPoint.x, inletPoint.y, 1000)
 			inletPoints = util.pathToPolyline(cuttedInlet, 1).split(';').map ( a => a.split(',').map( aa => Number(aa)))
 			let intersection;
            let intersections=0;


			// в этом цикле ообрезаем inlet до чтоки пресечения
			for (let ind = 0; ind < inletPoints.length-1; ind++) {
				let x = inletPoints[ind][0]
				let xx = inletPoints[ind+1][0]
				let y = inletPoints[ind][1]
				let yy = inletPoints[ind+1][1]

				intersection = util.intersects (PP,[{x:x,y:y},{x:xx,y:yy}])
				if (intersection) {
                    intersections++
					inletPoints.splice(ind+1);
					let IL = util.distance ({x:MX,y:MY},{x:intersection.x,y:intersection})
					let lastPoint = util.findPointWithSameDirection(MX,MY,intersection.x, intersection.y, IL )
					if(inletPoints.length===1){
						inletPoints.push([intersection.x, intersection.y])
					} else {
						inletPoints.push([lastPoint.x, lastPoint.y])
					}
					//break;
				}	
				intersection=false
			}

            if (intersections > 1) return false

            inlet.createSVG( inletPoints, 'white',  'inletPoints')
 			// в этом цикле ищем столкновение 
			for (let ind = 0; ind < inletPoints.length-1; ind++) {
				let x = inletPoints[ind][0]
				let xx = inletPoints[ind+1][0]
				let y = inletPoints[ind][1]
				let yy = inletPoints[ind+1][1]

				for (let ind = 0; ind < this.contourEdges.length-1; ind++) {
					let cx =  this.contourEdges[ind][0]
					let cxx = this.contourEdges[ind+1][0]
					let cy =  this.contourEdges[ind][1]
					let cyy = this.contourEdges[ind+1][1]

					let intersection = util.intersects ([{x:cx,y:cy},{x:cxx,y:cyy}],[{x:x,y:y},{x:xx,y:yy}])
					if (intersection) {
						return false;
					}	
				}
			}

			nesIntesect=false
			// в этом цикле ищем столкновение которое должно быть!!
			for (let ind = 0; ind < inletPoints.length-1; ind++) {
				let x = inletPoints[ind][0]
				let xx = inletPoints[ind+1][0]
				let y = inletPoints[ind][1]
				let yy = inletPoints[ind+1][1]

				for (let ind = 0; ind < this.contourEdges1.length-1; ind++) {
					let cx =  this.contourEdges1[ind][0]
					let cxx = this.contourEdges1[ind+1][0]
					let cy =  this.contourEdges1[ind][1]
					let cyy = this.contourEdges1[ind+1][1]

					let intersection = util.intersects ([{x:cx,y:cy},{x:cxx,y:cyy}],[{x:x,y:y},{x:xx,y:yy}])
					if (intersection) {
						nesIntesect= true
						//console.log ("Find  necessary intersection  " +  intersection )
					}	
				}
			} 
			return nesIntesect
		} else if (inl.newInleType === "Tangent") {
                cuttedInlet = SVGPathCommander.normalizePath( inl.newInletPath)
                cuttedInlet.forEach((seg) =>{
                        if ( seg.includes('A')) {
                            flag1=seg[3]
                            flag2=seg[4]
                            flag3=seg[5]
                            EX=seg[6]
                            EY=seg[7]
                            radius=seg[1]        
                        }
                        if ( seg.includes('M')) {
                            MX=seg[1]
                            MY=seg[2]
                        }
                }) 
        
                var centers = util.svgArcToCenterParam (MX, MY, radius, radius, flag1, flag2, flag3, EX, EY, true) 
                var topPoint = util.findPointWithSameDirection( EX, EY, centers.x, centers.y, 2*radius)
    
                distance = 2*radius//util.distance({x:topPoint.x,y:topPoint.y},{x:EX,y:EY})
                inletPoint= util.findPointWithSameDirection( topPoint.x, topPoint.y, EX, EY, distance-intend-0.5)
    
                let perpendicular=util.findPerpendicularPoints( EX, EY, topPoint.x, topPoint.y, 10)
                CX = perpendicular[0].x
                CY = perpendicular[0].y
    
                let PP = util.findParallelLine(EX, EY, CX, CY,  inletPoint.x, inletPoint.y, 1000)
                
    
                inletPoints = util.pathToPolyline(cuttedInlet, 1).split(';').map ( a => a.split(',').map( aa => Number(aa)))
                let intersections =0
                // в этом цикле ообрезаем inlet до чтоки пресечения
                for (let ind = 0; ind < inletPoints.length-1; ind++) {
                    let x = inletPoints[ind][0]
                    let xx = inletPoints[ind+1][0]
                    let y = inletPoints[ind][1]
                    let yy = inletPoints[ind+1][1]
    
                    intersection = util.intersects (PP,[{x:x,y:y},{x:xx,y:yy}])
                    if (intersection) {
                        
                        intersection++
                        inletPoints.splice(ind);
                        inletPoints.push([intersection.x, intersection.y])
                        //break;
                    }	
                    intersection=false
                }

                if (intersections > 1) return false
                inlet.createSVG( inletPoints, 'yellow',  'inletPoints')
                // в этом цикле ищем столкновение 
                for (let ind = 0; ind < inletPoints.length-1; ind++) {
                    let x = inletPoints[ind][0]
                    let xx = inletPoints[ind+1][0]
                    let y = inletPoints[ind][1]
                    let yy = inletPoints[ind+1][1]
    
                    for (let ind = 0; ind < this.contourEdges.length-1; ind++) {
                        let cx =  this.contourEdges[ind][0]
                        let cxx = this.contourEdges[ind+1][0]
                        let cy =  this.contourEdges[ind][1]
                        let cyy = this.contourEdges[ind+1][1]
    
                        let intersection = util.intersects ([{x:cx,y:cy},{x:cxx,y:cyy}],[{x:x,y:y},{x:xx,y:yy}])
                        if (intersection) {
                            return false;
                        }	
                    }
                }
    
                nesIntesect=false
                // в этом цикле ищем столкновение которое должно быть!!
                for (let ind = 0; ind < inletPoints.length-1; ind++) {
                    let x = inletPoints[ind][0]
                    let xx = inletPoints[ind+1][0]
                    let y = inletPoints[ind][1]
                    let yy = inletPoints[ind+1][1]
    
                    for (let ind = 0; ind < this.contourEdges1.length-1; ind++) {
                        let cx =  this.contourEdges1[ind][0]
                        let cxx = this.contourEdges1[ind+1][0]
                        let cy =  this.contourEdges1[ind][1]
                        let cyy = this.contourEdges1[ind+1][1]
    
                        let intersection = util.intersects ([{x:cx,y:cy},{x:cxx,y:cyy}],[{x:x,y:y},{x:xx,y:yy}])
                        if (intersection) {
                            nesIntesect= true
                            //console.log ("Find  necessary intersection  " +  intersection )
                        }	
                    }
                }
                return nesIntesect

        } else if (inl.newInleType === "Direct") {
            cuttedInlet = SVGPathCommander.normalizePath( inl.newInletPath)
			cuttedInlet.forEach((seg) =>{
				if ( seg.includes('M')) {
					MX=seg[1]
					MY=seg[2]    
				} else if (seg.includes('L')) {
                    EX=seg[1]
                    EY=seg[2]
				} 
			})

            let cutted = false
             
            // здесь обрезаем по место столкновения(!)
            let inletPoint;
            let intersections=0;

            for (let ind = 0; ind < this.contourEdges.length-1; ind++) {
                let cx =  this.contourEdges[ind][0]
                let cxx = this.contourEdges[ind+1][0]
                let cy =  this.contourEdges[ind][1]
                let cyy = this.contourEdges[ind+1][1]
                let intersection = util.intersects ([{x:cx,y:cy},{x:cxx,y:cyy}],[{x:MX,y:MY},{x:EX,y:EY}])
                if (intersection) {
                    intersections++
                    cutted = true
                    distance = util.distance({x:MX,y:MY},{x:intersection.x,y:intersection.y})
                    inletPoint= util.findPointWithSameDirection( MX, MY, intersection.x,intersection.y, distance-.5)   
                    inlet.createSVG( [[MX,MY],[inletPoint.x,inletPoint.y]], 'yellow',  'inletPoints')               
                }	
            }
            // если пересекает контур несоколько раззз... ну если пользователь идиот!!!
            if (intersections > 1) return false
            // на случай если нечем обрезать inlet... значит он не там стоит
            if (!cutted) {
                //console.log (' // на случай если нечем обрезать inlet... значит он не там стоит')
                return false
            } 

            // в этом цикле ищем столкновение которого НЕ должно быть!!
            for (let ind = 0; ind < this.contourEdges.length-1; ind++) {
                let cx =  this.contourEdges[ind][0]
                let cxx = this.contourEdges[ind+1][0]
                let cy =  this.contourEdges[ind][1]
                let cyy = this.contourEdges[ind+1][1]

                intersection = util.intersects ([{x:cx,y:cy},{x:cxx,y:cyy}],[{x:MX,y:MY},{x:inletPoint.x,y:inletPoint.y}])
                if (intersection) {
                    return false
                }
            }

            return true
           /*  nesIntesect=false
            // в этом цикле ищем столкновение которое должно быть!! но это не нужно ))
            for (let ind = 0; ind < this.contourEdges1.length-1; ind++) {
                let cx =  this.contourEdges1[ind][0]
                let cxx = this.contourEdges1[ind+1][0]
                let cy =  this.contourEdges1[ind][1]
                let cyy = this.contourEdges1[ind+1][1]

                try{
                    intersection = util.intersects ([{x:cx,y:cy},{x:cxx,y:cyy}],[{x:MX,y:MY},{x:inletPoint.x,y:inletPoint.y}])
                    if (intersection) {
                        nesIntesect= true
                        console.log ("Find  necessary intersection  " +  intersection )
                    }
                } catch(e){}
            }
            return nesIntesect */
		}
	}

    checkInletPosition (contour, path, type, inletType, inletOutlet,seg=1) {
        const totalLength = SVGPathCommander.getTotalLength( path )
        if (inletType ==='Straight') return true;

        if (inletOutlet ==='inlet'){
            for (let i = 0; i < totalLength-1; i++) {
                let point = SVGPathCommander.getPointAtLength( path, i* seg)
                let fill = util.pointInSvgPath(contour, point.x, point.y) 
                if ((type === 'inner' && !fill) || (type === 'outer' && fill)) {
                    console.log ('shit')
                    return false
                }
            }

        } else {
            for (let i = 1; i < totalLength-1; i++) {
                let point = SVGPathCommander.getPointAtLength( path, totalLength-i* seg)
                let fill = util.pointInSvgPath( contour, point.x, point.y) 
                if ((type === 'inner' && !fill) || (type === 'outer' && fill)) {
                    console.log ('shit')
                    return false
                }
            }
        } 
        return true
    }

    getNewPathsInMove  ( coords ) {
        const {
            selectedCid,
            selectedPath,
            selectedInletPath,
            selectedOutletPath    
        } = partStore;
    
		//editorStore.setInletMode('inletInMoving')
		let nearest = util.findNearestPointOnPath (selectedPath, { x: coords.x, y: coords.y })
		let inletType = this.detectInletType (selectedInletPath)
		let classes = partStore.getElementByCidAndClass ( selectedCid, 'contour', 'class')
		let contourType = classes.includes('inner') ? 'inner' : 'outer'
		let resp = this.setInletType ( inletType, nearest, 'move', selectedPath, selectedInletPath, contourType) 

		let outletType = this.detectInletType (selectedOutletPath)
		let resp1 = this.setOutletType ( outletType, nearest, 'move', selectedPath, selectedOutletPath, contourType) 

		if (resp  && resp1) {
			
			if (typeof nearest.x  === 'number' &&  typeof nearest.y  === 'number') {
                let newContour = this.updateContourPathInMove(selectedPath, nearest)
                let newPaths ={}
                newPaths.cid = selectedCid
                newPaths.contour = newContour
                newPaths.inlet = resp.newInletPath
                newPaths.outlet = resp1.newOutletPath
                this.applyNewPaths (newPaths)
			}
		} else {
			console.log ('Invalid PATH')
		}
	}

    reversePath ()  {
        console.log ('reverse')
        const {
             selectedPath,
             selectedCid
         } = partStore;

        let reversePath =  SVGPathCommander.reversePath( selectedPath ).join(' ').replaceAll(',', ' ')
        let res = inlet.getNewInletOutlet( selectedCid, 'contour', 'path', reversePath)
        inlet.applyNewPaths( res )
        addToLog('Contour reversed')
    }

    applyNewPaths (paths) {
        //console.log ("+++ NOW WE APPLY NEW PATHS +++")
        let {contour, inlet, outlet, cid, log} = paths
        if (partStore.safeMode.mode) {
           
            if (!paths.hasOwnProperty('contour')) {
                contour = partStore.getElementByCidAndClass (cid, 'contour', 'path')
            }
            if (!paths.hasOwnProperty('inlet')) {
                inlet = partStore.getElementByCidAndClass (cid, 'inlet', 'path')
            }
            if (!paths.hasOwnProperty('outlet')) {
                outlet = partStore.getElementByCidAndClass (cid, 'outlet', 'path')
            }
            // safeMode ON
            this.contourEdges = ''
            this.contourEdges1 = '' 
            let resp={}
            let oldInlet =  partStore.getElementByCidAndClass (cid, 'inlet', 'path')
            let oldContour =  partStore.getElementByCidAndClass (cid, 'contour')
            resp.newInleType =  this.detectInletType(  inlet )
            resp.oldInletType = this.detectInletType(  oldInlet.path )
            resp.oldInletPath = oldInlet.path
            resp.newInletPath = inlet
            resp.cid = cid            
            resp.action = 'check'
            resp.contourType = oldContour.class.includes('inner') ? 1 : 0

            let outletType = this.detectInletType(  outlet )              
            let outletCheck = true
            try {
                outletCheck = this.checkInletPosition ( contour, outlet, resp.contourType === 1 ? "inner" : "outer", outletType, 'outlet')             
                //console.log ('outlet check result is...  ' + outletCheck )
            } catch (e) {
                console.log ('Catch in checkInletPosition')
            }
            let inletCheck =  this.checkInletIntend (resp, contour ) 
            if (outletCheck && inletCheck) {
                if ( paths.hasOwnProperty('contour')) partStore.updateElementValue ( cid, 'contour', 'path', contour );
                if ( paths.hasOwnProperty('outlet')) partStore.updateElementValue ( cid, 'outlet', 'path', outlet );
                if ( paths.hasOwnProperty('inlet')) partStore.updateElementValue ( cid, 'inlet', 'path', inlet );
                if ( paths.hasOwnProperty('log')) addToLog(log)
                return true
            } else {
                return false;
            }
        } else {

            if ( paths.hasOwnProperty('contour')) partStore.updateElementValue ( cid, 'contour', 'path', contour );
            if ( paths.hasOwnProperty('outlet')) partStore.updateElementValue ( cid, 'outlet', 'path', outlet );
		    if ( paths.hasOwnProperty('inlet')) partStore.updateElementValue ( cid, 'inlet', 'path', inlet );
            if ( paths.hasOwnProperty('log')) addToLog(log)
            return true
        }
    }   
}

const inlet = new Inlet()

export default inlet;