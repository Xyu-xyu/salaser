import { observer } from 'mobx-react-lite';
import { Modal } from 'react-bootstrap';
import macrosStore from '../store/macrosStore';
import SwiperModulationMacro from './swiperModulationMacro'
import { Icon } from '@iconify/react/dist/iconify.js';



const ModulationMacroModalPanel = observer(() => {

	const handleClose = () => {
		macrosStore.setModal(false, 'modulationMacro');
	};
  	return (
		<>
			<Modal show={macrosStore.modulationMacroModalEdit} onHide={handleClose} fullscreen centered >
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
				<Modal.Body className="position-relative">
					{ 
						<SwiperModulationMacro />
					}
				</Modal.Body>
			</Modal>
		</>
	);
});

export default ModulationMacroModalPanel;
