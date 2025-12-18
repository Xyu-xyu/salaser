import logStore from './../../../store/logStore'; 
import partStore from "./../../../store/partStore";
//import jointStore from "../stores/jointStore.js";
import { useEffect  } from 'react';
import log from './../../../scripts/log.jsx'
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import Panel from './panel.jsx';
import { addToLog } from './../../../scripts/addToLog.jsx';
import CustomIcon from './../../../icons/customIcon.jsx';


const LogPanel = observer(() => {
	const { t } = useTranslation();
	useEffect(() => {
		log.initDatabase()
			.then(() => {
				console.log('Database initialized.');	
				addToLog('Ready to work')
			})
			.catch((error) => {
				console.error('Error initializing database or saving data:', error);
			});
	}, []);
	
	const time = (t) => {
		const date = new Date(t);
		const hours = date.getHours().toString().padStart(2, "0"); 
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");
	  	return `${hours}:${minutes}:${seconds}`;
	};

	const restore = async (e) => {
		try {
			const tpoint = Number(e.currentTarget.getAttribute('data-stamp'));
			//console.log('Restore from', tpoint);
			const data = await log.load(tpoint);	
 			console.log('Loaded data:', data);
			let parsed = JSON.parse(data.svg)
			//let joints = JSON.parse(data.joints)
			if (parsed ) {
				const newSvgData = {
					width: parsed.width,
					height: parsed.height,
					code: parsed.code,
					params: parsed.params,
				  };
				partStore.setSvgData(newSvgData)
				//jointStore.setData(joints)
			}		
			logStore.makeNoteActive(tpoint)	
			
		} catch (error) {
			console.error('Error during restore:', error);
		}
	};

	const panelInfo = [
		  {
			id: 'logPopup',
			fa: (<>
			<CustomIcon
					icon="history"
					width="24"
					height="24"
					color="black"
					fill="black"
					strokeWidth={0}
					viewBox='0 0 16 16'
					className={'m-2'}
				/>
			<div>{t('History')}</div></>),
			content: (
				<div id="logger_wrapper">
				  <div id="logger">
					{logStore.log.map((element, index, arr) => (					  

						<div key={index+'logger'} className="log_mess"  data-stamp={ element.time } >
							<div className="d-flex justify-content-between pt-2">
								<div className="d-flex">
									<div className="messTime ms-2">
										<div className='font14'>{time(element.time)}</div>
									</div>
									<div className="ms-2">
										<div className="fs-6 text-start font14">
											{t(element.action)}
										</div>
									</div>
								</div>
								<div className="me-4">
									<button type="button" className={ element.active ? 
									'btn btn-sm mt-1 ms-2 btn-secondary btn-log-restore active' : 
									'btn btn-sm mt-1 ms-2 btn-secondary btn-log-restore'} 
									data-stamp={ element.time } 
									onMouseDown={restore}>{t('Restore')}</button>
								</div>                
							</div>              
							<div className="custom_devide mt-2"></div>
						</div>

					))}
				  </div>
				</div>
			  ),
		},    
	]
return (
	<>
		{panelInfo.map((element, index) => (
			<Panel key={'panel'+3} element={element} />
		))}
	</>
	);
})

export default LogPanel;


 