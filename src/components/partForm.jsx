import { observer } from "mobx-react-lite";
import { useTranslation } from "react-i18next";
import jobStore from "../store/jobStore";
import laserStore from "../store/laserStore";
import CustomIcon from "../icons/customIcon";

export function parsePartsFromLoadResult(loadResultStr) {
	if (!loadResultStr) return [];
	try {
		const lr = JSON.parse(loadResultStr);
		return lr?.result?.jobinfo?.parts ?? [];
	} catch {
		return [];
	}
}

export function findJobById(id) {
	if (!id) return null;
	for (const key of Object.keys(jobStore.mockCards)) {
		const found = jobStore.mockCards[key].find((j) => j.id === id);
		if (found) return found;
	}
	return null;
}

const PartForm = observer(() => {
	const { t } = useTranslation();
	const { selectedId } = jobStore;
	const job = findJobById(selectedId);
	const parts = job?.loadResult
		? parsePartsFromLoadResult(job.loadResult)
		: parsePartsFromLoadResult(laserStore.loadResult);

	return (
		<div id="PartForm">
			<div className="mt-2">
				<h5>{t("Parts")}</h5>
			</div>

			<div>
				<button type="button" className="w-100" onMouseDown={() => {}}>
					<div className="d-flex align-items-center">
						<CustomIcon
							icon="gridicons:add"
							width="24"
							height="24"
							color="black"
							fill="black"
							strokeWidth={0}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Add")}</div>
					</div>
				</button>
			</div>
			<div>
				<button type="button" className="w-100" onMouseDown={() => {}}>
					<div className="d-flex align-items-center">
						<CustomIcon
							icon="material-symbols:delete-outline-sharp"
							width="24"
							height="24"
							fill="black"
							strokeWidth={0}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Delete")}</div>
					</div>
				</button>
			</div>
			<div>
				<button type="button" className="w-100" onMouseDown={() => {}}>
					<div className="d-flex align-items-center">
						<CustomIcon
							icon="fa-regular:copy"
							width="24"
							height="24"
							viewBox="0 0 448 512"
							color="black"
							fill="black"
							strokeWidth={0}
							className="ms-1"
						/>
						<div className="flex-grow-1 text-center">{t("Copy")}</div>
					</div>
				</button>
			</div>

			<div className="mt-4">
				<h5>{t("Sort")}</h5>
			</div>

			{!parts.length ? (
				<div className="text-muted small mt-2">{t("No parts data")}</div>
			) : (
				<div className="mt-2 d-flex flex-column gap-1">
					{parts.map((p, i) => (
						<div
							key={`${p.partcode ?? i}-${i}`}
							className="d-flex justify-content-between align-items-center border rounded px-2 py-1 small"
						>
							<span className="text-truncate me-2" title={p.partcode}>
								{p.partcode}
							</span>
							<span className="text-nowrap text-muted">×{p.debit ?? 0}</span>
						</div>
					))}
				</div>
			)}
		</div>
	);
});

export default PartForm;
