import { Button } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';


const Stepper = observer(() => {
	const {technology, selectedPiercingMacro} = viewStore
	const length = technology.piercingMacros[selectedPiercingMacro].stages.length+1
	const steps = Array.from({ length: length }, (_, i) => i);
	const { selectedPiercingStage, isVertical } = viewStore
	const onStepChange = (step: number) => {
		viewStore.setselectedPiercingStage(step)
	}

	return (
		<div className={"d-flex flex-wrap justify-content-center gap-2 mt-10"}
			id='stages'>
				
			{steps.map((step) => (
				<Button
					key={step}
					variant={step === selectedPiercingStage ? 'primary' : 'outline-primary'}
					onClick={() => onStepChange(step)}
					style={{ minWidth: '40px' }}
				>
					{ step }
				</Button>
			))}
		</div>
	);
});

export default Stepper;
