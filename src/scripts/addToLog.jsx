import logStore  from "./../store/logStore.jsx"; // Импорт logStore
import partStore  from "./../store/partStore.jsx"; // Импорт svgStore
import jointStore  from "./../store/jointStore.jsx"; // Импорт svgStore

import log from './log.jsx'

export const addToLog = (message) => {
    let now = new Date().getTime();
    logStore.add({ time: now, action: message });
    let data = {
        id: now,
        svg: JSON.stringify(partStore.svgData),
        joints: JSON.stringify(jointStore.joints),
    };
    log.save(data);
};