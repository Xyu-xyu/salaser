import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import viewStore from "../store/viewStore";
import { useTranslation } from 'react-i18next';
 

const NavigationButtonsInChartInStages = observer(() => {
	const { t } = useTranslation()
 	const {  isAnimating,  isPaused, atEnd } = viewStore;


	const cloneThis = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to copy and add this piercing macro step?',
			confirmText: 'Copy',
			cancelText: 'Cancel',
			func: viewStore.addStage,
			args: []
		})
	}

	const deleteStage = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete this piercing macro step?',
			confirmText: 'Delete',
			confirmText1: 'Delete all stages',
			cancelText: 'Cancel',
			func: viewStore.deleteStage,
			args: []
		})
	}

	const deleteAllStages = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete all steps in piercing macro?',
			confirmText: 'Delete all stages',
			cancelText: 'Cancel',
			func: viewStore.deleteStage,
			args: ['all']
		})
	}

	const toggleAnimation = () => {
		if (!atEnd) {
			if (!isAnimating && !isPaused) {
				viewStore.setIsAnimating(true);
			} else if (!isAnimating && isPaused) {
				viewStore.setPaused(false)
				viewStore.setIsAnimating(true);
			} else if (isAnimating && !isPaused) {
				viewStore.setPaused(true)
				viewStore.setIsAnimating(false);
			}
		} else {
			viewStore.setAtEnd(!atEnd)
			rewind()
			viewStore.setIsAnimating(true);
		}
	};

	const rewind = () => {
		viewStore.setIsAnimating(false);
		viewStore.setPaused(false)
		viewStore.setAnimProgress(0, 0)
	}
 

	return (
		<>
			<div className="d-flex align-items-center mt-5">
				<button className="carousel_btn mx-1"
					onMouseDown={(e) => { deleteStage(e) }}
				>
					<div className="d-flex align-items-center justify-content-center">
						<Icon
							icon="ic:twotone-delete-outline"
							width="24"
							height="24"
							style={{ color: 'white' }}
						/>
						<div className="mx-1 d-flex align-items-center">
							<p className="text-white mb-0">{t('Delete step')}</p>
						</div>
					</div>
				</button>
				<button className="carousel_btn mx-1"
					onMouseDown={(e) => { deleteAllStages(e) }}
				>
					<div
						className="d-flex align-items-center justify-content-center"
						onMouseDown={() => { }}
					>
						<Icon
							icon="ic:twotone-delete-outline"
							width="24"
							height="24"
							style={{ color: 'white' }}
						/>
						<div className="mx-1 d-flex align-items-center">
							<p className="text-white mb-0">{t('Clear')}</p>
						</div>
					</div>
				</button>
				<button className="carousel_btn mx-1"
					onMouseDown={(e) => { cloneThis(e) }}
				>
					<div
						className="d-flex align-items-center justify-content-center"
						onMouseDown={() => { }}
					>
						<Icon
							icon="fluent:copy-add-20-regular"
							width="24"
							height="24"
							style={{ color: 'white' }}
						/>
						<div className="mx-1 d-flex align-items-center">
							<p className="text-white mb-0">{t('Copy step')}</p>
						</div>
					</div>
				</button>
				<button className="carousel_btn mx-1"
					onPointerDown={toggleAnimation}
				>
					<div className="d-flex align-items-center justify-content-center">
						{!isAnimating ?
							<Icon icon="fluent:play-24-filled" width="16" height="16"
								style={{ color: 'white' }}
							/> :
							<Icon icon="fluent:pause-24-filled" width="16" height="16"
								style={{ color: 'white' }}
							/>

						}
						<div className="mx-1 d-flex align-items-center">
							<p className="text-white mb-0">{t('Play demo')}</p>
						</div>
					</div>
				</button>
			</div>
		</>
	)
})


export default NavigationButtonsInChartInStages;