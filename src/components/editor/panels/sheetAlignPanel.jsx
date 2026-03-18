import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import { useTranslation } from 'react-i18next';
import CustomIcon from '../../../icons/customIcon.jsx';
import svgStore from '../../../store/svgStore.jsx';
import SVGPathCommander from 'svg-path-commander';
import svgPath from 'svgpath';
import constants from '../../../store/constants.jsx';
import { useState } from "react";
import { addToSheetLog } from '../../../scripts/addToSheetLog.jsx';



const SheetAlignPanel = observer(() => {
	const { t } = useTranslation();
	const [intend, setIntend] = useState(constants.defaultIntend);
	const max = 60;

	const handleIntendChange = (e) => {
		let value = e.target.value;
	
		// разрешаем пустое значение (чтобы можно было редактировать)
		if (value === "") {
			setIntend("");
			return;
		}
	
		// только целые числа (с минусом)
		if (!/^-?\d+$/.test(value)) return;
	
		let num = parseInt(value, 10);
	
		// ограничение диапазона
		if (0 <= num ) num = num;
		if (num > max) num = max;
	
		setIntend(num);
	};

	const getMeasuredPaths = (part) => {
		if (!Array.isArray(part?.code)) return [];

		const outerCids = new Set(
			part.code
				.filter(item =>
					typeof item?.class === "string" &&
					item.class.includes("contour") &&
					item.class.includes("outer") &&
					typeof item?.cid === "number"
				)
				.map(item => item.cid)
		);

		if (!outerCids.size) return [];

		return part.code.filter(item =>
			typeof item?.path === "string" &&
			item.path.trim().length > 0 &&
			typeof item?.class === "string" &&
			typeof item?.cid === "number" &&
			outerCids.has(item.cid) &&
			(
				item.class.includes("contour") ||
				item.class.includes("inlet") ||
				item.class.includes("outlet")
			)
		);
	};

	const getPositionBBox = (pos) => {
		const part = svgStore.svgData.part_code.find(p => p.id === pos.part_code_id);
		if (!part) return null;

		const { a, b, c, d, e, f } = pos.positions;
		const paths = getMeasuredPaths(part);
		if (!paths.length) return null;

		let minX = Infinity, minY = Infinity;
		let maxX = -Infinity, maxY = -Infinity;

		try {
			paths.forEach(({ path }) => {
				const transformedPath = svgPath(path)
					.matrix([a, b, c, d, e, f])
					.toString();
				const box = SVGPathCommander.getPathBBox(transformedPath);
				if (!box) return;

				minX = Math.min(minX, box.x);
				minY = Math.min(minY, box.y);
				maxX = Math.max(maxX, box.x + box.width);
				maxY = Math.max(maxY, box.y + box.height);
			});
		} catch (err) {
			console.warn("BBox error:", err);
			return null;
		}

		if (!isFinite(minX)) return null;

		return { pos, minX, minY, maxX, maxY };
	};
 
	const alignItems = (direction) => {
		const selected = svgStore.svgData.positions.filter(pos => pos.selected);
		if (!selected.length) return;

		const items = selected.map(getPositionBBox).filter(Boolean);
		if (!items.length) return;

		const minX = Math.min(...items.map(item => item.minX));
		const minY = Math.min(...items.map(item => item.minY));
		const maxX = Math.max(...items.map(item => item.maxX));
		const maxY = Math.max(...items.map(item => item.maxY));
	
		// =========================
		// 🔥 2. целевая точка
		// =========================
		let targetX, targetY;
	
		if (direction === "left") targetX = minX;
		else if (direction === "right") targetX = maxX;
		else if (direction === "center-horizontal") targetX = (minX + maxX) / 2;
	
		if (direction === "top") targetY = minY;
		else if (direction === "bottom") targetY = maxY;
		else if (direction === "center-vertical") targetY = (minY + maxY) / 2;
	
		// =========================
		// 🔥 3. выравнивание каждого объекта
		// =========================
		items.forEach(item => {
			const { pos, minX: localMinX, minY: localMinY, maxX: localMaxX, maxY: localMaxY } = item;
			const { a, b, c, d, e, f } = pos.positions;
	
			let dx = 0, dy = 0;
	
			if (direction === "left") dx = targetX - localMinX;
			else if (direction === "right") dx = targetX - localMaxX;
			else if (direction === "center-horizontal") dx = targetX - (localMinX + localMaxX) / 2;
	
			if (direction === "top") dy = targetY - localMinY;
			else if (direction === "bottom") dy = targetY - localMaxY;
			else if (direction === "center-vertical") dy = targetY - (localMinY + localMaxY) / 2;
	
			// 🔥 применяем только translate
			pos.positions = {
				a,
				b,
				c,
				d,
				e: e + dx,
				f: f + dy
			};
		});

		addToSheetLog('Selected parts aligned');
	};

	const spreadItems = (direction, indent = 10) => {
		const selected = svgStore.svgData.positions.filter(pos => pos.selected);
		if (selected.length < 2) return;

		const items = selected.map(getPositionBBox).filter(Boolean);
	
		if (items.length < 2) return;
	
		// =========================
		// 🔥 2. сортировка
		// =========================
		if (direction === "right") {
			items.sort((a, b) => a.minX - b.minX);
		} else if (direction === "left") {
			items.sort((a, b) => b.maxX - a.maxX);
		} else if (direction === "down") {
			items.sort((a, b) => a.minY - b.minY);
		} else if (direction === "up") {
			items.sort((a, b) => b.maxY - a.maxY);
		}
	
		// =========================
		// 🔥 3. раскладка
		// =========================
		let prev = items[0];
	
		for (let i = 1; i < items.length; i++) {
			const current = items[i];
	
			let dx = 0, dy = 0;
	
			if (direction === "right") {
				const target = prev.maxX + indent;
				dx = target - current.minX;
			}
	
			if (direction === "left") {
				const target = prev.minX - indent;
				dx = target - current.maxX;
			}
	
			if (direction === "down") {
				const target = prev.maxY + indent;
				dy = target - current.minY;
			}
	
			if (direction === "up") {
				const target = prev.minY - indent;
				dy = target - current.maxY;
			}
	
			// применяем только translate
			current.pos.positions = {
				...current.pos.positions,
				e: current.pos.positions.e + dx,
				f: current.pos.positions.f + dy
			};
	
			// обновляем bbox после сдвига (ВАЖНО)
			current.minX += dx;
			current.maxX += dx;
			current.minY += dy;
			current.maxY += dy;
	
			prev = current;
		}

		addToSheetLog('Selected parts spread');
	};

	const panelInfo = 
		{
			id: "sheetAlignPopup",
			fa: (
				<>
					<CustomIcon
						icon="fa-objects"
						width="24"
						height="24"
						color="black"
						fill="black"
						strokeWidth={1}
						viewBox='0 0 24 24'
						className={'m-2'}
					/>
					<div>{t('Transform')}</div>
				</>),
			content: (<div className="d-flex flex-column">
	

				<table className="table">
					<thead className="table-dark">
						<tr>
							<th colSpan={5}>{t('Align')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<div className="d-flex align-items-center justify-content-around">
									<button
										type="button"
										onMouseDown={() => alignItems('top')}
										className="btn text-white mt-1 btn_align btn_align-left"
									>
										<CustomIcon
											icon="xLeft"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => alignItems('center-vertical')}
										className="btn text-white mt-1 btn_align btn_align-center-vertical"
									>
										<CustomIcon
											icon="xMid"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => alignItems('bottom')}
										className="btn text-white mt-1 btn_align btn_align-right"
									>
										<CustomIcon
											icon="xRight"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => alignItems('right')}
										className="btn text-white mt-1 btn_align btn_align-top"
									>
										<CustomIcon
											icon="yLeft"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>

									</button>
									<button
										type="button"
										onMouseDown={() => alignItems('center-horizontal')}
										className="btn text-white mt-1 btn_align btn_align-center-horizontal"
									>
										<CustomIcon
											icon="yMid"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>									
									</button>
									<button
										type="button"
										onMouseDown={() => alignItems('left')}
										className="btn text-white mt-1 btn_align btn_align-bottom"
									>
										<CustomIcon
											icon="yRight"
											width="24"
											height="24"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.5}
										/>
									</button>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				<table className="table">
					<thead className="table-dark">
						<tr>
							<th colSpan={5}>{t('Spread')}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td>
								<div className="d-flex align-items-center justify-content-around">
									<button
										type="button"
										onMouseDown={() => spreadItems('down', intend)}
										className="btn text-white mt-1 btn_align btn_align-left"
									>
										<CustomIcon
											icon="sort-right"
											width="30"
											height="30"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.25}
										/>
									</button>
 
									<button
										type="button"
										onMouseDown={() => spreadItems('up', intend)}
										className="btn text-white mt-1 btn_align btn_align-right"
									>
										<CustomIcon
											icon="sort-left"
											width="30"
											height="30"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.25}
										/>
									</button>
									<button
										type="button"
										onMouseDown={() => spreadItems('right', intend)}
										className="btn text-white mt-1 btn_align btn_align-top"
									>
										<CustomIcon
											icon="sort-up"
											width="30"
											height="30"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.25}
										/>

									</button>
									 
									<button
										type="button"
										onMouseDown={() => spreadItems('left', intend)}
										className="btn text-white mt-1 btn_align btn_align-bottom"
									>
										<CustomIcon
											icon="sort-down"
											width="30"
											height="30"
											viewBox='0 0 24 24'
											color='black'
											fill='none'
											strokeWidth={1.25}
										/>
									</button>
									<input
										type="number"
										step="1"
										min={0}
										max={max}
										value={intend}
										onChange={handleIntendChange}
										style={{
											width: "75px",
											height: "40px",
											textAlign: "center",
											fontSize: "16px",
											marginLeft: "10px"
										}}
										className="form-control"
									/>
								</div>
							</td>
						</tr>
					</tbody>
				</table>				
			</div>
			),
		}

	return (
		<>
			<>
			<Panel key={'panel' + 15} element={panelInfo}  />
			</>
		</>
	);
})

export default SheetAlignPanel; 