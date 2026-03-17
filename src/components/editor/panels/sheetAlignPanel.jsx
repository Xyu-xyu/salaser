import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import CustomIcon from '../../../icons/customIcon.jsx';
import svgStore from '../../../store/svgStore.jsx';
import SVGPathCommander from 'svg-path-commander';


const SheetAlignPanel = observer(() => {
	const { t } = useTranslation();

	useEffect(() => {
 	}, [])

 
	const alignItems = (direction) => {
		const selected = svgStore.svgData.positions.filter(pos => pos.selected);
		if (!selected.length) return;
	
		// =========================
		// 🔥 1. Общий bbox группы
		// =========================
		let minX = Infinity, minY = Infinity;
		let maxX = -Infinity, maxY = -Infinity;
	
		selected.forEach(pos => {
			const part = svgStore.svgData.part_code.find(p => p.id === pos.part_code_id);
			if (!part) return;
	
			const { a, b, c, d, e, f } = pos.positions;
	
			try {
				// 🔥 находим outer
				const outer = part.code?.find(a =>
					typeof a?.class === "string" &&
					a.class.includes("contour") &&
					a.class.includes("outer")
				);
				if (typeof outer.cid !== "number")  return;
	
				// 🔥 собираем ВСЕ пути этого контура (commonPath)
				const paths = part.code.filter(p => p.cid === outer.cid && p.path);
	
				paths.forEach(p => {
					const box = SVGPathCommander.getPathBBox(p.path);
					if (!box) return;
	
					const points = [
						[box.x, box.y],
						[box.x + box.width, box.y],
						[box.x + box.width, box.y + box.height],
						[box.x, box.y + box.height]
					];
	
					points.forEach(([x, y]) => {
						const tx = a * x + c * y + e;
						const ty = b * x + d * y + f;
	
						minX = Math.min(minX, tx);
						minY = Math.min(minY, ty);
						maxX = Math.max(maxX, tx);
						maxY = Math.max(maxY, ty);
					});
				});
	
			} catch (err) {
				console.warn("BBox error:", err);
			}
		});
	
		if (!isFinite(minX)) return;
	
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
		selected.forEach(pos => {
			const part = svgStore.svgData.part_code.find(p => p.id === pos.part_code_id);
			if (!part) return;
	
			const { a, b, c, d, e, f } = pos.positions;
	
			let localMinX = Infinity, localMinY = Infinity;
			let localMaxX = -Infinity, localMaxY = -Infinity;
	
			try {
				const outer = part.code?.find(a =>
					typeof a?.class === "string" &&
					a.class.includes("contour") &&
					a.class.includes("outer")
				);
				if (typeof outer.cid !== "number")  return;
	
				const paths = part.code.filter(p => p.cid === outer.cid && p.path);
	
				paths.forEach(p => {
					const box = SVGPathCommander.getPathBBox(p.path);
					if (!box) return;
	
					const points = [
						[box.x, box.y],
						[box.x + box.width, box.y],
						[box.x + box.width, box.y + box.height],
						[box.x, box.y + box.height]
					];
	
					points.forEach(([x, y]) => {
						const tx = a * x + c * y + e;
						const ty = b * x + d * y + f;
	
						localMinX = Math.min(localMinX, tx);
						localMinY = Math.min(localMinY, ty);
						localMaxX = Math.max(localMaxX, tx);
						localMaxY = Math.max(localMaxY, ty);
					});
				});
	
			} catch (err) {
				console.warn("BBox error:", err);
			}
	
			if (!isFinite(localMinX)) return;
	
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