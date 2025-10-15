import { useState, FormEvent } from "react";


const LoginPage = () => {
	const [login, setLogin] = useState<string>("");
	const [password, setPassword] = useState<string>("");
	const [error, setError] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);


	// Простая проверка и имитация отправки формы
	const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
		e.preventDefault();
		setError("");

		if (!login.trim() || !password) {
			setError("Пожалуйста, заполните все поля.");
			return;
		}

		setLoading(true);
		try {
			// Здесь можно вызвать API для авторизации.
			// В демо-версии просто ждем 700мс и сбрасываем состояние.
			await new Promise((r) => setTimeout(r, 700));
			// TODO: заменить на реальную логику авторизации
			alert(`Успешная авторизация: ${login}`);
		} catch (err) {
			setError("Ошибка авторизации. Попробуйте снова.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<div className="login-page">
				<div className="login-card" style={{opacity: "1", zIndex:"1"}}>
					<div className="login-header"></div>

					<div className="login-body">
						<h1 className="login-title">SGNmotion</h1>

						<form onSubmit={handleSubmit}>
							<input
								type="text"
								placeholder="Login"
								value={login}
								onChange={(e) => setLogin(e.target.value)}
							/>
							<input
								type="password"
								placeholder="Password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>

							{error && <div className="login-error">{error}</div>}

							<button type="submit" disabled={loading} className="mt-2 mb-4">
								{loading ? "Вход..." : "Sign in"}
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
				background: "url('/src/assets/images/222082.gif",
				width: "100vw",
				height: "500vh",
				mixBlendMode: "luminosity",
				opacity: "0.2"
			}}		
			 >
			</div>
		</>
	);
}


export default LoginPage