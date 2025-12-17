import { observer } from 'mobx-react-lite';
import partStore from "./../../../store/partStore.jsx";
//import editorStore from "./../../../store/editorStore.jsx";
import { useEffect, useState } from 'react';
import Hook from './../../../images//Hook.jpg';
import Direct from './../../../images/Direct.jpg';
import Straight from './../../../images/Straight.jpg';
import Tangent from './../../../images//Tangent.jpg';
import SVGPathCommander from 'svg-path-commander';
import util from './../../../scripts/util.jsx';
import inlet from './../../../scripts/inlet.jsx'
import Panel from './panel.jsx';
//import CONSTANTS from './../../../store/constants.jsx';
import { addToLog } from './../../../scripts/addToLog.jsx';
import { useTranslation } from 'react-i18next';
import CustomIcon from './../../../icons/customIcon.jsx';


const OutletPanel = observer(() => {
	const { t } = useTranslation();
	const {
		selectedCid,
		selectedPath,
		selectedOutletPath
	} = partStore;

	const [type, setType] = useState(Straight)
	const [mode, setMode] = useState(null)
	const [TangentL, setTangentL] = useState(0);
	const [TangentR, setTangentR] = useState(0);
	const [HookL, setHookL] = useState(0);
	const [HookR, setHookR] = useState(0);
	const [DirectA, setDirectA] = useState(90);
	const [DirectL, setDirectL] = useState(0);

	useEffect(() => {
		let outletMode = inlet.detectInletType ( selectedOutletPath )
		setType(outletMode)
 	}, [ selectedOutletPath, selectedCid])

	 useEffect(() => {
		let mode = inlet.detectInletType ( selectedOutletPath )
		setOutletParams(mode)
	}, [ selectedCid, mode])

	 useEffect(()=>{
		let resp;
		if (DirectL && selectedOutletPath) {
			resp = inlet.outletDirectL (DirectL, selectedOutletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.outlet = resp.newOutletPath		
 				inlet.applyNewPaths(paths)
				setOutletParams ()
			}	
		}		
	},[DirectL])


	useEffect(()=>{
		let resp;
		if (DirectA && selectedOutletPath) {
			let classes = partStore.getElementByCidAndClass ( selectedCid, 'contour', 'class')
			let contourType = classes.includes('inner') ? 'inner' : 'outer'
			resp = inlet.outletDirectA (DirectA, selectedOutletPath, selectedPath, contourType)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.outlet = resp.newOutletPath		
 				inlet.applyNewPaths(paths)
				setOutletParams ()
			}	
		}		
	},[DirectA])

	useEffect(()=>{
		let resp;
		if (TangentR && TangentL  && selectedOutletPath) {
			resp = inlet.outletTangentR (TangentR, TangentL, selectedOutletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.outlet = resp.newOutletPath		
 				inlet.applyNewPaths(paths)
				setOutletParams ()
			}	
		}		
	},[TangentR])

	useEffect(()=>{
		let resp;
		if (TangentR && TangentL  && selectedOutletPath) {
			resp = inlet.outletTangentL (TangentL, selectedOutletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.outlet = resp.newOutletPath		
 				inlet.applyNewPaths(paths)
				setOutletParams ()
			}	
		}		
	},[TangentL])
	
	useEffect(()=>{
		let resp;
		if (HookR &&  HookL && selectedOutletPath) {
			resp = inlet.outletHookR (HookR, HookL, selectedOutletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.outlet = resp.newOutletPath		
 				inlet.applyNewPaths(paths)
				setOutletParams ()
			}					
		}		
	},[HookR])

	useEffect(()=>{
		let resp;
		if (HookR &&  HookL && selectedOutletPath) {
			resp = inlet.outletHookL (HookL, HookR, selectedOutletPath)
			if ( resp ) {
				let paths = {}
				paths.cid = selectedCid
				paths.outlet = resp.newOutletPath		
 				inlet.applyNewPaths(paths)
				setOutletParams ()
			}			
		}		
	},[HookL])


	const setNewOutlet = (newType) =>{
		console.log(newType)
		if (type === newType) return;
		let classes = partStore.getElementByCidAndClass ( selectedCid, 'contour', 'class')
		let contourType = classes.includes('inner') ? 'inner' : 'outer'	
		let resp = inlet.setOutletType (newType, false, 'set', selectedPath, selectedOutletPath, contourType)
		if ( resp ) {
			let paths = {}
			paths.cid = selectedCid
			paths.outlet = resp.newOutletPath		
			paths.log = 'Set outlet type'
			inlet.applyNewPaths(paths)
			setOutletParams ()
		}
	}

	const setOutletForAll = () =>{
		console.log ('setoutletForAll')
		let mode = inlet.detectInletType ( selectedOutletPath )
		let outlets = partStore.getFiltered("outlet")
		if (mode) {
			for (let i in  outlets ) {
				let element = outlets[i]
				let contourType = element.class.includes('inner') ? 'inner' : 'outer'	
				let outletPath = element.path
				let contour = partStore.getElementByCidAndClass ( element.cid, 'contour')

				let resp = inlet.setOutletType (mode, false, 'set', contour.path, outletPath, contourType)
				if (resp ) {
					let paths = {}
					paths.cid = element.cid
					paths.outlet = resp.newOutletPath		
					inlet.applyNewPaths(paths)
					setOutletParams ()
				}
			}
			addToLog(`Set outlet type ${mode} for all`)
		}
	}

	const setOutletParams = (mode) => {
		if (mode === 'Tangent') {
            let R;
            let path =  SVGPathCommander.normalizePath(selectedOutletPath)
            path.forEach((seg)=>{
                if (seg[0] === "A" ) {
                    R=seg[1]
                }
            })
            setTangentR(R)
            let L =  util.arcLength(selectedOutletPath)//Math.round(util.arcLength(selectedOutletPath)*1000)/1000
            setTangentL(L)
        } else if (mode === 'Direct') {
          
            let A, MX, MY, LX, LY, D, PX, PY;
            let path =  SVGPathCommander.normalizePath(selectedOutletPath)
            if (path && path.length) {
                path.forEach( seg=>{
                    if ( seg.includes('M')) {
                        LX=seg[1]
                        LY=seg[2]
                    }
                    if ( seg.includes('L')) {
                        MX=seg[1]
                        MY=seg[2]    
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

        } else if (mode === 'Hook') {

            let MX, MY, LX, LY, R, D;
            let path =  SVGPathCommander.normalizePath(selectedOutletPath)
            if (path.length) {
                path.forEach( seg=>{
                    if ( seg.includes('M')) {
                        MX=seg[1]
                        MY=seg[2]
                    } else if ( seg.includes('L')) {
                        LX=seg[1]
                        LY=seg[2]    
                    } else if (seg.includes('A')){
                        R=seg[1]
                    }
                }) 
            }
            D = util.round( util.distance( MX, MY, LX, LY ), 3)
            setHookR(R)
            setHookL(D)
        }
	} 



	const panelInfo = [
		  {
			id: 'outletPopup',
			fa: (<>
			<CustomIcon
					icon="outlet"
					width="24"
					height="24"
					color="black"
					fill="none"
					strokeWidth={50}
					viewBox='0 0 512 512'
					className={'m-2'}
				/>
			<div>{t('Outlet')}</div></>),
			content:  (
				<div className="d-flex flex-column">
					<table className="table mb-0">
						<tbody>
							<tr>
								<td colSpan={3} className='d-flex justify-content-around'>
									<div className="d-flex">
										<input
											className="form-check-input mt-0 outletMode"
											type="radio"
											name="outletMode"
											id="outletModeSet"
											//onMouseDown={() => { setMode('set') }}
											onChange={() => { setMode('set') }}
											checked={mode === 'set'}
										/>
										<label className="form-check-label mx-1" htmlFor="outletModeSet">{t('Set')}</label>
									</div>
									<div className="d-flex">
										<input
											className="form-check-input mt-0 outletMode"
											type="radio"
											name="outletMode"
											id="outletModeEdit"
											//onMouseDown={() => { setMode('edit') }}
											onChange={() => { setMode('edit') }}
											checked={mode === 'edit'}
										/>
										<label className="form-check-label mx-1" htmlFor="outletModeEdit">{t('Edit')}</label>
									</div>									
								</td>
							</tr>

						</tbody>
					</table>
					<table className="table">
						<tbody>
							<tr>
								<td className="w-50">
									<div className='d-flex flex-column align-items-baseline justify-content-between h-100 mt-2'
										style={{marginLeft :"18px"}}>
										<div className="form-check text-left m-0 p-0">
											<input
												className="form-check-input mt-0 mt-0 inputOutletType"
												type="radio"
												name="outletType"
												id="outletTypeStraight"
												disabled={mode !== 'set'}
												checked={type === 'Straight'}
												//onMouseDown={()=>{ setNewOutlet('Straight')}}
												onChange={()=>{ setNewOutlet('Straight')}}
											/>
											<label className="form-check-label mx-1" htmlFor="outletTypeStraight">
												<div>
												{t('Straight')}
												</div>
											</label>
										</div>
										<div className="form-check text-left m-0 p-0">
											<input
												className="form-check-input mt-0 inputOutletType"
												type="radio"
												name="outletType"
												id="outletTypeDirect"
												disabled={mode !== 'set'}
												checked={type === 'Direct'}
												//onMouseDown={()=>{ setNewOutlet('Direct')}}
												onChange={()=>{ setNewOutlet('Direct')}}

											/>
											<label className="form-check-label mx-1" htmlFor="outletTypeDirect">
												<div>{t('Direct')}</div>
											</label>
										</div>
										<div className="form-check text-left m-0 p-0">
											<input
												className="form-check-input mt-0 inputOutletType"
												type="radio"
												name="outletType"
												id="outletTypeHook"
												disabled={mode !== 'set'}
												checked={type === 'Hook'}
												//onMouseDown={()=>{ setNewOutlet('Hook')}}
												onChange={()=>{ setNewOutlet('Hook')}}

											/>
											<label className="form-check-label mx-1" htmlFor="outletTypeHook">
												<div>{t('Hook')}</div>
											</label>
										</div>
										<div className="form-check text-left m-0 p-0">
											<input
												className="form-check-input mt-0 inputOutletType"
												type="radio"
												name="outletType"
												id="outletTypeTangent"
												disabled={mode !== 'set'}
												checked={type === 'Tangent'}
												//onMouseDown={()=>{ setNewOutlet('Tangent')}}
												onChange={()=>{ setNewOutlet('Tangent')}}

											/>

											<label className="form-check-label mx-1" htmlFor="outletTypeTangent">
												<div>{t('Tangent')}</div>
											</label>
										</div>
									</div>
								</td>
								<td colSpan={2}>
									<div id="outlet_viewer__wrapper">
										<img id="outlet_viewer__wrapper__img" src={
											type === "Straight" ? Straight :
												type === "Hook" ? Hook :
													type === "Direct" ? Direct :
														type === "Tangent" ? Tangent : ''
										}
										alt="pic"/>
									</div>
								</td>
							</tr>
							<tr>
								<td colSpan={2}>
									<div className="d-flex ms-3">
										<button
											className="btn btn-sm btn-primary btn_outletApplyForAll"
											id="outletApplyForAll"
											onMouseDown={()=>{ setOutletForAll()}}
										>{t('Apply for all')}</button>
									</div>
								</td>
							</tr>
							<tr>
								<td colSpan={2} id="outletParams" >
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
																	id="outletHookR"
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
																id="outletHookL"
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
																		id="outletDirectL"
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
															<div className="d-flex align-items-center"><div className="mr-2">
																<div className='popup_input_label'>{t('a')}</div>
															</div>
																<div>
																<input
																	className="popup_input mx-2"
																	type="number"
																	id="outletDirectA"
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
																		id="outletTangentR"
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
																		id="outletTangentL"
																		step={0.1}
																		onChange={(e) => setTangentL(parseFloat(e.target.value))}
																		//onInput={(e) => setTangentL(parseFloat(e.target.value))}
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
				</div>)
		},    
	]
return (
	<>
		{panelInfo.map((element) => (
			<Panel key={'panel' + 5} element={element}/>
		))}
	</>
	);
})

export default OutletPanel;