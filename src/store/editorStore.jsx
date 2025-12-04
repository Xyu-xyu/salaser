// store/editorStore.ts
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
    this.mode = newMode;
  };

  setInletMode = (newMode )=> {
    this.inletMode = newMode;
  };
}

// Singleton instance (most common pattern)
const editorStore = new EditorStore();
export default editorStore;
