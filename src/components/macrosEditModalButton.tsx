import { observer } from 'mobx-react-lite';
import { Icon } from "@iconify/react/dist/iconify.js";
import viewStore from '../store/viewStore';

interface MacrosEditModalButtonProps {
	param: string;
}

const MacrosEditModalButton = observer(({ param }: MacrosEditModalButtonProps) => {
	/* const [show, setShow] = useState(false);

	const handleClose = () => setShow(false);
	const handleShow = () => setShow(true);
	const handleContinue = () => {
		setShow(false)
		viewStore.setModal (true, param)
	} */

	const { isVertical } = viewStore
	const x1 = isVertical ? 83 : 110
	const y1 = isVertical ? -12 : 20

	const x2 = isVertical ? 76 : 103
	const y2 = isVertical ? -19 : 13

	const handleShow = ()=>{
		viewStore.setModal ( true, param)
	}


	return (
		<>
			<g onClick={handleShow} style={{ cursor: "pointer" }}>
				<circle
					cx={x1}
					cy={y1}
					r="15"
					fill="url(#circleGradient)"
					stroke="gray"
					strokeWidth="1"
					filter="var(--shadow)"
				/>
				<svg x={x2} y={y2} width="26" height="26">
					<Icon icon="fa:gear" 
						width="14"
						height="14"
						style={{
							color: "var(--knobMainText)",
							position: "absolute",
							top: "50%",
							left: "50%",
							transform: "translate(50%, 50%)",
						}} />
				</svg>
			</g>
		</>
	);
});

export default MacrosEditModalButton;
