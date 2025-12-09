import SimpleReturnComponent from './simpleReturnComponent'
//import Selector from './selector.js'
//import SelectedPointOnEdge from './selectedPointOnEdge.js';
//import SelectedPointOnPath from './selectedPointOnPath.js';
//import SelectedEdge from './selectedEdge.js';
//import Guides from './guides.js'
//import editorStore from '../../store/editorStore';
import svgStore from './../../store/svgStore';
import { observer } from 'mobx-react-lite';
//import Joints from './joints.js';
///import HighLighted from './highlighted.js';
//import LaserShow from './laserShow.js';


const SvgComponent = observer (() => {

    const {
        matrix,  
        groupMatrix,
        rectParams,
        gridState,
        svgData,

    } = svgStore

   
    const matrixM = `${matrix.a} ${matrix.b} ${matrix.c} ${matrix.d} ${matrix.e} ${matrix.f}`;
    const matrixG = `${groupMatrix.a} ${groupMatrix.b} ${groupMatrix.c} ${groupMatrix.d} ${groupMatrix.e} ${groupMatrix.f}`;

    return (
        <svg
            id="svg"
            baseProfile="full"
            viewBox={`0.00 0.00 ${svgData.width} ${ svgData.height }`}
            style={{ overflow: 'hidden', border: '1px solid var(--color)' }}
            version="1.1"
            stroke='var(--color)'
            strokeWidth="0.2"
        >
            <defs>
                <pattern  
                    id="xsGrid" 
                    width="1" 
                    height="1" 
                    fill="var(--gridColorFill)" 
                    patternUnits="userSpaceOnUse" 
                    visibility={gridState.xsGrid.visibility}>
                    <path  d="M 0 0 1 0 1 1 0 1 0 0" fill="var(--gridColorFill)" stroke="var(--gridColorStroke)" strokeWidth="0.05"/>
                </pattern>
                <pattern 
                    id="smallGrid" 
                    width="10" 
                    height="10" 
                    patternUnits="userSpaceOnUse" >
                    <rect  width="100" height="100" fill="url(#xsGrid)"/>
                    <path  
                    d="M 10 0 L 0 0 0 10 10 10 10 0" 
                    fill={gridState.smallGrid.fill} 
                    stroke="var(--gridColorStroke)" 
                    strokeWidth="0.1" 
                    visibility={gridState.smallGrid.visibility}/>
                </pattern>
                <pattern  
                    id="grid" 
                    width="100" 
                    height="100" 
                    patternUnits="userSpaceOnUse"
                    visibility={gridState.grid.visibility}>
                    <rect  
                    width="100" height="100" 
                    fill="url(#smallGrid)"/>
                    <path  
                    d="M 100 0 0 0 0 100 100 100 100 0" 
                    fill={gridState.grid.fill} 
                    stroke="var(--gridColorStroke)" 
                    strokeWidth="0.2"/>
                </pattern>
                <marker id="dotRed" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
                    <circle 
                    cx="5" 
                    cy="5" 
                    r="5" 
                    fill="red"></circle>
                </marker>
                <marker id="dotPink" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
                    <circle 
                    cx="5" 
                    cy="5" 
                    r="5" 
                    fill="pink"></circle>
                </marker>
                <marker id="dotYellow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5">
                    <circle 
                    cx="5" 
                    cy="5" 
                    r="5" 
                    fill="yellow"></circle>
                </marker>                
            </defs>
            <g id="group2" fill="url(#grid)">
                <g id="group1" transform={`matrix(${matrixG})`}>
                    <g id="group" transform={`matrix(${matrixM})`} className="grab">
                        <g id="contours">
                            <rect
                                id="dimensionalGrid"
                                height={ svgData.height }
                                width={ svgData.width }
								x={0}
                                y={0}
                                fill="url(#grid)"
                                stroke='var(--color)'
                                strokeWidth="0"
                            ></rect>
                            <>
                            < SimpleReturnComponent />
                            </>
                       </g>
                      {/*  <Selector />
                       <Guides />
                       <SelectedPointOnEdge/>
                       <Joints />
                       <SelectedPointOnPath/>
                       <SelectedEdge/>
                       <HighLighted />
                       <LaserShow /> */}
                    </g>
                </g>
            </g>
        </svg>
    );
});

export default SvgComponent;

















