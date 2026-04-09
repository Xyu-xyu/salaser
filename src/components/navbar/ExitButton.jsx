import { useState } from "react";
import { Modal, Button } from "react-bootstrap";
import CustomIcon from "../../icons/customIcon";
import { observer } from 'mobx-react-lite';
import laserStore from "../../store/laserStore";
import { useTranslation } from 'react-i18next';
import partStore from "../../store/partStore";
import svgStore from "../../store/svgStore";
import jointStore from "../../store/jointStore";
import { showToast } from "../toast";

const ExitButton = observer(() => {

	const [show, setShow] = useState(false);
	const { t } = useTranslation()
	const { svgData, partInEdit, savePartToDbOnExit, partEditorExitMode } = partStore

	const showModal = () => {
		setShow(true);
	};

	const goToPartsLibraryView = () => {
		laserStore.setVal("rightMode", "part");
		laserStore.setVal("leftMode", "part");
		laserStore.setVal("centralBarMode", "plans");
	};

	const collectEditedPart = () => {
		let box = svgStore.findBox(svgData.code);
		const currentPart = jointStore.exportForCurrentPart();
		currentPart.width = box.width;
		currentPart.height = box.height;
		currentPart.x = box.x;
		currentPart.y = box.y;

		partStore.setSvgData(currentPart);

		return {
			...currentPart,
		};
	};

	const handleClose = () => {
		setShow(false)
		const mode = partStore.partEditorExitMode;
		const dbUuid = partStore.editingDbPartUuid;
		if (mode === "sheet") {
			laserStore.setVal("centralBarMode", "planEditor");
			partStore.setToDefault();
			return;
		}
		goToPartsLibraryView();
		if (mode === "db_new") {
			partStore.setToDefault();
			partStore.selectPart("");
			return;
		}
		if (mode === "db_existing") {
			const u = String(dbUuid ?? "").trim();
			partStore.setToDefault();
			if (u) partStore.selectPart(u);
			return;
		}
		partStore.setToDefault();
	};

	const handleSubmit = async () => {
		setShow(false);

		const updatedPart = collectEditedPart();

		try {
			const savedUuid = String(updatedPart?.uuid ?? partStore.partInEdit ?? "");
			if (savePartToDbOnExit) {
				await partStore.savePartToDatabase(updatedPart);
				showToast({
					type: "success",
					message: t("Part saved to database"),
				});
				goToPartsLibraryView();
				partStore.setToDefault();
				if (savedUuid) partStore.selectPart(savedUuid);
			} else {
				svgStore.updateForm(partInEdit, updatedPart);
				laserStore.setVal("centralBarMode", "planEditor");
				partStore.setToDefault();
			}
		} catch (e) {
			console.error(e);
			showToast({
				type: "error",
				message: t("Part save failed"),
			});
		}
	};

	const handleDbExistingUpdate = async () => {
		setShow(false);
		const catalogUuid = String(partStore.editingDbPartUuid ?? "").trim();
		const updatedPart = collectEditedPart();
		updatedPart.uuid = catalogUuid;
		updatedPart.params = typeof updatedPart.params === "object" && updatedPart.params
			? { ...updatedPart.params, uuid: catalogUuid }
			: { uuid: catalogUuid, id: "", pcode: "" };
		try {
			await partStore.updatePartOnServer(updatedPart);
			showToast({ type: "success", message: t("Part updated in database") });
			goToPartsLibraryView();
			partStore.setToDefault();
			if (catalogUuid) partStore.selectPart(catalogUuid);
		} catch (e) {
			console.error(e);
			showToast({
				type: "error",
				message: t("Part save failed"),
				theme: "dark",
			});
		}
	};

	const handleDbExistingSaveCopy = async () => {
		setShow(false);
		const newUuid =
			typeof crypto !== "undefined" && crypto.randomUUID
				? crypto.randomUUID()
				: `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
		const updatedPart = collectEditedPart();
		const copy = {
			...updatedPart,
			uuid: newUuid,
			params:
				typeof updatedPart.params === "object" && updatedPart.params
					? { ...updatedPart.params, uuid: newUuid }
					: { uuid: newUuid, id: "", pcode: "" },
		};
		try {
			await partStore.savePartToDatabase(copy);
			showToast({ type: "success", message: t("Part saved as copy") });
			goToPartsLibraryView();
			partStore.setToDefault();
			partStore.selectPart(newUuid);
		} catch (e) {
			console.error(e);
			showToast({
				type: "error",
				message: t("Part save failed"),
			});
		}
	};

	const handleDbExistingCancel = () => {
		setShow(false);
		const u = String(partStore.editingDbPartUuid ?? "").trim();
		goToPartsLibraryView();
		partStore.setToDefault();
		if (u) partStore.selectPart(u);
	};

	const isExistingDbPart = partEditorExitMode === "db_existing";

	const modalProps = {
		modalBody: isExistingDbPart
			? "Part editor persist or cancel"
			: "Do you want to save changes ?",
		confirmText: "Save and exit",
		cancelText: "Exit",
	};


	return (

		<div className="ms-2" >
			<div className="ms-2 position-absolute"
				style={{ top: "10px", left: "0px" }}
			>
				<button	className={`navbar_button me-1 violet_button`} onClick={showModal}>
					<div className="d-flex align-items-center justify-content-center">
						<CustomIcon icon="material-symbols:close-rounded"
							width="36"
							height="36"
							fill='white'
							strokeWidth={0}
						/>
					</div>
				</button>
			</div>
			<Modal
				size="xl"
				centered
				onHide={handleClose}
				className="with-inner-backdrop"
				show={show}
			>
				<Modal.Header closeButton>
					<Modal.Title>
					</Modal.Title>
				</Modal.Header>
				<Modal.Body className="position-relative">
					<div className='modulatiomNacroName text-center'>
						<>
						{t(modalProps.modalBody)}
						</>
					</div>
				</Modal.Body>
				<Modal.Footer className="position-relative">
					{isExistingDbPart ? (
						<>
							<Button
								variant="primary"
								onClick={handleDbExistingCancel}
								size="lg"
								className="ms-2 m-2 py-3 px-5"
							>
								{t("Exit without saving")}
							</Button>
							<Button
								variant="primary"
								onClick={handleDbExistingSaveCopy}
								size="lg"
								className="ms-2 m-2 py-3 px-5"
							>
								{t("Save as copy")}
							</Button>
							<Button
								variant="secondary"
								onClick={handleDbExistingUpdate}
								size="lg"
								className="violet_button m-2 py-3 px-5"
							>
								{t("Save")}
							</Button>
						</>
					) : (
						<>
							<Button
								variant="primary"
								onClick={()=>{ setShow(false)}}
								size="lg"
								className='ms-2 m-2 py-3 px-5'
							>
								{t("Cancel")}
							</Button>

							<Button
								variant="primary"
								onClick={handleSubmit}
								size="lg"
								className='ms-2 m-2 py-3 px-5'
							>
								{t(modalProps.confirmText)}
							</Button>

							<Button
								variant="secondary"
								onClick={handleClose}
								size="lg"
								className='violet_button m-2 py-3 px-5'
							>
								{t(modalProps.cancelText)}
							</Button>
						</>
					)}
				</Modal.Footer>
			</Modal>
		</div>

	)
});

export default ExitButton;
