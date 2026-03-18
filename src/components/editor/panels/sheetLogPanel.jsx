import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { observer } from 'mobx-react-lite';
import Panel from './panel.jsx';
import CustomIcon from './../../../icons/customIcon.jsx';
import sheetLog from './../../../scripts/sheetLog.jsx';
import sheetLogStore from './../../../store/sheetLogStore.jsx';
import { addToSheetLog } from './../../../scripts/addToSheetLog.jsx';

const SheetLogPanel = observer(() => {
	const { t } = useTranslation();

	useEffect(() => {
		if (sheetLogStore.log.length > 0) return;

		sheetLog.initDatabase()
			.then(() => {
				if (sheetLogStore.log.length === 0) {
					addToSheetLog('Ready to work');
				}
			})
			.catch((error) => {
				console.error('Error initializing sheet history:', error);
			});
	}, []);

	const time = (stamp) => {
		const date = new Date(stamp);
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		const seconds = date.getSeconds().toString().padStart(2, "0");
		return `${hours}:${minutes}:${seconds}`;
	};

	const restore = async (e) => {
		const tpoint = Number(e.currentTarget.getAttribute('data-stamp'));
		await sheetLog.restorePoint(tpoint);
	};

	const panelInfo = {
		id: 'sheetLogPopup',
		fa: (
			<>
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
				<div>{t('History')}</div>
			</>
		),
		content: (
			<div id="logger_wrapper">
				<div id="logger">
					{sheetLogStore.log.map((element, index) => (
						<div key={index + 'sheet-logger'} className="log_mess" data-stamp={element.time}>
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
									<button
										type="button"
										className={element.active
											? 'btn btn-sm mt-1 ms-2 btn-secondary btn-log-restore active'
											: 'btn btn-sm mt-1 ms-2 btn-secondary btn-log-restore'}
										data-stamp={element.time}
										onMouseDown={restore}
									>
										{t('Restore')}
									</button>
								</div>
							</div>
							<div className="custom_devide mt-2"></div>
						</div>
					))}
				</div>
			</div>
		),
	};

	return <Panel key={'panel' + 21} element={panelInfo} index={21} />;
});

export default SheetLogPanel;
