import { observer } from "mobx-react-lite";
import { useState } from "react";
import { Modal, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import CutHead from "../laser_head/cutHead";
import macrosStore from "../../store/macrosStore";
import NavigationButtonsInChartInStages from './../../components/navigationButtonsInChartInStages'

const Demo = observer(() => {

	const { t } = useTranslation();
	const [show, setShow] = useState(false);
	const { selectedPiercingMacro} = macrosStore

	const showModal = () => {
		setShow(true);
	};

	const handleClose = () => {
		setShow(false);
	};
 

	return (
		<div id="DemoBtn">

			<button
				type="button"
				className="cp-btn"
				onClick={showModal}
			>
				{t('Demo')}
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				id="ddemo"
				style={{padding:"30px"}}
 				centered
				className="with-inner-backdrop demo-modal"
			>
 
 			<div className="p-6"
				style={{display: "flex", justifyContent:"center"}}
			>
				<CutHead keyInd={selectedPiercingMacro} />
				</div>
				<div className="cp-submodal__footer">
				<NavigationButtonsInChartInStages timerOnly={true}  />
				</div>
			</Modal>
		</div>
	);
});

export default Demo;