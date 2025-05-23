import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import PlanCard from './planCard';
import 'swiper/css/scrollbar';
import { EffectCoverflow, Scrollbar } from 'swiper/modules';
import { Swiper as SwiperClass } from 'swiper/types';
import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
 

const  SwiperPlan =observer (()=> {
	let arr = Array.from({ length: 8 })
	const swiperRef = useRef<SwiperClass | null>(null);
	const { isVertical} = viewStore

	return (

		<>
 <Swiper
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      direction={isVertical ? 'vertical' : 'horizontal'}
      effect="coverflow"
      loop={true}
      slideToClickedSlide={true}
      grabCursor={true}
      centeredSlides={true}
      slidesPerView={3}
      freeMode={false}
      scrollbar={{ el: '.swiper-scrollbar', draggable: true }}
      coverflowEffect={{
        rotate: isVertical ? 0 : 0,
        stretch: isVertical ? 0 : 0,
        depth: 400,
        modifier: isVertical ? 1: 0.8,
        slideShadows: false,
      }}
      modules={[EffectCoverflow, Scrollbar ]}
	  style={{
        height: isVertical ? '80vh' : '80%',
        width: isVertical ? '80%' : '80vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
	  /* className="mySwiper" */
    >
				{
					arr.map((a,i) =>
						<SwiperSlide>
							<PlanCard />
						</SwiperSlide>
					)
				}
				<div className="swipeButtons">
					<div>
						<button
							onClick={() => swiperRef.current?.slidePrev()}
							className="mx-1 grey_button"
						>◀</button>
						<button
							className="mx-1   grey_button"
						>■</button>
						<button
							onClick={() => swiperRef.current?.slideNext()}
							className="mx-1   grey_button"
						>▶</button>
					</div>
				</div>
			</Swiper>
		</>
	);
})


export default SwiperPlan;