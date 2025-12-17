import React from 'react';
import Panel from './panel.jsx';
import partStore from "./../../../store/partStore.jsx";
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import CustomIcon from './../../../icons/customIcon.jsx';
//import jointStore from '../stores/jointStore';


const TecnologyPanel =  observer(() => {
	const { t } = useTranslation();
	const { tecnology } = partStore
	//const { jointPositions } = jointStore
	const panelInfo = [
		  {
			id: 'contourModesPopup',
			fa: (<>
					<CustomIcon
						icon="dashed"
						width="24"
						height="24"
						color="black"
						fill="black"
						strokeWidth={0}
						viewBox='0 0 24 24'
						className={'m-2'}
					/>
					<div>{t('Operating modes')}</div>
				</>),
	 		content: (
			  <div className="window-content">
				<div className="d-flex">
				  <table className="table">
					<tbody>
					{Array.from({ length: 8 }, (_, i) => `macro${i}`)
						.filter(macro => tecnology.includes(macro))
						.map((macro, i) => (
							<tr key={macro}>
							<td className="w-50">{t('Macro')} { macro.replace('macro', '') }</td>
							<td className="w-50">
								<div className="operating_mode__wrappper">
								<div className={`operating_mode ${macro}`} ></div>
								</div>
							</td>
							</tr>
						))
					}				 

					  <tr style={{ backgroundColor: '#212529' }}>
						<td colSpan="2">{t('Tags')}</td>
					  </tr>


{/* 					  { jointPositions.length > 0 && (<tr>
						<td>{t('Joint')}</td>
						<td>
						  <i className="fa-solid fa-xmark"></i>
						</td>
					  </tr>)} */}
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
