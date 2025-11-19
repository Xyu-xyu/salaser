import { observer } from 'mobx-react-lite';
import macrosStore from '../store/macrosStore';
import { useTranslation } from 'react-i18next';
import CustomIcon from "../icons/customIcon";


const NavigationModalinStages = observer(() => {

	const { carouselModeInPiercing } = macrosStore
	const { t } = useTranslation()
	const carousel = () => {
		macrosStore.setCarouselModeInPiercing(!carouselModeInPiercing)
	}

	return (
		<>
 				<button className="carousel_btn violet_button mx-2">
					<div
						className="d-flex align-items-center justify-content-center mx-2"
						onMouseDown={carousel}
					>
						{carouselModeInPiercing ? (
							<CustomIcon
								icon="material-symbols:rectangle-outline-rounded"
								width="48"
								height="48"
								color='white'
								fill='white'
								strokeWidth={0}
							/>
						) : (
							<CustomIcon
								icon="hugeicons:carousel-horizontal-02"
								width="48"
								height="48"
								color='white'
								strokeWidth={1.5}

							/>
						)}
						<div className="mx-2 d-flex align-items-center">
							<p className="text-white mb-0 font25">{!carouselModeInPiercing ? t('View all') : t('Edit')  }</p>
						</div>
					</div>
				</button>
 		</>
	)
});

export default NavigationModalinStages;
