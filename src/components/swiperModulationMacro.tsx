import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Swiper as SwiperClass } from 'swiper/types';
import { EffectCoverflow, /* Mousewheel */ } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import UniversalKnob from './universalKnob';
import macrosStore from '../store/macrosStore';
import { observer } from 'mobx-react-lite';
import SwiperStringComponent from './swiperStringComponent';
import { useTranslation } from 'react-i18next';
import CustomIcon from '../icons/customIcon';


const swiperModulationMacro = observer(() => {
	const swiperRef = useRef<SwiperClass | null>(null);
	const { isVertical, modulationMacroinUse, technology, selectedModulationMacro, selectedSlide } = macrosStore
	let arr = Array.from({ length: technology.modulationMacros.length })
	const { t } = useTranslation()

	useEffect(() => {
		macrosStore.setSelectedSlide(macrosStore.selectedModulationMacro)
	}, [])

	const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation(); 
		macrosStore.setTecnologyValue(selectedSlide, 'modulationMacro', 'macros', 0, 15, false)
	};

	const cloneThis = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		macrosStore.setModalProps ({
		   show:true,
			modalBody: 'Do you want to copy and add this macro?',
		   confirmText: 'Copy',
		   cancelText:'Cancel',
		   func: macrosStore.AddAndUpdate,
		   args:['modulationMacros', macrosStore.selectedSlide, 'modulationMacro']
	   })
   }

   const deleteThis = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation();
		macrosStore.setModalProps ({
		   show:true,
			modalBody: 'Do you want to delete this macro?',
		   confirmText: 'Delete',
		   cancelText:'Cancel',
		   func: macrosStore.deleteAndUpdate,
		   args:['modulationMacros', macrosStore.selectedSlide, 'modulationMacro']
	   })
   }

	return (

		<>
			<Swiper
				onSwiper={(swiper) => {
					swiperRef.current = swiper;
				}}
				id="swiperModulationMacro"
				modules={[EffectCoverflow, /* Mousewheel */]}
				direction={isVertical ? 'vertical' : 'horizontal'}
				effect="coverflow"
				loop={false}
				slideToClickedSlide={true}
				grabCursor={true}
				centeredSlides={true}
				slidesPerView={5}
				initialSlide={macrosStore.selectedModulationMacro} // Нумерация с 0 (0=1-й слайд, 3=4-й слайд)
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
					macrosStore.setSelectedSlide(currentSlide);
				}}
			>
				{
					arr.map((_, ii) =>
						<SwiperSlide>
							<div className="swiperSlide position-absolute top-50 start-50 translate-middle fs-4">
								<div
									className={"text-center swiperSlideName " + (modulationMacroinUse.includes(ii) ? (ii === selectedModulationMacro ? "currentMacros" : "") : "notInUse")}
								>
									<div className='text-center'>
										<p className=''>
											{macrosStore.getTecnologyValue('name', 'modulationMacros', ii)}:&nbsp;
											{macrosStore.getTecnologyValue('pulseFill_percent', 'modulationMacros', ii)}%,&nbsp;
											{macrosStore.getTecnologyValue('pulseFrequency_Hz', 'modulationMacros', ii)}Hz
										</p>
									</div>
								</div>

								
								<div className={'d-flex justify-content-center align-items-center flex-column'}>
									<div className={'d-flex justify-content-evenly align-items-center ' + (isVertical ? "mt-50" : "mt-50")}>

										<div>	
											<div className={'d-flex justify-content-evenly align-items-center ' + (isVertical ? "mt-50" : "mt-50")}>
												<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
													<SwiperStringComponent param={'name'} keyParam={'modulationMacros'} keyInd={ii} />
												</div>
											</div>
											<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-4" : "mt-4")} >
												{[
													"pulseFill_percent",
													"pulseFrequency_Hz",
												].map((a: string, i: number) => (
													<div className="editModal_row " key={i}>
														<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
															<UniversalKnob param={a} keyParam={'modulationMacros'} keyInd={ii} />
														</div>
													</div>
												))
												}
											</div>
										</div>	
									</div>
									<div className='mt-50 d-flex d-flex w-100 align-items-center justify-content-center'>
									{ macrosStore.selectedModulationMacro !== ii &&		
										<button className="carousel_btn violet_button m-2"	onClick={(e) => handleMouseDown(e)}>
											<div className="d-flex align-items-center justify-content-center">
												<CustomIcon
													icon="charm:square-tick"
													width="36"
													height="36"
													strokeWidth={1}
													color='white'
													viewBox='0 0 16 16' />
												<div className="mx-2 d-flex align-items-center">
													<p className="text-white mb-0 font25">{ t('Set') }</p>
												</div>
											</div>
										</button>}
										<button className="carousel_btn mx-2" onClick={ (e) => deleteThis(e)}>
											<div
												className="d-flex align-items-center justify-content-center mx-2"
											>
												<CustomIcon
													icon="ic:twotone-delete-outline"
													width="36"
													height="36"
													fill='white'
													strokeWidth={0}
												/>
												<div className="mx-2 d-flex align-items-center">
													<p className="text-white mb-0 font25">{ t('Delete') }</p>
												</div>
											</div>
										</button>

										<button className="carousel_btn violet_button mx-2" onClick={ (e)=> cloneThis(e) }>
											<div
												className="d-flex align-items-center justify-content-center mx-2"
											>
												<CustomIcon
													icon="fa-regular:clone"
													width="24"
													height="36"
													color= 'white'
													fill = 'white'
													viewBox='0 0 512 512'
												/>
												<div className="mx-2 d-flex align-items-center">
													<p className="text-white mb-0 font25">{ t('Copy') }</p>
												</div>
											</div>
										</button>
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

export default swiperModulationMacro;