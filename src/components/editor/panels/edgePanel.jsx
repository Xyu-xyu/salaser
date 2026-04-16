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
	const [startX, setStartX] = useState('')
	const [startY, setStartY] = useState('')
	const [endX, setEndX] = useState('')
	const [endY, setEndY] = useState('')

	useEffect(() => {
		if (!selectedEdge) {
			setLL('')
			setRX('')
			setRY('')
			setStartX('')
			setStartY('')
			setEndX('')
			setEndY('')
			return
		}
		let normPath = util.normPath(selectedEdgePath)

		if (Array.isArray(normPath) && normPath.length >= 2) {
			const s = normPath[0]
			const e = normPath[1]
			const sx = s?.[s.length - 2]
			const sy = s?.[s.length - 1]
			const ex = e?.[e.length - 2]
			const ey = e?.[e.length - 1]
			if ([sx, sy, ex, ey].every((v) => typeof v === 'number' && Number.isFinite(v))) {
				setStartX(round(sx))
				setStartY(round(sy))
				setEndX(round(ex))
				setEndY(round(ey))
			} else {
				setStartX('')
				setStartY('')
				setEndX('')
				setEndY('')
			}
		} else {
			setStartX('')
			setStartY('')
			setEndX('')
			setEndY('')
		}

		if (selectedEdgePath.includes('L')) {
			let dist = util.distance(normPath[0][1], normPath[0][2], normPath[1][1], normPath[1][2])
			setLL(round(dist))
		}

		if (selectedEdgePath.includes('A')) {
			setRX(round(normPath[1][1]))
			setRY(round(normPath[1][2]))
		}

	}, [selectedEdge, selectedEdgePath])

	const getEdgeLogMeta = () => {
		if (!selectedEdge) return null;
		return {
			cid: selectedEdge.cid,
			segment: selectedEdge?.edge?.segIndex,
			pathType: selectedEdgePath?.includes('A') ? 'A' : (selectedEdgePath?.includes('L') ? 'L' : ''),
		};
	};

	const logEdgeAction = (message, meta = {}) => {
		const baseMeta = getEdgeLogMeta() || {};
		const merged = { ...baseMeta, ...meta };
		const metaString = Object.entries(merged)
			.filter(([, value]) => value !== undefined && value !== null && value !== '')
			.map(([key, value]) => `${key}=${value}`)
			.join(' ');
		addToLog(metaString ? `${message} (${metaString})` : message);
	};

	const toArc = () => {
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		if (segment < 1) {
			logEdgeAction('Edge: to arc failed', { reason: 'insufficient_points' });
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
		logEdgeAction('Edge: to arc', { rx: round(rx), ry: round(ry) });
	};


	const toLine = () => {
		let cid = selectedEdge.cid
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path')
		let updPath = util.normPath(newPath)
		let segment = selectedEdge.edge.segIndex
		updPath[segment] = ['L', updPath[segment][6], updPath[segment][7]]
		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 })
		inlet.applyNewPaths(res)
		logEdgeAction('Edge: to line')
	}

	const arcFlag = () => {
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		if (!updPath[segment] || updPath[segment][0] !== 'A') {
			logEdgeAction('Edge: toggle large-arc-flag failed', { reason: 'not_arc' });
			return;
		}

		let arcSegment = updPath[segment];

		// Меняем large-arc-flag (4-й параметр, индекс 4) с 0 на 1 и наоборот
		const prevFlag = arcSegment[4];
		arcSegment[4] = arcSegment[4] === 0 ? 1 : 0;

		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 });
		inlet.applyNewPaths(res);
		logEdgeAction('Edge: toggle large-arc-flag', { from: prevFlag, to: arcSegment[4] });
	};

	const sweepFlag = () => {
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		if (!updPath[segment] || updPath[segment][0] !== 'A') {
			logEdgeAction('Edge: toggle sweep-flag failed', { reason: 'not_arc' });
			return;
		}

		let arcSegment = updPath[segment];

		// Меняем sweep-flag (5-й параметр, индекс 5) с 0 на 1 и наоборот
		const prevFlag = arcSegment[5];
		arcSegment[5] = arcSegment[5] === 0 ? 1 : 0;

		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 });
		inlet.applyNewPaths(res);
		logEdgeAction('Edge: toggle sweep-flag', { from: prevFlag, to: arcSegment[5] });
	};

	const applyR = () => {
		const nextRX = Number(inputRX.current?.textContent);
		const nextRY = Number(inputRY.current?.textContent);
		if (!Number.isFinite(nextRX) || !Number.isFinite(nextRY)) {
			logEdgeAction('Edge: apply radius failed', { reason: 'invalid_radius' });
			return;
		}
		let cid = selectedEdge.cid;
		let newPath = partStore.getElementByCidAndClass(cid, 'contour', 'path');
		let updPath = util.normPath(newPath);
		let segment = selectedEdge.edge.segIndex;

		if (!updPath[segment] || updPath[segment][0] !== 'A') {
			logEdgeAction('Edge: apply radius failed', { reason: 'not_arc' });
			return;
		}

		let prevSegment = updPath[segment - 1];
		let currSegment = updPath[segment];

		let prevX = prevSegment[prevSegment.length - 2];
		let prevY = prevSegment[prevSegment.length - 1];
		let currX = currSegment[currSegment.length - 2];
		let currY = currSegment[currSegment.length - 1];

		let d1 = util.distance(prevX, prevY, currX, currY)*0.5
		if (d1 > nextRX && d1 > nextRY) {
			logEdgeAction('Edge: apply radius failed', { reason: 'radius_too_large', limit: round(d1) });
			return
		}

		const prevRX = updPath[segment][1];
		const prevRY = updPath[segment][2];
		updPath[segment][1] = nextRX
		updPath[segment][2] = nextRY

		let res = inlet.getNewInletOutlet(cid, 'contour', 'path', updPath.join(' ').replaceAll(',', ' '), { angle: 0, x: 0, y: 0 });
		inlet.applyNewPaths(res);
		logEdgeAction('Edge: apply radius', { from: `${round(prevRX)}×${round(prevRY)}`, to: `${round(nextRX)}×${round(nextRY)}` });

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
								<tr id="lineParameters">
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
								<tr id="lineCoordinates">
									<td className="text-start ps-2">
										<div className="d-flex align-items-center justify-content-center">
											<div className="d-flex align-items-center flex-wrap gap-2">
												<div className="me-2">
													<span className="me-1">{t('Start')}</span>
													<span className="panel_info_text">{startX}</span>
													<span className="mx-1">×</span>
													<span className="panel_info_text">{startY}</span>
												</div>
												<div>
													<span className="me-1">{t('End')}</span>
													<span className="panel_info_text">{endX}</span>
													<span className="mx-1">×</span>
													<span className="panel_info_text">{endY}</span>
												</div>
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
													ref={inputRX}
													contentEditable={true}
													suppressContentEditableWarning={true}
													className='panel_info_text ms-1 me-1'
													onInput={(e) => {
														setRX(e.target.innerText)
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
													ref={inputRY}
													contentEditable={true}
													suppressContentEditableWarning={true}
													className='panel_info_text ms-1 me-1'
													onInput={(e) => {
														setRY(e.target.innerText)
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
								<tr id="edgeCoordinates">
									<td className="text-start ps-2">
										<div className="d-flex align-items-center justify-content-center">
											<div className="d-flex align-items-center flex-wrap gap-2">
												<div className="me-2">
													<span className="me-1">{t('Start')}</span>
													<span className="panel_info_text">{startX}</span>
													<span className="mx-1">×</span>
													<span className="panel_info_text">{startY}</span>
												</div>
												<div>
													<span className="me-1">{t('End')}</span>
													<span className="panel_info_text">{endX}</span>
													<span className="mx-1">×</span>
													<span className="panel_info_text">{endY}</span>
												</div>
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