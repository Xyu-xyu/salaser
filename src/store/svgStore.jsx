import { makeAutoObservable,  runInAction } from "mobx";
import SVGPathCommander from 'svg-path-commander';
 
  
class SvgStore {
	tooltips = false;
	laserShow =  {};
	highLighted= false;
	//svgData = { width: 0, height: 0, code: [], params:{id:'',uuid:'',pcode:''} }; // Хранилище объекта SVG
	svgData = {
		"name": "undefined.ncp",
		"width": 500,
		"height": 500,
		"quantity": 1,
		"presetId": 50,
		"presetName": "any_preset",
		"positions": [
			/*{
				"part_id": 1,
				"part_code_id": 1,
				"positions": { "a": 1, "b": 0, "c": 0, "d": 1, "e": 0, "f": 0 }
			}*/
		],
		"part_code": [
			/*{
				"id": 1,
				"uuid": "n2-d0170e56-3c47-411e-84de-813bb41a7245",
				"name": "12___10__2",
				"code": [
					{
						"cid": 1,
						"class": "contour outer macro0 closed1",
						"path": "M15 199.5 V254.358 A9.999969 9.999969 0 0 1 12.071 261.429 L2.929 270.571 A9.999969 9.999969 0 0 0 0 277.642 V389 A9.999993 9.999993 0 0 0 10 399 H54.555 A10.000573 10.000573 0 0 0 62.955 394.426 L65.619 390.302 A10.000073 10.000073 0 0 1 74.019 385.729 H180.981 A10.000073 10.000073 0 0 1 189.381 390.302 L192.045 394.426 A10.000573 10.000573 0 0 0 200.445 399 H245 A9.999993 9.999993 0 0 0 255 389 V277.642 A9.999969 9.999969 0 0 0 252.071 270.571 L242.929 261.429 A9.999969 9.999969 0 0 1 240 254.358 V144.642 A9.999969 9.999969 0 0 1 242.929 137.571 L252.071 128.429 A9.999969 9.999969 0 0 0 255 121.358 V10 A9.999993 9.999993 0 0 0 245 0 H200.445 A10.000573 10.000573 0 0 0 192.045 4.574 L189.381 8.698 A10.000073 10.000073 0 0 1 180.981 13.271 H74.019 A10.000073 10.000073 0 0 1 65.619 8.698 L62.955 4.574 A10.000573 10.000573 0 0 0 54.555 0 H10 A9.999993 9.999993 0 0 0 0 10 V121.358 A9.999969 9.999969 0 0 0 2.929 128.429 L12.071 137.571 A9.999969 9.999969 0 0 1 15 144.642 V199.5 ",
						"stroke": "red",
						"strokeWidth": 0.2
					},
					{
						"cid": 2,
						"class": "inlet outer macro1 pulse0",
						"path": "M7 199.5 L12.333333 197.614382 A2 2 0 0 1 15 199.5 ",
						"stroke": "red",
						"strokeWidth": 0.2
					},
					{
						"cid": 2,
						"class": "contour inner macro0 closed1",
						"path": "M100.025 283.243 V241.243 A9.999993 9.999993 0 0 1 110.025 231.243 H144.482 A9.999993 9.999993 0 0 1 154.482 241.243 V325.243 A9.999993 9.999993 0 0 1 144.482 335.243 H110.025 A9.999993 9.999993 0 0 1 100.025 325.243 V283.243",
						"stroke": "red",
						"strokeWidth": 0.2
					}

				]
			}*/
			
		]
	}

	matrix =  { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
	groupMatrix =  { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 }
	offset =  {x:0,y:0}
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
        });
    }

	get nextPartId() {
        const positions = this.svgData.positions;
        if (!positions || positions.length === 0) {
            return 1;
        }

        // Находим максимальный part_id
        const maxId = Math.max(...positions.map(p => p.part_id || 0));
        return maxId + 1;
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

	setGridState(val) {
		Object.assign(this.gridState, val);
	}
	setTooltips (val) {
		this.tooltips = val
	}

	setVal(objectKey, pathOrKey, newValue) {
		const target = this[objectKey];
		if (!target) throw new Error(`Object ${objectKey} not found in store`);
	
		// если передан просто ключ (string), конвертируем в массив
		const path = Array.isArray(pathOrKey) ? pathOrKey : [pathOrKey];
	
		let current = target;
		for (let i = 0; i < path.length - 1; i++) {
		  if (!(path[i] in current)) {
			throw new Error(`Key ${path[i]} does not exist in ${objectKey}`);
		  }
		  current = current[path[i]];
		}
	
		const lastKey = path[path.length - 1];
		if (!(lastKey in current)) {
		  throw new Error(`Key ${lastKey} does not exist in ${objectKey}`);
		}
	
		current[lastKey] = newValue;
	}

	fitToPage() {
		console.log("FIT TO PAGE");
	}

	addPosition ( position) {
		this.svgData.positions = [...this.svgData.positions, position]
	}
	
	addForm ( form ) {
		form.part_id = svgStore.svgData.part_code.length+1
		form.papams={
			"code": "",
			"uuid": ""
		}
		const box = this.findBox ( form.code)
		form.width = 0
		form.height = 0
		if ( box) {
			form.width = box.width
			form.height = box.height
		}

		console.log ( form )

		this.svgData.part_code.push ( form )
	}

	findBox (code) {
		let commonPath =''
		code.map (a => commonPath+= a.path)
		return SVGPathCommander.getPathBBox( commonPath )
	}

	selectOnly = (partId) => {
		runInAction(() => {
			this.svgData.positions.forEach(pos => {
				pos.selected = pos.part_id === partId;
			});
		});
	};

	deselect = (id = false) => {
		runInAction(() => {
			if (id === false || id === null || id === undefined) {
				// Снимаем выделение со ВСЕХ деталей
				this.svgData.positions.forEach(part => {
					part.selected = false;
				});
			} else {
				// Снимаем выделение только с конкретной детали
				const part = this.svgData.positions.find(p => p.part_id === id);
				if (part) {
					part.selected = false;
				}
			}
		});
	};

	deleteAll = (uuid) => {
		if (!uuid) {
			console.warn('deleteAll: uuid не передан');
			return;
		}
	
		runInAction(() => {
			svgStore.svgData.positions = svgStore.svgData.positions.filter(
				(part) => part.part_code_id !== uuid
			);
		});
	};

	deleteOutParts = () => {
		const { width, height } = this.svgData;
	
		// Если холст не задан — выходим
		if (!width || !height) {
			console.warn('deleteOutParts: размеры холста не заданы');
			return;
		}
	
		runInAction(() => {
			this.svgData.positions = this.svgData.positions.filter(part => {
				// Проверяем только выделенные
				if (!part.selected) {
					return true; // оставляем
				}	
				const x = part.positions.e;
				const y = part.positions.f;
				const formId = part.part_code_id
				const form = this.svgData.part_code.filter (f =>  formId === f.uuid)
				const widthF = form[0].width
				const heightF = form[0].height
	
				// Условие: центр детали за пределами холста
				const isOut =
					x + widthF < 0 ||
					y + heightF < 0 ||
					x > width ||
					y > height;
	
				// Если за пределами — удаляем (filter возвращает false)
				return !isOut;
			});
		});
	};

	updateForm (uuid, newPartCodeObject) {
		//console.log( arguments );
        if (!this.svgData || !Array.isArray(this.svgData.part_code)) {
            console.error("svgData или svgData.part_code не определены или не являются массивом");
            return;
        }

        const index = this.svgData.part_code.findIndex(item => item.uuid === uuid);

        if (index === -1) {
            console.warn(`Объект с uuid "${uuid}" не найден в part_code`);
            return;
        }

		//console.log (JSON.stringify(this.svgData))
        this.svgData.part_code[index] = Object.assign({}, newPartCodeObject);
		//console.log(`Объект с uuid "${uuid}" успешно обновлён`);
		//console.log (JSON.stringify(this.svgData))
    };
		
}

const svgStore = new SvgStore();
export default svgStore;
