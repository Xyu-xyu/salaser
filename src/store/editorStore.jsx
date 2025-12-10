import { makeAutoObservable } from "mobx";

/* type EditorMode =
  | "resize"
  | "drag"
  | "dragging"
  | "addPoint"
  | "selectPoint"
  | "text"
  | "addJoint"
  | "removeJoint"; */

/* type InletMode = "" | "inletInMoving" | string; // extend as needed */

class EditorStore {
  mode = "resize";
  inletMode = "";

  constructor() {
    makeAutoObservable(this);
  }

  setMode = (newMode )=> {
    console.log ("WE SET NEW MODE :" + newMode)
    this.mode = newMode;
  };

  setInletMode = (newMode )=> {
    this.inletMode = newMode;
  };

  setVal (key, value) {
    console.log ("Set VAL in EDITOR store" + value)
		if (key in this) {
			this[key] = value;
		}
	}
}

// Singleton instance (most common pattern)
const editorStore = new EditorStore();
export default editorStore;
