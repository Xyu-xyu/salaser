import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import PiercingMacroSelector from './piercingMacroSelector';
import UniversalKnob from './universalKnob';
import { useState } from 'react';
import Stepper from './stepper';
import { motion, AnimatePresence } from 'framer-motion';
import PiercingEditStagesPanel from './piercingEditStagesPanel'
import MacrosEditList from './macrosEditList';
import StringComponent from './stringComponent';
import IosToggleBlowInPiercing from './iosToggleBlowInPiercing'


const PiercingEditModalPanel = observer(() => {
	const [showStepper, setShowStepper] = useState(false);

	const slideVariants = {
		initial: { x: '100%', opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: '-100%', opacity: 0 },
		transition: { duration: 0.1, ease: 'easeInOut' }
	};


	const handleClose = () => {
		viewStore.setModal(false, 'piercingMacro');
		setShowStepper(false); // сбрасываем при закрытии
	};

	const editStages = () => {
		setShowStepper(prev => !prev); // переключение видимости степпера
	};

	const { isVertical } = viewStore;

	return (
		<>
			<Modal show={viewStore.piercingMacroModalEdit} onHide={handleClose} fullscreen centered >
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid">
						<div className={'d-flex justify-content-evenly align-items-center ' + (isVertical ? "mt-10" : "mt-4")}>
							
							<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
								<PiercingMacroSelector />
							</div>
							<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
								<StringComponent param={'name'} keyParam={'piercingMacros'}/>
							</div>
								{[
								"gas",
								].map((a: string, i: number) => (

									<div className="" key={i + 10}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<MacrosEditList param={a} keyParam={'piercingMacros'}/>
										</div>
									</div>
								))}
						</div>

						<AnimatePresence mode="wait">
							{showStepper ? (
								<motion.div
									key="stepper"
									variants={slideVariants}
									initial="initial"
									animate="animate"
									exit="exit"
									transition={slideVariants.transition}
								>
									  <Stepper />
									  <PiercingEditStagesPanel />
								</motion.div>
							) : (
								<motion.div
									key="editor"
									variants={slideVariants}
									initial="initial"
									animate="animate"
									exit="exit"
									transition={slideVariants.transition}
								>
									{/* Оригинальный контент */}
									<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-10")}>
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
										<div className="editModal_col">
											<IosToggleBlowInPiercing />	
										</div>
										
									</div>

									<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-10")}>
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
									</div>
								</motion.div>
							)}
						</AnimatePresence>

					</div>
				</Modal.Body>

				<Modal.Footer>
					<Button
						variant="primary"
						onClick={editStages}
						className="mt-4 py-3 px-5 fs-3 close-button"
					>
						{showStepper ? "Back to settings" : "Edit stages"}
					</Button>

					<Button
						variant="secondary"
						onClick={handleClose}
						className="mt-4 py-3 px-5 fs-3 close-button"
					>
						Close
					</Button>
				</Modal.Footer>
			</Modal>
		</>
	);
});


export default PiercingEditModalPanel;
