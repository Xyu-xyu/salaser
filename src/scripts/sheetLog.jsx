import { runInAction } from "mobx";
import sheetLogStore from "../store/sheetLogStore.jsx";
import svgStore from "../store/svgStore.jsx";

function openDatabase() {
	return new Promise((resolve, reject) => {
		const request = indexedDB.open('sheeteditor', 1);

		request.onupgradeneeded = function (event) {
			const db = event.target.result;

			if (!db.objectStoreNames.contains('save')) {
				const objectStore = db.createObjectStore('save', { keyPath: 'id', autoIncrement: true });
				objectStore.createIndex('svgData', 'svgData', { unique: false });
			}
		};

		request.onsuccess = function (event) {
			resolve(event.target.result);
		};

		request.onerror = function (event) {
			reject(event.target.errorCode);
		};
	});
}

class SheetLog {
	constructor() {
		this.db = null;
	}

	async initDatabase() {
		if (!this.db) {
			this.db = await openDatabase();
		}
		return this.db;
	}

	async save(data) {
		if (!data) return;

		const db = await this.initDatabase();
		const transaction = db.transaction(['save'], 'readwrite');
		const objectStore = transaction.objectStore('save');

		return new Promise((resolve, reject) => {
			const request = objectStore.add(data);
			request.onsuccess = () => resolve(true);
			request.onerror = (event) => reject(event.target.errorCode);
		});
	}

	async load(tpoint) {
		if (!tpoint) {
			throw new Error('Invalid tpoint value');
		}

		const db = await this.initDatabase();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(['save'], 'readonly');
			const objectStore = transaction.objectStore('save');
			const getRequest = objectStore.get(Number(tpoint));

			getRequest.onsuccess = (event) => {
				const row = event.target.result;
				if (row) {
					resolve(row);
				} else {
					reject('No data found for the given ID.');
				}
			};

			getRequest.onerror = (event) => {
				reject('Error retrieving data from IndexedDB: ' + event.target.errorCode);
			};
		});
	}

	async clearBase() {
		const db = await this.initDatabase();
		return new Promise((resolve, reject) => {
			const transaction = db.transaction(['save'], 'readwrite');
			const objectStore = transaction.objectStore('save');
			const request = objectStore.clear();

			request.onsuccess = () => resolve(true);
			request.onerror = (event) => reject(event.target.errorCode);
		});
	}

	async restorePoint(tpoint = sheetLogStore.currentTimeStamp) {
		try {
			if (!tpoint) return;

			const data = await this.load(tpoint);
			if (!data?.svgData) return;

			const parsed = JSON.parse(data.svgData);
			if (!parsed) return;

			runInAction(() => {
				svgStore.svgData = parsed;
			});

			sheetLogStore.setCurrentTimeStamp(tpoint);
			sheetLogStore.makeNoteActive(tpoint);
		} catch (error) {
			console.error('Error during restore:', error);
		}
	}
}

const sheetLog = new SheetLog();
export default sheetLog;
