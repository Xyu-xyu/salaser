// SvgStore.js

import { makeAutoObservable, computed, runInAction } from "mobx";
import { toJS } from "mobx";
import Part from "./../scripts/part";
import Util from "./../scripts/util";
import CONSTANTS from "./constants";
import log from "../scripts/log";
import jointStore from "./jointStore";
import svgStore from "./svgStore";

const DEFAULT_DB_PARTS_QUERY = Object.freeze({
	limit: 50,
	offset: 0,
	name_prefix: "",
	name_contains: "",
	created_last_days: "",
	updated_last_days: "",
	created_from: "",
	created_to: "",
	updated_from: "",
	updated_to: "",
	owner: "",
	thickness: "",
	material_id: "",
});

class PartStore {
	// ---- Parts DB list (for UI parts mode) ----
	dbParts = [];
	dbPartsLoading = false;
	dbPartsError = null;
	dbPartsQuery = { ...DEFAULT_DB_PARTS_QUERY };
	/** @type {{ id: number|string, label: string, name?: string }[]} */
	dbMaterials = [];
	dbMaterialsLoading = false;
	dbMaterialsError = null;
	selectedPartUuid = "";

	/** Сохранить в jdb/parts при выходе из редактора (новая деталь или из библиотеки). */
	savePartToDbOnExit = false;

	partInEdit = false;
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
	/** Если true, трансформация внешнего контура применяется ко всем внутренним контурам. */
	InnerAndOuter = true;
	matrix =  { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	groupMatrix =  { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
	offset =  {x:0,y:0}
	rectParams =  {x:0, y:0, width:0, height:0};
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
	
		// Функция определения приоритета класса
		const getClassPriority = (item) => {
			if (item.class.includes('contour')) return 0;
			if (item.class.includes('inlet'))   return 1;
			if (item.class.includes('outlet'))  return 2;
			return 3; // на случай других классов — в конец
		};
	
		// Группируем oldOrder по cid, сохраняя внутри группы правильный порядок
		const groupedByCid = {};
		oldOrder.forEach(item => {
			const cid = item.cid;
			if (!groupedByCid[cid]) {
				groupedByCid[cid] = [];
			}
			groupedByCid[cid].push(item);
		});
	
		// Сортируем элементы внутри каждой группы по приоритету class
		Object.keys(groupedByCid).forEach(cid => {
			groupedByCid[cid].sort((a, b) => getClassPriority(a) - getClassPriority(b));
		});
	
		// Формируем новый порядок: следуем newOrder по cid, но внутри cid берём отсортированные элементы
		const reorderedItems = [];
		newOrder.forEach(newItem => {
			const cid = newItem.cid;
			const group = groupedByCid[cid];
			if (group && group.length > 0) {
				// Берём все элементы из группы в уже отсортированном порядке
				reorderedItems.push(...group);
				// Удаляем группу, чтобы не добавить её повторно (на случай дубликатов в newOrder)
				delete groupedByCid[cid];
			}
		});
	
		// Если остались группы, которых нет в newOrder (маловероятно, но на всякий случай)
		// их можно добавить в конец, но обычно newOrder должен содержать все cid
		Object.keys(groupedByCid).forEach(cid => {
			reorderedItems.push(...groupedByCid[cid]);
		});
	
		// Теперь находим индексы старых элементов в originalArray и заменяем их
		const indices = oldOrder.map(item =>
			originalArray.findIndex(orig => orig.cid === item.cid && orig.class === item.class)
		);
	
		// Заменяем элементы в оригинальном массиве на новые (в нужном порядке)
		indices.forEach((index, i) => {
			if (index !== -1) { // на случай, если элемент не найден
				originalArray[index] = reorderedItems[i];
			}
		});
	
		// Обновляем состояние
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
		if (partStore.boundsList && val) {
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
		this.svgData.code.push( contour);
		this.svgData.code.push( inlet );
		this.svgData.code.push( outlet);

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

	setInnerAndOuter(value) {
		this.InnerAndOuter = Boolean(value);
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

	setVal (key, value) {
		if (key in this) {
			this[key] = value;
		}
	}

	async loadDbParts(limitOrPatch, maybeOffset) {
		let patch = {};
		if (typeof limitOrPatch === "number") {
			patch = { limit: limitOrPatch, offset: Number(maybeOffset) || 0 };
		} else if (limitOrPatch != null && typeof limitOrPatch === "object") {
			patch = limitOrPatch;
		}
		if (Object.keys(patch).length) {
			runInAction(() => Object.assign(this.dbPartsQuery, patch));
		}

		const q = this.dbPartsQuery;
		const params = new URLSearchParams();
		const lim = Math.max(1, Math.min(500, Number(q.limit) || 50));
		const off = Math.max(0, Number(q.offset) || 0);
		params.set("limit", String(lim));
		params.set("offset", String(off));

		const addParam = (key, val) => {
			const s = val == null ? "" : String(val).trim();
			if (s !== "") params.set(key, s);
		};
		addParam("name_prefix", q.name_prefix);
		addParam("name_contains", q.name_contains);
		addParam("created_last_days", q.created_last_days);
		addParam("updated_last_days", q.updated_last_days);
		addParam("created_from", q.created_from);
		addParam("created_to", q.created_to);
		addParam("updated_from", q.updated_from);
		addParam("updated_to", q.updated_to);
		addParam("owner", q.owner);
		addParam("thickness", q.thickness);
		addParam("material_id", q.material_id);

		partStore.setVal("dbPartsLoading", true);
		partStore.setVal("dbPartsError", null);
		try {
			const resp = await fetch(
				`${CONSTANTS.SERVER_URL}/jdb/get_parts?${params.toString()}`,
				{ method: "GET" }
			);
			const data = await resp.json();
			if (!resp.ok) throw new Error(data?.error ?? `HTTP ${resp.status}`);
			partStore.setVal("dbParts", Array.isArray(data?.parts) ? data.parts : []);
		} catch (e) {
			partStore.setVal("dbPartsError", e?.message ?? String(e));
		} finally {
			partStore.setVal("dbPartsLoading", false);
		}
	}

	setDbPartsQuery(partial) {
		runInAction(() => Object.assign(this.dbPartsQuery, partial));
	}

	resetDbPartsQuery() {
		runInAction(() => {
			Object.assign(this.dbPartsQuery, { ...DEFAULT_DB_PARTS_QUERY });
		});
	}

	async loadDbMaterials() {
		partStore.setVal("dbMaterialsLoading", true);
		partStore.setVal("dbMaterialsError", null);
		try {
			const resp = await fetch(`${CONSTANTS.SERVER_URL}/jdb/get_materials`, {
				method: "GET",
			});
			const data = await resp.json().catch(() => ({}));
			if (!resp.ok) throw new Error(data?.error ?? `HTTP ${resp.status}`);

			let raw = data?.materials;
			if (!Array.isArray(raw) && Array.isArray(data?.data)) raw = data.data;
			if (!Array.isArray(raw)) raw = [];

			const list = raw
				.map((row) => {
					if (row == null || typeof row !== "object") return null;
					const id = row.id ?? row.material_id;
					if (id == null || id === "") return null;
					const label =
						row.label != null && String(row.label).trim() !== ""
							? String(row.label)
							: row.name != null && String(row.name).trim() !== ""
								? String(row.name)
								: String(id);
					return {
						id,
						label,
						name: row.name != null ? String(row.name) : undefined,
					};
				})
				.filter(Boolean);

			partStore.setVal("dbMaterials", list);
		} catch (e) {
			partStore.setVal("dbMaterialsError", e?.message ?? String(e));
			console.error("jdb/get_materials", e);
		} finally {
			partStore.setVal("dbMaterialsLoading", false);
		}
	}

	selectPart(uuid) {
		partStore.setVal('selectedPartUuid', uuid ?? "");
	}

	/**
	 * Новая деталь из модалки: пустой контур, имя / толщина / материал с формы.
	 */
	applyNewPartDefaultsAndOpenEditor({ name, thickness, material_id }) {
		const uuid =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		const mid = String(material_id ?? "").trim();
		const mat = partStore.dbMaterials.find((m) => String(m.id) === mid);
		const t = Number(String(thickness).replace(",", "."));

		const part = {
			name: String(name ?? "").trim(),
			uuid,
			width: 0,
			height: 0,
			x: 0,
			y: 0,
			code: [],
			params: {
				uuid,
				pcode: "",
				id: "",
			},
			thickness: t,
			material_id: Number(mid),
			material: mat
				? { label: mat.label, name: mat.name ?? "" }
				: { label: "", name: "" },
		};

		runInAction(() => {
			partStore.setSvgData(part);
			partStore.setVal("partInEdit", uuid);
			partStore.setVal("savePartToDbOnExit", true);
		});
		jointStore.setData({});
	}

	/**
	 * Загружает деталь с бэка и открывает её в partStore для редактора.
	 * Ожидается GET /jdb/get_part/<uuid> с JSON телом детали (как в part_code: code, width, height, uuid, …)
	 * или { part: {…} }.
	 * @returns {Promise<boolean>}
	 */
	async loadPartIntoEditor(uuid) {
		const id = String(uuid ?? "").trim();
		if (!id) return false;
		try {
			const resp = await fetch(`${CONSTANTS.SERVER_URL}/jdb/get_part/${encodeURIComponent(id)}`, {
				method: "GET",
			});
			const data = await resp.json().catch(() => ({}));
			if (!resp.ok) throw new Error(data?.error ?? `HTTP ${resp.status}`);

			let raw = data?.part ?? data?.svg_data ?? data;
			if (!raw || typeof raw !== "object") {
				throw new Error("Пустой ответ get_part");
			}
			const next = JSON.parse(JSON.stringify(raw));
			if (!Array.isArray(next.code)) next.code = [];
			next.params = typeof next.params === "object" && next.params !== null ? next.params : {};
			if (!next.params.uuid) next.params.uuid = next.uuid ?? id;
			if (!next.uuid) next.uuid = id;

			runInAction(() => {
				partStore.setSvgData(next);
				partStore.setVal("partInEdit", next.uuid ?? id);
				partStore.setVal("savePartToDbOnExit", true);
			});
			return true;
		} catch (e) {
			console.error("jdb/get_part", e);
			return false;
		}
	}

	/**
	 * Сохранение детали в БД.
	 * POST /jdb/save_part — тело JSON по схеме:
	 * { uuid, name, thickness, material_id, part: { … }, ncp: string }.
	 */
	async savePartToDatabase(partObject) {
		const raw = partObject && typeof partObject === "object" ? partObject : partStore.svgData;
		const po = toJS(raw);
		const uuid = po?.uuid ?? partStore.partInEdit;
		if (!uuid) throw new Error("Нет uuid детали");

		const numOrNull = (v) => {
			if (v === undefined || v === null || v === "") return null;
			const n = Number(v);
			return Number.isFinite(n) ? n : null;
		};
		const intOrNull = (v) => {
			if (v === undefined || v === null || v === "") return null;
			const n = parseInt(String(v), 10);
			return Number.isFinite(n) ? n : null;
		};

		const ncpLines = svgStore.generateStandalonePartNcp(po, 1);
		const ncp = Array.isArray(ncpLines) ? ncpLines.flat().join("\n") : String(ncpLines ?? "");

		const name = String(po.name ?? "").trim();
		const thickness = numOrNull(po.thickness);
		const material_id = intOrNull(po.material_id);

		let partPayload;
		try {
			partPayload = JSON.parse(JSON.stringify(po));
		} catch {
			partPayload = { ...po };
		}
		partPayload.uuid = String(uuid);
		partPayload.name = name;
		partPayload.thickness = thickness;
		partPayload.material_id = material_id;

		const body = {
			uuid: String(uuid),
			name,
			thickness,
			material_id,
			part: partPayload,
			ncp,
		};

		const resp = await fetch(`${CONSTANTS.SERVER_URL}/jdb/save_part`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		});
		const data = await resp.json().catch(() => ({}));
		if (!resp.ok) throw new Error(data?.error ?? `HTTP ${resp.status}`);
		await partStore.loadDbParts();
		return data;
	}

	async deletePart(uuid) {
		const targetUuid = uuid ?? partStore.selectedPartUuid;
		if (!targetUuid) return;

		try {
			const resp = await fetch(`${CONSTANTS.SERVER_URL}/jdb/delete_part`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ uuid: targetUuid }),
			});
			const data = await resp.json().catch(() => ({}));
			if (!resp.ok) throw new Error(data?.error ?? `HTTP ${resp.status}`);

			partStore.setVal('dbParts', partStore.dbParts.filter(p => p?.uuid !== targetUuid));
			if (partStore.selectedPartUuid === targetUuid) {
				partStore.setVal('selectedPartUuid', "");
			}
		} catch (e) {
			console.error(e);
			partStore.setVal('dbPartsError', e?.message ?? String(e));
		}
	}

	getDefaultState() {
		return {
			// я ни фига не уверен что это нужно, но пусть будет
			dbParts: [],
			dbPartsLoading: false,
			dbPartsError: null,
			dbPartsQuery: { ...DEFAULT_DB_PARTS_QUERY },
			dbMaterials: [],
			dbMaterialsLoading: false,
			dbMaterialsError: null,
			selectedPartUuid: "",
			savePartToDbOnExit: false,
			// 
			partInEdit: false,
			tooltips: false,
			laserShow: {},
			highLighted: false,
			svgParams: { width: 0, height: 0 },
			svgData: {
				width: 0,
				height: 0,
				code: [],
				params: { id: '', uuid: '', pcode: '' },
			},
			selectorCoords: { x: 0, y: 0, width: 0, height: 0 },
			safeMode: { mode: false, intend: CONSTANTS.defaultInletIntend },
			copiedCid: false,
			selectedPointOnPath: false,
			selectedPointOnEdge: false,
			pointInMove: false,
			boundsList: false,
			xGuide: { x1: 0, y1: 0, x2: 0, y2: 0 },
			yGuide: { x1: 0, y1: 0, x2: 0, y2: 0 },
			aGuide: { x1: 0, y1: 0, x2: 0, y2: 0, angle: 0 },
			guidesMode: true,
			selectedEdge: false,
			textFocus: false,
			InnerAndOuter: true,
			matrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
			groupMatrix: { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
			offset: { x: 0, y: 0 },
			rectParams: { x: 0, y: 0, width: 0, height: 0 }
		}
	}

	setToDefault() {
		log.clearBase();
		this.clearSvgData();
		const defaults = this.getDefaultState();
		/** Каталог деталей / материалов — не затирать: иначе после save + loadDbParts список обнуляется. */
		const preserveKeys = [
			"dbParts",
			"dbPartsLoading",
			"dbPartsError",
			"dbPartsQuery",
			"dbMaterials",
			"dbMaterialsLoading",
			"dbMaterialsError",
		];
		const preserved = {};
		for (const k of preserveKeys) {
			if (k in this) preserved[k] = this[k];
		}
		Object.assign(this, defaults);
		Object.assign(this, preserved);
		this.printStore();
		jointStore.setData({});
	}
	
}

const partStore = new PartStore();
export default partStore;
