import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
//import PiercingMacroSelector from './piercingMacroSelector';
import UniversalKnob from './universalKnob';
import Stepper from './stepper';
import PiercingEditStagesPanel from './piercingEditStagesPanel'
import MacrosEditList from './macrosEditList';
import StringComponent from './stringComponent';
import IosToggleBlowInPiercing from './toggles/iosToggleBlowInPiercing'
import NavigationModalinStages from './navigationModalinStages';
import SwiperPiercingMacro from './swiperPiercingMacro';
//import { SwiperPiercingMacroCharts } from './swiperPiercingMacroCharts';
import { CustomChart } from './chart/customChart'
import { useTranslation } from 'react-i18next';

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
					{ !carouselModeInPiercing && <div className="container-fluid">
						<div className={'d-flex justify-content-evenly align-items-center ' + (isVertical ? "mt-10" : "mt-4")}>

							<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
								<StringComponent param={'name'} keyParam={'piercingMacros'} />
							</div>
							{!isVertical && <div style={{ width: '600px', height:'100px', margin: 'auto', position: 'absolute', right:'50px', top:'0px' }}>
								<CustomChart keyInd={ selectedPiercingMacro} height={250} />
							</div>}

						</div>

						<div>
							<div className='d-flex'>
								{isVertical && <div style={{ width: '600px', height:'200px', margin: 'auto'  }}>
									<CustomChart keyInd={ selectedPiercingMacro} height={250} />
							</div>}
							</div>
							<Stepper keyInd ={ false }/>
							{selectedPiercingStage !== 0 ? (
								<PiercingEditStagesPanel />
							) : (
								<div>
									<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
										{[
											"initial_modulationMacro",
											"initial_modulationFrequency_Hz",
											"initial_pressure",
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
													<MacrosEditList param={a} keyParam={'piercingMacros'} />
												</div>
											</div>
										))}
									</div>

									<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
										{[
											"initial_power",
											"initial_focus",
											"initial_height",
										].map((a: string, i: number) => (
											<div className="" key={i}>
												<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
													<UniversalKnob param={a} keyParam={'piercingMacros'} />
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
