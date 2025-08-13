import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useTranslation } from 'react-i18next';


const NavigationModalinStages = observer(() => {

	const { carouselModeInPiercing } = viewStore
	const { t } = useTranslation()

	const cloneThis = () => {
		if (carouselModeInPiercing) {
			viewStore.setModalProps({
				show: true,
				modalBody: 'Do you want to copy and add this piercing macro?',
				confirmText: 'Copy',
				cancelText: 'Cancel',
				func: viewStore.AddAndUpdate,
				args: ['piercingMacros', viewStore.selectedSlide, 'piercingMacro']
			})
		} else {
			viewStore.setModalProps({
				show: true,
				modalBody: 'Do you want to copy and add this piercing macro step?',
				confirmText: 'Copy',
				cancelText: 'Cancel',
				func: viewStore.addStage,
				args: []
			})
		}
	}

	const deleteThis = () => {
		if (carouselModeInPiercing) {
			viewStore.setModalProps({
				show: true,
				modalBody: 'Do you want to delete piercing macro?',
				confirmText: 'Delete',
				cancelText: 'Cancel',
				func: viewStore.deleteAndUpdate,
				args: ['piercingMacros', viewStore.selectedSlide, 'piercingMacro']
			})
		} else {
			viewStore.setModalProps({
				show: true,
				modalBody: 'Do you want to delete this piercing macro step?',
				confirmText: 'Delete',
				confirmText1: 'Delete all stages',
				cancelText: 'Cancel',
				func: viewStore.deleteStage,
				func1: viewStore.deleteStage,
				args: ['all']
			})
		}
	}

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
