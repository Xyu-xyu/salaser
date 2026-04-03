import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import partStore from "./../../../store/partStore.jsx";
import { useEffect, useState } from 'react';
import { addToLog } from './../../../scripts/addToLog.jsx';
import { useTranslation } from 'react-i18next';
import CustomIcon from './../../../icons/customIcon.jsx';
import constants from '../../../store/constants.jsx';
import svgStore from '../../../store/svgStore.jsx';


const ContourPanel = observer(() => {
	const { t } = useTranslation();
	const {
		selectedType,
		selectedContourModeType,
		selectedInletModeType,
		selectedPiercingType } = partStore;

	const setSelectedContourModeType = (e) => {
		let n = (Number(e.target.value))
		let newMode = 'macro' + n
		let selected = partStore.getSelectedElement()
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

	const [ macrosCount, setMacrosCount] = useState(0)
	useEffect (() =>{
		
		getAndCountMacros()

	},[])

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
			content: (<div className="d-flex flex-column mt-2">
				<table className="table mb-0">
					<tbody>
						<tr className='d-none'>
							<td colSpan={2} className="text-start ps-2">
								{t('Type')}:
							</td>
							<td colSpan={2}><div id="info_type">{selectedType ? t(selectedType) : ""}</div></td>
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
									value={selectedContourModeType}
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
