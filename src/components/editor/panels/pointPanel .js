import Panel from './panel.js';
import '@fortawesome/fontawesome-free/css/all.css'
import { observer } from 'mobx-react-lite';
import svgStore from "../stores/svgStore.js";
import { useTranslation } from 'react-i18next';
import { useRef } from 'react';
import util from '../../utils/util.js';


const PointPanel = observer(() => {
	const inputRefX = useRef(null);
    const inputRefY = useRef(null);

	const { t } = useTranslation();
	const { selectedPointOnEdge } = svgStore;

	const applyPointPosition = () => { 
		let x = +inputRefX.current.value
		let y = +inputRefY.current.value
		if (typeof x === 'number' && typeof y === 'number'){
			util.pointMoving(false, {x,y});	
			inputRefY.current.value = "";
			inputRefX.current.value = "";		
		}
	}

	const round = (val, n=3)=>{
		return (Math.round (val*10**n)) / 10**n
	}

	const panelInfo = [
		{
			id: "pointPopup",
			fa: (<><i className="fa-solid fa-location-dot me-2"></i><div>{t('Point')}</div></>),
			content: (<div className="d-flex flex-column">
				<table className="table mb-0">
					<thead className="table-dark">
						<tr />
					</thead>
					<tbody>
						<tr>
							<td>
								<div className="d-flex align-items-center justify-content-center">
									<div>{t('angle')}:</div>
									<div className="mx-2">
										{selectedPointOnEdge ? round(selectedPointOnEdge.angle) + '°' : ''}
									</div>
								</div>
							</td>
							{/* Второй <td> для координаты X */}
							<td>
								<div className="d-flex align-items-center justify-content-center">
									<div>x:</div>
									<div className="">
										{selectedPointOnEdge ? round(selectedPointOnEdge.point.x) + t('mm') : ''}
									</div>
								</div>
							</td>
							{/* Третий <td> для координаты Y */}
							<td>
								<div className="d-flex align-items-center justify-content-center">
									<div>y:</div>
									<div className="">
										{selectedPointOnEdge ? round(selectedPointOnEdge.point.y) + t('mm') : ''}
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
				<Panel key={'panel' + index + 10} element={element} index={index + 10} />
			))}
		</>
	);
})


export default PointPanel