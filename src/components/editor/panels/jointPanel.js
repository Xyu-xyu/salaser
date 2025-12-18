import Panel from './panel.js';
import '@fortawesome/fontawesome-free/css/all.css'
import { observer } from 'mobx-react-lite';
import { useEffect, useRef } from 'react';
import util from '../../utils/util.js';
import { useTranslation } from 'react-i18next';
import CONSTANTS from '../../constants/constants.js';
import { addToLog } from './../../scripts/addToLog.jsx';
import jointStore from '../stores/jointStore.js';
import svgStore from '../stores/svgStore.js';
import editorStore from '../stores/editorStore.js';


const JointPanel = observer(() => {
	const { t } = useTranslation();
	const { jointsForSelectedCid } = jointStore
	const { selectedCid } = svgStore
	const jointQuantity = useRef(null);
	const jointDistance = useRef(null);

	const setJointQuantity =(e)=> {
		if (jointsForSelectedCid) {
			if ( jointsForSelectedCid.quantity) {
				jointStore.updJointVal( selectedCid, 'quantity', false ); 
			} else {
				let val = +jointQuantity.current.value
				jointStore.updJointVal( selectedCid, 'quantity', val ); 
			}
		} else {
			let val = +jointQuantity.current.value
			jointStore.updJointVal( selectedCid, 'quantity', val); 
		}
		addToLog("Updated joints")
	}

	const setNewJointQuantity =()=> {
		let val = +jointQuantity.current.value
		jointStore.updJointVal( selectedCid, 'quantity',val ); 
		addToLog("Updated joints")
	}

	const setNewJointDistance =()=> {
		let val = +jointDistance.current.value
		jointStore.updJointVal( selectedCid, 'distance',val ); 
		addToLog("Updated joints")
	}

	const updJointAtEnd = (e) => {
 		if (jointsForSelectedCid) {
			if (jointsForSelectedCid.atEnd) {
				jointStore.updJointVal(selectedCid, 'atEnd', false)
			} else {
				jointStore.updJointVal(selectedCid, 'atEnd', true)
			}
		} else {
			jointStore.updJointVal(selectedCid, 'atEnd', true)
		}
		addToLog("Updated joints")
	};

	const setJointDistance =(e)=> {
		if (jointsForSelectedCid && jointsForSelectedCid.distance) {
			jointStore.updJointVal( selectedCid, 'distance',!Boolean(jointsForSelectedCid && jointsForSelectedCid.distance) ); 
		} else {
			let val = +jointDistance.current.value
			jointStore.updJointVal( selectedCid, 'distance', val ); 
		}
		addToLog("Updated joints")
	}

	
	const panelInfo = 
		  {
			id: 'jointPopup',
			fa: (<><i className="fa-solid fa-xmark me-2" /><div>{t('Joint')}</div></>),
			content:  (
	<div className="d-flex flex-column">
		<table className="table">
			<tbody>
				<tr>
					<td>
						<div>
							<nav>
								<div className="nav nav-tabs mb-3" id="nav-tab" role="tablist">
									<button className="nav-link active" id="nav-jointAuto-tab" data-bs-toggle="tab"
										data-bs-target="#nav-jointAuto" type="button" role="tab"
										aria-controls="nav-jointAuto" aria-selected="true" tabIndex={-1}>
										{t('Avto')}
									</button>
									<button className="nav-link" id="nav-jointManual-tab" data-bs-toggle="tab"
										data-bs-target="#nav-jointManual" type="button" role="tab"
										aria-controls="nav-jointManual" aria-selected="false" tabIndex={-1}>
										{t('Manual')}
									</button>
									<button className="nav-link" id="nav-jointSize-tab" data-bs-toggle="tab"
										data-bs-target="#nav-jointSize" type="button" role="tab"
										aria-controls="nav-jointSize" aria-selected="false" tabIndex={-1}>
										{t('Size')}
									</button>
								</div>
							</nav>
							<div className="tab-content" id="nav-tabContent">
								<div className="tab-pane active show mb-2" id="nav-jointAuto" role="tabpanel"
									aria-labelledby="nav-jointAuto-tab">
									<div>
										<div className="d-flex align-items-baseline">
											<div className="form-check text-left ms-4">
												<input 
													className="form-check-input mt-0 mt-0 popup-input" 
													type="checkbox"
													name="jointAuto" 
													id="jointAutoDistributedD" 
													checked={!!jointsForSelectedCid?.distance} 
													onChange={ setJointDistance }												
												/>
												<label className="form-check-label" htmlFor="jointAutoDistributedD">
													<div>
														{t('Distance ')}
													</div>
												</label>
											</div>
											<div className="d-flex align-items-center">
												<input className="ms-3 popup_input me-1" 
													style={{ width: 50,
													textAlign: "center" }} 
													id="jointQuantityD" 
													type="number" 
													min={10}
													step={1} 
													defaultValue={50} 
													value={ jointsForSelectedCid && jointsForSelectedCid.distance ? jointsForSelectedCid.distance : 50}
													onChange={ setNewJointDistance }
													ref={jointDistance}
												/>
												{t('mm')}
											</div>
										</div>
										<div className="d-flex align-items-baseline">
											<div className="form-check text-left ms-4">
												<input 
													className="form-check-input mt-0 mt-0 popup-input" 
													type="checkbox"
													name="jointAuto" 
													id="jointAutoDistributed" 
													checked={!!jointsForSelectedCid?.quantity} 
													onChange={(e) => setJointQuantity(e.target.checked ? 1 : 0)}
												/>												
												<label className="form-check-label" htmlFor="jointAutoDistributed">
													<div>
														{t('Quantity')}
													</div>
												</label>
											</div>
											<div className="d-flex align-items-center">
												<input className="ms-3 popup_input me-1" 
													style={{ width: 50,
													textAlign: "center" }} 
													id="jointQuantity" 
													type="number" 
													min={1} 
													step={1}
													defaultValue={1} 
													onChange={ setNewJointQuantity }
													ref={jointQuantity}
													value={ jointsForSelectedCid &&  jointsForSelectedCid.quantity ? jointsForSelectedCid.quantity : 1}
												/>
												{t('pcs')}
											</div>
										</div>
										<div className="d-flex align-items-baseline mt-1">
											<div className="form-check text-left ms-4">
												<input className="form-check-input mt-0" 
													type="checkbox" 
													name="jointAuto"
													id="jointAutoToEnd"
													onChange={ updJointAtEnd } 
													checked={!!jointsForSelectedCid?.atEnd}
													/>
												<label className="form-check-label" htmlFor="jointAutoToEnd">
													<div>
														{t('toEnd')}
													</div>
												</label>
											</div>
										</div>
									</div>
								</div>
								<div className="tab-pane" id="nav-jointManual" role="tabpanel"
									aria-labelledby="nav-jointManual-tab">
									<div>
										<div className="d-flex align-items-baseline mt-1">
											<div className="form-check text-left ms-4" >
												<input
													className="btn_tool btn_add_joint form-check-input mt-0 mt-0 btn_joint_mode"
													type="radio" 
													name="jointManual" 
													id="jointManualAdd" 
													onChange={ ()=>{ editorStore.setMode('addJoint')}}												
													checked = {editorStore.mode === 'addJoint'}
													/>
												<label className="btn_tool btn_add_joint form-check-label"
													htmlFor="jointManualAdd">
													<div>
														{t('Add joint')}
													</div>
												</label>
											</div>
										</div>
										<div className="d-flex align-items-baseline mt-1">
											<div className="form-check text-left ms-4">
												<input
													className="btn_tool btn_remove_joint form-check-input mt-0 btn_joint_mode"
													type="radio" 
													name="jointManual" 
													id="jointManualRemove" 
													onChange={ ()=>{ editorStore.setMode('removeJoint')}}												
													checked = {editorStore.mode === 'removeJoint'}
													/>
												<label className="btn_tool btn_remove_joint form-check-label"
													htmlFor="jointManualRemove">
													<div>
														{t('Remove joint')}
													</div>
												</label>
											</div>
										</div>
										
									</div>
									<hr className="dropdown-divider" />
								</div>
								<div className="tab-pane" id="nav-jointSize" role="tabpanel"
									aria-labelledby="nav-jointManual-tab">
									<div>
										<div className="me-1" style={{ marginTop: 32 }}>
											<input style={{ width: 70, textAlign: "center" }} className="me-1 popup_input"
												type="number" 
												name="jointSize" 
												id="jointSize"
												defaultValue={CONSTANTS.defaultJointSize} 
												min={0} 
												max={5} 
												step="0.1" 												
											/>
											<label className="form-check-label" htmlFor="jointManualAdd">
												<div>{t('mm')}</div>
											</label>
										</div>
									</div>
									<hr className="dropdown-divider" />
								</div>
							</div>
						</div>
					</td>
				</tr>
			</tbody>
		</table> 
	</div>				
	)
}    
	
return (
	<>
		<Panel key={'panel' + 13} element={panelInfo} index={13} />
	</>
	);
})

export default JointPanel;