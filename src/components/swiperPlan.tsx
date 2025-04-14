import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import PlanCard from './planCard';

// import required modules
import { EffectCoverflow, Pagination } from 'swiper/modules';
import { Swiper as SwiperClass } from 'swiper/types';


export default function SwiperPlan() {
	let arr = Array.from({ length: 10 })
	const swiperRef = useRef<SwiperClass | null>(null);

	return (

		<>
			<Swiper

				onSwiper={(swiper) => {
					swiperRef.current = swiper;
				}}
				effect={'coverflow'}
				grabCursor={true}
				spaceBetween={30}
				loop={true}
				centeredSlides={true}
				slidesPerView={3}
				coverflowEffect={{
					rotate: 0,
					stretch: 50,
					depth: 1000,
					modifier: 0.8,
					slideShadows: false,
				}}
				pagination={false}
				modules={[EffectCoverflow, Pagination]}
				className="mySwiper"
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
							className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
						>◀</button>
						<button
							className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
						>■</button>
						<button
							onClick={() => swiperRef.current?.slideNext()}
							className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
						>▶</button>
					</div>
				</div>
			</Swiper>
		</>
	);
}
