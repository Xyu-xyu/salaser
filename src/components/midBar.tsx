import laserStore from "../store/laserStore";
import { useRef, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/scrollbar';
import { Swiper as SwiperClass } from 'swiper/types';
import { EffectCoverflow, /* Mousewheel */ } from 'swiper/modules';
import macrosStore from '../store/macrosStore';
import { observer } from 'mobx-react-lite';
import GCodeToSvg from "./gcodeToSvg";
import { motion } from "framer-motion";
import CanBan from "./canBan";
import jobStore from "../store/jobStore";
import { useTranslation } from 'react-i18next';
import constants from "../store/constants";

interface ParamItem {
	name: string;
	val: number;
	measure: string;
}

/* interface JobInfoAttr {
	thickness: string;
	id: number;
	preset: number;
	status: number;
	name: string;
	dimX: number;
	dimY: number;
	materialLabel: string;
	quantity: number;
	created_at: string;
	updated_at: string;
	loadResult: string;
} */

const MidBar = observer(() => {
	let params = [
		{ name: 'N2', measure: 'bar', val: 4.8 },
		{ name: 'Nd', measure: 'mm', val: 12.7 },
		{ name: 'f', measure: 'kHz', val: 88.7 },
	]

	const { t } = useTranslation();

	useEffect(() => {
		jobStore.loadJobs()
	}, [])


	const { paramsLimit, planViewType } = laserStore;
	const { leftMode } = laserStore
	const swiperRef = useRef<SwiperClass | null>(null);
	const { isVertical, presets } = macrosStore
	const { mockCards } = jobStore
	const tasks = mockCards.Cutting || []


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

							{/* Параметры без лимитов */}
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
											const loadResult = JSON.parse(card.loadResult);

											return (
												<SwiperSlide key={card.id}>
													<div className="swiperSlide swiperSlideInTasks position-absolute top-50 start-50 translate-middle fs-4">
														<div className="ccard">
															<div className="ccard-header">{card.name}</div>
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
																		• {t(loadResult.result.jobinfo.attr.label)} {card.materialLabel} {loadResult.result.jobinfo.attr.thickness} {t('mm')}
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