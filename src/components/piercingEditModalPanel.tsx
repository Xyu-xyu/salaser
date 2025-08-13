import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import PiercingEditStagesPanel from './piercingEditStagesPanel'
import StringComponent from './stringComponent';
import NavigationModalinStages from './navigationModalinStages';
import SwiperPiercingMacro from './swiperPiercingMacro';
import { CustomChart } from './chart/customChart'
import { useTranslation } from 'react-i18next';
import CutHead from './laser_head/cutHead';
import NavigationButtonsInChartInStages from './navigationButtonsInChartInStages'



const PiercingEditModalPanel = observer(() => {

	const handleClose = () => {
		viewStore.setModal(false, 'piercingMacro');
	};

	const { t } = useTranslation()

	const { isVertical, selectedPiercingStage, carouselModeInPiercing, selectedPiercingMacro } = viewStore;

	return (
		<>
			<Modal show={viewStore.piercingMacroModalEdit} onHide={handleClose} fullscreen centered >
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{!carouselModeInPiercing &&
						<div className="container-fluid">
							<div className={'d-flex justify-content-evenly align-items-center flex-column '}>

								<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
									<StringComponent param={'name'} keyParam={'piercingMacros'} />
								</div>
								<div className={'d-flex ' + (isVertical ? "mt-4" : "")}>
									<div style={{ width: '600px', height: '200px', margin: 'auto' }}>
										<CustomChart keyInd={selectedPiercingMacro} />
										<CutHead keyInd={selectedPiercingMacro} />
									</div>
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

				<Modal.Footer className="position-relative">
					<div className="position-absolute top-50 start-50 translate-middle fs-4 no-wrap">
						<NavigationModalinStages />
					</div>

					<Button
						variant="secondary"
						onClick={handleClose}
						className="mt-4 py-3 px-5 fs-3 close-button ms-auto"
					>
						{t('Close')}
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
});


export default PiercingEditModalPanel;
