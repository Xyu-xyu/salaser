import { useMemo } from 'react';
import ProgressBar from 'react-bootstrap/ProgressBar';
import { observer } from "mobx-react-lite";
import jobStore from "../store/jobStore";
import laserStore from "../store/laserStore";

const countListingLines = (text) => (
	String(text ?? "").trim().split(/\n+/).filter(Boolean).length
);

const safeJsonParse = (value) => {
	if (!value || typeof value !== "string") return null;
	try {
		return JSON.parse(value);
	} catch {
		return null;
	}
};

const formatDateDDMM = (value) => {
	if (!value) return "";
	const d = new Date(value);
	if (Number.isNaN(d.getTime())) return "";
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	return `${dd}.${mm}`;
};

const formatDuration = (secondsValue) => {
	const total = Math.max(0, Math.round(Number(secondsValue) || 0));
	const h = Math.floor(total / 3600);
	const m = Math.floor((total % 3600) / 60);
	const s = total % 60;
	if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
};

const ProgressBarContainer = observer(() => {
	const { currentCuttingJobId } = jobStore;
	const { loadResult, cutSeg, listing } = laserStore;

	const parsedLoadResult = useMemo(() => safeJsonParse(loadResult), [loadResult]);
	const loadResultData = parsedLoadResult?.result ?? parsedLoadResult ?? null;
	const jobInfo = loadResultData?.jobinfo ?? null;
	const attr = jobInfo?.attr ?? null;

	const job = useMemo(() => (
		currentCuttingJobId ? jobStore.getJobById(currentCuttingJobId) : null
	), [currentCuttingJobId]);

	const totalLines = useMemo(() => {
		const n = countListingLines(listing);
		return n > 0 ? n : 0;
	}, [listing]);

	const progress = useMemo(() => {
		const raw = Math.max(0, Number(cutSeg) || 0);
		const executed = totalLines ? Math.min(raw, totalLines) : 0;
		if (!totalLines) return 0;
		const pct = (executed / totalLines) * 100;
		return Math.max(0, Math.min(100, pct));
	}, [cutSeg, totalLines]);

	const hasWork = Boolean(currentCuttingJobId && jobInfo?.load_result);

	const title = useMemo(() => {
		if (!hasWork) return "Статус: ожидание работы";

		const date = formatDateDDMM(job?.created_at) || formatDateDDMM(job?.updated_at) || "";
		const jobCode = (job?.name || attr?.jobcode || "").toString().trim();

		const thicknessRaw = (job?.thickness ?? attr?.thickness);
		const thickness = thicknessRaw != null && `${thicknessRaw}`.trim() !== "" ? `${thicknessRaw}`.trim() : "";
		const material = (attr?.label || job?.materialLabel || job?.material || "").toString().replaceAll("_", " ").trim();
		const percentText = `${Math.round(progress)}%`;
		const duration = formatDuration(jobInfo?.estimation_s);

		// Пример: "Current work 06.08 1,5мм-01 2 mm Steel {0}%" + время
		const parts = [
			"Current work",
			date,
			jobCode,
			[thickness ? `${thickness} mm` : "", material].filter(Boolean).join(" ").trim(),
			percentText,
			duration ? `(${duration})` : "",
		].filter(Boolean);

		return parts.join(" ").replace(/\s+/g, " ").trim();
	}, [hasWork, job?.created_at, job?.updated_at, job?.name, job?.thickness, job?.materialLabel, job?.material, attr?.jobcode, attr?.thickness, attr?.label, jobInfo?.estimation_s, progress]);

	return (
		<div id="ProgressBarContainer" className="w-100" style={{ position: 'relative' }}>
			<ProgressBar
				striped
				variant="info"
				now={progress}
				className="m-2"
				style={{ height: '58px' }}
			/>
			<div style={{
				position: 'absolute',
				top: '37px',
				left: '50%',
				transform: 'translate(-50%, -50%)',
				color: 'black', // или другой цвет для лучшей видимости
 				width: '100%',
				textAlign: 'center',
				pointerEvents: 'none' // чтобы клики проходили сквозь текст
			}}>
				{title}
			</div>
		</div>
	);
});

export default ProgressBarContainer;
