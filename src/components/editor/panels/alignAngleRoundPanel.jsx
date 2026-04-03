import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import CustomIcon from './../../../icons/customIcon.jsx';
import contourTransformSharedStore from '../../../store/contourTransformSharedStore.jsx';

const AlignAngleRoundPanel = observer(() => {
	const { t } = useTranslation();
	const cellRef = useRef(null);

	const { angle } = contourTransformSharedStore;

	const onAngleInput = (e) => {
		contourTransformSharedStore.captureAngleInput(e);
		contourTransformSharedStore.focusAngleInputEnd(cellRef);
	};

	const panelInfo = [
		{
			id: "alignAngleRoundPopup",
			fa: (
				<>
					<CustomIcon
						icon="octagon"
						width="24"
						height="24"
						color="black"
						fill="none"
						strokeWidth={1}
						viewBox='0 0 16 16'
						className={'m-2'}
					/>
					<div>{t('Align Angle Round')}</div>
				</>),
			content: (<div className="d-flex flex-column">

				<table className="table">
					<thead className="panelTableSectionHead">
						<tr>
							<th colSpan={5}>{t('Align')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<div className="d-flex align-items-center justify-content-around">
									<button
										type="button"
										onMouseDown={() => contourTransformSharedStore.alignItems('left')}
										className="btn text-white mt-1 btn_align btn_align-left"
									>
										<CustomIcon
											icon="xLeft"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => contourTransformSharedStore.alignItems('center-vertical')}
										className="btn text-white mt-1 btn_align btn_align-center-vertical"
									>
										<CustomIcon
											icon="xMid"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => contourTransformSharedStore.alignItems('right')}
										className="btn text-white mt-1 btn_align btn_align-right"
									>
										<CustomIcon
											icon="xRight"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => contourTransformSharedStore.alignItems('top')}
										className="btn text-white mt-1 btn_align btn_align-top"
									>
										<CustomIcon
											icon="yLeft"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>

									</button>
									<button
										type="button"
										onMouseDown={() => contourTransformSharedStore.alignItems('center-horizontal')}
										className="btn text-white mt-1 btn_align btn_align-center-horizontal"
									>
										<CustomIcon
											icon="yMid"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => contourTransformSharedStore.alignItems('bottom')}
										className="btn text-white mt-1 btn_align btn_align-bottom"
									>
										<CustomIcon
											icon="yRight"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<table className="table">
					<thead className="panelTableSectionHead">
						<tr>
							<th colSpan={5}>{t('Rounding')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="text-start ps-2">
								<div className="d-flex align-items-center justify-content-around">
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="round:angle"
											width="24"
											height="24"
											viewBox='0 0 1024 1024'
											color='black'
											fill='none'
											strokeWidth={50}
										/>
										<div className="ms-2">{t('Rounding radius')}</div>
										<input
											className="mx-2"
											id="rounding_radius"
											type="number"
											placeholder={1}
											min={0}
											max={10000}
											step={1}
											defaultValue={5}
										/>
										<div>{t('mm')}</div>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<table className="table mb-0">
					<thead className="panelTableSectionHead">
						<tr>
							<th colSpan={2}>{t('Angle')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className='align-middle w-50'>
								<div className="d-flex flex-row align-items-top justify-content-center">
									<CustomIcon
										icon="tabler:angle"
										width="24"
										height="24"
										color="black"
										fill="none"
										strokeWidth={1.5}
										className={'m-0'}
									/>
									<div
										style={{ fontFamily: '"Font Awesome 6 Pro"', marginTop: "-5px", marginLeft: "-10px" }}
									>
										°
									</div>
								</div>
							</td>
							<td
								ref={cellRef}
								id="contourRotateValue"
								className="editable w-50"
								contentEditable=""
								onKeyDown={(e) => contourTransformSharedStore.handleKeyDown(e)}
								onInput={onAngleInput}
							>
								{angle}
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
				<Panel key={'alignAngleRoundPanel' + index + 1} element={element} />
			))}
		</>
	);
})

export default AlignAngleRoundPanel;
