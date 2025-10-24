import { Icon } from "@iconify/react/dist/iconify.js";
import { observer } from 'mobx-react-lite';
import macrosStore from "../store/macrosStore";
import { useTranslation } from 'react-i18next';
import Timer from "./timer";
 

const NavigationButtonsInChartInStages = observer(() => {
	const { t } = useTranslation()
 	const {  isAnimating,  isPaused, atEnd } = macrosStore;


	const cloneThis = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to copy and add this piercing macro step?',
			confirmText: 'Copy',
			cancelText: 'Cancel',
			func: macrosStore.addStage,
			args: []
		})
	}

	const deleteStage = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete this piercing macro step?',
			confirmText: 'Delete',
			confirmText1: 'Delete all stages',
			cancelText: 'Cancel',
			func: macrosStore.deleteStage,
			args: []
		})
	}

	const deleteAllStages = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete all steps in piercing macro?',
			confirmText: 'Delete all stages',
			cancelText: 'Cancel',
			func: macrosStore.deleteStage,
			args: ['all']
		})
	}

	const toggleAnimation = () => {
		if (!atEnd) {
			if (!isAnimating && !isPaused) {
				macrosStore.setIsAnimating(true);
			} else if (!isAnimating && isPaused) {
				macrosStore.setPaused(false)
				macrosStore.setIsAnimating(true);
			} else if (isAnimating && !isPaused) {
				macrosStore.setPaused(true)
				macrosStore.setIsAnimating(false);
			}
		} else {
			macrosStore.setAtEnd(!atEnd)
			rewind()
			macrosStore.setIsAnimating(true);
		}
	};

	const rewind = () => {
		macrosStore.setIsAnimating(false);
		macrosStore.setPaused(false)
		macrosStore.setAnimProgress(0, 0)
	}
 

	return (
		<>
			<div className="d-flex align-items-center justify-content-center mt-5">
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
							<div>
								<p className="text-white mb-0">{t('Play demo')}</p> 
							</div>
							<Timer/>
						</div>
					</div>
				</button>
			</div>
		</>
	)
})


export default NavigationButtonsInChartInStages;