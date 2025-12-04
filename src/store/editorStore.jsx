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
  newSheet = {
      name: "undefined.ncp",
			width: 600,
			height: 500,
			quantity: 1,
			presetId: 0,
			presetName: "any_preset"
  }

  constructor() {
    makeAutoObservable(this);
  }

  setMode = (newMode )=> {
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
