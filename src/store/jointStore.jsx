import { makeAutoObservable, observable, computed, set } from "mobx";
import svgStore from "./svgStore";
import SVGPathCommander from "svg-path-commander";

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

	
			let contour = svgStore.getElementByCidAndClass(cid, 'contour');
			if (!contour || !contour.path) continue; // Проверяем, существует ли объект
			
			let path = contour.path;
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
		if (!svgStore.selectedCid) return null;		
		return this.joints[svgStore.selectedCid] || null;
	}

	loadJoints(loaded) {
		let cids = new Set();
		let jointMap = {};
		loaded.forEach((elm) => {
			for (let key in elm) {
				cids.add(key);
				if (!jointMap[key]) {
					jointMap[key] = [];
				}
				jointMap[key].push(elm[key]);  
			}
		});
	
		// Обрабатываем каждый уникальный cid
		cids.forEach((cid) => {
			console.log(`Обрабатываем cid: ${cid}`, jointMap[cid]);
	
			let dpValues = [];
			let dValues = []; // Сюда собираем все d (расстояния)
	
			jointMap[cid].forEach(j => {
				const { dp, d, d1 } = j;	
				// Проверяем atEnd
				if (d1 !== 0 && Math.abs(Math.round(dp) - Math.round((d / d1) * 100)) < 1) {
					this.updJointVal(Number(cid), 'atEnd', true);
				} else {
					dpValues.push(Math.round(dp * 100) / 100);
					dValues.push(Math.round(d * 100) / 100);
				}
			});
	
			let usedDpValues = new Set();
			let usedDValues = new Set();	
	
			// === 2. Определяем distance (шаг по d) только если quantity НЕ найден ===
			if (dValues.length > 1) {
				dValues.sort((a, b) => a - b);
				for (let i = 0; i < dValues.length; i++) {
					let testArray = [];
					let dist = dValues[i];
					let ii = 1;
					while (ii * dist <= dValues[dValues.length - 1]) {
						testArray.push(Math.round(ii * dist * 100) / 100);
						ii++;
					}
	
					if (testArray.every(value => dValues.includes(value))) {
						usedDValues = new Set(dValues.filter(a => testArray.includes(a)));
						dpValues = dpValues.filter((dp, i) => !usedDValues.has(dValues[i]));
						this.updJointVal(Number(cid), 'distance', dist);
						break;
					}
				}
			}

			// 1. Проверяем все возможные шаги dp от 1 до 50
			let bestStep = null;
			let testArray;
			//console.log ('dpValues  ' + JSON.stringify(dpValues))
			for (let step = 50; step >= 2; step--) { // Двигаемся от 50 к 2
				testArray = Array.from({ length: (100 / step) - 1 }, (_, ind) => Math.round((100/step)*(ind+1) *100) /100).filter(a => a<100)
				//console.log('Step:', step, JSON.stringify(testArray));
			
				if (testArray.every(value => dpValues.includes(value))) {
					//console.log ('BEST STEP:   '+ step)
					bestStep = step;
					break							
				}
			}

			if (bestStep) {
				usedDpValues = new Set(dpValues.filter(a => testArray.includes(a)));	
				dValues = dValues.filter((_, i) => !usedDpValues.has(dpValues[i]));	
				this.updJointVal(Number(cid), 'quantity',  bestStep - 1);	
			}

			// === 3. manual только для оставшихся joints ===
			let manualDp = dpValues.filter(dp => !usedDpValues.has(dp));
			if (manualDp.length > 0) {
				this.updJointVal(Number(cid), 'manual', manualDp);
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

	setData (data) {
		Object.assign(this.joints, data);
	}
}

const jointStore = new JointStore();
export default jointStore;
