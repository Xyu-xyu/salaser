import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
//import ModulationMacroSelector from './modulationMacroSelector';
import UniversalKnob from './universalKnob';
import StringComponent from './stringComponent';
import NavigationModal from './navigationModal';
import SwiperModulationMacro from './swiperModulationMacro'
import { useTranslation } from 'react-i18next';



const ModulationMacroModalPanel = observer(() => {

	const handleClose = () => {
		viewStore.setModal(false, 'modulationMacro');
	};
	const { t } = useTranslation()

	const { isVertical, carouselMode } = viewStore;

	return (
		<>
			<Modal show={viewStore.modulationMacroModalEdit} onHide={handleClose} fullscreen centered >
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					{ carouselMode ? 
						<SwiperModulationMacro />
						:
						<div className="position-absolute top-50 start-50 translate-middle fs-4">
							<div className={'d-flex justify-content-evenly align-items-center ' + (isVertical ? "mt-10" : "mt-4")}>
								<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
									<StringComponent param={'name'} keyParam={'modulationMacros'}/>
								</div>
							</div>
							<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-10")} >
								{[								 
									"pulseFill_percent",
									"pulseFrequency_Hz",
								].map((a: string, i: number) => (
									<div className="editModal_row" key={i}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<UniversalKnob param={a}  keyParam={'modulationMacros'}/>
										</div>
									</div>
									))
								} 
							</div>
						</div>
					}
				</Modal.Body>
				<Modal.Footer className="position-relative">
 					<div className="position-absolute top-50 start-50 translate-middle fs-4">
						<NavigationModal />
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

export default ModulationMacroModalPanel;
