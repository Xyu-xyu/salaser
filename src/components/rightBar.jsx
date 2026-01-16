import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import laserStore from "../store/laserStore";
import { UploadButton } from "./uploadButton";
import { AnimatePresence, motion } from "framer-motion";
import FunctionsForm from "./formFunctionsorm";
import PlanViewSwitcher from "./planViewSwitcher";
import AddPlanButton from "./navbar/addPlanButton";
import jobStore from "../store/jobStore";
import macrosStore from "../store/macrosStore";
import CustomIcon from "../icons/customIcon";
import { DetailsButton } from "./detailsButton";
import NewPlanButton from "./navbar/newPlanButton";
import svgStore from "../store/svgStore";
import constants from "../store/constants";

const RightBar = observer(() => {
	const { rightMode } = laserStore;
	const { selectedId } = jobStore;
	const { t } = useTranslation();

	// Настройки анимации для появления/исчезновения
	const fadeVariants = {
		hidden: { opacity: 0, x: 40 },
		visible: { opacity: 1, x: 0 },
		exit: { opacity: 0, x: 40 },
	};

	const deleteJob =()=>{
		macrosStore.setModalProps({
			show: true,
			modalBody: 'Do you want to delete job ?',
			confirmText: 'Delete',
			cancelText: 'Cancel',
			func: jobStore.deleteJob,
			args: []
		})
	}

	const editSelectedHardcode = () => {

		laserStore.setVal("centralBarMode", "planEditor")
		svgStore.startToEdit()

	}

	const editSelected = async () => {

		console.log("load ncp : " + selectedId)

	
		if (selectedId) {
			let resp = await fetch(
				constants.SERVER_URL + "/jdb/get_ncp",
				{
				  method: "POST",
				  headers: {
					/*"Content-Type": "application/json"*/
				  },
				  body: JSON.stringify({
					uuid: selectedId
				  })
				}
			  )
			  
			  const data = await resp.json()
			  laserStore.setVal("centralBarMode", "planEditor")
			  svgStore.startToEdit(data.content)
		}
	}
	

	return (
		<AnimatePresence mode="wait">
			{true && (
				<motion.div
					key="rightBar"
					initial="hidden"
					animate="visible"
					exit="exit"
					variants={fadeVariants}
					transition={{ duration: 0.4, ease: "easeInOut" }}
					id={rightMode === 'function' ? "FunctionBar" : "RightBar"}
					className="d-flex flex-column"
					style={{ position: "relative" }}
				>
					{rightMode === 'plan' &&
						<div>
							<div className="mt-2">
								<h5>{t("Plans")}</h5>
							</div>
							<AddPlanButton />
							<NewPlanButton />
							<div>
								<button className="w-100"
									onMouseDown={ deleteJob }
								>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="material-symbols:delete-outline-sharp"
											width="24"
											height="24"
											fill= {"black"}
											strokeWidth={0}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Tidy up")}</div>
									</div>
								</button>
							</div>
							<div>
								<button className="w-100"
									onMouseDown={ editSelectedHardcode }
								>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="material-symbols:delete-outline-sharp"
											width="24"
											height="24"
											fill= {"black"}
											strokeWidth={0}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("EDIT")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100" disabled>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="fluent:group-24-regular"
											width="24"
											height="24"
											color="black"
											fill="black"
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
								<button className="w-100" /*onClick={() => laserStore.setVal('rightMode', 'parameter')}*/ disabled>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="tabler:chart-dots-3"
											width="24"
											height="24"
											color="black"
											fill="black"
											strokeWidth={1}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Parameters")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100" onClick={() => laserStore.setVal('rightMode', 'function')}>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="hugeicons:function"
											width="24"
											height="24"
											color="black"
											strokeWidth={1.5}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Functions")}</div>
									</div>
								</button>
							</div>

							<div>
								<DetailsButton item={'selected'} />
							</div>

							<div>
								<button className="w-100" onClick={ editSelected }>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="bytesize:edit"
											width="24"
											height="24"
											color="black"
											viewBox="0 0 32 32"
											strokeWidth={2}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Edit")}</div>
									</div>
								</button>
							</div>

							<PlanViewSwitcher />

						</div>
					}

					{rightMode === 'parameter' &&

						<div>
							<div className="mt-2">
								<h5>{t("Parameters")}</h5>
							</div>

							<div>
								<UploadButton />
							</div>

							<div>
								<button className="w-100" disabled>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="fa7-solid:list-check"
											width="24"
											height="24"
											color="black"
											fill="black"
											viewBox="0 0 512 512"
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Select")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100" disabled>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="bytesize:edit"
											width="24"
											height="24"
											color="black"
											viewBox="0 0 32 32"
											strokeWidth={2}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Edit")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100 disabled" disabled>
									<div className="d-flex align-items-center">
									<CustomIcon
											icon="fa7-solid:list-check"
											width="24"
											height="24"
											color="black"
											fill="black"
											viewBox="0 0 512 512"
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
								<button className="w-100" onClick={() => laserStore.setVal('rightMode', 'function')} >
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="hugeicons:function"
											width="24"
											height="24"
											color="black"
											strokeWidth={1.5}
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("Functions")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100" disabled>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="solar:restart-bold"
											width="24"
											height="24"
											color="black"
											fill="black"
											className="ms-1"
											strokeWidth={0}
										/>
										<div className="flex-grow-1 text-center">{t("Restart")}</div>
									</div>
								</button>
							</div>

							<div className="mt-4">
								<h5>{t("Display")}</h5>
							</div>

							<div>
								<DetailsButton item={'is_cutting'} />
							</div>

							<div>
								<button className="w-100" disabled>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="carbon:view"
											width="24"
											height="24"
											color="black"
											fill="black"
											viewBox="0 0 32 32"
											className="ms-1"
										/>
										<div className="flex-grow-1 text-center">{t("View")}</div>
									</div>
								</button>
							</div>

							<div>
								<button className="w-100" disabled>
									<div className="d-flex align-items-center">
										<CustomIcon
											icon="flowbite:clipboard-list-outline"
											width="24"
											height="24"
											color="black"
											className="ms-1"											
										/>
										<div className="flex-grow-1 text-center">{t("Key")}</div>
									</div>
								</button>
							</div>
						</div>
					}
					{rightMode === 'function' &&
						<FunctionsForm />
					}
				</motion.div>
			)}
		</AnimatePresence>
	);
});

export default RightBar;


 