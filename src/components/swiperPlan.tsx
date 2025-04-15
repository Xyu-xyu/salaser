import { useEffect, useRef, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import PlanCard from './planCard';
import 'swiper/css/scrollbar';
import { EffectCoverflow, Scrollbar } from 'swiper/modules';
import { Swiper as SwiperClass } from 'swiper/types';
 

export default function SwiperPlan() {
	let arr = Array.from({ length: 10 })
	const swiperRef = useRef<SwiperClass | null>(null);
	const [isVertical, setIsVertical] = useState<boolean>(
		window.innerHeight > window.innerWidth
	  );
	
 	  const checkOrientation = () => {
		setIsVertical(window.innerHeight > window.innerWidth);
	  };
	
	  // установка listener на resize
	  useEffect(() => {
		window.addEventListener('resize', checkOrientation);
		return () => {
		  window.removeEventListener('resize', checkOrientation);
		};
	  }, []);

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
        depth: 750,
        modifier: isVertical ? 1: 0.8,
        slideShadows: false,
      }}
      modules={[EffectCoverflow, Scrollbar ]}
	  style={{
        height: isVertical ? '100vh' : '80%',
        width: isVertical ? '534px' : '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
	  /* className="mySwiper" */
    >
				{
					arr.map(a =>
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
}
