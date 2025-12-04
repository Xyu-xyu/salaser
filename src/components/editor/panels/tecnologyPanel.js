import React from 'react';
import { Icon } from '@iconify/react';
import Panel from './panel';
import '@fortawesome/fontawesome-free/css/all.css'
import svgStore from '../stores/svgStore';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import jointStore from '../stores/jointStore';


const TecnologyPanel =  observer(() => {
	const { t } = useTranslation();
	const { tecnology } = svgStore
	const { jointPositions } = jointStore
	const panelInfo = [
		  {
			id: 'contourModesPopup',
			fa: (<><Icon icon="mynaui:square-dashed-solid" width="24" height="24"  style={{color: 'white'}} className='me-2'/><div>{t('Operating modes')}</div></>),
	 		content: (
			  <div className="window-content">
				<div className="d-flex">
				  <table className="table">
					<tbody>
					{tecnology.includes('macro0') &&  (<tr>
						<td className="w-50">{t('Cutting')}</td>
						<td className="w-50">
						  <div className="operating_mode__wrappper">
							<div className="operating_mode cutting"></div>
						  </div>
						</td>
					  </tr>)}					  
					{tecnology.includes('macro1') && (<tr><td className="w-50">{t('Pulse')}</td>
						<td className="w-50">
						  <div className="operating_mode__wrappper">
							<div className="operating_mode pulse"></div>
						  </div>
						</td>
					  </tr>)}
					  {tecnology.includes('macro2') && (  <tr>
						<td className="w-50">{t('Engraving')}</td>
						<td className="w-50">
						  <div className="operating_mode__wrappper">
							<div className="operating_mode engraving"></div>
						  </div>
						</td>
					  </tr>)}					
					  {tecnology.includes('macro3') && ( <tr>
						<td className="w-50">{t('Process macro')} 3</td>
						<td className="w-50">
						  <div className="operating_mode__wrappper">
							<div className="operating_mode macro3"></div>
						  </div>
						</td>
					  </tr>)}
					  {tecnology.includes('macro4') && (<tr>
						<td className="w-50">{t('Process macro')} 4</td>
						<td className="w-50">
						  <div className="operating_mode__wrappper">
							<div className="operating_mode macro4"></div>
						  </div>
						</td>
					  </tr>)}
					  {tecnology.includes('macro5') && (<tr>
						<td className="w-50">{t('uncut contour')}</td>
						<td className="w-50">
						  <div className="operating_mode__wrappper">
							<div className="operating_mode macro5"></div>
						  </div>
						</td>
					  </tr>)}
					  <tr style={{ backgroundColor: '#212529' }}>
						<td colSpan="2">{t('Piercing')}</td>
					  </tr>
					  {tecnology.includes('pulse0') && (<tr>
						<td className="w-50">{t('Normal')}</td>
						<td className="w-50">
						  <div className="piercing_mode__wrappper">
							<div className="piercing_mode normal"></div>
						  </div>
						</td>
					  </tr>)}
					  {tecnology.includes('pulse2') && (<tr>
						<td className="w-50">{t('Without time')}</td>
						<td className="w-50">
						  <div className="piercing_mode__wrappper">
							<div className="piercing_mode without_time"></div>
						  </div>
						</td>
					  </tr>)}
					  {tecnology.includes('pulse1') && (<tr>
						<td className="w-50">{t('Pulsed')}</td>
						<td className="w-50">
						  <div className="piercing_mode__wrappper">
							<div className="piercing_mode pulse"></div>
						  </div>
						</td>
					  </tr>)}
					  <tr style={{ backgroundColor: '#212529' }}>
						<td colSpan="2">{t('Tags')}</td>
					  </tr>
					  { jointPositions.length > 0 && (<tr>
						<td>{t('Joint')}</td>
						<td>
						  <i className="fa-solid fa-xmark"></i>
						</td>
					  </tr>)}
					</tbody>
				  </table>
				</div>
			  </div>
			),
		  },
	]
	return (
		<>
			{panelInfo.map((element, index) => (
				<Panel key={'panel' + index+7} element={element} index={index+7} />
			))}
		</>
	);
});

export default TecnologyPanel;
