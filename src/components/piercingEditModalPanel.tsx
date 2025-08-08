import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
//import PiercingMacroSelector from './piercingMacroSelector';
import UniversalKnob from './universalKnob';
//import Stepper from './stepper';
import PiercingEditStagesPanel from './piercingEditStagesPanel'
//import MacrosEditList from './macrosEditList';
import StringComponent from './stringComponent';
import IosToggleBlowInPiercing from './toggles/iosToggleBlowInPiercing'
import NavigationModalinStages from './navigationModalinStages';
import SwiperPiercingMacro from './swiperPiercingMacro';
//import { SwiperPiercingMacroCharts } from './swiperPiercingMacroCharts';
import { CustomChart } from './chart/customChart'
import { useTranslation } from 'react-i18next';
import UniversalNamedKnob from './universalNamedKnob';
import UniversalKnobList from './universalKnobList';
import CutHead from './laser_head/cutHead';


type Param = 'initial_focus' | 'initial_height' | 'initial_pressure' | 'initial_power';
const data: Record<Param, string> = {
	initial_focus: '#8884d8',
	initial_height: '#82ca9d',
	initial_pressure: '#ffc658',
	initial_power: '#ff7300',
};

const params: Param[] = ['initial_focus', 'initial_height', 'initial_pressure', 'initial_power'];

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
					{ !carouselModeInPiercing && 
					<div className="container-fluid">
						<div className={'d-flex justify-content-evenly align-items-center flex-column ' + (isVertical ? "mt-50" : "mt-50")}>

							<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
								<StringComponent param={'name'} keyParam={'piercingMacros'} />
							</div>	
							<div className={'d-flex '+(isVertical ? "mt-4" : "")}>
								{true && <div style={{ width: '600px', height:'200px', margin: 'auto'  }}>
									<CustomChart keyInd={ selectedPiercingMacro} />
									<CutHead keyInd={ selectedPiercingMacro} />
							</div>}					
						</div>
						
						{selectedPiercingStage !== 0 ? (
								<PiercingEditStagesPanel />
							) : (
								<div className='w-100'>
									<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-50" : "mt-50")}>
										{ params.map((a: string, i: number) => (
											<div className="vidget" key={i} style={{ border: `4px solid ${data[a]}` }}>
												<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
													<UniversalKnob param={a} keyParam={'piercingMacros'} />
												</div>
											</div>
										))}									
									</div>

									<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-4" : "mt-4")}>
										
										{[
												"initial_modulationMacro",
 										].map((a: string, i: number) => (
											<div className="" key={i}>
												<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
													<UniversalNamedKnob param={a} keyParam={'piercingMacros'} />
												</div>
											</div>
										))}
										{[
 												"initial_modulationFrequency_Hz",
										].map((a: string, i: number) => (
											<div className="" key={i}>
												<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
													<UniversalKnob param={a} keyParam={'piercingMacros'} />
												</div>
											</div>
										))}
										{[
											"gas",
										].map((a: string, i: number) => (
											<div className="" key={i + 10}>
												<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
													<UniversalKnobList param={a} keyParam={'piercingMacros'} />
												</div>
											</div>
										))}
										<div className="">
												<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
													<IosToggleBlowInPiercing />
												</div>
										</div>
									</div>									
								</div>
							)}
						</div>
					</div>
					}
					{
						carouselModeInPiercing && <SwiperPiercingMacro />
					}
				</Modal.Body>

 				<Modal.Footer className="position-relative">
 					<div className="position-absolute top-50 start-50 translate-middle fs-4">
						<NavigationModalinStages />
					</div>
 					<Button
						variant="secondary"
						onClick={handleClose}
						className="mt-4 py-3 px-5 fs-3 close-button ms-auto"
					>
						{ t('Close')}
					</Button>
				</Modal.Footer>
 			</Modal>
		</>
	);
});


export default PiercingEditModalPanel;
