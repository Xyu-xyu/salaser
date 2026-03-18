import { toJS } from "mobx";
import sheetLogStore from "../store/sheetLogStore.jsx";
import svgStore from "../store/svgStore.jsx";
import sheetLog from "./sheetLog.jsx";

export const addToSheetLog = async (message) => {
	const now = new Date().getTime();

	sheetLogStore.add({ time: now, action: message });

	const data = {
		id: now,
		svgData: JSON.stringify(toJS(svgStore.svgData)),
	};

	try {
		await sheetLog.save(data);
	} catch (error) {
		console.error('Error saving sheet log:', error);
	}
};
