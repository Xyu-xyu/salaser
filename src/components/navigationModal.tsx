import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useTranslation } from 'react-i18next';


const NavigationModal = observer(() => {

	const { carouselMode } = viewStore
	const { t } = useTranslation()

	const cloneThis = () => {
 		viewStore.setModalProps ({
			show:true,
 			modalBody: 'Do you want to copy and add this macro?',
			confirmText: 'Copy',
			cancelText:'Cancel',
			func: viewStore.AddAndUpdate,
			args:['modulationMacros', viewStore.selectedSlide, 'modulationMacro']
		})
	}

	const deleteThis = () => {
 		viewStore.setModalProps ({
			show:true,
 			modalBody: 'Do you want to delete this macro?',
			confirmText: 'Delete',
			cancelText:'Cancel',
			func: viewStore.deleteAndUpdate,
			args:['modulationMacros', viewStore.selectedSlide, 'modulationMacro']
		})
	}

	const carousel = () =>{
		viewStore.setCarouselMode ( !carouselMode)
	}


	return (
		<>
			<div className="mt-2">
				<button className="carousel_btn violet_button mx-2">
					<div
						className="d-flex align-items-center justify-content-center mx-2"
						onMouseDown={carousel}
					>
						{carouselMode ? (
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
						<div className="mx-2 d-flex align-items-center">
							<p className="text-white mb-0 font25">{ t('View') }</p>
						</div>
					</div>
				</button>

				{carouselMode && (
					<button className="carousel_btn violet_button mx-2">
						<div
							className="d-flex align-items-center justify-content-center mx-2"
							onMouseDown={cloneThis}
						>
							<Icon
								icon="fa-regular:clone"
								width="36"
								height="48"
								style={{ color: 'white' }}
							/>
							<div className="mx-2 d-flex align-items-center">
								<p className="text-white mb-0 font25">{ t('Copy') }</p>
							</div>
						</div>
					</button>
				)}

				{carouselMode && (
					<button className="carousel_btn mx-2">
						<div
							className="d-flex align-items-center justify-content-center mx-2"
							onMouseDown={deleteThis}
						>
							<Icon
								icon="ic:twotone-delete-outline"
								width="48"
								height="48"
								style={{ color: 'white' }}
							/>
							<div className="mx-2 d-flex align-items-center">
								<p className="text-white mb-0 font25">{ t('Delete') }</p>
							</div>
						</div>
					</button>
				)}

			</div>
		</>
	)
});

export default NavigationModal;
