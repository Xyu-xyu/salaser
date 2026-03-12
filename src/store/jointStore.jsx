import { makeAutoObservable, observable, computed, set } from "mobx";
import partStore from "./partStore.jsx";
import SVGPathCommander from "svg-path-commander";
import CONSTANTS from "./constants.jsx";

class JointStore {
    joints = {};

    constructor() {
        makeAutoObservable(this, {
			joints: observable, 
			jointPositions:computed,
		});
    }

	get jointPositions() {
		let positions = [];
		//console.log ("calculate joint positions")
		
		for (let key in this.joints) {
			let cid = Number(key); // Преобразуем ключ в число
			let jointData = this.joints[key];
	
			if (!jointData) continue; // Если данных нет — пропускаем

	
			let contour = partStore.getElementByCidAndClass(cid, 'contour');
			if (!contour || !contour.path) continue; // Проверяем, существует ли объект
			let path = contour.path
			let updPath = SVGPathCommander.normalizePath(path);	
			let totalLength = SVGPathCommander.getTotalLength(path);

	
			if (jointData.hasOwnProperty('atEnd') && jointData.atEnd) {
				let last = updPath[updPath.length - 1];
				if (Array.isArray(last) && last.length >= 2) { // Проверяем корректность `last`
					let x = last[last.length - 2];
					let y = last[last.length - 1];
					let percent = 100
					positions.push({ x, y, percent, cid, origin:'atEnd' });
				}
			}

			if (jointData.hasOwnProperty('quantity') && jointData.quantity) {
				let numSegments = jointData.quantity + 1;
				for (let i = 1; i < numSegments; i++) { 
					let segmentLength = (totalLength / numSegments) * i;
					let { x, y } = SVGPathCommander.getPointAtLength(path, segmentLength); 
					let percent = segmentLength / totalLength *100
					positions.push({ x, y, percent, cid, origin:'quantity' });
				}
			}

			if (jointData.hasOwnProperty('distance') && jointData.distance) {
				let step = jointData.distance;
					for (let length = step; length < totalLength; length += step) {
					let { x, y } = SVGPathCommander.getPointAtLength(path, length);
					let percent = length / totalLength *100
					positions.push({ x, y, percent, cid, origin:'distance'});
				}
			}

			if (jointData.hasOwnProperty('manual') && Array.isArray(jointData.manual)) {
				jointData.manual.forEach(percent => {
					if (typeof percent === 'number' && percent >= 0 && percent <= 100) {
						let lengthAtPercent = (totalLength * percent) / 100;
						let { x, y } = SVGPathCommander.getPointAtLength(path, lengthAtPercent);
						positions.push({ x, y, percent, cid, origin:'manual' });
					}
				});
			}
		}
		return positions;
	}

	get jointsForSelectedCid() {
		if (typeof partStore.selectedCid !== 'number') return null;		
		return this.joints[partStore.selectedCid] || null;
	}

	loadJoints(loaded) {
	

		loaded?.code?.forEach(el => {

			if (!el.joints || !el.joints.length || !el.path) {
				return;
			}

			let path = el.path;
			let pathLength = SVGPathCommander.getTotalLength(path);

			let rawD = [];
			let atEnd = false;

			// --- сбор расстояний ---
			el.joints.forEach(dVal => {

				let d = Math.round(dVal * 100) / 100;

				if (Math.abs(d - pathLength) < 0.01) {
					atEnd = true;
				} else {
					rawD.push(d);
				}

			});

			this.updJointVal(el.cid, 'atEnd', atEnd);

			if (!rawD.length) {

				this.updJointVal(el.cid, 'distance', false);
				this.updJointVal(el.cid, 'quantity', false);
				this.updJointVal(el.cid, 'manual', []);

				return;
			}

			// убираем дубли
			rawD = [...new Set(rawD)].sort((a, b) => a - b);

			let remaining = [...rawD];

			// =====================================================
			// SEARCH QUANTITY
			// =====================================================

			let quantity = false;

			if (remaining.length > 0) {

				let dpValues = remaining.map(d =>
					Math.round((d / pathLength * 100) * 100) / 100
				);

				for (let step = 50; step >= 2; step--) {

					let expected = Array.from(
						{ length: step - 1 },
						(_, i) =>
							Math.round(((i + 1) * (100 / step)) * 100) / 100
					);

					if (
						expected.length &&
						expected.every(v => dpValues.includes(v))
					) {

						quantity = step - 1;

						remaining = [];
						break;
					}
				}
			}

			this.updJointVal(el.cid, 'quantity', quantity || false);

			// =====================================================
			// SEARCH DISTANCE
			// =====================================================

			let distance = false;

			if (remaining.length > 1) {

				for (let base of remaining) {

					let multiples = [];
					let i = 1;

					while (i * base <= remaining[remaining.length - 1] + 0.01) {

						multiples.push(Math.round(i * base * 100) / 100);
						i++;

					}

					if (
						multiples.length > 1 &&
						multiples.every(v => remaining.includes(v))
					) {

						distance = base;

						remaining = remaining.filter(d => !multiples.includes(d));

						break;
					}
				}
			}

			this.updJointVal(el.cid, 'distance', distance || false);


			// =====================================================
			// MANUAL
			// =====================================================

			if (remaining.length > 0) {

				let manual = remaining.map(d =>
					Math.round((d / pathLength * 100) * 100) / 100
				);

				this.updJointVal(el.cid, 'manual', manual);

			} else {

				this.updJointVal(el.cid, 'manual', []);

			}

		});
	
	}
	
	updJointVal(cid, param, val) {
		console.log(cid, param, val);
		if (!this.joints[cid]) {
			this.joints[cid] = {atEnd:false,distance:false,quantity:false,manual:[]}; 
		}
		if (param === 'manual' && !Array.isArray(val)) {
			let newVal =[...this.joints[cid]['manual'], val]
			Object.assign(this.joints[cid], { [param]: newVal });
		} else {
			Object.assign(this.joints[cid], { [param]: val });
		}		
	}

	removeJoint(params) {
		const { cid, percent, origin } = params;
		if (origin === 'manual' && this.joints[cid]?.manual) {
			let newVal = this.joints[cid].manual.filter(a => a !== percent);
			this.updJointVal(cid, 'manual', newVal);
		}

		if (origin === 'atEnd' && this.joints[cid]?.manual) {
			this.updJointVal(cid, 'atEnd', false);
		}

		if (origin === 'distance' && this.joints[cid]?.manual) {
			this.updJointVal(cid, 'distance', false);
		}

		if (origin === 'quantity' && this.joints[cid]?.manual) {
			this.updJointVal(cid, 'quantity', false);
		}
	}

	exportForCurrentPart() {

		const part = partStore.svgData;
		partStore.svgData.code.forEach(el => {
	
			if (!el.path || !el.class.includes("contour")) return;

			const joint = this.joints[`${el.cid}`] || []
	
			if (!joint) {
				el.joints = [];
				return;
			}
	
			const pathLength = SVGPathCommander.getTotalLength(el.path);
	
			let result = [];
	

			// -------------------------
			// quantity
			// -------------------------
	
			if (joint.quantity) {
	
				let step = pathLength / (joint.quantity + 1);
	
				for (let i = 1; i <= joint.quantity; i++) {
					result.push(Math.round((i * step) * 100) / 100);
				}
	
			}

			// -------------------------
			// distance
			// -------------------------
	
			if (joint.distance) {
	
				let d = joint.distance;
	
				for (let v = d; v < pathLength; v += d) {
					result.push(Math.round(v * 100) / 100);
				}
	
			}
		
			// -------------------------
			// manual %
			// -------------------------
	
			if (joint.manual?.length) {
	
				joint.manual.forEach(p => {
	
					let d = (p / 100) * pathLength;
	
					result.push(Math.round(d * 100) / 100);
	
				});
	
			}
	
			// -------------------------
			// конец пути
			// -------------------------
	
			if (joint.atEnd) {
				result.push(Math.round(pathLength * 100) / 100);
			}
	
			// удаляем дубли и сортируем
			result = [...new Set(result)].sort((a, b) => a - b);
	
			el.joints = result;
	
		});

		return part;
	}
	

	setData (data) {
		console.log ("ДАННЫЕ ОБНУЛЕНЫ JOINTSTOR ")
		this.joints = data || {};
	}
}

const jointStore = new JointStore();
export default jointStore;
