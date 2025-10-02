import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { Swiper as SwiperClass } from 'swiper/types';
import { EffectCoverflow, /* Mousewheel */ } from 'swiper/modules';
import viewStore from '../store/viewStore';
import { observer } from 'mobx-react-lite';
import SwiperStringComponent from './swiperStringComponent';
import { CustomChart } from './chart/customChart'
import { Icon } from '@iconify/react/dist/iconify.js';
import { useTranslation } from 'react-i18next';



const swiperPiercingMacro = observer(() => {
	const swiperRef = useRef<SwiperClass | null>(null);
	const { t } = useTranslation()
	const { isVertical, piercingMacroinUse, technology, selectedPiercingMacro, selectedSlide } = viewStore
	let arr = Array.from({ length: technology.piercingMacros.length })
	useEffect(() => {
		viewStore.setSelectedSlide(viewStore.selectedPiercingMacro)
	}, [])

	const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		viewStore.setTecnologyValue(selectedSlide, 'piercingMacro', 'macros', 0, 7, false)
	};


	const cloneThis = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to copy and add this piercing macro?',
			confirmText: 'Clone',
			cancelText: 'Cancel',
			func: viewStore.AddAndUpdate,
			args: ['piercingMacros', viewStore.selectedSlide, 'piercingMacro']
		})
}

	const deleteThis = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		viewStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete piercing macro?',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			func: viewStore.deleteAndUpdate,
			args: ['piercingMacros', viewStore.selectedSlide, 'piercingMacro']
		})
	}

	return (

		<>
			<Swiper
				onSwiper={(swiper) => {
					swiperRef.current = swiper;
				}}
				modules={[EffectCoverflow, /* Mousewheel */]}
				direction={isVertical ? 'vertical' : 'horizontal'}
				effect="coverflow"
				loop={false}
				slideToClickedSlide={true}
				grabCursor={true}
				centeredSlides={true}
				slidesPerView={isVertical ? 6 : 5}
				initialSlide={viewStore.selectedPiercingMacro} // Нумерация с 0 (0=1-й слайд, 3=4-й слайд)
				freeMode={false}
				coverflowEffect={{
					rotate: 0,
					stretch: 0,
					depth: 450,
					modifier: isVertical ? 1 : 0.8,
					slideShadows: false,
				}}

				style={{
					height: '100%',
					width: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
				onSlideChange={(swiper) => {
					const currentSlide = swiper.activeIndex;
					viewStore.setSelectedSlide(currentSlide);
				}}
			>
				{
					arr.map((_, ii) =>
						<SwiperSlide>

							<div className="swiperSlide swiperSlideLong position-absolute top-50 start-50 translate-middle fs-4">
								<div
									className={"text-center swiperSlideName " + (piercingMacroinUse.includes(ii) ? (ii === selectedPiercingMacro ? "currentMacros" : "") : "notInUse")}
								>
									<div className='text-center'>
										<p>
											{viewStore.getTecnologyValue('name', 'piercingMacros', ii)}:&nbsp;
											{viewStore.getTecnologyValue('initial_modulationFrequency_Hz', 'piercingMacros', ii)}&nbsp;Hz,&nbsp;
											{viewStore.getTecnologyValue('stages', 'piercingMacros', ii).length}&nbsp;stages
										</p>
									</div>
								</div>
								<div className={'d-flex flex-column justify-content-evenly align-items-center ' + (isVertical ? "mt-5" : "mt-4")}>

									<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
										<div className='mt-5 d-flex flex-column justify-content-center align-items-center'>
											<SwiperStringComponent param={'name'} keyParam={'piercingMacros'} keyInd={ii}/>
										</div>
									</div>
									<div className={isVertical ? "editModal_col d-contents mt-2" : "editModal_col_hor d-contents mt-2"}>
										<div style={{ width: '700px' }} className='mt-5'>
											<CustomChart keyInd={ii} />
										</div>
										<div className='mt-5'>
											{selectedPiercingMacro !== ii && <button className="carousel_btn violet_button m-2"
												onClick={(e) => handleMouseDown(e)}
											>
												<div className="d-flex align-items-center justify-content-center">
													<Icon
														icon="charm:square-tick"
														width="48"
														height="48"
														style={{ color: 'white' }} />
													<div className="mx-2 d-flex align-items-center">
														<p className="text-white mb-0 font25">{t('Set')}</p>
													</div>
												</div>
											</button>}

											<button className="carousel_btn violet_button mx-2" 
												onClick={ (e)=> cloneThis(e)}>
												<div
													className="d-flex align-items-center justify-content-center mx-2"
													
												>

													<Icon icon="fa-regular:clone"
														width="36"
														height="48"
														style={{ color: 'white' }} />
													<div className="mx-2 d-flex align-items-center">
														<p className="text-white mb-0 font25">{t('Copy')}</p>
													</div>
												</div>
											</button>

											<button className="carousel_btn violet_button mx-2"
												onClick={ (e) => deleteThis(e)}>
												<div
													className="d-flex align-items-center justify-content-center mx-2"
													>
													<Icon
														icon="ic:twotone-delete-outline"
														width="48"
														height="48"
														style={{ color: 'white' }} />

													<div className="mx-2 d-flex align-items-center">
														<p className="text-white mb-0 font25">{t('Delete')}</p>
													</div>
												</div>
											</button>
										</div>
									</div>
								</div>
							</div>
						</SwiperSlide>
					)
				}
			</Swiper>
		</>
	);
})

export default swiperPiercingMacro;