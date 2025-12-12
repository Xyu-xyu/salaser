// SvgStore.js

import { makeAutoObservable, computed, runInAction } from "mobx";
import { toJS } from "mobx";
import Part from "./../scripts/part";
import Util from "./../scripts/util";
import CONSTANTS from "./constants";


class PartStore {
	tooltips = false;
	laserShow =  {};
	highLighted= false;
	svgParams = { width: 0, height: 0 };
	svgData = { width: 0, height: 0, code: [], params:{id:'',uuid:'',pcode:''} }; // Хранилище объекта SVG
	selectorCoords ={ x: 0, y: 0, width: 0, height: 0 }
	safeMode = {mode: false, intend: CONSTANTS.defaultInletIntend}
	copiedCid = false
	selectedPointOnPath = false
	selectedPointOnEdge = false
	pointInMove = false
	boundsList = false
	xGuide = { x1: 0, y1: 0, x2: 0, y2: 0 };
    yGuide = { x1: 0, y1: 0, x2: 0, y2: 0 };
    aGuide = { x1: 0, y1: 0, x2: 0, y2: 0, angle:0 };
	guidesMode = true;
	selectedEdge = false;
	textFocus =false;
	matrix =  { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	groupMatrix =  { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
	offset =  {x:0,y:0}
	rectParams =  {x:0, y:0, width:0, heigh:0};
	gridState =  {
		xsGrid: {
			visibility: "visible",
			fill: "var(--gridColorFill)",
  		},
		smallGrid: {
			visibility: "visible",
			fill: "none",
 		},
		grid: {
			visibility: "visible",
			fill: "none",
		},
	};
	
	constructor() {
		makeAutoObservable(this, {
			selectedCid: computed,
			selected: computed,
			selectedPath: computed,
            selectedType: computed,
			selectedPiercingType: computed,
			selectedInletModeType: computed,
			selectedContourModeType: computed,
			tecnology: computed,
			selectedInletPath: computed,
			selectedOutletPath: computed,			
			selectedEdgePath: computed,
			selectedText: computed,
			inners: computed,

        });
    }

	get selectedText () {
		const text = this.svgData.code.find(element => element.class.includes('selectedText')  && element.class.includes('contour'));
		if (!text) {
			return null;
		}
		return text
	}

	get selectedInletPath () {
		let cid = this.selected.cid
		if (typeof cid === 'number') {
			return this.getElementByCidAndClass(cid, 'inlet', 'path')	|| ''
		}	
		return ''
	}

	get selectedOutletPath () {
		let cid = this.selected.cid
		if (typeof cid === 'number') {
			return this.getElementByCidAndClass(cid, 'outlet', 'path')	|| ''
		}	
		return ''
	}

	get selectedCid () {
		const selected = this.getSelectedElement();
		if (selected) {
			if (selected.hasOwnProperty('cid')){
				return selected.cid
			}
		}
		return -1;
	}

	get selectedPath () {
		const selected = this.getSelectedElement();
		if (selected) {
			if (selected.hasOwnProperty('path')){
				return selected.path
			}
		}
		return '';
	}

	get selected () {
		const selected = this.getSelectedElement();
		if (selected) {
			return selected;		 
		}
		return '';
	}

	get tecnology () {
		let allClasses =''
		this.svgData['code'].forEach(element => {
			allClasses+=' '
			allClasses+=element.class
			allClasses+=' '
   		});
		let allTec = [...new Set (allClasses.split(/\s{1,}/gm))]
		//console.log("printStore:", toJS(allTec));
	    return allTec
	}

	get selectedPiercingType () {
		const selected = this.getSelectedElement();
		if (selected) {
			const inletClass = this.getElementByCidAndClass (selected.cid, 'inlet', 'class')
			if (inletClass){
				return Part.detectPiercingType(inletClass);
			}
		}
		return '';
	}

	get selectedInletModeType () {
		const selected = this.getSelectedElement();
		if (selected) {
			const inletClass = this.getElementByCidAndClass (selected.cid, 'inlet', 'class')
			if (inletClass) {
				return Part.detectContourModeType(inletClass);
			}	
		}
		return '';
	}

	get selectedContourModeType () {
		const selected = this.getSelectedElement('class');
		if (selected) {
			return Part.detectContourModeType(selected);
		}
		return '';
	}

	get selectedType() {
		const selected = this.getSelectedElement('class');
		if (selected) {
			return Part.detectContourType(selected);
		}
		return '';
	}

	get selectedEdgePath() {
		let val = this.selectedEdge || '';
		if (val && this.selectedEdge) {
			let contour = this.getElementByCidAndClass(this.selectedEdge.cid, 'contour', 'path');
			if (!contour) return '';
			let updContour = Util.normPath(contour);
	
			let segIndex = val.edge.segIndex;
			let segment = updContour[segIndex];
	
			// Определяем предыдущий сегмент (учитываем замыкание контура)
			let prevSegmentIndex = segIndex > 0 ? segIndex - 1 : updContour.length - 1;
			let prevSegment = updContour[prevSegmentIndex];
	
			// Получаем координаты конца предыдущего сегмента
			let prevX = prevSegment[prevSegment.length - 2]; // X-координата последней точки
			let prevY = prevSegment[prevSegment.length - 1]; // Y-координата последней точки
	
			return `M${prevX} ${prevY} ${segment.join(' ')}`;
		} else {
			return '';
		}
	}

	setTooltips (val) {
		this.tooltips = val
	}

	reorderItems(newOrder, oldOrder) {
		// Создаём копию оригинального массива
		const originalArray = [...this.svgData.code];
	  
		// Создаём массив индексов элементов oldOrder в originalArray
		const indices = oldOrder.map(item =>
		  originalArray.findIndex(orig => orig.cid === item.cid && orig.class === item.class)
		);
	  
		// Создаём новый массив, упорядоченный в соответствии с newOrder
		const reorderedItems = newOrder.map(newItem =>
		  oldOrder.find(oldItem => oldItem.cid === newItem.cid)
		);
	  
		// Вставляем элементы в originalArray на соответствующие позиции
		indices.forEach((index, i) => {
		  originalArray[index] = reorderedItems[i];
		});
	  
		// Обновляем массив в состоянии
		this.svgData.code = originalArray;
	}
	
	setTextFocus (val) {
		this.textFocus = val
		if (!val) {
			this.svgData.code.forEach(element => {
				element.class = element.class.replace(/\bselectedText\b/, " ").trim();
			});
		}
	}	
	
	setSelectedEdge ( val ) {
		this.selectedEdge = val
	}

	setNewOuter() {
		if (typeof this.selectedCid === 'number' && this.selectedCid !==-1 ) {
			if (this.getSelectedElement().class.includes('outer')) return;
			this.svgData.code.forEach(element => {
				if (element.class.includes("outer")) {
					element.class = element.class.replace("outer", "inner");
				} else if (element.class.includes("inner") && this.selectedCid === element.cid) {
					element.class = element.class.replace("inner", "outer");
				}
			});
	
			// Сортировка после изменений
			const order = ['outer', 'contour', 'engraving', 'inlet', 'outlet', 'joint'].reverse();
			
			this.svgData.code = this.svgData.code.sort((a, b) => {
				let ac = a.class.split(' ')
					.map(cls => order.indexOf(cls))
					.sort((a, b) => b - a)[0] || -1;
				
				let bc = b.class.split(' ')
					.map(cls => order.indexOf(cls))
					.sort((a, b) => b - a)[0] || -1;
	
				return bc - ac;
			});
		}
	}
	
	setGuidesMode (val) {
		this.guidesMode = val
	}

	setBoundsList (val) {
		this.boundsList = val
	}

	setPointInMove (val) {
		this.pointInMove = val
	}

	updateXGuide(newValues) {
        Object.assign(this.xGuide, newValues);
    }

    updateYGuide(newValues) {
        Object.assign(this.yGuide, newValues);
    }

    updateAGuide(newValues) {
        Object.assign(this.aGuide, newValues);
    }

	setSelectedPointOnEdge (val) {
		this.selectedPointOnEdge = val
		if (svgStore.boundsList && val) {
			let res = Util.checkGuides( val.point )

			//console.log ( res )
			if (typeof res.yy === 'number') {
				let val = { x1: res.min.x, y1: res.yy, x2: res.max.x, y2: res.yy };
				this.updateXGuide(val)
			} else {
				let val = { x1: 0, y1: 0, x2:0, y2: 0 };
				this.updateXGuide(val)
			}

			if (typeof res.xx === 'number'){
				let val = { x1: res.xx, y1: res.min.y, x2: res.xx, y2: res.max.y };
				this.updateYGuide(val)
			} else {
				let val = { x1: 0, y1: 0, x2:0, y2: 0 };
				this.updateYGuide(val)			
			}

			if (res.aa) {
				let val = { x1: res.aa.x1, y1: res.aa.y1, x2: res.aa.x2, y2: res.aa.y2, angle: res.aa.a };
				this.updateAGuide(val)	
			} else  {
				let val = { x1: 0, y1: 0, x2:0, y2: 0, angle: 0 };
				this.updateAGuide(val)			
			}
		}
	}

	setSelectedPointOnPath (val) {
		this.selectedPointOnPath=val
	}

	setsafeMode (mode) {
		//console.log(mode)
		this.safeMode = mode
	}

	setSvgData(newData) {
		//console.log(newData)
		this.svgData = newData; // Устанавливаем новые данные SVG
	}

	setNewPartSize (x,y) {
		this.svgData.width = x
		this.svgData.height = y
	}

	clearSvgData() {
		this.svgData = { width: 0, height: 0, code: [] , params:{}}; // Очищаем данные SVG
	}

	addElement (element) {
		if (element) {
			this.svgData.code.push(element);
		}
	}

	getElementByCidAndClass(cid, className, val = '') {
		const element = this.svgData.code.find(
			(el) => el.cid === cid && el.class.includes(className)
		);
	
		if (!element) {
			return null; 
		}
	
		return val ? element[val] || null : element;
	}
	
	removeElementByCidAndClass(cid, className) {
		//console.log ('removeElementByCidAndClass', className, cid)
		this.svgData.code = this.svgData.code.filter(
			(element) => element.cid !== cid || !element.class.includes(className)
		);
	}

	addElementWithCid(cid) {
 		const elementsToCopy = this.svgData.code.filter(el => el.cid === cid);
		
		if (elementsToCopy.length === 0) {
			console.warn(`No elements found with cid: ${cid}`);
			return;
		}
	
 		const maxCid = this.svgData.code.length > 0 
			? Math.max(...this.svgData.code.map(el => el.cid)) 
			: 0;
	
 		const newElements = elementsToCopy.map(el => {
			// TODO надо решить что делать если копируется внешний контур ?? 
			// технически контур скопировать пока можно , но что делать с двумя внешними контурами не очень понятно ??
			/* let newClass = el.class.includes('outer') 
				? el.class.replace('outer', 'inner') 
				: el.class; */
			
			return {
				...el, 
				cid: maxCid + 1,
				//class: newClass
			};
		});	
		//console.log("Adding elements with new cid:", newElements);
 		this.svgData.code.push(...newElements);
	}

	addTextElement(coords={x:0,y:0}) {
		const maxCid = this.svgData.code.length > 0 
			? Math.max(...this.svgData.code.map(el => el.cid)) 
			: 0;

			coords = Util.convertScreenCoordsToSvgCoords( coords.x, coords.y )
			const newElement = {
			path: 'M0 0',
			cid: maxCid + 1,
			class: 'contour engraving macro2 closed0 noOutlet skeletonText selectedText',
            selected: false,
			stroke: 'lime',
			strokeWidth: 0.2,
			coords:  coords,
			kerning: CONSTANTS.kerning,
			fontSize: CONSTANTS.fontSize,
			text: '',
			rotate:0,
			rotatePoint:{},
			cursor:{start:0, end:0},
			scaleX:1,
			scaleY:1,
		};
	
		//console.log("Adding new TEXT element with new cid:", newElement);
		this.svgData.code.push(newElement); 
	}
	
	addElementPath (path='', inletPath='', outletPath='') {
		let maxCid = this.svgData.code.length > 0 
		? Math.max(...this.svgData.code.map(el => el.cid)) 
		: 0;
		maxCid+=1

		let inlet={
			cid:maxCid,
			class:"inlet inner macro0 closed1",
			path: inletPath,
			stroke:'red',
			strokeWidth:0.2,
		}
		let outlet={
			cid:maxCid,
			class:"outlet inner macro0 closed1",
			path:outletPath,
			stroke:'lime',
            strokeWidth:0.2,
		};
		let contour={
			class: 'contour inner macro0 closed1',
			cid:maxCid,
			path: path,
			stroke:'red',
            strokeWidth:0.2,
            //piercingMode: null,
            selected: false
		};
		this.svgData.code.push( contour, inlet, outlet);
		this.setContourSelected(maxCid)
	}
	
	updateElementValue(cid, className, val, newVal) {
		const element = this.svgData.code.find(
			(el) => el.cid === cid && el.class.includes(className)
		);
		if (element && val in element) {
			element[val] = newVal; 
		}
	}

	updateElementValues(cid, className, updates) {
		const element = this.svgData.code.find(
			(el) => el.cid === cid && el.class.includes(className)
		);
	
		if (element) {
			Object.assign(element, updates);
		}
	}

	setContourSelected(cid) {
		console.log('setContourSelected ' + cid)
 		this.svgData.code.forEach((el, i, arr)=>{
			if(el.hasOwnProperty('selected')) {
				this.updateElementValue (el.cid, 'contour', 'selected', false)		
			}
		}) 
		if (typeof cid  === 'number') this.updateElementValue (cid, 'contour', 'selected', true);
	}

	getSelectedElement(val = '') {	
		const selectedElement = this.svgData.code.find(element => element.selected);
		if (!selectedElement || selectedElement.cid === -1 ) {
			return null;
		}
		return val ? selectedElement[val] /* || null : */: selectedElement;
	}

	getOuterElement(val = '') {	
		const outer = this.svgData.code.find(element => element.class.includes('outer') && element.class.includes('contour'));
		if (!outer) {
			return null;
		}
		return val ? outer[val] || null : outer;
	}

	getFiltered(filter = 'contour', exclude = []) {
		const filters = Array.isArray(filter) ? filter : [filter];
		const excludes = Array.isArray(exclude) ? exclude : [exclude];
	  
		return this.svgData.code.filter(element =>
		  filters.every(f => element.class.includes(f)) &&
		  !excludes.some(e => element.class.includes(e))
		);
	}
	deleteSelected () {
		let selected = this.getSelectedElement()	
		let cidSelected = selected.cid		

		if (typeof cidSelected === 'number') {
			['inlet', 'outlet', 'contour', 'joint'].map(a =>{
				this.removeElementByCidAndClass(cidSelected, a)
			})
		}
	}

	printStore() {
		this.svgData['code'].forEach(element => {
        console.log("printStore:", toJS(element));
        });
	}

	setSelectorCoords (val) {
		this.selectorCoords =  val
	}

	setCopiedCid (val) {
		this.copiedCid = val
	}

	setMatrix  (val) {
		Object.assign(this.matrix, val)
	}

	setGroupMatrix (val) {
		Object.assign(this.groupMatrix,  val)
	}
	
	setOffset (val) {
		Object.assign(this.offset, val)
	}

	setRectParams (val) {
		Object.assign(this.rectParams,val)
	}

	setGridState(val) {
		Object.assign(this.gridState, val);
	}

	setSvgParams(val) {
        Object.assign(this.svgParams, val);
    } 

	setHighLighted(val) {
        this.highLighted = val;
    } 

	setLaserShow (val) {
		Object.assign(this.laserShow, val);
	}
}

const partStore = new PartStore();
export default partStore;
