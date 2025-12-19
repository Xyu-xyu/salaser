import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import partStore from "./../../../store/partStore.jsx";
import util from './../../../scripts/util.jsx';
import Panel from './panel.jsx';
import { addToLog } from './../../../scripts/addToLog.jsx';
import { useTranslation } from 'react-i18next';
import CustomIcon from './../../../icons/customIcon.jsx';
import { ReactSortable } from "react-sortablejs";
import TooltipCreator from './tooltipCreator';


const CutPanel = observer(() => {

	const { t } = useTranslation();
	const [speed,setSpeed] = useState(50)
	const inners = partStore.getFiltered(["contour"], ["outer"]) 		
	const runCutQue = () => {
		partStore.setLaserShow ( {on:true, speed:speed} )
	}
	const stopCutQue = () => { 
		partStore.setLaserShow ({on:false, speed:speed})
	}
	
	const setShowSpeed =(e)=>{
		let val = +e.currentTarget.value
		partStore.setLaserShow ( {on: partStore.laserShow.on, speed:val})
		setSpeed (val)
	}

	const [WH, setWH] = useState({ w: 100, h: 100 })
	const [miniSvg, setMiniSvg] = useState({ sizeX: 50, sizeY: 50 })

	const setList =(e) =>{
		if (e.length && inners.length) {
			partStore.reorderItems (e, inners)		
			addToLog("Cut order was changed")
		}
	
	}

	//const innerSort = useRef(null);	
/* 
	useEffect(() => {
		if (!innerSort.current) return;

		const sortable = new Sortable(innerSort.current, {
			animation: 75,
			ghostClass: "sortable-ghost_item",
			dragClass: "sortable-drag_item",
			onEnd: (evt) => {
				partStore.reorderItems(evt.oldIndex, evt.newIndex); 
			},
		});

		return () => sortable.destroy();
	}, []); */


	const createCenteredSVGPath = (element) => {

		if (!element)  return
		if (!element.path)  {
			const { cid } = element;

			return (
				<div
					className={`grid-square macro5`}
					data-cid={cid}
					key={cid}
					style={{
						width: `${100}px`,
						height: `${100}px`,
					}}
					onMouseOver={mouseOver}
					onMouseLeave={mouseLeave}	
				>
					<svg
						width={0}
						height={0}
						fill={"inner"}
						stroke={"none"}
						strokeWidth={"0"}
					>
						<path d={"M0 0"} />
					</svg>
				</div>
			);
		};

		const { path, cid, class: className } = element;
		const classList = className || "";
		const contour = classList.includes("inner") ? "inner" : "outer";
		const cutlessElement = classList.includes("macro5");

		const bbox = util.fakeBox(path);
		if (!bbox) {
			console.error("Failed to calculate bounding box");
			return null;
		}

		const { x, y, width, height } = bbox;

		const scaleX = miniSvg.sizeX / width;
		const scaleY = miniSvg.sizeY / height;
		const scale = Math.min(scaleX, scaleY);

		const translateX = (miniSvg.sizeX - width * scale) / 2 - x * scale;
		const translateY = (miniSvg.sizeY - height * scale) / 2 - y * scale;

		return (
			<div
				className={`grid-square ${cutlessElement ? "macro5" : ""}`}
				data-cid={cid}
				key={cid}
				style={{
					width: `${WH?.w ?? 100}px`,
					height: `${WH?.h ?? 100}px`,
				}}
				onMouseOver={mouseOver}
				onMouseLeave={mouseLeave}

			>
				<svg
					width={miniSvg.sizeX}
					height={miniSvg.sizeY}
					fill={contour === "inner" ? "#fd7e14" : "none"}
					stroke={contour === "inner" ? "none" : "#fd7e14"}
					strokeWidth={contour === "inner" ? "0" : "1"}
				>
					<path d={path} transform={`translate(${translateX}, ${translateY}) scale(${scale})`} />
				</svg>
			</div>
		);
	};


	const resizeCutItem = (event) => {
		console.log('resizeCutItem')
		let e = event.currentTarget;
		var newValueX, newValueY, svgX, svgY;
		if (e.classList.contains('w50')) {
			newValueX = 50
			newValueY = 50
			svgX = 25
			svgY = 25;
		} else if (e.classList.contains('w100')) {
			newValueX = 100
			newValueY = 100
			svgX = 50
			svgY = 50;
		} else {
			newValueX = (JSON.parse(localStorage.getItem('ppp'))?.cutPopup?.style?.width || 500) - 50
			newValueY = 100
			svgX = newValueX
			svgY = 100
		}
		setWH({ w: newValueX, h: newValueY })
		setMiniSvg({ sizeX: svgX, sizeY: svgY })
	}

	const mouseOver = (e) => {
		let target = e.currentTarget
		let cid = +target.getAttribute("data-cid")
		let newclass = partStore.getElementByCidAndClass(cid, 'contour', 'class') + " highLighted"
		partStore.updateElementValue(cid, 'contour', 'class', newclass)
	}

	const mouseLeave = (e) => {
		let target = e.currentTarget
		let cid = +target.getAttribute("data-cid")
		let newclass = partStore.getElementByCidAndClass(cid, 'contour', 'class').replace(/highLighted/gm, '')
		partStore.updateElementValue(cid, 'contour', 'class', newclass)
	}

	const panelInfo =
	{
		id: 'cutPopup',
		fa: (<>
				<CustomIcon
					icon="route"
					width="24"
					height="24"
					color="black"
					fill="black"
					strokeWidth={0}
					viewBox='0 0 512 512'
					className={'m-2'}
				/>
				<div>{t('Cutting order')}</div>
			</>),
		content: (
			<div className="d-flex flex-column">
				<table className="table">
					<tbody>
						<tr>
							<td>
								<div className="d-flex align-items-center justify-content-evenly">
									<TooltipCreator
										element={{
											id: 'speedPartShow',
											info: (
												<div className="ms-2 w-25">
													<input
														type="range"
														className="form-range black-range"
														id="speedPartShow"
														step={1}
														min={1}
														max={100}
														value={speed}
														onChange={setShowSpeed}													
													/>
												</div>
											)
										}}
									/>
 									<div className="ms-2">
										<TooltipCreator
											element={
												{
													id: 'playCutPartOrder',
													info:
														(<button
															type="button"
															className="btn btn-sm violet_button"
															id="playCutPartOrder"
															onMouseDown={runCutQue}
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
														)
												}
											}
										/>
										<button
											type="button"
											className="btn btn-sm violet_button ms-1"
											id="stopCutQue"
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
									<div className="ms-2">
										<button
											type="button"
											className="btn btn-sm btn-primary w50 resizeCutItem violet_button"
											onMouseDown={resizeCutItem}
										>
											<CustomIcon
												icon="9"
												width="24"
												height="24"
												color="white"
												fill="white"
												strokeWidth={0}
 											/>
										</button>
										<button
											type="button"
											className="btn btn-sm btn-primary mx-1 w100 resizeCutItem violet_button"
											onMouseDown={resizeCutItem}
										>
											<CustomIcon
												icon="4"
												width="24"
												height="24"
												color="white"
												fill="white"
												strokeWidth={0}
 											/>
										</button>
										<button
											type="button"
											className="btn btn-sm btn-primary resizeCutItem violet_button"
											onMouseDown={resizeCutItem}
										>
											<CustomIcon
												icon="list"
												width="24"
												height="24"
												color="white"
												fill="white"
												strokeWidth={1}
 											/>
										</button>
									</div>
								</div>
							</td>
						</tr>
						<tr>
							<td>
								<div className="d-flex flex-column" id="editCutPartSquare" />
							</td>
						</tr>
						<tr>
							<td>
								<div className="d-flex flex-column" id="cutPartModel" />
								{/* <div className="">
									<nav>
										<div className="nav nav-tabs mb-3" id="nav-tab" role="tablist">
											<button
												className="nav-link "
												id="nav-engraving-tab"
												data-bs-toggle="tab"
												data-bs-target="#nav-engraving"
												type="button"
												role="tab"
												aria-controls="nav-engraving"
												aria-selected="false"
												tabIndex={-1}
											>
												{t('Engraving')}
											</button>
											<button
												className="nav-link active"
												id="nav-inner-tab"
												data-bs-toggle="tab"
												data-bs-target="#nav-inner"
												type="button"
												role="tab"
												aria-controls="nav-inner"
												aria-selected="false"
												tabIndex={-1}
											>
												{t('Inner')}
											</button>
										</div>
									</nav>
									<div className="tab-content p-3" id="nav-tabContent">
										<div
											className="tab-pane fade"
											id="nav-engraving"
											role="tabpanel"
											aria-labelledby="nav-engraving-tab"
										>
											<div className="gridWrapper">
												<div id="engravingSort" ref={engSort}>
													{engs.map((item, index) => (
														createCenteredSVGPath(item)
													))}
												</div>
											</div>
										</div>
										<div
											className="tab-pane active show "
											id="nav-inner"
											role="tabpanel"
											aria-labelledby="nav-inner-tab"
										>
											<div className="gridWrapper">
												<div id="innerSort" ref={innerSort}>
													{inners.map((item, index) => (
														createCenteredSVGPath(item)
													))}
												</div>
											</div>
										</div>
									</div>



								</div> */}
								<div className="gridWrapperCommon">
									<div id="innerSort">
										<ReactSortable
											dragClass="sortableDrag"
											filter=".addImageButtonContainer"
											list={inners}
											setList={setList}
											animation={75}
											easing="ease-out"
											className='d-flex flex-row flex-wrap'
											>
											{inners.map((item, index) => (
												
												createCenteredSVGPath(item, index)
												
											))}
										</ReactSortable>
									</div> 
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>)
	}

	return (
		<>
			<Panel key={'panel' + 14} element={panelInfo} index={14} />
		</>
	);
})

export default CutPanel;