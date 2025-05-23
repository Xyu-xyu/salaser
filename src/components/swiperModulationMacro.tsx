import { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { EffectCoverflow, Scrollbar } from 'swiper/modules';
import { Swiper as SwiperClass } from 'swiper/types';
//import StringComponent from './stringComponent';
//import UniversalKnob from './universalKnob';
import viewStore from '../store/viewStore';
import { observer } from 'mobx-react-lite';
import SwipeUniversalKnob from './swipeUniversalKnob';
import SwiperStringComponent from './swiperStringComponent';


const swiperModulationMacro = observer(() => {
 	let arr = Array.from({ length: 16 })
	const swiperRef = useRef<SwiperClass | null>(null);
	const { isVertical } = viewStore

	return (

		<>
			<Swiper
				onSwiper={(swiper) => {
					swiperRef.current = swiper;
				}}
				direction={isVertical ? 'vertical' : 'horizontal'}
				effect="coverflow"
				loop={false}
				slideToClickedSlide={true}
				grabCursor={true}
				centeredSlides={true}
				slidesPerView={5}
				initialSlide={ viewStore.selectedModulationMacro } // Нумерация с 0 (0=1-й слайд, 3=4-й слайд)
				freeMode={false}
				scrollbar={{ el: '.swiper-scrollbar', draggable: true }}
				coverflowEffect={{
					rotate: 0,
					stretch: 0,
					depth: 450,
					modifier: isVertical ? 1 : 0.8,
					slideShadows: false,
				}}
				modules={[EffectCoverflow, Scrollbar]}
				style={{
					height:'100%',
					width:'100%', 
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
 			>
				{
					arr.map((_, ii) =>
						<SwiperSlide>
							<div className="swiperSlide position-absolute top-50 start-50 translate-middle fs-4">
							<div 
								className={"text-center swiperSlideName "  /* +(ii % 2 === 0 ? "notInUse" : "") */}
								> 
								Any name for something  { ii }
								</div>	
							<div className={'d-flex justify-content-evenly align-items-center ' + (isVertical ? "mt-10" : "mt-4")}>
								<div className={isVertical ? "editModal_col d-contents" : "editModal_col_hor d-contents"}>
									<SwiperStringComponent param={'name'} keyParam={'modulationMacros'} keyInd={ii}/>
								</div>
							</div>
							<div className={'d-flex d-flex justify-content-evenly ' + (isVertical ? "mt-10" : "mt-10")} >
								{[								 
									"pulseFill_percent",
									"pulseFrequency_Hz",
								].map((a: string, i: number) => (
									<div className="editModal_row" key={i}>
										<div className={isVertical ? "editModal_col" : "editModal_col_hor"}>
											<SwipeUniversalKnob param={a}  keyParam={'modulationMacros'} keyInd={ii}/>
										</div>
									</div>
									))
								} 
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