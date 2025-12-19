import { observer } from 'mobx-react-lite';
import laserStore from "../../store/laserStore";
import { useState } from "react";
import { Modal } from "react-bootstrap";
import CustomIcon from "../../icons/customIcon";


const ExitButton = observer(() => {


	const setMode = () => {
		laserStore.setVal("centralBarMode", "planEditor")
	}

	return (

		<div className="ms-2 position-absolute" 
		style={{ top:"20px", right:"20px" }}
		>
			<button
				className={`navbar_button me-1 violet_button`}
				onClick={ setMode}>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon icon="material-symbols:close-rounded"
						width="36"
						height="36"
						fill='white'
						strokeWidth={0}
					/>
		</div>
			</button>			
		</div>

	)
});

export default ExitButton;