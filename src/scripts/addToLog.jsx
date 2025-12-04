import logStore  from "./log.jsx"; // Импорт logStore
import svgStore  from "./../store/svgStore.jsx"; // Импорт svgStore
import jointStore  from "./../store/jointStore.jsx"; // Импорт svgStore

import log from './log'

export const addToLog = (message) => {
    let now = new Date().getTime();
    logStore.add({ time: now, action: message });
    let data = {
        id: now,
        svg: JSON.stringify(svgStore.svgData),
        joints: JSON.stringify(jointStore.joints),
    };
    log.save(data);
};