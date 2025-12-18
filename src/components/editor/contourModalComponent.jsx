import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import 'bootstrap/dist/css/bootstrap.min.css';
import { observer } from 'mobx-react-lite';
import { addToLog } from '../../scripts/addToLog';
import util from '../../scripts/util';
import SVGPathCommander from 'svg-path-commander';
import { useTranslation } from 'react-i18next';
import CustomIcon from '../../icons/customIcon';
import constants from '../../store/constants';
import partStore from '../../store/partStore';


const contourModalComponent = observer(() => {
	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const [selected, setSelected] = useState(0)
	const [partXPosition, setPartXPosition] = useState(0)
	const [partYPosition, setPartYPosition] = useState(0)
	const [partWidth, setPartWidth] = useState(150)
	const [partHeight, setPartHeight] = useState(150)
	const [partCenterXPosition, setPartCenterXPosition] = useState(true)
	const [partCenterYPosition, setPartCenterYPosition] = useState(true)

	let shapes = constants.shapes

	const addContour = () => {
		let d = shapes[selected]
		const myPathBBox = SVGPathCommander.getPathBBox(d)
		let iniX = myPathBBox.width
		let iniY = myPathBBox.height
		let scaleX = partWidth / iniX
		let scaleY = partHeight / iniY
		var transformed = util.applyTransform(d, scaleX, scaleY, 0, 0, { angle: 0, x: 0, y: 0 })
		if (!d || !d.length) return;
		partStore.addElementPath ( transformed )
		addToLog ("Contour added")		
	}


	return (
	<>
		<Button variant="" onClick={handleShow} className='mt-1 ms-2'>
			<div
				className="text-white btn_shapes btn_tool"
			>
				<CustomIcon
					icon="fa-shapes"
					width="20"
					height="20"
					fill='black'
					strokeWidth={0}
					viewBox='0 0 512 512'
				/>
			</div>
		</Button>

		<Modal variant="" show={show} onHide={handleClose}>
			<Modal.Header closeButton className="custom_modal">
				<Modal.Title>{t('Add contour from shapes')}</Modal.Title>
			</Modal.Header>
			<Modal.Body className="custom_modal">
				<div className="modal-body">
					<div className="d-flex align-items-center justify-content-center">
						{
							shapes.map((shape, i) => (
								<button
									key={"sh"+i}
									className={"btn btn-shape-select m-2 d-flex align-items-center justify-content-center " + (i === selected ? "btn-shape-selected" : "")}
									onMouseDown={() => { setSelected(i) }}
								>
									<div className='d-flex align-items-center justify-content-center shape-select-wrapper'>
										<svg
											width={10}
											height={10}
											xmlns="http://www.w3.org/2000/svg"
											style={{ transform: "scale(2.5)" }}
										>
											<path d={shape} stroke="" />
										</svg>
									</div>
								</button>
							))
						}
					</div>
					<div className="d-flex align-items-center justify-content-center mt-4">
						<table>
							<tbody>
								<tr>
									<td>
										<div>{t('Position center')} X</div>
									</td>
									<td>
										<div className="">
											<input
												className="mx-2"
												id="newPartPositionX"
												type="number"
												min={0}
												max={1500}
												step={1}
												value={partXPosition}
												onChange={(e) => {
													let value = Number(e.target.value);
													if (!isNaN(value)) {
														if (value < 0) value = 0;
														if (value > 1500) value = 1500; // Максимум 1500
														setPartXPosition(value);
													}
												}}
											/>
											mm
											<input
												className="mx-2"
												id="newPartPositionXCenter"
												type="checkbox"
												checked={partCenterXPosition}
												onChange={() => setPartCenterXPosition(!Boolean(partCenterXPosition))}
											/>
											{t('In the center')} X
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<div>{t('Position center')} Y</div>
									</td>
									<td>
										<div className="">
											<input
												className="mx-2"
												id="newPartPositionY"
												type="number"
												min={0}
												max={2500}
												step={1}
												value={partYPosition}
												onChange={(e) => {
													let value = Number(e.target.value);
													if (!isNaN(value)) {
														if (value < 0) value = 0;
														if (value > 1500) value = 1500; // Максимум 1500
														setPartYPosition(value);
													}
												}}
											/>
											mm
											<input
												className="mx-2"
												id="newPartPositionYCenter"
												type="checkbox"
												checked={partCenterYPosition}
												onChange={() => setPartCenterYPosition(!Boolean(partCenterYPosition))}
											/>
											{t('In the center')} Y
										</div>
									</td>
								</tr>
								<tr>
									<td>
										<div>{t('Width')}</div>
									</td>
									<td>
										<input
											className="mx-2"
											id="newPartShapesX"
											type="number"
											min={1}
											max={1500}
											step={1}
											value={partWidth}
											onChange={(e) => {
												let value = Number(e.target.value);
												if (!isNaN(value)) {
													if (value < 1) value = 1;
													if (value > 1500) value = 1500; // Максимум 1500
													setPartWidth(value);
												}
											}}
										/>
										mm
									</td>
								</tr>
								<tr>
									<td>
										<div>{t('Height')}</div>
									</td>
									<td>
										<input
											className="mx-2"
											id="newPartShapesY"
											type="number"
											min={1}
											max={2500}
											step={1}
											value={partHeight}
											onChange={(e) => {
												let value = Number(e.target.value);
												if (!isNaN(value)) {
													if (value < 1) value = 1;
													if (value > 1500) value = 1500; // Максимум 1500
													setPartHeight(value);
												}
											}}
										/>
										mm
									</td>
								</tr>
							</tbody>
						</table>
					</div>
				</div>
			</Modal.Body>
			<Modal.Footer className="custom_modal">
				<Button variant="secondary" onClick={handleClose}>
					{t('Close')}
				</Button>
				<Button variant="primary"
					onClick={handleClose}
					onMouseDown={addContour}>
					{t('Add contour')}
				</Button>
			</Modal.Footer>
		</Modal>
	</>
);
})

export default contourModalComponent;