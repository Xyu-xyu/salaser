import { observer } from "mobx-react-lite";
import { Icon } from "@iconify/react";
import { useTranslation } from "react-i18next";
import laserStore from "../store/laserStore";
import { UploadButton } from "./uploadButton";
import { AnimatePresence, motion } from "framer-motion";

const RightBar = observer(() => {
	const { carouselInPlan, rightMode } = laserStore;
	const { t } = useTranslation();

	// Настройки анимации для появления/исчезновения
	const fadeVariants = {
		hidden: { opacity: 0, x: 40 },
		visible: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 40 },
	};

	return (
		<AnimatePresence mode="wait">
			{rightMode && (
				<motion.div
					key="rightBar"
					initial="hidden"
					animate="visible"
					exit="exit"
					variants={fadeVariants}
					transition={{ duration: 0.4, ease: "easeInOut" }}
					id="RightBar"
					className="d-flex flex-column"
					style={{ position: "relative" }}
				>
					{carouselInPlan ? (
						<div>
							<div className="mt-2">
								<h5>{t("Plans")}</h5>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fluent:copy-add-20-regular"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Add")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fluent:tab-new-24-filled"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("New")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fluent-mdl2:remove-from-trash"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Tidy up")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fluent:group-24-regular"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Group")}</div>
									</div>
								</button>
							</div>

							<div className="mt-4">
								<h5>{t("Plan")}</h5>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="tabler:chart-dots-3"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Parameters")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="ph:function"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Functions")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fluent:clipboard-more-20-regular"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Details")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fluent:edit-24-regular"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Edit")}</div>
									</div>
								</button>
							</div>

							<div className="mt-4">
								<h5>{t("View")}</h5>
							</div>
						</div>
					) : (
						<div>
							<div className="mt-2">
								<h5>{t("Parameters")}</h5>
							</div>

							<div>
								<UploadButton />
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fa7-solid:list-check"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Select")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="fa7-solid:list-check"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Edit")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100 disabled" disabled>
									<div className="d-flex align-items-center">
										<Icon
											icon="fa7-solid:list-check"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Wizard")}</div>
									</div>
								</button>
							</div>

							<div className="mt-4">
								<h5>{t("Functions")}</h5>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="hugeicons:function"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Functions")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="solar:restart-bold"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Restart")}</div>
									</div>
								</button>
							</div>

							<div className="mt-4">
								<h5>{t("Display")}</h5>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="tabler:chart-dots-3"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Display")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="carbon:view"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("View")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100">
									<div className="d-flex align-items-center">
										<Icon
											icon="flowbite:clipboard-list-outline"
											width="24"
											height="24"
											style={{ color: "black" }}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Key")}</div>
									</div>
								</button>
							</div>
						</div>
					)}
				</motion.div>
			)}
		</AnimatePresence>
	);
});

export default RightBar;
