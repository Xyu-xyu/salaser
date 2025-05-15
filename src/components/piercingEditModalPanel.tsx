import { observer } from 'mobx-react-lite';
import { Modal, Button } from 'react-bootstrap';
import viewStore from '../store/viewStore';
import PiercingMacroSelector from './piercingMacroSelector';
import UniversalKnob from './universalKnob';
import { useState } from 'react';
import Stepper from './stepper';
import { motion, AnimatePresence } from 'framer-motion';



const PiercingEditModalPanel = observer(() => {
	const [showStepper, setShowStepper] = useState(false);

	const slideVariants = {
		initial: { x: '100%', opacity: 0 },
		animate: { x: 0, opacity: 1 },
		exit: { x: '-100%', opacity: 0 },
		transition: { duration: 0.4, ease: 'easeInOut' }
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
			<Modal show={viewStore.piercingMacroModalEdit} onHide={handleClose} centered fullscreen>
				<Modal.Header closeButton>
					<Modal.Title>
						{"piercingMacro"}
					</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<div className="container-fluid">
						<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
							<div key={0} className="editModal_row">
								<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
									<PiercingMacroSelector />
								</div>
							</div>
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
									<div className={'d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-4")}>
										{[
											"initial_modulationFrequency_Hz",
											"initial_pressure",
											"initial_modulationMacro",
										].map((a: string, i: number) => (
											<div className="editModal_row" key={i}>
												<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
													<UniversalKnob param={a} keyParam={'piercingMacros'} />
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
											<div className="editModal_row" key={i}>
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
