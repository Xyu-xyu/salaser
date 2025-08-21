import laserStore from "../store/laserStore";
import axios from "axios";
import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { Swiper as SwiperClass } from 'swiper/types';
import { EffectCoverflow, /* Mousewheel */ } from 'swiper/modules';
import viewStore from '../store/viewStore';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';


const MidBar = observer(() => {
	let params = [
		{ name: 'N2', measure: 'bar', val: 4.8 },
		{ name: 'Nd', measure: 'mm', val: 12.7 },
		{ name: 'f', measure: 'kHz', val: 88.7 },
	]

	let paramsLimit = [
		{ name: 'X', measure: 'mm', val: 1250.44 },
		{ name: 'Y', measure: 'mm', val: 44.777 },
		{ name: 'Z', measure: 'mm', val: 28.77 },
	]

	const { carouselInPlan, tasks } = laserStore
	const swiperRef = useRef<SwiperClass | null>(null);
	const { isVertical } = viewStore

	useEffect(() => {
		laserStore.startPolling(10000);
		return () => laserStore.stopPolling();
	  }, []);
	
	  if (laserStore.loading) return <div>Загрузка...</div>;
	  if (laserStore.error) return <div>Ошибка: {laserStore.error}</div>;
	

	return (

		<>
			{!carouselInPlan && <div className="d-flex flex-column">
				<div className="d-flex mx-2 flex-wrap">
					{
						paramsLimit.map((item, i) => {
							return (
								<div className="currentPlanMeasureWpapperWpapper d-flex" key={i}>
									<div className="currentPlanMeasureWpapper">
										<div className="currentPlanMeasure">

											<div className="currentPlanMeasureNameCont">
												<div className="currentPlanMeasureName">
													{item.name}
												</div>
											</div>

											<div className="currentPlanMeasureValConainer d-flex align-items-center">
												<div className="currentPlanMeasureValue">
													{item.val.toFixed(2)}
												</div>
												<div className="currentPlanMeasureItem mx-1">
													{item.measure}
												</div>
											</div>
										</div>
									</div>
									<div className="currentPlanLimits my-2 ms-2">
										<div className="d-flex flex-column">
											<div className="d-flex  align-items-center mb-1">
												<div className="led-green-medium">
												</div>
												<div className="limitText">
													Limit-
												</div>
											</div>
											<div className="d-flex  align-items-center">
												<div className="led-gray-medium">
												</div>
												<div className="limitText">
													Limit+
												</div>
											</div>
										</div>
									</div>
								</div>
							)

						})
					}
				</div>
				<div className="d-flex mx-2 flex-wrap">
					{
						params.map((item, i) => {
							return (
								<div className="currentPlanMeasureWpapperWpapper d-flex" key={i}>
									<div className="currentPlanMeasureWpapper">
										<div className="currentPlanMeasure">

											<div className="currentPlanMeasureNameCont">
												<div className="currentPlanMeasureName">
													{item.name}
												</div>
											</div>

											<div className="currentPlanMeasureValConainer d-flex align-items center">
												<div className="currentPlanMeasureValue">
													{item.val.toFixed(2)}
												</div>
												<div className="currentPlanMeasureItem mx-1">
													{item.measure}
												</div>
											</div>
										</div>
									</div>
									<div className="currentPlanLimits">
									</div>
								</div>
							)

						})
					}
				</div>

				{!carouselInPlan && <div className="d-flex w-100 h-100 flex-start p-3">
					<img src="/images/06.08 1,5мм-01.svg" alt="Plan Image" />
				</div>}

			</div>}
			{carouselInPlan &&
				<div>
					<Swiper
						onSwiper={(swiper) => {
							swiperRef.current = swiper;
						}}
						modules={[EffectCoverflow, /* Mousewheel */]}
						direction={'horizontal'}
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
							height: '800px',
							width: '1600px',
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
							Object.keys(tasks.categories.active.items).map((key) =>
								<SwiperSlide>
									<div className="swiperSlide swiperSlideInTasks position-absolute top-50 start-50 translate-middle fs-4">
										
										<div className="ccard">
											<div className="ccard-header">{ key } 00:08:10</div>
											<div className="d-flex w-100 justify-content-center mt-50">
												<div className="ccard-image card-image">
													<img src="/images/06.08 1,5мм-01.svg" alt="Plan Image" />
												</div>
											</div>
											

											<div className="ccard-title">jia</div>
											<div className="ccard-details">mr · 0.00 mm</div>
											<div className="ccard-details">20# · 954.99×725.54 mm · 1000×1000 mm</div>
											<div className="ccard-footer">大口有求</div>
										</div>

									</div>
								</SwiperSlide>
							)
						}
					</Swiper>

				</div>
			}
		</>

	)
});

export default MidBar;
