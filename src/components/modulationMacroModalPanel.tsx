import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
//import ModulationMacroSelector from './modulationMacroSelector';
//import UniversalKnob from './universalKnob';
//import StringComponent from './stringComponent';
//import NavigationModal from './navigationModal';
import SwiperModulationMacro from './swiperModulationMacro'
import { useTranslation } from 'react-i18next';



const ModulationMacroModalPanel = observer(() => {

	const handleClose = () => {
		viewStore.setModal(false, 'modulationMacro');
	};
	const { t } = useTranslation()
 	return (
		<>
			<Modal show={viewStore.modulationMacroModalEdit} onHide={handleClose} fullscreen centered >
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					{ 
						<SwiperModulationMacro />
					}
				</Modal.Body>
				<Modal.Footer className="position-relative">
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
