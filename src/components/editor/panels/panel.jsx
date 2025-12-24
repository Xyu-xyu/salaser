import { observer } from "mobx-react-lite";
import React, { useState, useRef, useEffect } from "react";
import panelStore from "./../../../store/panelStore";
import { toJS } from "mobx";


const Panel = observer(({ element }) => {
	const id = element.id

	useEffect(() => {
		panelStore.getInitialPositions()
	}, [])

	const panelRef = useRef(null);
	const startPos = useRef({ x: 0, y: 0 });
	const startWidth = useRef(0);
	const startHeight = useRef(0);
	const startY = useRef(0);
	const startX = useRef(0);
	const move = useRef(0);

	const toggleMinified = () => {
		handleIncreaseZIndex()
		let positions = {
			style: {
				width: panelStore.positions[id].style.width,
				height: panelStore.positions[id].style.height,
				top: panelStore.positions[id].style.top,
				left: panelStore.positions[id].style.left,
				zIndex: panelStore.maxZindex
			}
		}
		positions.mini = Boolean(!Number(panelStore.positions[id].mini))
		panelStore.setPosition(id, positions)
		savePanelPosition()
	};

	const handleMouseDown = (e) => {
		handleIncreaseZIndex()
		//e.preventDefault();
		e.stopPropagation();

		if (e.type === 'mousedown' || e.type === 'touchstart') {
			const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
			const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

			startPos.current = {
				x: clientX - panelRef.current.offsetLeft,
				y: clientY - panelRef.current.offsetTop,
			};
		}

		move.current = 'move'

		let positions = {
			style: {
				width: panelStore.positions[id].style.width,
				height: panelStore.positions[id].style.height,
				top: panelStore.positions[id].style.top,
				left: panelStore.positions[id].style.left,
				zIndex: panelStore.maxZindex
			}
		}
		positions.mini = panelStore.positions[id].mini
		panelStore.setPosition(id, positions)

		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("touchmove", handleMouseMove);
		document.addEventListener("touchend", handleMouseUp);
	};

	const initDrag = (e) => {
		// Определяем, мышь или сенсор
		handleIncreaseZIndex()
		const clientX = e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
		const clientY = e.type === 'mousedown' ? e.clientY : e.touches[0].clientY;

		startX.current = clientX;
		startY.current = clientY;

		startWidth.current = panelStore.positions[id].style.width;
		startHeight.current = panelStore.positions[id].style.height;

		move.current = 'resize';

		// Добавляем слушатели событий
		document.addEventListener("mousemove", handleMouseMove);
		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("touchmove", handleMouseMove, { passive: false });
		document.addEventListener("touchend", handleMouseUp);
	};

	const handleMouseMove = (e) => {
		// Определяем тип события и получаем координаты
		const clientX = e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
		const clientY = e.type === 'mousemove' ? e.clientY : e.touches[0].clientY;

		if (move.current === 'move') {
			const newLeft = clientX - startPos.current.x;
			const newTop = clientY - startPos.current.y;
			let positions = {
				style: {
					top: newTop,
					left: newLeft,
					width: panelStore.positions[id].style.width,
					height: panelStore.positions[id].style.height,
					zIndex: panelStore.maxZindex
				}
			};
			positions.mini = panelStore.positions[id].mini;
			panelStore.setPosition(id, positions);
		} else {
			let w = startWidth.current + clientX - startX.current;
			let h = startHeight.current + clientY - startY.current;
			let positions = {
				style: {
					top: panelStore.positions[id].style.top,
					left: panelStore.positions[id].style.left,
					width: w,
					height: h,
					zIndex: panelStore.maxZindex
				}
			};
			positions.mini = panelStore.positions[id].mini;
			panelStore.setPosition(id, positions);
		}
	};

	const handleMouseUp = () => {
		document.removeEventListener("mousemove", handleMouseMove);
		document.removeEventListener("mouseup", handleMouseUp);
		document.removeEventListener("touchmove", handleMouseMove);
		document.removeEventListener("touchend", handleMouseUp);
		move.current = ''
		savePanelPosition()
	};

	const findHighestZIndex = () => {
		let inx = [...Object.values(panelStore.positions).filter(a => typeof a !== 'number').map(popup => popup.style.zIndex)]
		let maxZIndex = Math.max(...inx);
		console.log('maxZIndex' + maxZIndex)
		if (typeof maxZIndex !== "number") debugger;
		return maxZIndex + 1;
	};

	const handleIncreaseZIndex = () => {
		const currentMaxZIndex = findHighestZIndex();
		panelStore.setMaxZindex(currentMaxZIndex)
	};

	const savePanelPosition = (id) => {
		console.log(toJS(panelStore.positions)); // если используешь mobx
		const entries = Object.entries(panelStore.positions);
		const sortedEntries = entries.sort(([, a], [, b]) => a.style.zIndex - b.style.zIndex);
		const updatedPositions = {};
		sortedEntries.forEach(([key, value], index) => {
			updatedPositions[key] = {
				...value,
				style: {
					...value.style,
					zIndex: index + 1,
				},
			};
		});

		panelStore.positions = updatedPositions;
		localStorage.setItem('ppp', JSON.stringify(updatedPositions));
	};

	return (
		<div
			ref={panelRef}
			id={element.id}
			className={`window popup ${panelStore.positions[id].mini ? " mini h45" : ""}`}
			style={{
				zIndex: `${panelStore.positions[id].style.zIndex}`,
				top: `${panelStore.positions[id].style.top}px`,
				left: `${panelStore.positions[id].style.left}px`,
				width: `${panelStore.positions[id].style.width}px`,
				height: `${panelStore.positions[id].mini ? 45 : panelStore.positions[id].style.height}px`,
			}}
		>
			<div className="window-top popup-header"
				onMouseDown={handleMouseDown}
				onTouchStart={handleMouseDown}
			>
				<div className="d-flex align-items-center justify-content-between">
					<div className="nav-link">
						<div className="d-flex align-items-center">
							{element.fa}
						</div>
					</div>
					<div className="minify_wrapper d-flex align-items-center justify-content-center">
						<div
							className={`minify ${panelStore.positions[id].mini ? "minified" : ""}`}
							onClick={(e) => {
								e.stopPropagation();
								toggleMinified();
							}}
						></div>
					</div>
				</div>
			</div>
			<div className={`window-content ${panelStore.positions[id].mini ? "mini" : ""}`}>
				{element.content}
			</div>
			<div
				className={`resizer-right ${panelStore.positions[id].mini ? "mini" : ""}`}
				onMouseDown={initDrag}
				onMouseUp={handleMouseUp}
			></div>
			<div
				className={`resizer-bottom ${panelStore.positions[id].mini ? "mini" : ""}`}
				onMouseDown={initDrag}
				onMouseUp={handleMouseUp}
			></div>
			<div
				className={`resizer-both ${panelStore.positions[id].mini ? "mini" : ""}`}
				onMouseDown={initDrag}
				onMouseUp={handleMouseUp}
				onTouchStart={initDrag}
				onTouchEnd={handleMouseUp}
			>
			</div>
		</div>
	);
});

export default Panel;