import { makeAutoObservable } from "mobx";

class LogStore {
	log = []

	constructor() {
		makeAutoObservable(this);
	}

	add(newNote) {
		console.log('note added')
		this.log.push(newNote);
		this.log.forEach((element, index, arr) => {
			if (index + 1 === arr.length) {
				element.active = true
			} else {
				element.active = false
			}
		});
	}

	makeNoteActive(tpoint) {
		this.log.forEach((element, index, arr) => {
			if (tpoint === element.time) {
				element.active = true
			} else {
				element.active = false
			}
		});
	}
}

const logStore = new LogStore();
export default logStore; 
