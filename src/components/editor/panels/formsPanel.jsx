import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import svgStore from "../../../store/svgStore.jsx";
import macrosStore from "../../../store/macrosStore.jsx";
import laserStore from "../../../store/laserStore.jsx";
import CustomIcon from '../../../icons/customIcon.jsx';
import { useTranslation } from 'react-i18next';
import partStore from "../../../store/partStore.jsx"


const FormsPanel = observer(() => {

	const { t } = useTranslation()
	const add = (uuid, x, y)=> {
		let id = svgStore.nextPartId
		svgStore.addPosition (
			{
				"part_id": id,
				"part_code_id": uuid,
				"selected":false,
				"positions": { "a": 1, "b": 0, "c": 0, "d": 1, "e": x, "f": y}
			}
		)
	}

	const deleteAll = (uuid) => {
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete all parts of this type?',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			func: svgStore.deleteAll,
			args: [uuid]
		})

	}

	const panelInfo =
	{
		id: "formsPopup",
		fa: (
			<>
				<CustomIcon
					icon="fa-shapes"
					width="20"
					height="20"
					fill='black'
					strokeWidth={0}
					viewBox='0 0 512 512'
					className="m-2"
				/>
				<div>{t('Part')}</div>
			</>
		),
		content: (
			<div className="d-flex align-items-center btn_block flex-wrap">
				<div className="containerTable">
					<table id="partListContainer" className="table">
						<thead style={{ position: "sticky", top: 0 }} className="table-white">
							<tr>
								<th className="header" scope="col">
									#
								</th>
								<th className="header longText longText5" scope="col">
									{t("id")}
								</th>
								<th className="header longText" scope="col">
									{t("part_code")}
								</th>
								<th className="header" scope="col">
									{t("amount")}
								</th>
								<th className="header" scope="col">
									{t("pic")}
								</th>
								<th className="header" scope="col">
									{t("action")}
								</th>
							</tr>
						</thead>
						<tbody>
							{
								svgStore.svgData.part_code.map((a, index) => {

									return (
										<tr key={index}>
											<td className="header align-middle" scope="col">
												{Number(index + 1)}
											</td>
											<td className="header longText longText5 align-middle" scope="col">
												Part_{Number(index + 1)}
											</td>
											<td className="header longText align-middle" scope="col">
												{a.uuid}
											</td>
											<td className="header align-middle" scope="col">
												{
													svgStore.svgData.positions.filter(pos => pos.part_code_id === a.uuid).length
												}
											</td>
											<td className="header" scope="col">
												<svg viewBox={`0 0 ${a.width} ${a.height}`} xmlns="http://www.w3.org/2000/svg" width='40' height='40'>
													{a.code.map((element, i) => (
														<g
															key={"fp"+element.cid+"_"+i}
															data-cid={element.cid}
															onMouseDown={(e) => { }}
															onMouseMove={(e) => { }}
															onTouchStart={(e) => { }}
															fill={element.class.includes("inner") ? "none" : "aqua"}
														>
															<path d={element.path} />
														</g>
													))}
												</svg>
											</td>
											<td className="header" scope="col">
												<div className='d-flex align-items-center justify-content-center'>												
													<div className='d-flex'>
														<button
															className={`white_button navbar_button small_button40 me-2`} 
															onPointerDown={ () => {add ( a.uuid, 0, 0)}}>
															<div className="d-flex align-items-center justify-content-center">
																<CustomIcon icon="plus"
																	width="24"
																	height="24"
																	fill='var(--violet)'
																	color="none"
																	viewBox="0 0 24 24"
																/>
															</div>
														</button>
														<button
															className={`white_button navbar_button small_button40 me-2`} 
															onPointerDown={() => { deleteAll (a.uuid)}}>
															<div className="d-flex align-items-center justify-content-center">
															<CustomIcon
																icon="ic:twotone-delete-outline"
																width="24"
																height="24"
																fill='var(--violet)'
																strokeWidth={0}
															/>
															</div>
														</button>
														<button
															className={`white_button navbar_button small_button40 me-2`} 
															onPointerDown={()=>{
																laserStore.setVal("centralBarMode", "partEditor")
																partStore.setSvgData( a );		
																}
															}>
															<div className="d-flex align-items-center justify-content-center">
															<CustomIcon 
																icon="bytesize:edit"
																width="20"
																height="20"
																color="var(--violet)"
																viewBox="0 0 32 32"
																strokeWidth={3}
															/>
															</div>
														</button>
													</div>
												</div>
											</td>
										</tr>
									)
								})
							}
							<tr>
								<td colSpan={3}>{t("Parts on sheet")}: </td>
								<td>{ svgStore.svgData.positions.length }</td>
								<td></td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		),
	}

	return (
		<>
			<Panel key={'panel' + 14} element={panelInfo} index={14} />
		</>
	);
})

export default FormsPanel;





