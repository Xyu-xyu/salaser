import { observer } from 'mobx-react-lite';
import { Modal } from 'react-bootstrap';
import macrosStore from '../store/macrosStore';
import PiercingEditStagesPanel from './piercingEditStagesPanel'
import StringComponent from './stringComponent';
import NavigationModalinStages from './navigationModalinStages';
import SwiperPiercingMacro from './swiperPiercingMacro';
import { CustomChart } from './chart/customChart'
import CutHead from './laser_head/cutHead';
import NavigationButtonsInChartInStages from './navigationButtonsInChartInStages'
import { Icon } from '@iconify/react/dist/iconify.js';



const PiercingEditModalPanel = observer(() => {

	const handleClose = () => {
		macrosStore.setModal(false, 'piercingMacro');
	};
	const { isVertical, carouselModeInPiercing, selectedPiercingMacro } = macrosStore;

	return (
		<>
			<Modal show={macrosStore.piercingMacroModalEdit} onHide={handleClose} fullscreen centered >
			<Modal.Header className="d-flex justify-content-between align-items-center">
					<Modal.Title></Modal.Title>
					<button
						className={`violet_button navbar_button small_button40`} onClick={handleClose}>
						<div className="d-flex align-items-center justify-content-center">
							<Icon icon="material-symbols:close-rounded"
								width="36"
								height="36"
								style={{ color: 'white' }}
							/>
						</div>
					</button>
				</Modal.Header>
				<Modal.Body>
					{!carouselModeInPiercing &&
						<div className="container-fluid">


							<div className='d-flex flex-column'>
								<div className='d-flex align-items-center justify-content-center'>


									<div className={'d-flex justify-content-evenly align-items-center flex-column '}>
										<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
											<StringComponent param={'name'} keyParam={'piercingMacros'} />
										</div>
										<div className={'d-flex ' + (isVertical ? "mt-4" : "")}>
											<div style={{ width: '600px', height: '200px', margin: 'auto' }}>
												<CustomChart keyInd={selectedPiercingMacro} />
											</div>
										</div>
									</div>
									
									<CutHead keyInd={selectedPiercingMacro} />
								</div>
 								<NavigationButtonsInChartInStages />
 								<PiercingEditStagesPanel />

							</div>

						</div>
					}
					{
						carouselModeInPiercing && <SwiperPiercingMacro />
					}
				</Modal.Body>

				<Modal.Footer className="position-relative d-flex justify-content-center align-items-center">
 						<NavigationModalinStages />
 				</Modal.Footer>
			</Modal>
		</>
	);
});


export default PiercingEditModalPanel;
