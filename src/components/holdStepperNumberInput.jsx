import { useCallback, useEffect, useMemo, useRef } from "react";
import { Form } from "react-bootstrap";

const clampInt = (value, min) => {
	const n = parseInt(value, 10);
	if (!Number.isFinite(n)) return min;
	return Math.max(min, n);
};

/**
 * Numeric input with + / − buttons and press-and-hold autorepeat.
 * Pointer events are used for both mouse and touch.
 */
export default function HoldStepperNumberInput(props = {}) {
	const {
		value,
		onChangeValue,
		min = 1,
		step = 1,
		title = "",
		isInvalid = false,
		style = null,
		inputStyle = null,
		disabled = false,
		buttonTitlePlus = "Increase",
		buttonTitleMinus = "Decrease",
	} = props;

	const timersRef = useRef({ timeoutId: null, intervalId: null });
	const holdingRef = useRef({ pointerId: null, el: null });

	const stop = useCallback(() => {
		const t = timersRef.current;
		if (t.timeoutId) window.clearTimeout(t.timeoutId);
		if (t.intervalId) window.clearInterval(t.intervalId);
		t.timeoutId = null;
		t.intervalId = null;
		holdingRef.current.pointerId = null;
		holdingRef.current.el = null;
	}, []);

	useEffect(() => stop, [stop]);

	useEffect(() => {
		const onUp = () => stop();
		window.addEventListener("pointerup", onUp);
		window.addEventListener("pointercancel", onUp);
		window.addEventListener("blur", onUp);
		return () => {
			window.removeEventListener("pointerup", onUp);
			window.removeEventListener("pointercancel", onUp);
			window.removeEventListener("blur", onUp);
		};
	}, [stop]);

	const stepBy = useCallback((delta) => {
		if (typeof onChangeValue !== "function") return;
		const current = clampInt(value, min);
		const next = Math.max(min, current + (parseInt(delta, 10) || 0));
		onChangeValue(String(next));
	}, [min, onChangeValue, value]);

	const startHold = useCallback((e, delta) => {
		if (disabled) return;
		e.preventDefault();
		e.stopPropagation();
		stop();
		holdingRef.current.pointerId = e.pointerId;
		holdingRef.current.el = e.currentTarget;

		// capture keeps receiving events even if pointer leaves the button
		try {
			e.currentTarget.setPointerCapture?.(e.pointerId);
		} catch {
			// ignore
		}

		stepBy(delta);
		timersRef.current.timeoutId = window.setTimeout(() => {
			timersRef.current.intervalId = window.setInterval(() => stepBy(delta), 60);
		}, 350);
	}, [disabled, stepBy, stop]);

	const stopHold = useCallback((e) => {
		if (holdingRef.current.pointerId == null) return;
		e?.preventDefault?.();
		stop();
	}, [stop]);

	const stopHoldIfPointerOutside = useCallback((e) => {
		if (holdingRef.current.pointerId == null) return;
		const el = holdingRef.current.el;
		if (!el) return;
		const rect = el.getBoundingClientRect?.();
		if (!rect) return;
		const x = e?.clientX;
		const y = e?.clientY;
		if (!Number.isFinite(x) || !Number.isFinite(y)) return;
		const inside =
			x >= rect.left &&
			x <= rect.right &&
			y >= rect.top &&
			y <= rect.bottom;
		if (!inside) stop();
	}, [stop]);

	const containerStyle = useMemo(() => ({
		maxWidth: "88px",
		position: "relative",
		flex: "0 0 88px",
		...(style || {}),
	}), [style]);

	return (
		<div style={containerStyle}>
			<Form.Control
				style={{
					paddingRight: "2.15rem",
					boxSizing: "border-box",
					height: "48px",
					...(inputStyle || {}),
				}}
				type="number"
				min={min}
				step={step}
				title={title}
				value={value}
				disabled={disabled}
				isInvalid={isInvalid}
				onChange={(e) => onChangeValue?.(e.target.value)}
				onBlur={() => {
					onChangeValue?.(String(clampInt(value, min)));
				}}
			/>

			<div
				style={{
					position: "absolute",
					right: 4,
					top: 2,
					bottom: 2,
					width: 26,
					display: "flex",
					flexDirection: "column",
					gap: 4,
					zIndex: 2,
				}}
			>
				<button
					type="button"
					className="btn btn-outline-secondary p-0"
					title={buttonTitlePlus}
					disabled={disabled}
					style={{
						flex: 1,
						minHeight: 0,
						lineHeight: 1,
						fontSize: 14,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						touchAction: "none",
						userSelect: "none",
					}}
					onPointerDown={(e) => startHold(e, +step)}
					onPointerUp={stopHold}
					onPointerLeave={stopHold}
					onPointerCancel={stopHold}
					onPointerMove={stopHoldIfPointerOutside}
					onLostPointerCapture={stopHold}
				>
					+
				</button>
				<button
					type="button"
					className="btn btn-outline-secondary p-0"
					title={buttonTitleMinus}
					disabled={disabled}
					style={{
						flex: 1,
						minHeight: 0,
						lineHeight: 1,
						fontSize: 14,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						touchAction: "none",
						userSelect: "none",
					}}
					onPointerDown={(e) => startHold(e, -step)}
					onPointerUp={stopHold}
					onPointerLeave={stopHold}
					onPointerCancel={stopHold}
					onPointerMove={stopHoldIfPointerOutside}
					onLostPointerCapture={stopHold}
				>
					−
				</button>
			</div>
		</div>
	);
}

