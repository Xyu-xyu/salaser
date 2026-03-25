import { useCallback, useEffect, useMemo, useState } from "react";
import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import Panel from "./panel.jsx";
import CustomIcon from "../../../icons/customIcon.jsx";
import svgStore from "../../../store/svgStore.jsx";
import editorStore from "../../../store/editorStore.jsx";
import panelStore from "../../../store/panelStore.jsx";
import { addToSheetLog } from "../../../scripts/addToSheetLog.jsx";
import { showToast } from "../../toast.jsx";
import {
	RESIDUAL_CUT_MAX_STEP,
	RESIDUAL_CUT_MIN_STEP,
	buildResidualCutGeometry,
	buildResidualCutSimulationSequence,
	clampResidualCutStep,
	generateAutoResidualCutAreas,
} from "../../../scripts/residualCutUtils.jsx";

const SheetResidualCutPanel = observer(() => {
	const { t } = useTranslation();
	const isMini = panelStore.positions.sheetResidualCutPopup?.mini ?? true;
	const residualCutStep = svgStore.getResidualCutStep();
	const residualCutAreas = svgStore.getResidualCutAreas();
	const safetyClearance = svgStore.getSheetSafetyClearance();
	const [stepInput, setStepInput] = useState(() => String(residualCutStep));
	const isManualMode = editorStore.mode === "residualCut";
	const geometry = useMemo(() => buildResidualCutGeometry(
		residualCutAreas,
		svgStore.svgData?.width,
		svgStore.svgData?.height
	), [
		residualCutAreas,
		svgStore.svgData?.height,
		svgStore.svgData?.width,
	]);

	useEffect(() => {
		svgStore.ensureResidualCutState();
	}, []);

	useEffect(() => {
		setStepInput(String(residualCutStep));
	}, [residualCutStep]);

	useEffect(() => () => {
		svgStore.resetResidualCutDraft();
		svgStore.stopResidualCutSimulation();
		if (editorStore.mode === "residualCut") {
			editorStore.setMode("resize");
		}
	}, []);

	const commitStep = useCallback((rawValue) => {
		const nextStep = clampResidualCutStep(rawValue);
		svgStore.setResidualCutStep(nextStep);
		setStepInput(String(nextStep));
		return nextStep;
	}, []);

	const exitManualMode = useCallback(() => {
		svgStore.resetResidualCutDraft();
		if (editorStore.mode === "residualCut") {
			editorStore.setMode("resize");
		}
	}, []);

	const handleDeleteResidualCut = useCallback(() => {
		if (!residualCutAreas.length && !isManualMode) {
			return;
		}

		exitManualMode();
		svgStore.clearResidualCut();
		addToSheetLog("Residual cut deleted");
	}, [exitManualMode, isManualMode, residualCutAreas.length]);

	const handleAutoResidualCut = useCallback(() => {
		const nextStep = commitStep(stepInput);
		exitManualMode();

		const nextAreas = generateAutoResidualCutAreas(
			svgStore.svgData,
			nextStep,
			safetyClearance
		);
		svgStore.setResidualCutAreas(nextAreas);

		if (nextAreas.length) {
			addToSheetLog("Residual cut updated");
			return;
		}

		showToast({
			type: "info",
			message: "No residual cut found",
		});
	}, [commitStep, exitManualMode, safetyClearance, stepInput]);

	const handleEnterManualMode = useCallback(() => {
		svgStore.stopResidualCutSimulation();
		svgStore.resetResidualCutDraft();
		editorStore.setMode("residualCut");
	}, []);

	const handleSaveResidualCut = useCallback(() => {
		if (!isManualMode) {
			return;
		}

		exitManualMode();
		addToSheetLog("Residual cut saved");
	}, [exitManualMode, isManualMode]);

	const handleShowResidualCut = useCallback(() => {
		const sequence = buildResidualCutSimulationSequence(geometry.displayPaths);
		if (!sequence.length) {
			showToast({
				type: "warning",
				message: "Create residual cut first",
			});
			return;
		}

		exitManualMode();
		svgStore.setResidualCutSimulation({
			on: true,
			sequence,
			segmentIndex: 0,
			segmentProgress: 0,
		});
	}, [exitManualMode, geometry.displayPaths]);

	const handleStepChange = useCallback((event) => {
		setStepInput(event.currentTarget.value);
	}, []);

	const handleStepBlur = useCallback((event) => {
		commitStep(event.currentTarget.value);
	}, [commitStep]);

	const handleStepKeyDown = useCallback((event) => {
		if (event.key === "Enter") {
			event.currentTarget.blur();
			return;
		}

		if (event.key === "Escape") {
			event.preventDefault();
			setStepInput(String(svgStore.getResidualCutStep()));
		}
	}, []);

	const panelInfo = {
		id: "sheetResidualCutPopup",
		fa: (
			<>
				<CustomIcon
					icon="wpf:cut-paper"
					width="24"
					height="24"
					color="black"
					fill="black"
					strokeWidth={0}
					className="m-2"
					viewBox="0 0 24 24"
				/>
				<div>{t("Residual cut")}</div>
			</>
		),
		content: isMini ? null : (
			<div className="d-flex flex-column">
				<table className="table mb-0">
					<tbody>
						<tr>
							<td>
								<div
									className="d-flex align-items-center justify-content-center flex-wrap"
									style={{ gap: "6px" }}
								>
									<button
										type="button"
										className="btn btn-sm violet_button text-white"
										title={t("Delete")}
										onMouseDown={handleDeleteResidualCut}
									>
										<CustomIcon
											icon="material-symbols:delete-outline"
											width="20"
											height="20"
											color="white"
											fill="white"
											strokeWidth={0}
										/>
									</button>
									<button
										type="button"
										className="btn btn-sm violet_button text-white"
										title={t("auto")}
										onMouseDown={handleAutoResidualCut}
									>
										<CustomIcon
											icon="mdi:automatic"
											width="20"
											height="20"
											color="white"
											fill="white"
											strokeWidth={0}
										/>
									</button>
									<button
										type="button"
										className="btn btn-sm violet_button text-white"
										title={t("Manual")}
										onMouseDown={handleEnterManualMode}
									>
										<CustomIcon
											icon="hand"
											width="20"
											height="20"
											color="white"
											fill="white"
											strokeWidth={0}
										/>
									</button>
									<button
										type="button"
										className="btn btn-sm violet_button text-white"
										title={t("Save")}
										onMouseDown={handleSaveResidualCut}
										disabled={!isManualMode}
									>
										<CustomIcon
											icon="upload"
											width="20"
											height="20"
											color="white"
											fill="white"
											strokeWidth={0}
										/>
									</button>
									<button
										type="button"
										className="btn btn-sm violet_button text-white"
										title={t("Play")}
										onMouseDown={handleShowResidualCut}
									>
										<CustomIcon
											icon="play"
											width="20"
											height="20"
											color="white"
											fill="white"
											strokeWidth={0}
										/>
									</button>
									{isManualMode ? (
										<button
											type="button"
											className="btn btn-sm violet_button text-white"
											title={t("Exit")}
											onMouseDown={exitManualMode}
										>
											<CustomIcon
												icon="material-symbols:close-rounded"
												width="20"
												height="20"
												color="white"
												fill="white"
												strokeWidth={0}
											/>
										</button>
									) : null}
								</div>
							</td>
						</tr>
						<tr>
							<td>
								<div
									className="d-flex align-items-center justify-content-between flex-wrap"
									style={{ gap: "8px" }}
								>
									<div className="d-flex align-items-center">
										<label
											htmlFor="sheetResidualCutStep"
											className="mb-0 me-2 text-nowrap"
											style={{ fontSize: "12px" }}
										>
											{t("Step")}
										</label>
										<input
											id="sheetResidualCutStep"
											type="number"
											className="form-control form-control-sm"
											style={{ width: "92px" }}
											min={RESIDUAL_CUT_MIN_STEP}
											max={RESIDUAL_CUT_MAX_STEP}
											step={1}
											value={stepInput}
											onChange={handleStepChange}
											onBlur={handleStepBlur}
											onKeyDown={handleStepKeyDown}
										/>
										<span className="ms-2">mm</span>
									</div>
									<div className="text-nowrap" style={{ fontSize: "12px" }}>
										<strong>{residualCutAreas.length}</strong>
										<span className="ms-1">areas</span>
										<span className="mx-1">/</span>
										<strong>{geometry.displayPaths.length}</strong>
										<span className="ms-1">cuts</span>
									</div>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		),
	};

	return <Panel key="panelSheetResidualCut" element={panelInfo} />;
});

export default SheetResidualCutPanel;
