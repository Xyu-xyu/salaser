import logStore from "../store/logStore";
import jointStore from "../store/jointStore";
import partStore from "../store/partStore";


function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('parteditor', 1);

        request.onupgradeneeded = function (event) {
            const db = event.target.result;

            if (!db.objectStoreNames.contains('save')) {
                const objectStore = db.createObjectStore('save', { keyPath: 'id', autoIncrement: true });
                objectStore.createIndex('part', 'part', { unique: false });
                objectStore.createIndex('svg', 'svg', { unique: false });
                objectStore.createIndex('joints', 'joints', { unique: false });
                console.log('Created "save" object store in IndexedDB.');
            }
        };

        request.onsuccess = function (event) {
            console.log('Connected to the IndexedDB database.');
            resolve(event.target.result);
        };

        request.onerror = function (event) {
            console.error('Error connecting to IndexedDB:', event.target.errorCode);
            reject(event.target.errorCode);
        };
    });
}

class Log {
    constructor() {
        this.colors = {
            action: 'light',
            error: 'danger',
            info: 'primary',
            warning: 'warning'
        };
        this.db = null;   
    }

    async initDatabase() {
        this.db = await openDatabase();
    }

    // Сохранение данных в IndexedDB
    async save(data) {
        if (!this.db) {
            console.error('Database not initialized');
            return;
        } 

        console.log (data)
        if (!data) {
            console.error('Data is invalid');
            return;
        }

        const transaction = this.db.transaction(['save'], 'readwrite');
        const objectStore = transaction.objectStore('save');

        const request = objectStore.add(data);

        request.onsuccess = () => {
            console.log('Data saved to IndexedDB!');
        };

        request.onerror = (event) => {
            console.error('Error saving data to IndexedDB:', event.target.errorCode);
        };
    }

    async load(tpoint) {
        return new Promise((resolve, reject) => {
            if (!tpoint) {
                reject('Invalid tpoint value');
                return;
            }    
            // Открываем базу данных "parteditor"
            const request = indexedDB.open('parteditor', 1);
    
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['save'], 'readonly'); // Транзакция только для чтения
                const objectStore = transaction.objectStore('save');
    
                // Создаем запрос для получения данных по id
                const getRequest = objectStore.get(Number(tpoint)); // Преобразуем tpoint в число
    
                // Обработка успешного запроса
                getRequest.onsuccess = (event) => {
                    const row = event.target.result; // Получаем результат
                    if (row) {
                        resolve(row); // Разрешаем промис с результатом
                    } else {
                        reject('No data found for the given ID.');
                    }
                };
    
                getRequest.onerror = (event) => {
                    reject('Error retrieving data from IndexedDB: ' + event.target.errorCode);
                };
            };
    
            request.onerror = (event) => {
                reject('Error opening IndexedDB: ' + event.target.errorCode);
            };
        });
    }
    
    // Очистка базы данных
    clearBase() {
        if (!this.db) {
            console.error('Database not initialized');
            return;
        }

        const transaction = this.db.transaction(['save'], 'readwrite');
        const objectStore = transaction.objectStore('save');

        const request = objectStore.clear();

        request.onsuccess = () => {
            console.log('Database cleared.');
        };

        request.onerror = (event) => {
            console.error('Error clearing database:', event.target.errorCode);
        };
    }

    // Автосохранение (через интервал)
    autoSave(data) {
        setInterval(() => {
            console.log('Autosaving...');
            this.save(data);
        }, 30000); // Сохранение каждые 30 секунд
    }

    async restorePoint () {
		try {			
			//console.log('Restore from', tpoint);
			let tpoint = logStore.currentTimeStamp
			if (!tpoint) return
			const data = await log.load(tpoint);	
 			//console.log('Loaded data:', data);
			if (!data) return
			let parsed = JSON.parse(data.svg)
			let joints = JSON.parse(data.joints)
			if (parsed ) {
				const newSvgData = {
					width: parsed.width,
					height: parsed.height,
					code: parsed.code,
					params: parsed.params,
				  };
				partStore.setSvgData(newSvgData)
				jointStore.setData(joints)
			}		
			logStore.makeNoteActive(tpoint)	
			
		} catch (error) {
			console.error('Error during restore:', error);
		}
	}
}

const log = new Log();
export default log;
