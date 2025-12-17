import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import partStore from "./../../../store/partStore.jsx";
import { useEffect, useState, useRef } from 'react';
import SVGPathCommander from 'svg-path-commander';
import util from './../../../scripts/util.jsx';
import inlet from './../../../scripts/inlet.jsx'
import { addToLog } from './../../../scripts/addToLog.jsx';
import { useTranslation } from 'react-i18next';
import CustomIcon from './../../../icons/customIcon.jsx';
import constants from '../../../store/constants.jsx';
import svgStore from '../../../store/svgStore.jsx';


const ContourPanel = observer(() => {
	const { t } = useTranslation();
	const {
		selected,
		selectedPath,
		selectedType,
		selectedCid,
		selectedContourModeType,
		selectedInletModeType,
		selectedPiercingType } = partStore;

	const setSelectedContourModeType = (e) => {
		let n = (Number(e.target.value))
		let newMode = 'macro' + n
		let selected = partStore.getSelectedElement()
		let oldMode = selected.class.split(' ').filter(a => a.startsWith('macro')).join('')
		if (selected) {
			let newClass = selected.class.replace(/macro\d/gm, '') + ' ' + newMode
			/*if (newMode === 'macro2') {
				newClass += 'macro2'
				partStore.removeElementByCidAndClass(selectedCid, 'inlet')
				partStore.removeElementByCidAndClass(selectedCid, 'outlet')
			}
			if (oldMode === 'macro2' && oldMode !== newMode) {
				newClass = newClass.replace('engraving', 'inner')
				let inlet = {
					cid: selectedCid,
					class: "inlet inner macro0 closed1",
					path: '',
					stroke: 'red',
					strokeWidth: 0.2,
				}

				let outlet = {
					cid: selectedCid,
					class: "outlet inner macro0 closed1",
					path: '',
					stroke: 'lime',
					strokeWidth: 0.2,
				};
				partStore.addElement(inlet)
				partStore.addElement(outlet)
			}*/

			partStore.updateElementValue(selected.cid, 'outlet', 'class', "outlet inner closed1 "+newMode)
			partStore.updateElementValue(selected.cid, 'contour', 'class', newClass)
			addToLog('Contour type changed')
		}
	}

	const setSelectedInletModeType = (e) => {
		let n = (Number(e.target.value))
		let newMode = 'macro' + n
		let selected = partStore.getSelectedElement()
		if (selected) {
			let inlet = partStore.getElementByCidAndClass(selected.cid, 'inlet')
			let newClass = inlet.class.replace(/macro\d/gm, '') + ' ' + newMode
			partStore.updateElementValue(selected.cid, 'inlet', 'class', newClass)
			addToLog('Inlet type changed')

		}
	}

	const setSelectedPiercingType = (e) => {
		let n = (Number(e.target.value))
		let newMode = 'pulse' + n
		let selected = partStore.getSelectedElement()
		if (selected) {
			let inlet = partStore.getElementByCidAndClass(selected.cid, 'inlet')
			let newClass = inlet.class.replace(/pulse-1/gm, '').replace(/pulse\d/gm, '') + ' ' + newMode
			partStore.updateElementValue(selected.cid, 'inlet', 'class', newClass)
			addToLog('Piercing type changed')
		}

	}

	const [activePoint, setActive] = useState('topYtopX')
	const [activeCooord, setActiveCoord] = useState({ x: 0, y: 0 })
	const [wh, setWH] = useState({ w: 0, h: 0 })
	const [angle, setAngle] = useState(0)
	const cellRef = useRef(null); 

	const contourPoint = (e) => {
		let id = e.currentTarget.getAttribute('id')
		setActive(id)
	}

	const [ macrosCount, setMacrosCount] = useState(0)
	useEffect (() =>{
		
		getAndCountMacros()

	},[])

	useEffect(() => {
 		updateState()
	}, [selected, selectedPath, activePoint])

	const updateState = () => {

		let x = 0
		let y = 0

		if (angle === 0) {
			setAngle('')
		} else {
			setAngle(0)
		}


		let path = partStore.getSelectedElement('path')
		if (!path) {
			setActiveCoord({ x, y })
			setWH({ w: x, h: y })
			return
		}

		const box = SVGPathCommander.getPathBBox(path);
		if (box) {
			let w = util.round(box.width, 2)
			let h = util.round(box.height, 2)
			setWH({ w, h })

		}

		if (activePoint.match(/topX/gm)) {
			x = box.x
		} else if (activePoint.match(/midX/gm)) {
			x = box.x + box.width * 0.5
		} else if (activePoint.match(/botX/gm)) {
			x = box.x2
		}

		if (activePoint.match(/topY/gm)) {
			y = box.y
		} else if (activePoint.match(/midY/gm)) {
			y = box.y + box.height * 0.5
		} else if (activePoint.match(/botY/gm)) {
			y = box.y2
		}

		if (activeCooord) setActiveCoord({ x: util.round(x, 2), y: util.round(y, 2) })
	}

	const captureInput = (event) => {
		// Get the current value from the event
		const newValue = event.currentTarget.textContent.trim();
		// Update the angle state, assuming the input should be a number
		if (!isNaN(newValue) && newValue !== '') {
			setAngle(Number(newValue)); // Convert string to number
		} else {
			// Handle invalid input if necessary
			console.warn('Invalid input, please enter a number');
			if (angle === 0) {
				setAngle('')
			} else {
				setAngle(0)
			}
		}
		const range = document.createRange();
		const selection = window.getSelection();

		// Устанавливаем диапазон в конец ячейки
		range.selectNodeContents(cellRef.current);
		range.collapse(false); // Сжимаем диапазон к концу
		selection.removeAllRanges(); // Убираем все выделения
		selection.addRange(range); // Добавляем новый диапазон 
	};

	async function getAndCountMacros () {
		let id = svgStore.svgData.presetId
 		const resp = await fetch(`${constants.SERVER_URL}/db/get_preset?id=${id}`, {
			method: "GET",
		});

		if (!resp.ok) throw new Error(`Ошибка: ${resp.statusText}`);
		const data = await resp.json();
		try {

			let count = data.preset.technology.macros.length
			setMacrosCount( count )

		} catch (error) {
			console.log ("Error in getAndCountMacros")			
		}
	}

	const onKeyDown = (e) => {
		let id = e.currentTarget.getAttribute('id')
		let val = Number(e.currentTarget.textContent)
		let path = partStore.getSelectedElement('path')
		let cid = partStore.getSelectedElement('cid')
		let classes = partStore.getElementByCidAndClass(cid, 'contour', 'class')

		//TODO нижнюю строку убрать и далее при вращении относительно любой точке
		// кроме центра необходимо учитывать смещение относительно высоты ширины

		if (id === 'contourRotateValue') setActive('midXmidY');

		if (!path) return;
		let params = {
			x: activeCooord.x,
			y: activeCooord.y,
			width: wh.w,
			height: wh.h,
			angle: angle,
			proportion: false//proportion
		}
		if (e.key === 'Enter' || e.key === 'Return' || e.key === 'Tab') {

			if (e.key === 'Enter') e.preventDefault();
			let updPathParams = util.transformContour(path, id, val, params)
			let newPath = updPathParams.newPath
			newPath = SVGPathCommander.normalizePath(newPath).toString().replaceAll(',', ' ')
			let res;
			if (id === 'contourRotateValue') {
				res = inlet.getNewInletOutlet(cid, 'contour', 'path', newPath, { angle: angle, x: activeCooord.x, y: activeCooord.y })
				inlet.applyNewPaths(res)
			} else {
				res = inlet.getNewInletOutlet(cid, 'contour', 'path', newPath)
				inlet.applyNewPaths(res)
			};
			//UPDATE SKELETON TEXT PARAMS
			if (classes && classes.includes('skeletonText') && res) {

				let textStart = partStore.getElementByCidAndClass(cid, 'contour', 'coords')
				let scaleX = partStore.getElementByCidAndClass(cid, 'contour', 'scaleX')
				let scaleY = partStore.getElementByCidAndClass(cid, 'contour', 'scaleY')

				let fakePath = 'M ' + textStart.x + ' ' + textStart.y
				let fuckPath = util.applyTransform(fakePath, updPathParams.scaleX, updPathParams.scaleY, updPathParams.translateX, updPathParams.translateY, { angle: angle, x: activeCooord.x, y: activeCooord.y })
				fuckPath = SVGPathCommander.normalizePath(fuckPath)
				let newStart = { x: fuckPath[0][1], y: fuckPath[0][2] };

				scaleX *= updPathParams.scaleX
				scaleY *= updPathParams.scaleY

				partStore.updateElementValues(cid, 'contour', {
					coords: newStart,
					scaleX: scaleX,
					scaleY: scaleY,
					angle: angle,
				});
			}
		}
	}

	const alignItems = (direction) => {
		console.log(direction)
		let newPath, xDif = 0, yDif = 0;
		let path = partStore.getSelectedElement('path')
		let cid = partStore.getSelectedElement('cid')
		let classes = partStore.getElementByCidAndClass(cid, 'contour', 'class')
		let outerPath = partStore.getOuterElement('path')
		let outerPathParams = SVGPathCommander.getPathBBox(outerPath)
		let innerPathParams = SVGPathCommander.getPathBBox(path)
		if (classes && classes.includes('outer')) {
			return;
		}
		if (direction === 'left') {
			xDif = outerPathParams.x - innerPathParams.x
		} else if (direction === 'right') {
			xDif = outerPathParams.x2 - innerPathParams.x2
		} else if (direction === 'center-horizontal') {
			yDif = outerPathParams.cy - innerPathParams.cy
		} else if (direction === 'top') {
			yDif = outerPathParams.y - innerPathParams.y
		} else if (direction === 'center-vertical') {
			xDif = outerPathParams.cx - innerPathParams.cx
		} else if (direction === 'bottom') {
			yDif = outerPathParams.y2 - innerPathParams.y2
		}
		newPath = util.applyTransform(path, 1, 1, xDif, yDif, { angle: angle, x: 0, y: 0 })
		let resp = inlet.getNewInletOutlet(cid, 'contour', 'path', newPath)
		let res = inlet.applyNewPaths(resp)
		//UPDATE SKELETON TEXT PARAMS
		if (classes && classes.includes('skeletonText') && res) {
			//console.log ('Двигаем блок текста')
			let textStart = partStore.getElementByCidAndClass(cid, 'contour', 'coords')
			let newStart = {
				x: textStart.x + xDif,
				y: textStart.y + yDif
			}
			partStore.updateElementValue(cid, 'contour', 'coords', newStart)
		}
	}

	const panelInfo = [
		{
			id: "contourPopup",
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
					<div>{t('Contour')}</div>
				</>),
			content: (<div className="d-flex flex-column">
				<table className="table mb-0">
					<tbody>
						<tr className='d-none'>
							<td colSpan={2} className="text-start ps-2">
								{t('Type')}:
							</td>
							<td colSpan={2}><div id="info_type">{t(selectedType)}</div></td>
						</tr>
						{/* Пирсинг тайп определяется только макросом  */}
						<tr style={{ height: "1.5rem" }} className='d-none'>
							<td colSpan={2} className="text-start ps-2">
								{t('Piercing')}:
							</td>
							<td colSpan={2} style={{ padding: "0 0.2rem" }} id="info_piercing_mode">
								<select
									className="form-select"
									id="piercingSelect"
									aria-label="Default select example"
									onChange={setSelectedPiercingType}
									value={selectedPiercingType}
								>
									<option value={-1} disabled={typeof selectedPiercingType === 'number'}>
										-- {t('Select Piercing Type')} --
									</option>
									<option value={0}>{t('normal')}</option>
									<option value={1}>{t('pulse')}</option>
									<option value={2}>{t('without time')}</option>
								</select>
							</td>
						</tr>
						{/* Пирсинг тайп определяется только макросом  */}
						<tr style={{ height: "1.5rem" }}>
							<td colSpan={2} className="text-start ps-2">
								{t('Inlet')}:
							</td>
							<td
								colSpan={2}
								style={{ padding: "0 0.2rem" }}
								id="info_inlet_operating_mode"
							>
								<select
									id="operatingInletSelect"
									className="form-select"
									aria-label="Default select example"
									value={selectedInletModeType}
									onChange={setSelectedInletModeType}
								>
									<option value={-1} disabled={selectedInletModeType}>
										-- {t('Inlet Mode')} --
									</option>
									{
										Array.from({ length: Number(macrosCount) }, (_, index) => (
										<option key={index} value={index}>
											macro{index}
										</option>))
									}
								</select>
							</td>
						</tr>
						<tr style={{ height: "1.5rem" }}>
							<td colSpan={2} className="text-start ps-2">
								{t("Contour")}:
							</td>
							<td
								colSpan={2}
								style={{ padding: "0 0.2rem" }}
								id="info_contour_operating_mode"
							><div></div>

								<select
									id="operatingContourModeSelect"
									className="form-select"
									aria-label="Default select example"
									value={selectedContourModeType} // Привязка состояния
									onChange={setSelectedContourModeType}
								>
									<option value={-1} disabled={selectedContourModeType}>
										-- {t('Contour Mode')} --
									</option>
									{
										Array.from({ length: Number(macrosCount) }, (_, index) => (										
										<option key={index} value={index}>
											macro{index}
										</option>
										))
									}
								</select>
							</td>
						</tr>
					</tbody>
				</table>
				<table className="table mb-0">
					<thead className="table-dark">
						<tr>
							<th colSpan={5}>{t('Transformations')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td className="w-25" rowSpan={2}>
								<div
									style={{
										width: "initial",
										height: "5rem",
										display: "flex",
										justifyContent: "center",
										alignItems: "center"
									}}
								>
									<div
										style={{
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											height: "2.5rem"
										}}
									>
										<div className="containerPoint">
											<div
												id="topYtopX"
												onMouseDown={contourPoint}
												className={`contourPoint topY topX ${activePoint === 'topYtopX' ? 'active' : ''}`}
											/>
											<div
												id="topYbotX"
												onMouseDown={contourPoint}
												className={`contourPoint topY botX ${activePoint === 'topYbotX' ? 'active' : ''}`}
											/>
											<div
												id="botYtopX"
												onMouseDown={contourPoint}
												className={`contourPoint botY topX ${activePoint === 'botYtopX' ? 'active' : ''}`}
											/>
											<div
												id="botYbotX"
												onMouseDown={contourPoint}
												className={`contourPoint botY botX ${activePoint === 'botYbotX' ? 'active' : ''}`}
											/>
											<div
												id="midXtopY"
												onMouseDown={contourPoint}
												className={`contourPoint midX topY ${activePoint === 'midXtopY' ? 'active' : ''}`}
											/>
											<div
												id="midXbotY"
												onMouseDown={contourPoint}
												className={`contourPoint midX botY ${activePoint === 'midXbotY' ? 'active' : ''}`}
											/>
											<div
												id="midYtopX"
												onMouseDown={contourPoint}
												className={`contourPoint midY topX ${activePoint === 'midYtopX' ? 'active' : ''}`}
											/>
											<div
												id="midYbotX"
												onMouseDown={contourPoint}
												className={`contourPoint midY botX ${activePoint === 'midYbotX' ? 'active' : ''}`}
											/>
											<div
												id="midXmidY"
												onMouseDown={contourPoint}
												className={`contourPoint midX midY ${activePoint === 'midXmidY' ? 'active' : ''}`}
											/>
										</div>
									</div>
								</div>
							</td>
							<td>X:</td>
							<td id="contourPointXvalue"
								className="editable"
								contentEditable=""
								onKeyDown={onKeyDown}
							>
								{activeCooord.x}
							</td>
							<td>Y:</td>
							<td id="contourPointYvalue"
								className="editable"
								contentEditable=""
								onKeyDown={onKeyDown}
							>
								{activeCooord.y}
							</td>
						</tr>
						<tr>
							<td>__:</td>
							<td id="contourWidthValue"
								className="editable"
								contentEditable=""
								onKeyDown={onKeyDown}
							>
								{wh.w}
							</td>
							<td>|:</td>
							<td id="contourHeightValue"
								className="editable"
								contentEditable=""
								onKeyDown={onKeyDown}
							>
								{wh.h}
							</td>
						</tr>
					</tbody>
				</table>
				<table className="table mb-0">
					<thead className="table-dark">
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
								onKeyDown={onKeyDown}
								onInput={captureInput}
							>
								{angle}
							</td>
						</tr>
					</tbody>
				</table>

				<table className="table">
					<thead className="table-dark">
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
										onMouseDown={() => alignItems('left')}
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
										onMouseDown={() => alignItems('center-vertical')}
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
										onMouseDown={() => alignItems('right')}
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
										onMouseDown={() => alignItems('top')}
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
										onMouseDown={() => alignItems('center-horizontal')}
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
										onMouseDown={() => alignItems('bottom')}
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
					<thead className="table-dark">
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
			</div>
			),
		},
	]

	return (
		<>
			{panelInfo.map((element, index) => (
				<Panel key={'panel' + index + 1} element={element} />
			))}
		</>
	);
})

export default ContourPanel; 