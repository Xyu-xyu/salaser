import { useTranslation } from 'react-i18next';
import { useEffect, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import partStore from "./../../../store/partStore.jsx";
import util from './../../../scripts/util.jsx';
import inlet from './../../../scripts/inlet.jsx'
import Panel from './panel.jsx';
import { addToLog } from './../../../scripts/addToLog.jsx';
import CustomIcon from './../../../icons/customIcon.jsx';


const EdgePanel = observer(() => {
	const inputRX = useRef(null);
	const inputRY = useRef(null);

	const { selectedEdge,
		selectedEdgePath } = partStore
	const { t } = useTranslation();

	const round = (val, n = 3) => {
		return (Math.round(val * 10 ** n)) / 10 ** n
	}

	const [LL, setLL] = useState('')
	const [RX, setRX] = useState('')
	const [RY, setRY] = useState('')

	useEffect(() => {
		console.log('useEffedct selectedEdge')
		console.log(selectedEdge)

		if (!selectedEdge) {
			setLL('')
			setRX('')
			setRY('')
			return
		}
		let normPath = util.normPath(selectedEdgePath)
		console.log(normPath)

		if (selectedEdgePath.includes('L')) {
			let dist = util.distance(normPath[0][1], normPath[0][2], normPath[1][1], normPath[1][2])
			setLL(round(dist))
		}

		if (selectedEdgePath.includes('A')) {
			setRX(round(normPath[1][1]))
			setRY(round(normPath[1][2]))
		}

	}, [selectedEdge, selectedEdgePath])

	const toArc = () => {
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		console.log('segment ' + segment);
		console.log(updPath);

		if (segment < 1) {
			console.error("Невозможно преобразовать в дугу: недостаточно точек");
			return;
		}

		let prevSegment = updPath[segment - 1];
		let currSegment = updPath[segment];

		let prevX = prevSegment[prevSegment.length - 2];
		let prevY = prevSegment[prevSegment.length - 1];
		let currX = currSegment[currSegment.length - 2];
		let currY = currSegment[currSegment.length - 1];

		let dx = currX - prevX;
		let dy = currY - prevY;
		let distance = Math.sqrt(dx * dx + dy * dy);

		let rx = distance / 2;
		let ry = distance / 2;

		updPath[segment] = ['A', rx, ry, 0, 0, 1, currX, currY];

		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 });
		inlet.applyNewPaths(res);
		addToLog ("Edge transform")
	};


	const toLine = () => {
		let cid = selectedEdge.cid
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path')
		let updPath = util.normPath(newPath)
		let segment = selectedEdge.edge.segIndex
		updPath[segment] = ['L', updPath[segment][6], updPath[segment][7]]
		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 })
		inlet.applyNewPaths(res)
		addToLog ("Edge transform")
	}

	const arcFlag = () => {
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		console.log('segment ' + segment);
		console.log(updPath);

		if (!updPath[segment] || updPath[segment][0] !== 'A') {
			console.error("Выбранный сегмент не является дугой");
			return;
		}

		let arcSegment = updPath[segment];

		// Меняем large-arc-flag (4-й параметр, индекс 4) с 0 на 1 и наоборот
		arcSegment[4] = arcSegment[4] === 0 ? 1 : 0;

		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 });
		inlet.applyNewPaths(res);
	};

	const sweepFlag = () => {
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		if (!updPath[segment] || updPath[segment][0] !== 'A') {
			console.error("Выбранный сегмент не является дугой");
			return;
		}

		let arcSegment = updPath[segment];

		// Меняем sweep-flag (5-й параметр, индекс 5) с 0 на 1 и наоборот
		arcSegment[5] = arcSegment[5] === 0 ? 1 : 0;

		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 });
		inlet.applyNewPaths(res);
	};

	const applyR = () => {
		let RX = +inputRX.current.textContent
		let RY = +inputRX.current.textContent
		if (typeof RX !== 'number' || typeof RY !== 'number') return;
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		if (!updPath[segment] || updPath[segment][0] !== 'A') {
			console.error("Выбранный сегмент не является дугой");
			return;
		}

		let prevSegment = updPath[segment - 1];
		let currSegment = updPath[segment];

		let prevX = prevSegment[prevSegment.length - 2];
		let prevY = prevSegment[prevSegment.length - 1];
		let currX = currSegment[currSegment.length - 2];
		let currY = currSegment[currSegment.length - 1];

		let d1 = util.distance(prevX, prevY, currX, currY)*0.5
		if (d1 > RX && d1 > RY) {
			console.log("Imp[ossible radius")
			return
		}

		updPath[segment][1] = RX
		updPath[segment][2] = RY

		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 });
		inlet.applyNewPaths(res);

	}

	const panelInfo = [
		{
			id: "edgePopup",
			fa: (<>
			<CustomIcon
					icon="edge"
					width="24"
					height="24"
					color="black"
					fill="black"
					strokeWidth={1}
					viewBox='0 0 100 100'
					className={'m-2'}
				/>
			<div>{t('Edge')}</div></>),
			content: (
				<>
					<div className="d-flex flex-column">
						{selectedEdge && selectedEdgePath.includes('L') && <table className="table mb-0">
							<tbody>
								<tr id="edgeParameters">
									<td>
										<div className="d-flex align-items-center justify-content-center">
											<div className="d-flex align-items-center justify-content-around">
												<div>{t('Length')}:</div>
												<div
													className='panel_info_text ms-1'
												>
													{LL}
												</div>
												<div className='ms-1'>{t('mm')}</div>
												<div className="ms-2 d-none">{t('angle')}</div>
												<div></div>
												<button
													className="btn btn-secondary btn-sm to_arc ms-2"
													onMouseDown={toArc}
												>
													{t('To arc')}
												</button>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>}

						{selectedEdge && selectedEdgePath.includes('A') && <table className="table mb-0">
							<tbody>
								<tr id="edgeParameters">
									<td className="text-start ps-2">
										<div className="d-flex align-items-center justify-content-center">
											<div className="d-flex align-items-center">
												<div>rx</div>
												<div
													ref={inputRY}
													contentEditable={true}
													suppressContentEditableWarning={true}
													className='panel_info_text ms-1 me-1'
													onInput={(e) => {
														//setRX(e.target.innerText)
														setRY(e.target.innerText)
													}}
												>
													{RX}
												</div>
												<div>{t('mm')}</div>
											</div>
											<input
												className="mx-2"
												id="proportionRadius"
												type="checkbox"
												checked={true}
												disabled
												onChange={() => { }}
											/>

											<div className="d-flex align-items-center">
												<div className="">ry</div>
												<div
													ref={inputRX}
													contentEditable={true}
													suppressContentEditableWarning={true}
													className='panel_info_text ms-1 me-1'
													onInput={(e) => {
														setRX(e.target.innerText)
														//setRY(e.target.innerText)
													}}
												>
													{RY}
												</div>

												<div className="me-2">mm</div>
												<button
													className="btn btn-sm btn-secondary ms-2"
													onMouseDown={applyR}
												>{t('Apply')}
												</button>
											</div>
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<div className="d-flex align-items-center justify-content-center">
											<div className="d-flex align-items-center justify-content-around">
												<div className="form-check form-switch ms-2 me-2">
													<input
														className="form-check-input"
														type="checkbox"
														id="arcFlag2"
														onChange={arcFlag}
													/>
												</div>
												<div className="form-check form-switch mx-2">
													<input
														className="form-check-input"
														type="checkbox"
														id="arcFlag3"
														onChange={sweepFlag}
													/>
												</div>
											</div>
											 

											<button
												className="btn btn-secondary btn-sm to_line ms-2"
												onMouseDown={toLine}
											>
												{t('To line')}
											</button>
										</div>
									<div className="d-flex align-items-center justify-content-center d-none">
										<div className="d-flex align-items-center justify-content-around">
											<div style={{ marginRight: 28 }}>{t('Save points')}</div>
											<div className="form-check form-switch mx-2">
												<input
													className="form-check-input"
													type="checkbox"
													id="arcPrioritySwitcher"
												/>
											</div>
											<div>{t('Save arc angle')}</div>
										</div>
									</div>
								</td>
							</tr>
						</tbody>
				</table>}
				</div>
			</>
			)
		}
	]

return (
	<>
		{selectedEdge && panelInfo.map((element, index) => (
			<Panel key={'panel'+11} element={element} />
		))}
	</>
);
})


export default EdgePanel