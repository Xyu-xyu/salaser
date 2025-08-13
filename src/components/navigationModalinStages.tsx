import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useTranslation } from 'react-i18next';


const NavigationModalinStages = observer(() => {

	const { carouselModeInPiercing } = viewStore
	const { t } = useTranslation()

	const carousel = () => {
		viewStore.setCarouselModeInPiercing(!carouselModeInPiercing)
	}

	return (
		<>
			<div className="ms-2">
				<button className="carousel_btn violet_button mx-2">
					<div
						className="d-flex align-items-center justify-content-center mx-2"
						onMouseDown={carousel}
					>
						{carouselModeInPiercing ? (
							<Icon
								icon="material-symbols:rectangle-outline-rounded"
								width="48"
								height="48"
								style={{ color: 'white' }}
							/>
						) : (
							<Icon
								icon="hugeicons:carousel-horizontal-02"
								width="48"
								height="48"
								style={{ color: 'white' }}
							/>
						)}
						<div className="mx-4 d-flex align-items-center">
							<p className="text-white mb-0">{!carouselModeInPiercing ? t('View all') : t('Edit')  }</p>
						</div>
					</div>
				</button>
			</div>
		</>
	)
});

export default NavigationModalinStages;
