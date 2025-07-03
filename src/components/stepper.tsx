import { Button } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';

interface StepperComponentInt {
    keyInd: number|boolean;
}


const Stepper: React.FC<StepperComponentInt>  = observer(({ keyInd }) => {
	const {technology, selectedPiercingMacro} = viewStore
	const length = technology.piercingMacros[keyInd ? keyInd : selectedPiercingMacro].stages.length+1
	const steps = Array.from({ length: length }, (_, i) => i);
	const { selectedPiercingStage } = viewStore
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
