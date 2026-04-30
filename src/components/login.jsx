import { useState } from "react";
import { useTranslation } from 'react-i18next';
import LanguageButton from "./navbar/languageButton";
import laserStore from "../store/laserStore";
import LaserBackground from "./LaserBackground";


const LoginPage = () => {
	const [login, setLogin] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);
	const { t } = useTranslation()

	const handleSubmit = async (e) => {
		laserStore.setVal( 'isLogined', true)
		e.preventDefault();
		setError("");

		if (!login.trim() || !password) {
			setError(t("Please fill all fields."));
			return;
		}

		setLoading(true);
		try {
			await new Promise((r) => setTimeout(r, 700));
			console.log(t(`Auth success: `) + login);
		} catch (err) {
			setError(t("Auth error. Try again."));
		} finally {
			setLoading(false);
			laserStore.setVal( 'isLogined', true)
		}
	};

	return (
		<>
			<LaserBackground />
			<div className="login-page" data-testid="login-page">
				<div className="login-card">
					<div className="login-header" />

					<div className="login-body">
						<h1 className="login-title">Vematic</h1>

						<form onSubmit={handleSubmit}>
							<input
								type="text"
								data-testid="login-username"
								placeholder={t("Login")}
								value={login}
								onChange={(e) => setLogin(e.target.value)}
							/>
							<input
								type="password"
								data-testid="login-password"
								placeholder={t("Password")}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>

							{error && <div className="login-error">{error}</div>}

							<button
								type="submit"
								disabled={loading}
								className="mt-2 mb-4"
								data-testid="login-submit"
							>
								{loading ? t("Enter...") : t("Sign in")}
							</button>
						</form>
						<p className="login-hint" />
					</div>
				</div>
			</div>
			<div id="LoginButton" className="position-absolute" style={{right:"0", top:"0", zIndex: 2}}>
				<LanguageButton color={"rgba(255, 255, 255, 0.5)"}/>
			</div>
		</>
	);
}

export default LoginPage
