import { observer } from 'mobx-react-lite';
import partStore from "./../../../store/partStore.jsx";
import editorStore from "./../../../store/editorStore.jsx";
import { useEffect, useState } from 'react';
import Hook from './../../../images/Hook.jpg';
import Direct from './../../../images/Direct.jpg';
import Straight from './../../../images/Straight.jpg';
import Tangent from './../../../images//Tangent.jpg';
import SVGPathCommander from 'svg-path-commander';
import util from './../../../scripts/util.jsx';
import inlet from './../../../scripts/inlet.jsx'
import Panel from './panel.jsx';
import CONSTANTS from './../../../store/constants.jsx';
import { addToLog } from './../../../scripts/addToLog.jsx';
import { useTranslation } from 'react-i18next';
import CustomIcon from './../../../icons/customIcon.jsx';


const InletPanel = observer(() => {
	const { t } = useTranslation();
	const {
		selectedCid,
		selectedPath,
		selectedInletPath
	} = partStore;

	const [type, setType] = useState(Straight)
	const [mode, setMode] = useState(null)
	const [TangentL, setTangentL] = useState(0);
	const [TangentR, setTangentR] = useState(0);
	const [HookL, setHookL] = useState(0);
	const [HookR, setHookR] = useState(0);
	const [DirectA, setDirectA] = useState(90);
	const [DirectL, setDirectL] = useState(0);
	const [safeMode, setSafeMode] = useState(false)
	const [inletIntend, setInletIntend] = useState(CONSTANTS.defaultInletIntend)



	const setNewInlet = (newType) => {
		console.log(newType)
		if (type === newType) return;
		let classes = partStore.getElementByCidAndClass(selectedCid, 'contour', 'class')
		let contourType = classes.includes('inner') ? 'inner' : 'outer'
		let resp = inlet.setInletType(newType, false, 'set', selectedPath, selectedInletPath, contourType)
		if (resp) {
			let paths = {}
			paths.cid = selectedCid
			paths.inlet = resp.newInletPath
			paths.log = 'Set inlet type'
			inlet.applyNewPaths(paths)
			setInletParams()
		}
	}

	useEffect(() => {
		partStore.setsafeMode({ mode: safeMode, intend: inletIntend })
		inlet.findDangerInletsOutlets()

	}, [safeMode, inletIntend])

	const setInletForAll = () => {
		console.log('setInletForAll')
		let inletMode = inlet.detectInletType(selectedInletPath)
		let inlets = partStore.getFiltered("inlet")
		if (inletMode) {
			for (let i in inlets) {
				let element = inlets[i]
				let contourType = element.class.includes('inner') ? 'inner' : 'outer'
				let inletPath = element.path
				let contour = partStore.getElementByCidAndClass(element.cid, 'contour')
				let resp = inlet.setInletType(inletMode, false, 'set', contour.path, inletPath, contourType)
				if (resp) {
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
			let path = SVGPathCommander.normalizePath(selectedInletPath)
			path.forEach((seg) => {
				if (seg[0] === "A") {
					R = seg[1]
				}
			})
			setTangentR(R)
			let L = util.arcLength(selectedInletPath)
			setTangentL(L)
		} else if (inletMode === 'Direct') {

			let A, MX, MY, LX, LY, D, PX, PY;
			let path = SVGPathCommander.normalizePath(selectedInletPath)
			if (path && path.length) {
				path.forEach(seg => {
					if (seg.includes('M')) {
						MX = seg[1]
						MY = seg[2]
					}
					if (seg.includes('L')) {
						LX = seg[1]
						LY = seg[2]
					}
				})
			}

			let contour = SVGPathCommander.normalizePath(selectedPath)
			contour.forEach((seg, i) => {
				if (i < 2) {
					if (seg.includes('M')) {
						PX = seg[1]
						PY = seg[2]
					} else if (seg.includes('L')) {
						PX = seg[1]
						PY = seg[2]
					} else if (seg.includes('V')) {
						PY = seg[1]
					} else if (seg.includes('H')) {
						PX = seg[1]
					} else if (seg.includes('A')) {
						PX = seg[6]
						PY = seg[7]
					}
				}
			})

			A = Math.round(util.calculateAngleVector(LX, LY, MX, MY, PX, PY) * 100) / 100
			D = util.distance(MX, MY, LX, LY)

			if (contour[1][0] === 'A') {
				let nearestSegment = contour[1]
				const rx = parseFloat(nearestSegment[1]);
				const ry = parseFloat(nearestSegment[2]);
				const flag1 = parseFloat(nearestSegment[3]);
				const flag2 = parseFloat(nearestSegment[4]);
				const flag3 = parseFloat(nearestSegment[5]);
				const EX = parseFloat(nearestSegment[6]);
				const EY = parseFloat(nearestSegment[7]);
				let C = util.svgArcToCenterParam(LX, LY, rx, ry, flag1, flag2, flag3, EX, EY, true)
				let OP = util.rotatePoint(C.x, C.y, LX, LY, 0, 270)
				A = Math.round(util.calculateAngleVector(LX, LY, MX, MY, OP.x, OP.y) * 100) / 100
				if (rx !== ry) {
					console.log('rx !=== ry')
				}
			}

			setDirectA(A)
			setDirectL(D)

		} else if (inletMode === 'Hook') {

			let MX, MY, R, EX, EY, D;
			let path = SVGPathCommander.normalizePath(selectedInletPath)
			if (path.length) {
				path.forEach(seg => {
					if (seg.includes('M')) {
						MX = seg[1]
						MY = seg[2]
					} else if (seg.includes('A')) {
						R = seg[1]
						EX = seg[6]
						EY = seg[7]
					}
				})
			}
			D = util.round(util.distance(MX, MY, EX, EY), 3)
			setHookR(R)
			setHookL(D)
		}
	}

	useEffect(() => {
		let resp;
		if (HookR && HookL && selectedInletPath) {
			resp = inlet.inletHookR(HookR, HookL, selectedInletPath)
			if (resp) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath
				inlet.applyNewPaths(paths)
			}
		}
	}, [HookR])

	useEffect(() => {
		let resp;
		if (HookR && HookL && selectedInletPath) {
			resp = inlet.inletHookL(HookL, HookR, selectedInletPath)
			if (resp) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath
				inlet.applyNewPaths(paths)
			}
		}
	}, [HookL])

	useEffect(() => {
		let resp;
		if (TangentR && TangentL && selectedInletPath) {
			resp = inlet.inletTangentR(TangentR, TangentL, selectedInletPath)
			if (resp) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath
				inlet.applyNewPaths(paths)
			}
		}
	}, [TangentR])

	useEffect(() => {
		let resp;
		if (TangentR && TangentL && selectedInletPath) {
			resp = inlet.inletTangentL(TangentL, selectedInletPath)
			if (resp) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath
				inlet.applyNewPaths(paths)
			}
		}
	}, [TangentL])

	useEffect(() => {
		let resp;
		if (DirectL && selectedInletPath) {
			resp = inlet.inletDirectL(DirectL, selectedInletPath)
			if (resp) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath
				inlet.applyNewPaths(paths)
			}
		}
	}, [DirectL])

	useEffect(() => {
		let resp;
		if (DirectA !==90 && selectedInletPath) {
			let classes = partStore.getElementByCidAndClass(selectedCid, 'contour', 'class')
			let contourType = classes.includes('inner') ? 'inner' : 'outer'
			resp = inlet.inletDirectA(DirectA, selectedInletPath, selectedPath, contourType)
			if (resp) {
				let paths = {}
				paths.cid = selectedCid
				paths.inlet = resp.newInletPath
				inlet.applyNewPaths(paths)
			}
		}
	}, [DirectA])

	useEffect(() => {
		let inletMode = inlet.detectInletType(selectedInletPath)
		setType(inletMode)
	}, [selectedInletPath, selectedCid])

	useEffect(() => {
		let inletMode = inlet.detectInletType(selectedInletPath)
		setInletParams(inletMode)
		editorStore.setInletMode(mode)
		console.log("Set mode" + mode)
	}, [selectedCid, mode])

	const panelInfo = [
		{
			id: 'inletPopup',
			fa: (<>
				<CustomIcon
					icon="inlet"
					width="24"
					height="24"
					color="black"
					fill="none"
					strokeWidth={50}
					viewBox='0 0 512 512'
					className={'m-2'}
				/>
				<div>{t('Inlet')}</div>
			</>),
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
											onChange={(e) => { setSafeMode(e.target.checked); }} />
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
												<CustomIcon
													icon="arrow_to_line"
													width="24"
													height="24"
													color="black"
													fill="black"
													strokeWidth={10}
													viewBox='0 0 640 640'
													className={'m-2'}
												/>
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
												onMouseDown={() => { inlet.findDangerInletsOutlets() }}
											>{t('Show danger')}</button>
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
									<div className='d-flex flex-column align-items-baseline justify-content-between h-100 mt-2'
										style={{marginLeft :"18px"}}>	
										<div className="form-check text-left m-0 p-0">
											<input
												className="form-check-input mt-0 mt-0 inputInletType"
												type="radio"
												name="inletType"
												id="inletTypeStraight"
												disabled={mode !== 'set'}
												checked={type === 'Straight'}
												//onMouseDown={()=>{ setNewInlet('Straight')}}
												onChange={() => { setNewInlet('Straight') }}

											/>
											<label className="form-check-label mx-1" htmlFor="inletTypeStraight">
												<div>{t('Straight')}</div>
											</label>
										</div>
										<div className="form-check text-left m-0 p-0">
											<input
												className="form-check-input mt-0 inputInletType"
												type="radio"
												name="inletType"
												id="inletTypeDirect"
												disabled={mode !== 'set'}
												checked={type === 'Direct'}
												//onMouseDown={()=>{ setNewInlet('Direct')}}
												onChange={() => { setNewInlet('Direct') }}
											/>
											<label className="form-check-label mx-1" htmlFor="inletTypeDirect">
												<div>{t('Direct')}</div>
											</label>
										</div>
										<div className="form-check text-left m-0 p-0 ">
											<input
												className="form-check-input mt-0 inputInletType"
												type="radio"
												name="inletType"
												id="inletTypeHook"
												disabled={mode !== 'set'}
												checked={type === 'Hook'}
												//onMouseDown={()=>{ setNewInlet('Hook')}}
												onChange={() => { setNewInlet('Hook') }}

											/>
											<label className="form-check-label mx-1" htmlFor="inletTypeHook">
												<div>{t('Hook')}</div>
											</label>
										</div>
										<div className="form-check text-left m-0 p-0">
											<input
												className="form-check-input mt-0 inputInletType"
												type="radio"
												name="inletType"
												id="inletTypeTangent"
												disabled={mode !== 'set'}
												checked={type === 'Tangent'}
												//onMouseDown={()=>{ setNewInlet('Tangent')}}
												onChange={() => { setNewInlet('Tangent') }}
											/>
											<label className="form-check-label mx-1" htmlFor="inletTypeTangent">
												<div>{t('Tangent')}</div>
											</label>
									</div>

								</div>	
								</td>
								<td colSpan={2}>
									<div id="inlet_viewer__wrapper">
										<img id="inlet_viewer__wrapper__img" src={
											type === "Straight" ? Straight :
												type === "Hook" ? Hook :
													type === "Direct" ? Direct : Tangent
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
											onMouseDown={() => { setInletForAll() }}
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
												(type === "Direct" && mode === 'edit') ? (
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
																		value={Math.round(DirectL * 1000) / 1000}
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
													(type === "Tangent" && mode === 'edit') ? (
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
																			value={Math.round(TangentL * 1000) / 1000}
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
			{panelInfo.map((element, index) => (
				<Panel key={'panel' + index +2} element={element}/>
				
			))}
		</>
	);
})

export default InletPanel;