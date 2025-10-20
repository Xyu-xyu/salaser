import laserStore from "../store/laserStore";
import { useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { Swiper as SwiperClass } from 'swiper/types';
import { EffectCoverflow, /* Mousewheel */ } from 'swiper/modules';
import viewStore from '../store/viewStore';
import { observer } from 'mobx-react-lite';
import GCodeToSvg from "./gcodeToSvg1";
import { AnimatePresence, motion } from "framer-motion";

interface ParamItem {
	name: string;
	val: number;
	measure: string;
}

const MidBar = observer(() => {
	let params = [
		{ name: 'N2', measure: 'bar', val: 4.8 },
		{ name: 'Nd', measure: 'mm', val: 12.7 },
		{ name: 'f', measure: 'kHz', val: 88.7 },
	]

	const { paramsLimit } = laserStore;
	useEffect(() => {
		laserStore.fetchTasks();

		return () => {
			laserStore.stopPolling();
		};
	}, []);


	const { carouselInPlan, tasks } = laserStore
	const swiperRef = useRef<SwiperClass | null>(null);
	const { isVertical } = viewStore


	if (laserStore.loading) return <div>Загрузка...</div>;
	if (laserStore.error) return <div>Ошибка: {laserStore.error}</div>;


	return (

		<>
			<div style={{ position: "relative", width: "100%", height: "100%" }}>
				{/* Первый блок */}
				<motion.div
					key="blockA"
					initial={false}
					animate={{
						opacity: !carouselInPlan ? 1 : 0,
						x: !carouselInPlan ? 0 : -20,
						pointerEvents: !carouselInPlan ? "auto" : "none",
					}}
					transition={{ duration: 0.25, ease: "easeInOut" }}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
					}}
				>
					<div className="d-flex flex-column w-100">
						<div className="d-flex mx-2 flex-wrap">
							{paramsLimit.map((item: ParamItem, i: number) => (
								<div className="currentPlanMeasureWpapperWpapper d-flex" key={i}>
									<div className="currentPlanMeasureWpapper">
										<div className="currentPlanMeasure">
											<div className="currentPlanMeasureNameCont">
												<div className="currentPlanMeasureName">{item.name}</div>
											</div>
											<div className="currentPlanMeasureValConainer d-flex align-items-center">
												<div className="currentPlanMeasureValue">{item.val.toFixed(2)}</div>
												<div className="currentPlanMeasureItem mx-1">{item.measure}</div>
											</div>
										</div>
									</div>
									<div className="currentPlanLimits my-2 ms-2">
										<div className="d-flex flex-column">
											<div className="d-flex align-items-center mb-1">
												<div className={item.val > 500 ? "led-green-medium" : "led-gray-medium"}></div>
												<div className="limitText">Limit-</div>
											</div>
											<div className="d-flex align-items-center">
												<div className={item.val < 500 ? "led-green-medium" : "led-gray-medium"}></div>
												<div className="limitText">Limit+</div>
											</div>
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="d-flex mx-2 flex-wrap">
							{params.map((item, i) => (
								<div className="currentPlanMeasureWpapperWpapper d-flex" key={i}>
									<div className="currentPlanMeasureWpapper">
										<div className="currentPlanMeasure">
											<div className="currentPlanMeasureNameCont">
												<div className="currentPlanMeasureName">{item.name}</div>
											</div>
											<div className="currentPlanMeasureValConainer d-flex align-items-center">
												<div className="currentPlanMeasureValue">{item.val.toFixed(2)}</div>
												<div className="currentPlanMeasureItem mx-1">{item.measure}</div>
											</div>
										</div>
									</div>
									<div className="currentPlanLimits"></div>
								</div>
							))}
						</div>

						<div className="d-flex w-100 h-100 flex-center align-items-center">
							<div className="planMain" style={{ border: "2px solid grey", borderRadius: "10px" }}>
								<GCodeToSvg />
							</div>
						</div>
					</div>
				</motion.div>

				{/* Второй блок */}
				<motion.div
					key="blockB"
					initial={false}
					animate={{
						opacity: carouselInPlan ? 1 : 0,
						x: carouselInPlan ? 0 : 20,
						pointerEvents: carouselInPlan ? "auto" : "none",
					}}
					transition={{ duration: 0.25, ease: "easeInOut" }}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
					}}
				>
					<div className="d-flex w-100 h-100 flex-center align-items-center justify-content-center">
						<div className="planMain">
							{/* Ваш контент для режима carousel */}
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
									height: isVertical ? '1600px' : '800px',
									width: isVertical ? '800px' : '1600px',
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
									tasks.map((key: any) =>
										<SwiperSlide>
											<div className="swiperSlide swiperSlideInTasks position-absolute top-50 start-50 translate-middle fs-4">

												<div className="ccard">
													<div className="ccard-header">{key} 00:08:10</div>
													<div className="ccard-image-wrapper">
														<div className="ccard-image">
															<img
																src={'/'}
																alt="svg"
															/>
														</div>
													</div>

													<div className="ccard-info-block">
														<div className="ccard-title">{key} </div>
														<div className="ccard-details">
															• materialcode
															• label
															• thickness mm
														</div>
														<div className="ccard-details">
															• dimx mm
															• dimy mm
														</div>
													</div>

												</div>

											</div>
										</SwiperSlide>
									)
								}
							</Swiper>
						</div>
					</div>
				</motion.div>
			</div>

		</>

	)
});

export default MidBar;
