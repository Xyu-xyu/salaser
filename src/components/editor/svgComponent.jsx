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
            style={{ overflow: 'hidden' }}
            version="1.1"
            stroke='var(--color)'
            strokeWidth="0.2"          
        >

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
                                strokeWidth="0.25"
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

















