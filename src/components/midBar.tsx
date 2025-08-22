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
		//laserStore.startPolling(10000);
		laserStore.fetchTasks()
		return () => laserStore.stopPolling();
	}, []);


	if (laserStore.loading) return <div>Загрузка...</div>;
	if (laserStore.error) return <div>Ошибка: {laserStore.error}</div>;


	return (

		<>
			{!carouselInPlan && <div className="d-flex flex-column w-100">
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

				{!carouselInPlan && tasks?.categories?.active?.items && (
					<div className="d-flex w-100 h-100 flex-center align-items-center justify-content-center">
						<div className="planMain">
							{Object.keys(tasks.categories.active.items).map((key, ind) =>
								ind === 0 ? (
									<img 
										key={key}
										src={`http://127.0.0.1/get_svg_card?folder=${encodeURIComponent(
											key.replace('.ncp', '')
										)}&filename=${encodeURIComponent(key.replace('.ncp', '.svg'))}`}
										alt="svg"										
									/>
								) : null
							)}
						</div>

					</div>
				)}



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
											<div className="ccard-header">{key} 00:08:10</div>
											<div className="ccard-image-wrapper">
												<div className="ccard-image">
													<img
														src={`http://127.0.0.1/get_svg_card?folder=${encodeURIComponent(key.replace('.ncp', ''))}&filename=${encodeURIComponent(key.replace('.ncp', '.svg'))}`}
														alt="svg"
													/>
												</div>
											</div>


											<div className="ccard-info-block">
												<div className="ccard-title">{key} </div>
												<div className="ccard-details">
													• {(tasks.categories.active.items[key].attributes.doc_attr.materialcode) || ''}
													• {(tasks.categories.active.items[key].attributes.doc_attr.label) || ''}
													• {(tasks.categories.active.items[key].attributes.doc_attr.thickness) || 0} mm
												</div>
												<div className="ccard-details">
													• {(tasks.categories.active.items[key].attributes.doc_attr.dimx) || 0}  ×
													{(tasks.categories.active.items[key].attributes.doc_attr.dimy) || 0} mm
												</div>
											</div>

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
