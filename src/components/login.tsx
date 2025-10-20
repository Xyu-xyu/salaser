import { useState, FormEvent } from "react";
import { useTranslation } from 'react-i18next';
import LanguageButton from "./navbar/languageButton";
import laserStore from "../store/laserStore";


const LoginPage = () => {
	const [login, setLogin] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const { t } = useTranslation()



	// Простая проверка и имитация отправки формы
	const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		
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
 			console.log (t(`Auth success: `)+ login);
		} catch (err) {
			setError(t("Auth error. Try again."));
		} finally {
			setLoading(false);
			laserStore.setVal( 'isLogined', true)

		} 
	};

	return (
		<>
			<div className="login-page">
				<div className="login-card" style={{opacity: "1", zIndex:"1"}}>
					<div className="login-header"></div>

					<div className="login-body">
						<h1 className="login-title">Vematic</h1>

						<form onSubmit={handleSubmit}>
							<input
								type="text"
								placeholder={t("Login")}
								value={login}
								onChange={(e) => setLogin(e.target.value)}
							/>
							<input
								type="password"
								placeholder={t("Password")}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>

							{error && <div className="login-error">{error}</div>}

							<button type="submit" disabled={loading} className="mt-2 mb-4">
								{loading ? t("Enter...") : t("Sign in")}
							</button>
						</form>
						<p className="login-hint">
						</p>
					</div>
				</div>
			</div>
			<div className="position-absolute"
			style={{
				bottom:"0px",
				right:"0px",
				background: "url('/images/222082.gif",
				width: "100vw",
				height: "500vh",
				mixBlendMode: "luminosity",
				opacity: "0.2"
			}}		
			 >
			</div>
			<div className="position-absolute" style={{right:"0", top:"0"}}>
				<LanguageButton />
			</div>
		</>
	);
}


export default LoginPage