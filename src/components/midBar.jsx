import laserStore from "../store/laserStore";
import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { EffectCoverflow, /* Mousewheel */ } from 'swiper/modules';
import macrosStore from '../store/macrosStore';
import { observer } from 'mobx-react-lite';
import GCodeToSvg from "./gcodeToSvg";
import { motion } from "framer-motion";
import CanBan from "./canBan";
import jobStore from "../store/jobStore";
import { useTranslation } from 'react-i18next';
import constants from "../store/constants";
import CustomIcon from "../icons/customIcon";
 

const MidBar = observer(() => {

	const { t } = useTranslation();
	useEffect(() => {
		jobStore.loadJobs()
	}, [])


	const { paramsLimit, planViewType } = laserStore;
	const { leftMode } = laserStore
	const swiperRef = useRef(null);
	const { isVertical, presets } = macrosStore
	const { mockCards } = jobStore
	let tasks = []
	if (mockCards.Completed && mockCards.Completed.length) {
		tasks.push(mockCards.Completed[mockCards.Completed.length-1])
	}
	tasks = [...tasks, ...mockCards.Cutting]


	if (laserStore.loading) return <div>Загрузка...</div>;
	if (laserStore.error) return <div>Ошибка: {laserStore.error}</div>;

	const detectLimit =(param, limit )=>{
		if (!paramsLimit) return 0;
		const selector = 'limit'+ param + limit
		const limitVal = paramsLimit.filter(a => a.name === selector)[0]['val']
		return limitVal;	
	}

	return (

		<>
			<div style={{ position: "relative", width: "100%", height: "100%" }}>
				{/* Первый блок */}
				<motion.div
					key="blockA"
					initial={false}
					animate={{
						opacity: leftMode === 'sheet' ? 1 : 0,
						x: leftMode === 'sheet' ? 0 : -20,
						pointerEvents: leftMode === 'sheet' ? "auto" : "none",
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
						<div className={isVertical ? "d-flex w-100" : ""}>

							{/* Параметры с лимитами */}
							<div className="d-flex mx-2 flex-wrap">
								{paramsLimit.filter(a =>  ["Z","X","Y"].indexOf( a.name ) !=-1 ).map((item, i) => (
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
													<div className={ detectLimit (item.name, 'minus') === 0 ? "led-green-medium" : "led-gray-medium"}></div>
													<div className="limitText">Limit-</div>
												</div>
												<div className="d-flex align-items-center">
													<div className={ detectLimit (item.name, 'plus') === 0 ? "led-green-medium" : "led-gray-medium"}></div>
													<div className="limitText">Limit+</div>
												</div>
											</div>
										</div>
									</div>
								))}
							</div>

							{/* Параметры без лимитов */}
							<div className="d-flex mx-2 flex-wrap">
								{paramsLimit.filter(a =>  ["N2", "Nd", "f"].indexOf( a.name ) !=-1 ).map((item, i) => (
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
						</div>

						{/* SVG компонент */}
						<div className={`d-flex w-100 h-100 flex-center align-items-center ${isVertical ? "mt-2 ms-2" : ""}`}>
							<div className="planMain">
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
						opacity: leftMode === 'plan' ? 1 : 0,
						x: leftMode === 'plan' ? 0 : 20,
						pointerEvents: leftMode === 'plan' ? "auto" : "none",
					}}
					transition={{ duration: 0.25, ease: "easeInOut" }}
					style={{
						position: "absolute",
						inset: 0,
						width: "100%",
						height: "100%",
					}}
				>
					{/* Плавное переключение содержимого */}
					<motion.div
						key="content"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.25 }}
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",

						}}
					>
						<div
							style={{
								opacity: planViewType === "Carousel" ? 1 : 0,
								transition: "opacity 0.25s ease-in-out",
							}}
						>
							{/* Первый блок (Carousel) */}
							<div className="d-flex w-100 h-100 flex-center align-items-center justify-content-center">
								<div className="planMain">
									<Swiper
										onSwiper={(swiper) => {
											swiperRef.current = swiper;
										}}
										modules={[EffectCoverflow]}
										direction={isVertical ? 'vertical' : 'horizontal'}
										effect="coverflow"
										loop={false}
										slideToClickedSlide={true}
										grabCursor={true}
										centeredSlides={true}
										slidesPerView={5}
										initialSlide={macrosStore.selectedModulationMacro}
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
											macrosStore.setSelectedSlide(currentSlide);
										}}
									>
										{tasks.map((card) => {
											// Парсим loadResult один раз
											var loadResult

											try {
												loadResult = JSON.parse(card.loadResult);
											} catch (e) {
													
												loadResult = false
											}

											return (
												<SwiperSlide key={card.id}>
													<div className="swiperSlide swiperSlideInTasks position-absolute top-50 start-50 translate-middle fs-4">
														<div className="ccard">
															<div className="ccard-header">{card.name} {card.status} {card.is_cutting}</div>
															<div className="ccard-icon">

															{card.is_cutting === 1 &&
																<CustomIcon
																	icon="LaserInCut"
																	width="42"
																	height="42"
																	color="red"
																	fill="none"
																	strokeWidth={1}
																	className="ms-1"
																	viewBox='0 0 36 36'
																/>
															}


															{card.is_cutting === 0 && card.status === 1 &&																<CustomIcon
																	icon="LaserPending"
																	width="42"
																	height="42"
																	color="green"
																	fill="none"
																	strokeWidth={1}
																	className="ms-1"
																	viewBox='0 0 36 36'
																/>
															}

															{card.is_cutting === 0 && card.status === 3 &&					
																<CustomIcon
																	icon="LaserComplete"
																	width="42"
																	height="42"
																	color="var(--violet)"
																	fill="none"
																	strokeWidth={1}
																	className="ms-1"
																	viewBox='0 0 36 36'
																/>
															}



															
															</div>
															<div className="ccard-image-wrapper">
																<div className="ccard-image">
				    												<img src={`${constants.SERVER_URL}/api/get_svg/${card.id}`} alt={"img"} />
 																</div>
															</div>
															<div className="ccard-info-block">
																<div className="mt-2">
																	<div className="cardTime">
																		• {t('sheets')}:{ card.quantity }
																	</div>
																	<div className="cardMaterial">
																	
																	{loadResult?.result?.jobinfo?.attr ? (
																		<div className="cardMaterial">
																			• {t(loadResult.result.jobinfo.attr.label)} {card.materialLabel} {loadResult.result.jobinfo.attr.thickness} {t('mm')}
																		</div>
																	) : (
																		<div className="cardMaterial text-muted">
																			• {t('No material info')}
																		</div>
																	)}

																	</div>
																	<div className="cardMaterial">
																		• {card.dimX} * {card.dimY} {t('mm')}
																	</div>
																	
																	<div className="cardMaterial">
																		{presets.map((preset) =>
																			preset.id === card.preset ? (
																				<div className="cardTech" key={preset.id}>
																					• {t('macro')}: {preset.name}
																				</div>
																			) : null
																		)}
																	</div>
																</div>
															</div>
														</div>
													</div>
												</SwiperSlide>
											);
										})}


									</Swiper>
								</div>
							</div>
						</div>
					</motion.div>

					<motion.div
						key="content1"
						initial={{ opacity: 0 }}
						animate={{ opacity: planViewType === "CanBan" ? 1 : 0 }}
						transition={{ duration: 0.25 }}
						style={{
							position: "absolute",
							inset: 0,
							width: "100%",
							height: "100%",
						}}
					>
						{/* Второй блок (CanBan) */}
						<div
							style={{
								opacity: planViewType === "CanBan" ? 1 : 0,
								transition: "opacity 0.25s ease-in-out",
							}}
						>
							<div><CanBan /></div>
						</div>
					</motion.div>
				</motion.div>


			</div>

		</>

	)
});

export default MidBar;