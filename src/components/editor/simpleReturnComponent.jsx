import { observer } from "mobx-react-lite";
import SVGPathCommander from "svg-path-commander";
import svgStore from "./../../store/svgStore.jsx";
import editorStore from "./../../store/editorStore.jsx";

const SimpleReturnComponent = observer(() => {

	const { mode } = editorStore
	const activePartId = svgStore.laserShow.activePartId ?? null;
	const hoverPartId = svgStore.laserShow.hoverPartId ?? null;
	const currentOrder = Math.max(0, Number(svgStore.laserShow.currentOrder) || 0);
	const completedPartIds = new Set(
		svgStore.svgData.positions
			.slice(0, Math.max(currentOrder - 1, 0))
			.map(pos => pos.part_id)
	);
	const focusedPartId = hoverPartId ?? activePartId;

	const setSelected = (e, part_id) => {
		console.log ("setSelected ", mode)		
		if (/*e.button === 0 &&*/ mode === 'resize') {

			let pos = svgStore.svgData.positions.filter(pos => part_id === pos.part_id)[0];
			if (pos &&  pos?.selected && pos?.selected) return;
			svgStore.selectOnly(part_id)
			
		} else if (/*e.button === 0 &&*/ mode === 'selectionPlus') {
			svgStore.selectPlus(part_id)
		}  else if (/*e.button === 0 &&*/ mode === 'selectionMinus') {
			svgStore.selectMinus(part_id)			
		}
	}

	const setMoving = (e, part_id) => {		

		let pos = svgStore.svgData.positions.filter(pos => part_id === pos.part_id)[0];
	 	if (e.buttons === 1 && pos &&  pos?.selected && pos?.selected) {
			if (mode !== "dragging") {
				editorStore.setMode("dragging");
			}
		}	 	
	}

	// крестик joint
	const getJointPath = (x, y) => {
		return `M${x} ${y} l2 2 -4 -4 2 2 2 -2 -4 4`;
	};


	// сбор compound paths
	const buildCompoundPath = (code) => {

		const outer = [];
		const inner = [];
		const inletOutlet = [];
		const engraving = [];

		for (const el of code) {

			if (!el.path) continue;

			if (el.class.includes("macro2")) {

				engraving.push(el.path.trim());

			} else if (el.class.includes("outer") && el.class.includes("contour")) {

				outer.push(el.path.trim());

			} else if (el.class.includes("inner") && el.class.includes("contour")) {

				inner.push(el.path.trim());

			} else if (el.class.includes("inlet") || el.class.includes("outlet")) {

				inletOutlet.push(el.path.trim());
			}
		}

		return {
			contours: [...outer, ...inner].join(" z "),
			inletOutlet,
			engraving
		};
	};


	// defs
	const defs = svgStore.svgData.part_code.map(part => {

		const { contours, inletOutlet, engraving } = buildCompoundPath(part.code);

		return (
			<g key={`defs_part_${part.id}`} id={`part_${part.id}`}>

				{/* контуры */}
				<path
					d={contours}
					fillRule="evenodd"
					stroke="currentColor"
					strokeWidth={0.2}
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
				/>

				{/* inlet outlet */}
				<path
					d={inletOutlet.join(" ")}
					fill="none"
					stroke="currentColor"
					strokeWidth={2}
					strokeLinecap="round"
					vectorEffect="non-scaling-stroke"
				/>

				{/* engraving */}
				<path
					d={engraving.join(" ")}
					fill="none"
					stroke="limegreen"
					strokeWidth={1}
					strokeLinecap="round"
				/>

				{/* JOINTS */}
				{
					part.code.map((el, i) => {

						if (!el.joints?.length || !el.path) return null;

						return el.joints.map((len, j) => {

							const p = SVGPathCommander.getPointAtLength(el.path, len);

							return (
								<g
									key={`joint_${part.id}_${i}_${j}`}
									className="joint"
									fill="none"
									stroke="red"
									strokeWidth={0.5}
									vectorEffect="non-scaling-stroke"
								>
									<path d={getJointPath(p.x, p.y)} />
								</g>
							);
						});

					})
				}

			</g>
		);
	});


	const renderPos = (pos, posIndex) => {

		const { a, b, c, d, e, f } = pos.positions;
		const isActive = activePartId === pos.part_id;
		const isHovered = hoverPartId === pos.part_id;
		const isFocused = focusedPartId === pos.part_id;
		const isCompleted = completedPartIds.has(pos.part_id);
		const isDimmed = hoverPartId !== null && !isHovered;

		const fillColor = isActive
			? "rgba(255, 106, 0, 0.42)"
			: isCompleted
				? "rgba(253, 126, 20, 0.28)"
				: pos.selected
					? "var(--violetTransparent)"
					: "var(--grey-nav)";
		const strokeColor = isActive
			? "#ff5a00"
			: isCompleted
				? "#fd7e14"
				: pos.selected
					? "var(--violetTransparent)"
					: "var(--grey-nav)";
		const strokeWidth = isActive
			? 3
			: isFocused || isCompleted
				? 2.5
				: undefined;
		const opacity = isDimmed
			? 0.35
			: isActive
				? 1
				: isCompleted
					? 0.95
					: 1;

		return (
			<g
				key={`form_${pos.part_id}_${posIndex}`}
				transform={`matrix(${a} ${b} ${c} ${d} ${e} ${f})`}
				data-part-id={pos.part_id}
				onMouseDown={(e) => setSelected(e, pos.part_id)}
				onMouseMove={(e) => {
					setMoving(e, pos.part_id);
				}}

				 onTouchStart={(e) => {
					setSelected(e, pos.part_id);
					setMoving(e, pos.part_id);
					editorStore.setMode("dragging");
				}} 
			>

				<use
					href={`#part_${pos.part_code_id}`}
					fill={fillColor}
					stroke={strokeColor}
					strokeWidth={strokeWidth}
					opacity={opacity}
					pointerEvents="visiblePainted"
				/>

			</g>
		);
	};

	return (
		<>
			<defs>
				{defs}
			</defs>

			{/* сначала НЕ выбранные */}
			{svgStore.svgData.positions
				.filter(pos => pos.part_id !== focusedPartId)
				.filter(pos => !pos.selected)
				.map((pos, posIndex) => renderPos(pos, posIndex))}

			{/* потом выбранные — будут поверх */}
			{svgStore.svgData.positions
				.filter(pos => pos.part_id !== focusedPartId)
				.filter(pos => pos.selected)
				.map((pos, posIndex) => renderPos(pos, posIndex))}

			{/* активная/наведенная деталь — всегда поверх */}
			{svgStore.svgData.positions
				.filter(pos => pos.part_id === focusedPartId)
				.map((pos, posIndex) => renderPos(pos, posIndex))}
		</>
	);

});

export default SimpleReturnComponent;