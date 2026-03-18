import { makeAutoObservable } from "mobx";
import { showToast } from "../components/toast.jsx";

class SheetLogStore {
	log = [];
	currentTimeStamp = null;

	constructor() {
		makeAutoObservable(this);
	}

	findCurrentIndex() {
		return this.log.findIndex(entry => entry.time === this.currentTimeStamp);
	}

	setNext() {
		const currentIndex = this.findCurrentIndex();
		if (currentIndex !== -1 && currentIndex < this.log.length - 1) {
			const newStamp = this.log[currentIndex + 1].time;
			this.setCurrentTimeStamp(newStamp);
			return;
		}

		showToast({
			type: 'warning',
			message: 'No next log entry found.',
			autoClose: 5000,
			theme: 'dark',
		});
	}

	setPrev() {
		const currentIndex = this.findCurrentIndex();
		if (currentIndex > 0) {
			const newStamp = this.log[currentIndex - 1].time;
			this.setCurrentTimeStamp(newStamp);
			return;
		}

		showToast({
			type: 'warning',
			message: 'No previous log entry found.',
			autoClose: 5000,
			theme: 'dark',
		});
	}

	setCurrentTimeStamp(stamp) {
		this.currentTimeStamp = stamp;
	}

	add(newNote) {
		this.setCurrentTimeStamp(newNote.time);
		this.log.push(newNote);
		this.makeNoteActive(newNote.time);
	}

	makeNoteActive(tpoint) {
		this.log.forEach((element) => {
			element.active = tpoint === element.time;
		});
	}

	reset() {
		this.log = [];
		this.currentTimeStamp = null;
	}
}

const sheetLogStore = new SheetLogStore();
export default sheetLogStore;
