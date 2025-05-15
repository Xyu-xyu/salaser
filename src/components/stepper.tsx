import { Button } from 'react-bootstrap';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';


const Stepper = observer(() => {
	const steps = Array.from({ length: 16 }, (_, i) => i);
	const { selectedPercingStage, isVertical } = viewStore
	const onStepChange = (step: number) => {
		viewStore.setSelectedPercingStage(step)
	}

	return (
		<div className={"d-flex flex-wrap justify-content-center gap-2 " + (isVertical ? "mt-10" : "mt-4")}
			id='stages'>
			{steps.map((step) => (
				<Button
					key={step}
					variant={step === selectedPercingStage ? 'primary' : 'outline-primary'}
					onClick={() => onStepChange(step)}
					style={{ minWidth: '40px' }}
				>
					{step + 1}
				</Button>
			))}
		</div>
	);
});

export default Stepper;
