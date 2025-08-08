import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { Swiper as SwiperClass } from 'swiper/types';
import { EffectCoverflow, /* Mousewheel */ } from 'swiper/modules';
import UniversalKnob from './universalKnob';
import viewStore from '../store/viewStore';
import { observer } from 'mobx-react-lite';
import SwiperStringComponent from './swiperStringComponent';
import { Icon } from '@iconify/react/dist/iconify.js';


const swiperModulationMacro = observer(() => {
	const swiperRef = useRef<SwiperClass | null>(null);
	const { isVertical, modulationMacroinUse, technology, selectedModulationMacro, selectedSlide } = viewStore
	let arr = Array.from({ length: technology.modulationMacros.length })
	useEffect(() => {
		viewStore.setSelectedSlide(viewStore.selectedModulationMacro)
	}, [])

	const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.stopPropagation(); 
		viewStore.setTecnologyValue(selectedSlide, 'modulationMacro', 'macros', 0, 15, false)
	};

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
				slidesPerView={5}
				initialSlide={viewStore.selectedModulationMacro} // Нумерация с 0 (0=1-й слайд, 3=4-й слайд)
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
							<div className="swiperSlide position-absolute top-50 start-50 translate-middle fs-4">
								<div
									className={"text-center swiperSlideName " + (modulationMacroinUse.includes(ii) ? (ii === selectedModulationMacro ? "currentMacros" : "") : "notInUse")}
								>
									<div className='text-center'>
										<p className=''>
											{viewStore.getTecnologyValue('name', 'modulationMacros', ii)}:&nbsp;
											{viewStore.getTecnologyValue('pulseFill_percent', 'modulationMacros', ii)}%,&nbsp;
											{viewStore.getTecnologyValue('pulseFrequency_Hz', 'modulationMacros', ii)}Hz
										</p>
									</div>
								</div>

							{/* 	
								<div className={'d-flex justify-content-evenly align-items-center ' + (isVertical ? "mt-50" : "mt-50")}>
									<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
										<SwiperStringComponent param={'name'} keyParam={'modulationMacros'} keyInd={ii} />
									</div>
								</div> */}

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
								{ viewStore.selectedModulationMacro !== ii &&		<button className="carousel_btn violet_button m-2"
												onClick={(e) => handleMouseDown(e)}
									>
										<div className="d-flex align-items-center justify-content-center">
											<Icon
												icon="charm:square-tick"
												width="48"
												height="48"
												style={{ color: 'white' }} />

										</div>
									</button>}
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