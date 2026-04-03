import { makeAutoObservable } from 'mobx';
import partStore from './partStore.jsx';
import SVGPathCommander from 'svg-path-commander';
import util from '../scripts/util.jsx';
import inlet from '../scripts/inlet.jsx';

class ContourTransformSharedStore {
	activePoint = 'topYtopX'
	activeCoord = { x: 0, y: 0 }
	wh = { w: 0, h: 0 }
	angle = 0

	constructor() {
		makeAutoObservable(this);
	}

	setActivePoint(id) {
		this.activePoint = id;
	}

	syncFromSelection() {
		let x = 0;
		let y = 0;

		if (this.angle === 0) {
			this.angle = '';
		} else {
			this.angle = 0;
		}

		let path = partStore.getSelectedElement('path');
		if (!path) {
			this.activeCoord = { x, y };
			this.wh = { w: x, h: y };
			return;
		}

		const box = SVGPathCommander.getPathBBox(path);
		if (!box) {
			this.activeCoord = { x: 0, y: 0 };
			return;
		}

		{
			let w = util.round(box.width, 2);
			let h = util.round(box.height, 2);
			this.wh = { w, h };
		}

		if (this.activePoint.match(/topX/gm)) {
			x = box.x;
		} else if (this.activePoint.match(/midX/gm)) {
			x = box.x + box.width * 0.5;
		} else if (this.activePoint.match(/botX/gm)) {
			x = box.x2;
		}

		if (this.activePoint.match(/topY/gm)) {
			y = box.y;
		} else if (this.activePoint.match(/midY/gm)) {
			y = box.y + box.height * 0.5;
		} else if (this.activePoint.match(/botY/gm)) {
			y = box.y2;
		}

		this.activeCoord = { x: util.round(x, 2), y: util.round(y, 2) };
	}

	captureAngleInput(event) {
		const newValue = event.currentTarget.textContent.trim();
		if (!isNaN(newValue) && newValue !== '') {
			this.angle = Number(newValue);
		} else {
			console.warn('Invalid input, please enter a number');
			if (this.angle === 0) {
				this.angle = '';
			} else {
				this.angle = 0;
			}
		}
	}

	focusAngleInputEnd(cellRef) {
		if (!cellRef?.current) return;
		const range = document.createRange();
		const selection = window.getSelection();
		range.selectNodeContents(cellRef.current);
		range.collapse(false);
		selection.removeAllRanges();
		selection.addRange(range);
	}

	handleKeyDown(e) {
		let id = e.currentTarget.getAttribute('id');
		let val = Number(e.currentTarget.textContent);
		let path = partStore.getSelectedElement('path');
		let cid = partStore.getSelectedElement('cid');
		let classes = partStore.getElementByCidAndClass(cid, 'contour', 'class');

		if (id === 'contourRotateValue') this.setActivePoint('midXmidY');

		if (!path) return;
		let params = {
			x: this.activeCoord.x,
			y: this.activeCoord.y,
			width: this.wh.w,
			height: this.wh.h,
			angle: this.angle,
			proportion: false
		};
		if (e.key === 'Enter' || e.key === 'Return' || e.key === 'Tab') {

			if (e.key === 'Enter') e.preventDefault();
			let updPathParams = util.transformContour(path, id, val, params);
			let newPath = updPathParams.newPath;
			newPath = SVGPathCommander.normalizePath(newPath).toString().replaceAll(',', ' ');
			let res;
			if (id === 'contourRotateValue') {
				res = inlet.getNewInletOutlet(cid, 'contour', 'path', newPath, { angle: this.angle, x: this.activeCoord.x, y: this.activeCoord.y });
				inlet.applyNewPaths(res);
			} else {
				res = inlet.getNewInletOutlet(cid, 'contour', 'path', newPath);
				inlet.applyNewPaths(res);
			}
			if (classes && classes.includes('skeletonText') && res) {

				let textStart = partStore.getElementByCidAndClass(cid, 'contour', 'coords');
				let scaleX = partStore.getElementByCidAndClass(cid, 'contour', 'scaleX');
				let scaleY = partStore.getElementByCidAndClass(cid, 'contour', 'scaleY');

				let fakePath = 'M ' + textStart.x + ' ' + textStart.y;
				let fuckPath = util.applyTransform(fakePath, updPathParams.scaleX, updPathParams.scaleY, updPathParams.translateX, updPathParams.translateY, { angle: this.angle, x: this.activeCoord.x, y: this.activeCoord.y });
				fuckPath = SVGPathCommander.normalizePath(fuckPath);
				let newStart = { x: fuckPath[0][1], y: fuckPath[0][2] };

				scaleX *= updPathParams.scaleX;
				scaleY *= updPathParams.scaleY;

				partStore.updateElementValues(cid, 'contour', {
					coords: newStart,
					scaleX: scaleX,
					scaleY: scaleY,
					angle: this.angle,
				});
			}
		}
	}

	alignItems(direction) {
		console.log(direction);
		let newPath, xDif = 0, yDif = 0;
		let path = partStore.getSelectedElement('path');
		let cid = partStore.getSelectedElement('cid');
		let classes = partStore.getElementByCidAndClass(cid, 'contour', 'class');
		let outerPath = partStore.getOuterElement('path');
		let outerPathParams = SVGPathCommander.getPathBBox(outerPath);
		let innerPathParams = SVGPathCommander.getPathBBox(path);
		if (classes && classes.includes('outer')) {
			return;
		}
		if (direction === 'left') {
			xDif = outerPathParams.x - innerPathParams.x;
		} else if (direction === 'right') {
			xDif = outerPathParams.x2 - innerPathParams.x2;
		} else if (direction === 'center-horizontal') {
			yDif = outerPathParams.cy - innerPathParams.cy;
		} else if (direction === 'top') {
			yDif = outerPathParams.y - innerPathParams.y;
		} else if (direction === 'center-vertical') {
			xDif = outerPathParams.cx - innerPathParams.cx;
		} else if (direction === 'bottom') {
			yDif = outerPathParams.y2 - innerPathParams.y2;
		}
		newPath = util.applyTransform(path, 1, 1, xDif, yDif, { angle: this.angle, x: 0, y: 0 });
		let resp = inlet.getNewInletOutlet(cid, 'contour', 'path', newPath);
		let res = inlet.applyNewPaths(resp);
		if (classes && classes.includes('skeletonText') && res) {
			let textStart = partStore.getElementByCidAndClass(cid, 'contour', 'coords');
			let newStart = {
				x: textStart.x + xDif,
				y: textStart.y + yDif
			};
			partStore.updateElementValue(cid, 'contour', 'coords', newStart);
		}
	}
}

const contourTransformSharedStore = new ContourTransformSharedStore();
export default contourTransformSharedStore;
