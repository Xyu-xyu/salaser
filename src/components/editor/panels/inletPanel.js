import { Icon } from '@iconify/react';
import Panel from './panel.js';
import '@fortawesome/fontawesome-free/css/all.css'
import { observer } from 'mobx-react-lite';
import svgStore from "../stores/svgStore.js";
import editorStore from "../stores/editorStore.js";
import { useEffect, useState } from 'react';
import Hook from './../../img/Hook.jpg';
import Direct from './../../img/Direct.jpg';
import Straight from './../../img/Straight.jpg';
import Tangent from './../../img/Tangent.jpg';
import SVGPathCommander from 'svg-path-commander';
import inlet from '../../scripts/inlet.js';
import util from '../../utils/util.js';
import CONSTANTS from '../../constants/constants.js';
import { addToLog } from './../../scripts/addToLog.js';
import { useTranslation } from 'react-i18next';


const InletPanel = observer(() => {
	const { t } = useTranslation();
	const {
		selectedCid,
		selectedPath,
		selectedInletPath
	} = svgStore;

	const [type, setType] = useState(Straight)
	const [mode, setMode] = useState(null)
	const [TangentL, setTangentL] = useState(0);
	const [TangentR, setTangentR] = useState(0);
	const [HookL, setHookL] = useState(0);
	const [HookR, setHookR] = useState(0);
	const [DirectA, setDirectA] = useState(90);
	const [DirectL, setDirectL] = useState(0);
	const [safeMode, setSafeMode] = useState(false)
	const [inletIntend, setInletIntend] = useState( CONSTANTS.defaultInletIntend)



	const setNewInlet = (newType) =>{
		console.log(newType)
		if (type === newType) return;
		let classes = svgStore.getElementByCidAndClass ( selectedCid, 'contour', 'class')
		let contourType = classes.includes('inner') ? 'inner' : 'outer'	
		let resp = inlet.setInletType (newType, false, 'set', selectedPath, selectedInletPath, contourType)
		if ( resp ) {
			let paths = {}
			paths.cid = selectedCid
			paths.inlet = resp.newInletPath		
			paths.log = 'Set inlet type'
			inlet.applyNewPaths(paths)
			setInletParams ()
		}
	}

	useEffect(()=>{
		svgStore.setsafeMode({mode:safeMode, intend: inletIntend})
		inlet.findDangerInletsOutlets() 

	},[safeMode, inletIntend])

	const setInletForAll = () =>{
		console.log ('setInletForAll')
		let inletMode = inlet.detectInletType ( selectedInletPath )
		let inlets = svgStore.getFiltered("inlet")
		if (inletMode) {
			for (let i in  inlets ) {
				let element = inlets[i]
				let contourType = element.class.includes('inner') ? 'inner' : 'outer'	
				let inletPath = element.path
				let contour = svgStore.getElementByCidAndClass ( element.cid, 'contour')
				let resp = inlet.setInletType (inletMode, false, 'set', contour.path, inletPath, contourType)
				if ( resp ) {
					let paths = {}
					paths.cid = element.cid
					paths.inlet = resp.newInletPath		
					inlet.applyNewPaths(paths)
				}
						}
			addToLog(`Set inlet type ${inletMode} for all`)
		}
	}

	const setInletParams = (inletMode) => {
		if (inletMode === 'Tangent') {
            let R;
            let path =  SVGPathCommander.normalizePath(selectedInletPath)
            path.forEach((seg)=>{
                if (seg[0] === "A" ) {
                    R=seg[1]
                }
            })
            setTangentR(R)
            let L =  util.arcLength(selectedInletPath)
            setTangentL(L)
        } else if (inletMode === 'Direct') {
          
            let A, MX, MY, LX, LY, D, PX, PY;
            let path =  SVGPathCommander.normalizePath(selectedInletPath)
            if (path && path.length) {
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

            let contour =  SVGPathCommander.normalizePath(selectedPath)
            contour.forEach((seg, i)=>{
                if (i<2){
                    if (seg.includes('M')) {
                        PX=seg[1]
                        PY=seg[2]
                    } else if ( seg.includes('L')) {
                        PX=seg[1]
                        PY=seg[2]    
                    } else if (seg.includes('V')) {
                        PY=seg[1]
                     } else if (seg.includes('H')) {
                        PX=seg[1]
                    } else if (seg.includes('A')) {
                        PX=seg[6]
                        PY=seg[7]
                    }
                }
            })

            A = Math.round(util.calculateAngleVector ( LX, LY, MX, MY, PX, PY)*100)/100
            D = util.distance( MX, MY, LX, LY )

            if (contour[1][0] === 'A' ) {
                let nearestSegment = contour[1]
                const rx = parseFloat(nearestSegment[1]);
                const ry = parseFloat(nearestSegment[2]);
                const flag1 = parseFloat(nearestSegment[3]);
                const flag2 = parseFloat(nearestSegment[4]);
                const flag3 = parseFloat(nearestSegment[5]);
                const EX = parseFloat(nearestSegment[6]);
                const EY = parseFloat(nearestSegment[7]);
                let C = util.svgArcToCenterParam (LX, LY, rx, ry, flag1, flag2, flag3, EX, EY, true)   
                let OP = util.rotatePoint(C.x, C.y,  LX, LY,0, 270)
                A = Math.round(util.calculateAngleVector ( LX, LY, MX, MY, OP.x, OP.y)*100)/100
                if (rx !== ry) {
                    console.log( 'rx !=== ry' )
                }
            }

            setDirectA(A)
            setDirectL(D)

        } else if (inletMode === 'Hook') {

            let MX, MY, R, EX, EY, D;
            let path =  SVGPathCommander.normalizePath(selectedInletPath)
            if (path.length) {
                path.forEach( seg=>{
                    if ( seg.includes('M')) {
                        MX=seg[1]
                        MY=seg[2]
                    } else if (seg.includes('A')){
                        R=seg[1]
                        EX=seg[6]
					    EY=seg[7]
                    }
                }) 
            }
            D = util.round( util.distance( MX, MY, EX, EY ), 3)
            setHookR(R)
            setHookL(D)
        }
	} 

	useEffect(()=>{
		let resp;
		if (HookR &&  HookL && selectedInletPath) {
			resp = inlet.inletHookR (HookR, HookL, selectedInletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath		
				inlet.applyNewPaths(paths)
			}	
		}		
	},[HookR])

 	useEffect(()=>{
		let resp;
		if (HookR &&  HookL && selectedInletPath) {
			resp = inlet.inletHookL (HookL, HookR, selectedInletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath		
				inlet.applyNewPaths(paths)
			}
		}		
	},[HookL])

	useEffect(()=>{
		let resp;
		if (TangentR && TangentL  && selectedInletPath) {
			resp = inlet.inletTangentR (TangentR, TangentL, selectedInletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath		
				inlet.applyNewPaths(paths)
			}
		}		
	},[TangentR])

	useEffect(()=>{
		let resp;
		if (TangentR && TangentL  && selectedInletPath) {
			resp = inlet.inletTangentL (TangentL, selectedInletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath		
				inlet.applyNewPaths(paths)
			}
		}		
	},[TangentL])

	useEffect(()=>{
		let resp;
		if (DirectL && selectedInletPath) {
			resp = inlet.inletDirectL (DirectL, selectedInletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath		
				inlet.applyNewPaths(paths)
			}
		}		
	},[DirectL])

	useEffect(()=>{
		let resp;
		if (DirectA && selectedInletPath) {
			let classes = svgStore.getElementByCidAndClass ( selectedCid, 'contour', 'class')
			let contourType = classes.includes('inner') ? 'inner' : 'outer'
			resp = inlet.inletDirectA (DirectA, selectedInletPath, selectedPath, contourType)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath		
				inlet.applyNewPaths(paths)
			}
		}		
	},[DirectA])

	useEffect(() => {
		let inletMode = inlet.detectInletType ( selectedInletPath )
		setType(inletMode)
 	}, [ selectedInletPath, selectedCid])

	useEffect(() => {
		let inletMode = inlet.detectInletType ( selectedInletPath )
		setInletParams(inletMode)
		editorStore.setInletMode(mode)
		console.log ("Set mode" + mode)
	}, [ selectedCid, mode])

	const panelInfo = [
		{
			id: 'inletPopup',
			fa: (<>
				<Icon icon="ion:enter-outline" width="24" height="24" style={{ color: 'white' }} className='me-2' /><div>{t('Inlet')}</div></>),
			content: (
				<div className="d-flex flex-column">
					<table className="table mb-0">
						<tbody>
							<tr>
								<td colSpan={3}>
									<div className="ms-4 d-flex">
										<input 
											id="preventDangerInlets" className="" 
											type="checkbox" 
											onChange={ (e)=>{ setSafeMode(e.target.checked);}}/>
										<label
											className="form-check-label ms-2"
											htmlFor="preventDangerInlets"
										>{t('Prevent danger inlets and outlets')}</label>
									</div>
								</td>
							</tr>
							<tr>
								<td colSpan={3}>
									<div className="d-flex align-items-center ms-4 justify-content-around">
										<div className="d-flex align-items-center">
											<div>
												<i className="fa-solid fa-arrows-left-right-to-line" />
											</div>
											<input
												className="mx-2"
												id="inletIntend"
												type="number"
												placeholder={2}
												min={1}
												max={5}
												step={1}
												value={inletIntend} 
												onChange={(e) => {
													const value = Number(e.target.value);
													setInletIntend(Math.min(5, Math.max(1, value)));
												}}
											/>
											<div>{t('mm')}</div>
										</div>
										<div className="ms-2">
											<button 
												className="btn btn-sm btn-primary btn_ShowDangerInlets"
												onMouseDown={ ()=>{ inlet.findDangerInletsOutlets() }}
												>{t('Show danger inlets outlets')}</button>
										</div>
									</div>
								</td>
							</tr>
							<tr>
								<td colSpan={3} className='d-flex justify-content-around'>
									<div className="d-flex">
										<input
											className="form-check-input mt-0 inletMode"
											type="radio"
											name="inletMode"
											id="inletModeSet"
											//onMouseDown={() => { setMode('set') }}
											onChange={() => { setMode('set') }}
											checked={mode === 'set'}										
										/>
										<label className="form-check-label mx-1" htmlFor="inletModeSet">{t('Set')}</label>
									</div>
									<div className="d-flex">
										<input
											className="form-check-input mt-0 inletMode"
											type="radio"
											name="inletMode"
											id="inletModeEdit"
											//onMouseDown={() => { setMode('edit') }}
											onChange={() => { setMode('edit') }}
											checked={mode === 'edit'}										
										/>
										<label className="form-check-label mx-1" htmlFor="inletModeEdit">{t('Edit')}</label>
									</div>
									<div className="d-flex">
										<input
											className="form-check-input mt-0 inletMode"
											type="radio"
											name="inletMode"
											id="inletModeMove"
											//onMouseDown={() => { setMode('move') }}
											onChange={() => { setMode('move') }}
											checked={mode === 'move'}											
										/>
										<label className="form-check-label mx-1" htmlFor="inletModeMove">{t('Move')}</label>
									</div>
								</td>
							</tr>

						</tbody>
					</table>
					<table className="table">
						<tbody>
							<tr>
								<td className="w-50">
									<div className="form-check text-left ms-4">
										<input
											className="form-check-input mt-0 mt-0 inputInletType"
											type="radio"
											name="inletType"
											id="inletTypeStraight"
											disabled={mode !== 'set'}
											checked={type === 'Straight'}
											//onMouseDown={()=>{ setNewInlet('Straight')}}
											onChange={()=>{ setNewInlet('Straight')}}

										/>
										<label className="form-check-label mx-1" htmlFor="inletTypeStraight">
											<div>{t('Straight')}</div>
										</label>
									</div>
									<div className="form-check text-left ms-4">
										<input
											className="form-check-input mt-0 inputInletType"
											type="radio"
											name="inletType"
											id="inletTypeDirect"
											disabled={mode !== 'set'}
											checked={type === 'Direct'}
											//onMouseDown={()=>{ setNewInlet('Direct')}}
											onChange={()=>{ setNewInlet('Direct')}}
										/>
										<label className="form-check-label mx-1" htmlFor="inletTypeDirect">
											<div>{t('Direct')}</div>
										</label>
									</div>
									<div className="form-check text-left ms-4">
										<input
											className="form-check-input mt-0 inputInletType"
											type="radio"
											name="inletType"
											id="inletTypeHook"
											disabled={mode !== 'set'}
											checked={type === 'Hook'}
											//onMouseDown={()=>{ setNewInlet('Hook')}}
											onChange={()=>{ setNewInlet('Hook')}}

										/>
										<label className="form-check-label mx-1" htmlFor="inletTypeHook">
											<div>{t('Hook')}</div>
										</label>
									</div>
									<div className="form-check text-left ms-4">
										<input
											className="form-check-input mt-0 inputInletType"
											type="radio"
											name="inletType"
											id="inletTypeTangent"
											disabled={mode !== 'set'}
											checked={type === 'Tangent'}
											//onMouseDown={()=>{ setNewInlet('Tangent')}}
											onChange={()=>{ setNewInlet('Tangent')}}
										/>
										<label className="form-check-label mx-1" htmlFor="inletTypeTangent">
											<div>{t('Tangent')}</div>
										</label>
									</div>
								</td>
								<td colSpan={2}>
									<div id="inlet_viewer__wrapper">
										<img id="inlet_viewer__wrapper__img" src={
											type === "Straight" ? Straight :
												type === "Hook" ? Hook :
													type === "Direct" ? Direct :
														type === "Tangent" ? Tangent : ''
										} alt="no img"
										/>
									</div>
								</td>
							</tr>
							<tr>
								<td colSpan={2}>
									<div className="d-flex ms-3">
										<button
											className="btn btn-sm btn-primary btn_inletApplyForAll"
											id="inletApplyForAll"
											onMouseDown={ () =>{ setInletForAll() } }
										>{t('Apply for all')}</button>
									</div>
								</td>
							</tr>
							<tr>
								<td colSpan={2} id="inletParams" >
									{
										(type === "Straight" && mode === 'edit') ? ('') :
											(type === "Hook" && mode === 'edit') ? (
												<div className="d-flex flex-column">
													<div className="d-flex justify-content-center">
														<div className="d-flex align-items-center"><div className="mr-2">
															<div className='popup_input_label'>{t('r')}</div>
														</div>
															<div>
																<input
																	className="popup_input mx-2"
																	type="number"
																	min="0.1"
																	id="inletHookR"
																	step="0.05"
																	value={HookR}
																	onChange={(e) => setHookR(parseFloat(e.target.value))}
																/>
															</div>
															<div className="ml-2">
																<div className='popup_input_label'>{t('mm')}</div>
															</div>
														</div>
													</div>
													<div className="d-flex justify-content-center">
														<div className="d-flex align-items-center"><div className="mr-2">
															<div className='popup_input_label'>{t('d')}</div>
														</div>
															<div>
															<input
																className="popup_input mx-2"
																type="number"
																min="0.1"
																id="inletHookL"
																step="0.1"
																value={HookL}
																onChange={(e) => setHookL(parseFloat(e.target.value))}
															/>
															</div>
															<div className="ml-2">
																<div className='popup_input_label'>{t('mm')}</div>
															</div>
														</div>
													</div>
												</div>

											) :
												(type === "Direct"  && mode === 'edit' )? (
													<div className="d-flex flex-column">
														<div className="d-flex justify-content-center">
															<div className="d-flex align-items-center"><div className="mr-2">
																<div className='popup_input_label'>{t('l')}</div>
															</div>
																<div>
																	<input
																		className="popup_input mx-2"
																		type="number"
																		min="0.1"
																		id="inletDirectL"
																		step="0.1"
																		onChange={(e) => setDirectL(parseFloat(e.target.value))}
																		value={ Math.round( DirectL *1000)/1000}
																	/>
																</div>
																<div className="ml-2">
																	<div className='popup_input_label'>{t('mm')}</div>
																</div>
															</div>
														</div>
														<div className="d-flex justify-content-center">
															<div className="d-flex align-items-center">
																<div className="mr-2">
																<div className='popup_input_label'>{t('a')}</div>
															</div>
																<div>
																<input
																	className="popup_input mx-2"
																	type="number"
																	id="inletDirectA"
																	step={1}
																	min={0}
																	/* max={180} */
																	onChange={(e) => setDirectA(parseFloat(e.target.value))}
																	value={DirectA}
																/>
																</div>
																<div className="ml-2">
																	<div className='popup_input_label'>{t('deg')}</div>
																</div>
															</div>
														</div>
													</div>) :
													(type === "Tangent" && mode === 'edit')  ? (
													<div className="d-flex flex-column">
														<div className="d-flex justify-content-center">
															<div className="d-flex align-items-center"><div className="mr-2">
																<div className='popup_input_label'>{t('r')}</div>
															</div>
																<div>
																	<input
																		className="popup_input mx-2"
																		type="number"
																		min={0.1}
																		id="inletTangentR"
																		step={0.1}
																		onChange={(e) => setTangentR(parseFloat(e.target.value))}
																		value={TangentR}
																	/>
																</div>
																<div className="ml-2">
																	<div className='popup_input_label'>{t('mm')}</div>
																</div>
															</div>
														</div>
														<div className="d-flex justify-content-center">
															<div className="d-flex align-items-center"><div className="mr-2">
																<div className='popup_input_label'>{t('l')}</div>
															</div>
																<div>
																	<input
																		className="popup_input mx-2"
																		type="number"
																		min={0.1}
																		id="inletTangentL"
																		step={0.1}
																		onChange={(e) => setTangentL(parseFloat(e.target.value))}
 																		value={ Math.round(TangentL*1000)/1000 }
																	/>
																</div>
																<div className="ml-2">
																	<div className='popup_input_label'>{t('mm')}</div>
																</div>
															</div>
														</div>
													</div>) : ''
									}
								</td>
							</tr>
						</tbody>
					</table>
				</div>),
		},
	]
	return (
		<>
			{panelInfo.map((element) => (
				<Panel key={'panel' + 2} element={element} index={2} />
			))}
		</>
	);
})

export default InletPanel;