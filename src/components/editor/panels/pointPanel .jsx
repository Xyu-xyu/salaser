import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';

import partStore from "../../../store/partStore.jsx";
import { addToLog } from '../../../scripts/addToLog.jsx';
import util from '../../../scripts/util.jsx';
import CustomIcon from '../../../icons/customIcon.jsx';


const PointPanel = observer(() => {
	const inputRefX = useRef(null);
    const inputRefY = useRef(null);

	const { t } = useTranslation();
	const { selectedPointOnEdge } = partStore;

	const applyPointPosition = () => { 
		let x = +inputRefX.current.value
		let y = +inputRefY.current.value
		if (typeof x === 'number' && typeof y === 'number'){
			util.pointMoving(false, {x,y});	
			inputRefY.current.value = "";
			inputRefX.current.value = "";		
		}
		addToLog("Point position update")
	}

	const panelInfo = [
		{
			id: "pointPopup",
			fa: (<>
				<CustomIcon
					icon="point"
					width="36"
					height="36"
					color="black"
					fill="none"
					strokeWidth={2}
					className=""					
				/>
					<div>{t('Point')}</div>
				</>),
			content: (<div className="d-flex flex-column">
				<table className="table mb-0">
					<thead className="table-dark">
						<tr />
					</thead>
					<tbody>
						{/* TODO ДОПИЛИТЬ расчет углов */}
						<tr>
							{/* <td>
								<div className="d-flex align-items-center justify-content-center d-none">
									<div>{t('angle')}:</div>
									<div className="mx-2">
										{selectedPointOnEdge ? round(selectedPointOnEdge.angle) + '°' : ''}
									</div>
								</div>
							</td> */}
							{/* Второй <td> для координаты X */}
							<td colSpan={2}>
								<div className="d-flex align-items-center justify-content-center">
									<div>x:</div>
									<div className="">
										{selectedPointOnEdge ? util.round(selectedPointOnEdge.point.x, 2)+" " + t('mm') : ''}
									</div>
								</div>
							</td>
							{/* Третий <td> для координаты Y */}
							<td>
								<div className="d-flex align-items-center justify-content-start">
									<div>y:</div>
									<div className="">
										{selectedPointOnEdge ? util.round(selectedPointOnEdge.point.y, 2)+" " + t('mm') : ''}
									</div>
								</div>
							</td>
						</tr>
						<tr>
							<td colSpan={3}>
								<div className="d-flex flex-column align-items-center justify-content-center">
									<div className="d-flex align-items-center justify-content-around">
										<div className="d-flex align-items-center ms-2">
											<div>x</div>
											<input
												className="mx-2 popup_input "
												id="point_x"
												type="number"
												min={-10000}
												max={10000}
												step={1}
												onChange={() => {}}
												ref={inputRefX}
											/>
											<div>{t('mm')}</div>
										</div>
										<div className="d-flex align-items-center ms-2">
											<div className="">y</div>
											<input
												className="mx-2 popup_input "
												id="point_y"
												type="number"
												min={-10000}
												max={10000}
												step={1}
												onChange={() => {}}
												ref={inputRefY}
											/>
											<div>{t('mm')}</div>
										</div>
										<div className="d-flex align-items-center ms-2">
											<div>
												<button
													className="btn btn-secondary"
													onMouseDown={applyPointPosition}
												>
													{t('Apply')}
												</button>
											</div>
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
	]

	return (
		<>
			{selectedPointOnEdge && panelInfo.map((element, index) => (
				<Panel key={'panel' + 10} element={element} />
			))}
		</>
	);
})


export default PointPanel