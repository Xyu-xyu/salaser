import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import { Form, Modal } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import constants from "../../store/constants.jsx";
import CustomIcon from "../../icons/customIcon";

function isValidIpv4(ip) {
	if (!ip) return false;
	const trimmed = String(ip).trim();
	const m = trimmed.match(/^(\d{1,3})(?:\.(\d{1,3})){3}$/);
	if (!m) return false;
	return trimmed.split(".").every((part) => {
		if (part.length > 1 && part.startsWith("0")) return false;
		const n = Number(part);
		return Number.isInteger(n) && n >= 0 && n <= 255;
	});
}

function normalizeLaserIpFromExternalApi(externalApi) {
	if (!externalApi) return "";
	const raw = String(externalApi).trim();
	if (!raw) return "";
	try {
		return new URL(raw).hostname || "";
	} catch {
		return raw.replace(/^https?:\/\//, "").replace(/\/.*$/, "");
	}
}

function formatIpInput(value, prevValue = "") {
	// Allows typing dots manually (e.g. "11.") and also auto-adds a dot
	// after a 3-digit octet ("192.") while keeping max 4 octets.
	const raw = String(value ?? "");
	const prevRaw = String(prevValue ?? "");
	const isDeleting = raw.length < prevRaw.length;
	const cleaned = raw.replace(/[^\d.]/g, "");
	const endsWithDot = cleaned.endsWith(".");
	const lastChar = cleaned.slice(-1);

	const split = cleaned.split(".");
	const parts = [];

	for (let i = 0; i < split.length; i++) {
		const chunk = split[i];
		if (!chunk) continue;
		parts.push(chunk.replace(/\D/g, "").slice(0, 3));
		if (parts.length >= 4) break;
	}

	let out = parts.join(".");

	// keep explicit trailing dot (user typed it)
	if (endsWithDot && parts.length > 0 && parts.length < 4) out += ".";

	// auto-add dot after 3 digits in the current octet (when user types digits)
	if (!isDeleting && !endsWithDot && lastChar >= "0" && lastChar <= "9" && parts.length > 0 && parts.length < 4) {
		const lastPart = parts[parts.length - 1] ?? "";
		if (lastPart.length === 3) out += ".";
	}

	// prevent leading dot
	out = out.replace(/^\.+/, "");
	// prevent double dots
	out = out.replace(/\.{2,}/g, ".");
	// trim to max length
	return out.slice(0, 15);
}

async function safeJson(resp) {
	try {
		return await resp.json();
	} catch {
		return null;
	}
}

const ConnectionButton = observer(() => {
	const { t } = useTranslation();
	const apiHost = constants.SERVER_URL;

	const [show, setShow] = useState(false);
	const [loading, setLoading] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState("");

	const [ip, setIp] = useState("");
	const [ipInput, setIpInput] = useState("");
	const [connection, setConnection] = useState(null); // null | boolean
	const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

	const canSave = useMemo(() => isValidIpv4(ipInput) && ipInput !== ip && !saving, [ip, ipInput, saving]);

	const handleClose = () => setShow(false);
	const showModal = () => setShow(true);

	async function refresh() {
		if (!apiHost) {
			setError(t("Server URL is not configured"));
			return;
		}

		setError("");
		setLoading(true);
		try {
			const ipResp = await fetch(`${apiHost}/api/laserIp/get`, { method: "GET" });
			const ipData = ipResp.ok ? await safeJson(ipResp) : null;
			const resolvedIp = normalizeLaserIpFromExternalApi(ipData?.external_api);

			setIp(resolvedIp);
			setIpInput(resolvedIp || "");

			const connResp = await fetch(`${apiHost}/api/laserIp/connection`, { method: "GET" });
			const connData = connResp.ok ? await safeJson(connResp) : null;
			setConnection(typeof connData?.laser_connected === "boolean" ? connData.laser_connected : null);

			setLastUpdatedAt(Date.now());
		} catch (e) {
			console.error(e);
			setError(t("Network error or server is down"));
		} finally {
			setLoading(false);
		}
	}

	async function saveIp() {
		const nextIp = String(ipInput).trim();
		if (!isValidIpv4(nextIp)) {
			setError(t("Invalid IP address"));
			return;
		}
		if (!apiHost) {
			setError(t("Server URL is not configured"));
			return;
		}

		setError("");
		setSaving(true);
		try {
			const resp = await fetch(`${apiHost}/api/laserIp/set?ip=${encodeURIComponent(nextIp)}`, { method: "GET" });
			if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
			setIp(nextIp);
			await refresh();
		} catch (e) {
			console.error(e);
			setError(t("Update error"));
		} finally {
			setSaving(false);
		}
	}

	useEffect(() => {
		if (show) refresh();
	}, [show]);

	const connectionLabel = useMemo(() => {
		if (connection === null || connection === undefined) return t("Unknown");
		if (connection === true) return t("Connected");
		if (connection === false) return t("Disconnected");
		return t("Unknown");
	}, [connection, t]);

	const connectionColor = useMemo(() => {
		if (connection === true) return "#22c55e";
		if (connection === false) return "#ef4444";
		return "#6b7280";
	}, [connection]);

	return (
		<div className="ms-2" id="ConnectionButton">
			<button className={`navbar_button me-1 ${show ? "violet_button" : "white_button"}`} onClick={showModal}>
				<div className="d-flex align-items-center justify-content-center">
					<CustomIcon
						icon="connect"
						width="36"
						height="36"
						style={{ color: show ? "white" : "black" }}
						viewBox="0 0 24 24"
						strokeWidth={1.5}
					/>
				</div>
			</button>

			<Modal
				show={show}
				onHide={handleClose}
				id="connectionButtonModal"
				className="with-inner-backdrop powerButton-navbar-modal favoritesButton-navbar-modal"
				centered={false}
			>
				<div style={{ padding: "1.5rem" }}>
					<div style={{ minWidth: "calc(100vw * 0.25)", overflowX: "hidden" }}>
						<div className="d-flex align-items-center justify-content-between mb-2">
							<div className="d-flex align-items-center" style={{ gap: ".5rem" }}>
								<h4 className="ms-2 text-xs font-bold text-gray-500 uppercase mb-2">
									{t("Connection")}
								</h4>
							</div>
							<div className="d-flex" style={{ gap: ".5rem" }}>	
								<button className="white_button navbar_button m-1"
									onClick={refresh}
									disabled={loading || saving}
									title={t("Refresh")}
								>
									<div className="d-flex align-items-center justify-content-center">
										<CustomIcon 
											icon="refresh" 
											width="36" 
											height="36" 
											viewBox="0 0 24 24" 
											strokeWidth={1.5}
										/>
									</div>
								</button>				
							</div>
						</div>

						<div className="mb-2">
							<div className="d-flex align-items-center justify-content-between">
								<div className="text-muted">{t("Connection status")}</div>
								<div style={{ color: connectionColor, fontWeight: 600 }}>{connectionLabel}</div>
							</div>
							{lastUpdatedAt ? (
								<div className="text-muted" style={{ fontSize: "0.85rem" }}>
									{t("Updated")}: {new Date(lastUpdatedAt).toLocaleTimeString()}
								</div>
							) : null}
						</div>

						<div className="mb-2">
							<div className="text-muted mb-1">{t("Laser IP")}:</div>
							<div className="d-flex align-items-stretch" style={{ gap: 0 }}>
								<Form.Control
									value={ipInput}
									onChange={(e) => setIpInput(formatIpInput(e.target.value, ipInput))}
									placeholder="0.0.0.0"
									disabled={loading || saving}
									style={{
										height: "50px",
										textAlign: "center",
										borderTopRightRadius: 0,
										borderBottomRightRadius: 0,
									}}
								/>
								<button
									className={`navbar_button ${canSave ? "violet_button" : "white_button"}`}
									onClick={saveIp}
									disabled={!canSave}
									title={t("Save")}
									style={{
										height: "50px",
										width: "56px",
										minWidth: "56px",
										borderTopLeftRadius: 0,
										borderBottomLeftRadius: 0,
									}}
								>
									<div className="d-flex align-items-center justify-content-center">
										<CustomIcon
											icon="submit"
											width="30"
											height="40"
											viewBox="0 0 15 16"
											stroke={canSave ? "white" : "black"}
											strokeWidth={1.5}
										/>
									</div>
								</button>
							</div>
							{ip && ipInput !== ip ? (
								<div className="text-muted" style={{ fontSize: "0.85rem", marginTop: ".25rem" }}>
									{t("Current")}: <span style={{ fontFamily: "monospace" }}>{ip}</span>
								</div>
							) : null}
							{ipInput && !isValidIpv4(ipInput) ? (
								<div style={{ color: "#ef4444", fontSize: "0.85rem", marginTop: ".25rem" }}>{t("Invalid IP address")}</div>
							) : null}
						</div>

						{error ? (
							<div style={{ color: "#ef4444", fontSize: "0.9rem" }}>{error}</div>
						) : loading ? (
							<div className="text-muted">{t("Loading")}…</div>
						) : null}
					</div>
				</div>
			</Modal>
		</div>
	);
});

export default ConnectionButton;
