// store/editorStore.ts
import { makeAutoObservable } from "mobx";

type EditorMode =
  | "resize"
  | "drag"
  | "dragging"
  | "addPoint"
  | "selectPoint"
  | "text"
  | "addJoint"
  | "removeJoint";

type InletMode = "" | "inletInMoving" | string; // extend as needed

class EditorStore {
  mode: EditorMode = "resize";
  inletMode: InletMode = "";

  constructor() {
    makeAutoObservable(this);
  }

  setMode = (newMode: EditorMode): void => {
    this.mode = newMode;
  };

  setInletMode = (newMode: InletMode): void => {
    this.inletMode = newMode;
  };
}

// Singleton instance (most common pattern)
const editorStore = new EditorStore();
export default editorStore;
