import { observer } from 'mobx-react-lite';

import macrosStore from '../store/macrosStore';
import CustomIcon from '../icons/customIcon';



const MacrosEditModalButton = observer(({ param }) => {

	const { isVertical } = macrosStore
	const x1 = isVertical ? 83 : 110
	const y1 = isVertical ? -12 : 20

	const ICON_W = 14;
	const ICON_H = 14;

	const handleShow = () => {
		macrosStore.setModal(true, param)
	}


	return (
		<>
			<g onClick={handleShow} style={{ cursor: 'pointer' }}>
				<circle
					cx={x1}
					cy={y1}
					r={15}
					fill="url(#circleGradient)"
					stroke="gray"
					strokeWidth={0.25}
					filter="var(--shadow)"
				/>
 				<g transform={`translate(${x1} ${y1})`}>
 					<g transform={`translate(${-ICON_W / 2} ${-ICON_H / 2})`}>
						<CustomIcon
							icon="iwwa:settings"
							width={ICON_W}
							height={ICON_H}
							strokeWidth={2}
							viewBox='0 0 40 40'
 							style={{ color: 'var(--knobMainText)' }}
						/>
					</g>
				</g>
			</g>

		</>
	);
});

export default MacrosEditModalButton;
