import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import Panel from "./panel.jsx";
import svgStore from "./../../../store/svgStore.jsx";
import { addToSheetLog } from "./../../../scripts/addToSheetLog.jsx";
import { useTranslation } from "react-i18next";
import CustomIcon from "./../../../icons/customIcon.jsx";
import { ReactSortable } from "react-sortablejs";
import TooltipCreator from "./tooltipCreator";
import {
	getAutoSheetCutOrder,
	getPositionPreviewData,
} from "./../../../scripts/sheetCutUtils.jsx";
import panelStore from "./../../../store/panelStore.jsx";

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const SheetCutPanel = observer(() => {
	const { t } = useTranslation();
	const [WH, setWH] = useState({ w: 50, h: 50 });
	const [miniSvg, setMiniSvg] = useState({ sizeX: 25, sizeY: 25 });
	const isMini = panelStore.positions.sheetCutPopup?.mini ?? true;
	const positions = isMini ? [] : svgStore.svgData.positions.slice();
	const activeCutOrderMode = svgStore.getSheetCutMode();
	const sectorSize = svgStore.getSheetCutSectorSize();
	const maxSectorSize = svgStore.getSheetCutSectorMax();
	const positionIdsSignature = positions.map(position => position.part_id).join("|");
	const speed = Number(svgStore.laserShow.speed) || 50;
	const progress = clamp(Number(svgStore.laserShow.progress) || 0, 0, 100);
	const isPlaying = Boolean(svgStore.laserShow.on && !svgStore.laserShow.paused);
	const isPaused = Boolean(svgStore.laserShow.on && svgStore.laserShow.paused);
	const activePartId = svgStore.laserShow.activePartId ?? null;
	const hoverPartId = svgStore.laserShow.hoverPartId ?? null;
	const highlightedPartId = hoverPartId ?? activePartId;
	const currentOrder = Math.min(
		positions.length,
		Number(svgStore.laserShow.currentOrder) || 0
	);
	const completedPartIds = new Set(
		positions
			.slice(0, Math.max(currentOrder - 1, 0))
			.map(pos => pos.part_id)
	);

	useEffect(() => {
		svgStore.ensureSheetCutState();
	}, [maxSectorSize, positionIdsSignature]);

	const runCutQue = () => {
		const shouldRestart = progress >= 100;
		const seekVersion = Number(svgStore.laserShow.seekVersion) || 0;

		svgStore.setLaserShow({
			on: true,
			paused: false,
			speed,
			...(shouldRestart
				? {
					progress: 0,
					seek: 0,
					seekVersion: seekVersion + 1,
				}
				: {}),
		});
	};

	const pauseCutQue = () => {
		if (!svgStore.laserShow.on) return;

		svgStore.setLaserShow({
			on: true,
			paused: true,
			speed,
			seek: progress,
		});
	};

	const stopCutQue = () => {
		svgStore.setLaserShow({
			on: false,
			paused: false,
			speed,
			progress: 0,
			seek: 0,
			activePartId: null,
			currentOrder: 0,
		});
	};

	const setShowSpeed = (e) => {
		const val = +e.currentTarget.value;
		svgStore.setLaserShow({
			on: svgStore.laserShow.on,
			paused: svgStore.laserShow.paused,
			speed: val,
		});
	};

	const setSeekProgress = (e) => {
		const value = clamp(+e.currentTarget.value, 0, 100);
		const seekVersion = (Number(svgStore.laserShow.seekVersion) || 0) + 1;

		svgStore.setLaserShow({
			on: true,
			paused: true,
			speed,
			progress: value,
			seek: value,
			seekVersion,
		});
	};

	const setHoveredPart = (partId = null) => {
		if ((svgStore.laserShow.hoverPartId ?? null) === partId) return;
		svgStore.setLaserShow({ hoverPartId: partId });
	};

	const applyCutOrder = (mode, nextPositions) => {
		if (!Array.isArray(nextPositions)) return;
		if (nextPositions.length !== svgStore.svgData.positions.length) return;

		const currentIds = svgStore.svgData.positions.map(pos => pos.part_id);
		const nextIds = nextPositions.map(pos => pos.part_id);
		const hasOrderChanged = nextIds.some((partId, index) => partId !== currentIds[index]);
		const previousMode = svgStore.getSheetCutMode();
		const hasModeChanged = previousMode !== mode;

		svgStore.setSheetCutOrderIds(mode, nextIds);
		svgStore.setSheetCutMode(mode);

		if (hasOrderChanged) {
			stopCutQue();
			setHoveredPart(null);
			svgStore.reorderPositions(nextPositions);
		}

		if (hasOrderChanged || hasModeChanged) {
			addToSheetLog("Sheet cut order was changed");
		}
	};

	const showSavedOrder = (mode) => {
		svgStore.ensureSheetCutState();
		applyCutOrder(
			mode,
			svgStore.getPositionsByPartIds(svgStore.getSheetCutOrderIds(mode))
		);
	};

	const setAutoOrder = () => {
		svgStore.ensureSheetCutState();
		applyCutOrder(
			"auto",
			getAutoSheetCutOrder(svgStore.svgData, sectorSize)
		);
	};

	const setSectorSize = (e) => {
		const nextSectorSize = svgStore.setSheetCutSectorSize(e.currentTarget.value);
		if (svgStore.getSheetCutMode() === "auto") {
			applyCutOrder(
				"auto",
				getAutoSheetCutOrder(svgStore.svgData, nextSectorSize)
			);
		}
	};

	const setList = (nextPositions) => {
		if (activeCutOrderMode !== "manual") return;
		if (!nextPositions.length || nextPositions.length !== svgStore.svgData.positions.length) {
			return;
		}

		const currentOrder = svgStore.svgData.positions.map(pos => pos.part_id);
		const nextOrder = nextPositions.map(pos => pos.part_id);
		const hasOrderChanged = nextOrder.some((partId, index) => partId !== currentOrder[index]);

		if (!hasOrderChanged) return;

		applyCutOrder("manual", nextPositions);
	};

	const getCutOrderButtonStyle = (mode) => ({
		opacity: activeCutOrderMode === mode ? 1 : 0.55,
		boxShadow: activeCutOrderMode === mode
			? "0 0 0 1px rgba(111, 66, 193, 0.35)"
			: "none",
	});

	const createCenteredSVGPath = (position, index) => {
		const preview = getPositionPreviewData(svgStore.svgData, position);
		const isHighlighted = highlightedPartId === position.part_id;
		const isActive = activePartId === position.part_id;
		const isCompleted = completedPartIds.has(position.part_id);
		const accentColor = isActive ? "#ff5a00" : "#fd7e14";
		const wrapperStyle = {
			width: `${WH.w}px`,
			height: `${WH.h}px`,
			position: "relative",
			border: isActive
				? "2px solid #ff5a00"
				: isHighlighted
					? "2px solid var(--violet)"
					: isCompleted
						? "2px solid #fd7e14"
						: undefined,
			boxShadow: isActive
				? "0 0 0 2px rgba(255, 90, 0, 0.18), 0 0 18px rgba(255, 90, 0, 0.12)"
				: isHighlighted
					? "0 0 0 1px rgba(111, 66, 193, 0.25)"
					: isCompleted
						? "0 0 0 1px rgba(253, 126, 20, 0.18)"
						: undefined,
			backgroundColor: isActive
				? "rgba(255, 106, 0, 0.16)"
				: isCompleted
					? "rgba(253, 126, 20, 0.08)"
					: undefined,
		};

		if (!preview?.bbox) {
			return (
				<div
					className="grid-square"
					key={position.part_id}
					style={wrapperStyle}
					onMouseEnter={() => setHoveredPart(position.part_id)}
					onMouseLeave={() => setHoveredPart(null)}
				>
					<div
						style={{
							position: "absolute",
							top: "6px",
							left: "8px",
							fontSize: "12px",
							fontWeight: 700,
							color: accentColor,
						}}
					>
						{index + 1}
					</div>
					<svg width={0} height={0}>
						<path d="M0 0" />
					</svg>
				</div>
			);
		}

		const { bbox, contourPath, inletOutletPath, part } = preview;
		const { a = 1, b = 0, c = 0, d = 1, e = 0, f = 0 } = position.positions || {};
		const safeWidth = bbox.width || 1;
		const safeHeight = bbox.height || 1;
		const scaleX = miniSvg.sizeX / safeWidth;
		const scaleY = miniSvg.sizeY / safeHeight;
		const scale = Math.min(scaleX, scaleY);
		const translateX = (miniSvg.sizeX - safeWidth * scale) / 2 - bbox.x * scale;
		const translateY = (miniSvg.sizeY - safeHeight * scale) / 2 - bbox.y * scale;

		return (
			<div
				className="grid-square"
				key={position.part_id}
				style={wrapperStyle}
				title={`${index + 1}. ${part?.name || `Part ${position.part_id}`}`}
				onMouseEnter={() => setHoveredPart(position.part_id)}
				onMouseLeave={() => setHoveredPart(null)}
			>
				<div
					style={{
						position: "absolute",
						top: "6px",
						left: "8px",
						fontSize: "12px",
						fontWeight: 700,
						color: accentColor,
						zIndex: 1,
					}}
				>
					{index + 1}
				</div>
				<svg width={miniSvg.sizeX} height={miniSvg.sizeY}>
					<g transform={`translate(${translateX}, ${translateY}) scale(${scale})`}>
						<g transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}>
							<path
								d={contourPath}
								fill={isActive
									? "rgba(255, 106, 0, 0.32)"
									: isCompleted
										? "rgba(253, 126, 20, 0.18)"
										: "rgba(253, 126, 20, 0.12)"}
								fillRule="evenodd"
								stroke={accentColor}
								strokeWidth={isActive ? "1.5" : "1"}
								vectorEffect="non-scaling-stroke"
							/>
							<path
								d={inletOutletPath}
								fill="none"
								stroke={accentColor}
								strokeWidth={isActive ? "1.5" : "1"}
								vectorEffect="non-scaling-stroke"
							/>
						</g>
					</g>
				</svg>
			</div>
		);
	};

	const resizeCutItem = (event) => {
		const element = event.currentTarget;
		let newValueX;
		let newValueY;
		let svgX;
		let svgY;

		if (element.classList.contains("w50")) {
			newValueX = 50;
			newValueY = 50;
			svgX = 25;
			svgY = 25;
		} else if (element.classList.contains("w100")) {
			newValueX = 100;
			newValueY = 100;
			svgX = 50;
			svgY = 50;
		} else {
			newValueX = (JSON.parse(localStorage.getItem("ppp"))?.sheetCutPopup?.style?.width || 500) - 50;
			newValueY = 100;
			svgX = newValueX;
			svgY = 100;
		}

		setWH({ w: newValueX, h: newValueY });
		setMiniSvg({ sizeX: svgX, sizeY: svgY });
	};

	const panelInfo = {
		id: "sheetCutPopup",
		fa: (
			<>
				<CustomIcon
					icon="route"
					width="24"
					height="24"
					color="black"
					fill="black"
					strokeWidth={0}
					viewBox="0 0 512 512"
					className={"m-2"}
				/>
				<div>{t("Cutting order")}</div>
			</>
		),
		content: isMini ? null : (
			<div className="d-flex flex-column h-100" style={{ overflow: "hidden" }}>
				<div className="px-2 pt-2 pb-1">
					<div className="d-flex align-items-center justify-content-between">
						<TooltipCreator
							element={{
								id: "sheetSpeedPartShow",
								info: (
									<div className="ms-2 w-50">
										<input
											type="range"
											className="form-range black-range"
											id="sheetSpeedPartShow"
											step={1}
											min={1}
											max={100}
											value={speed}
											onChange={setShowSpeed}
										/>
									</div>
								),
							}}
						/>
						<div className="ms-2">
							<TooltipCreator
								element={{
									id: "playSheetCutPartOrder",
									info: (
										<button
											type="button"
											className="btn btn-sm violet_button me-2"
											id="playSheetCutPartOrder"
											onMouseDown={runCutQue}
											disabled={isPlaying}
										>
											<CustomIcon
												icon="play"
												width="24"
												height="24"
												color="white"
												fill="white"
												strokeWidth={0}
											/>
										</button>
									),
								}}
							/>
							<button
								type="button"
								className="btn btn-sm violet_button ms-1 me-2"
								id="pauseSheetCutQue"
								onMouseDown={pauseCutQue}
								disabled={!svgStore.laserShow.on || isPaused}
							>
								<CustomIcon
									icon="fluent:pause-24-filled"
									width="24"
									height="24"
									color="white"
									fill="white"
									strokeWidth={0}
								/>
							</button>
							<button
								type="button"
								className="btn btn-sm violet_button ms-1 me-2"
								id="stopSheetCutQue"
								onMouseDown={stopCutQue}
							>
								<CustomIcon
									icon="stop"
									width="24"
									height="24"
									color="white"
									fill="white"
									strokeWidth={0}
								/>
							</button>
						</div>
					</div>
					<div
						className="d-flex align-items-center justify-content-between flex-wrap px-2 pt-2"
						style={{ gap: "8px" }}
					>
						<div className="btn-group btn-group-sm" role="group" aria-label="sheet cut order mode">
							<button
								type="button"
								className="btn btn-sm violet_button text-white"
								style={getCutOrderButtonStyle("current")}
								onMouseDown={() => showSavedOrder("current")}
							>
								{t("current")}
							</button>
							<button
								type="button"
								className="btn btn-sm violet_button text-white"
								style={getCutOrderButtonStyle("auto")}
								onMouseDown={setAutoOrder}
							>
								{t("auto")}
							</button>
							
						</div>
						<div className="d-flex align-items-center">
							<label
								htmlFor="sheetCutSectorSize"
								className="me-2 mb-0 text-nowrap"
								style={{ fontSize: "12px" }}
							>
								sectorSize
							</label>
							<input
								id="sheetCutSectorSize"
								type="number"
								className="form-control form-control-sm"
								style={{ width: "96px" }}
								step={1}
								min={1}
								max={maxSectorSize}
								value={sectorSize}
								onChange={setSectorSize}
							/>
						</div>
						<div className="text-nowrap" style={{ fontSize: "12px" }}>
							order: <strong>{activeCutOrderMode}</strong>
						</div>
					</div>
					<div className="d-flex align-items-center px-2 pt-2">
						<input
							type="range"
							className="form-range black-range m-0"
							min={0}
							max={100}
							step={0.1}
							value={progress}
							onChange={setSeekProgress}
						/>
						<div className="ms-2 text-nowrap" style={{ minWidth: "62px", fontSize: "12px" }}>
							{currentOrder}/{positions.length}
						</div>
					</div>
					<div className="d-flex flex-column" id="editSheetCutPartSquare" />
					<div className="d-flex flex-column" id="sheetCutPartModel" />
				</div>
				<div
					className="px-2 pb-2"
					style={{ flex: 1, minHeight: 0, overflowY: "auto", overflowX: "hidden" }}
				>
					<div className="gridWrapperCommon">
						<div id="sheetCutSort">
							<ReactSortable
								dragClass="sortableDrag"
								filter=".addImageButtonContainer"
								list={positions}
								setList={setList}
								disabled={activeCutOrderMode !== "manual"}
								animation={75}
								easing="ease-out"
								className="d-flex flex-row flex-wrap"
							>
								{positions.map((position, index) => createCenteredSVGPath(position, index))}
							</ReactSortable>
						</div>
					</div>
				</div>
			</div>
		),
	};

	return <Panel key={"panelSheetCut"} element={panelInfo} index={14} />;
});

export default SheetCutPanel;
