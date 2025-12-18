import React from 'react';
import Panel from './panel';
import '@fortawesome/fontawesome-free/css/all.css'
import svgStore from '../stores/svgStore';
import { observer } from 'mobx-react-lite';
import Util from '../../utils/util';
import Part from '../../scripts/part';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';


const PartPanel = observer(() => {
	const { t } = useTranslation();
	const [guidesMode, setGuidesMode] =useState(true)
	const checkCollisions =()=> {
		console.log (' checkCollisions ')
		let contours = svgStore.getFiltered('contour')
		let collision = Part.partDetectCollision( contours )
		console.log ( 'Colllsion', collision  )
		collision.forEach((cid)=>{
			let collider  =  svgStore.getElementByCidAndClass( cid, 'contour', 'class')
			collider += ' collision'
			svgStore.updateElementValue(cid, 'contour', 'class', collider)
		})

		setTimeout(()=>{
			collision.forEach((cid)=>{
				let collider  =  svgStore.getElementByCidAndClass( cid, 'contour', 'class')
				collider = collider.replace(' collision', '')
				svgStore.updateElementValue(cid, 'contour', 'class', collider)
			})
		},5000)
	}

	const setStoreGuidesMode = (mode)=>{
		setGuidesMode(mode)
		svgStore.setGuidesMode(mode)
	}

	const { svgData } = svgStore
	const panelInfo = [
		{
			id: 'partPopup',
			fa: (<><i className="fa-solid fa-gear me-2"></i><div>{t('Part data')}</div></>),
			content: (
				<div className="d-flex">
					<table className="table">
						<tbody>
						{/*  TODO add or not ??	<tr>
								<td>{t('id')}</td>
								<td>{svgData.params.id}</td>
 							</tr> */}
							<tr>
								<td>{t('code')}</td>
								<td>{svgData.params.code}</td>
 							</tr>
							<tr>
								<td>{t('uuid')}</td>
								<td id="info_uuid" contentEditable=""> {svgData.params.uuid}</td>
							</tr>
							<tr>
								<td>{t('width')}</td>
 								<td>{Util.round (svgData.width, 3)}</td>
 							</tr>
							 <tr>
								<td>{t('height')}</td>
 								<td>{ Util.round(svgData.height, 3)}</td>
 							</tr>
							<tr>
								<td colSpan={3}>
									<div className='d-flex align-items-center justify-content-around'>
										<button 
										className="btn btn-sm btn-danger btn_partDetectCollision me-2"
										onMouseDown={ checkCollisions }
										>
											{t('Check collision')}
										</button>								
 										<input 
											id="ignoreColissions" 
											type="checkbox" />
										<label
											className="form-check-label"
											htmlFor="ignoreColissions"
										>{t('Ignore contour collisions')}
										</label>
 										<input 
											id="guidesMode" 
											type="checkbox" 
											checked={guidesMode}
											onChange={ (e)=>{ setStoreGuidesMode(e.target.checked);}}/>
										<label
											className="form-check-label"
											htmlFor="guidesMode"
										>{t('Use guides')}
										</label>
									</div>									
								</td>
							</tr>
						</tbody>
					</table>
				</div>
			),
		},
	]
	return (
		<>
			{panelInfo.map((element, index) => (
				<Panel key={'panel' + 6} element={element} index={6} />
			))}
		</>
	);
});

export default PartPanel;
