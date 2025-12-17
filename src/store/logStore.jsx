import { makeAutoObservable } from "mobx";

class LogStore {
	log = []

	constructor() {
		makeAutoObservable(this);
	}

	findCurrentIndex() {
		return this.log.findIndex(entry => entry.time === this.currentTimeStamp);
	  }

	setNext() {
		const currentIndex = this.findCurrentIndex();
		if (currentIndex !== -1 && currentIndex < this.log.length - 1) {
		  let newStamp =  this.log[currentIndex + 1].time;
		  this.setCurrentTimeStamp (newStamp)
		} else {
		  //console.log('No next log entry found.');
		  showToast({
			type: 'warning',
			message: 'No next log entry found.',			
			autoClose: 5000,
			theme: 'dark',
		});
		  return null;
		}
	}
	
	setPrev() {
		const currentIndex = this.findCurrentIndex();
		if (currentIndex > 0) {
		  let newStamp =  this.log[currentIndex - 1].time;
		  this.setCurrentTimeStamp (newStamp)
		} else {
		  //console.log('No previous log entry found.');
		  showToast({
			type: 'warning',
			message: 'No previous log entry found.',			
			autoClose: 5000,
			theme: 'dark',
		});
		  return null;
		}
	}

	setCurrentTimeStamp (stamp) {
		this.currentTimeStamp = stamp
	}

	add(newNote) {
		//console.log('note added'+JSON.stringify(newNote))
		this.setCurrentTimeStamp( newNote.time ) 
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
