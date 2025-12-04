import './../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Main from './components/main.jsx'
import { observer } from "mobx-react-lite";
import macrosStore from './store/macrosStore.jsx';
import { ToastContainer } from 'react-toastify';
import SvgDefs from './components/svgDef.jsx';
import ModalGeneric from "./components/modalGeneric.jsx";
import './scripts/i18n.jsx';
import LoginPage from './components/login.jsx';
import { AnimatePresence, motion } from "framer-motion";
import laserStore from './store/laserStore.jsx';


const App = observer(() => {

	const { isLogined } = laserStore
	const handleContextMenu = (e) => {
		e.preventDefault();
	};


	return (
		<>
			<div
				id="App"
				className={"d-flex flex-column min-vh-100 " + macrosStore.theme}
				onContextMenu={handleContextMenu}
			>
				<SvgDefs />
				<ToastContainer toastStyle={{
					minWidth: '450px',
					minHeight: '150px',
					fontSize: '20px'
				}} />
				<AnimatePresence mode="wait">
					{/* LoginPage */}
					<motion.div
						key="LoginPage"
						initial={{ opacity: 0, x: 0 }}
						animate={
							!isLogined
								? { opacity: 1, x: 0, zIndex: 2, pointerEvents: "auto" }
								: { opacity: 0, x: 0, zIndex: 1, pointerEvents: "none" }
						}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						style={{
							position: "absolute",
							width: "100%",
							height: "100%",
							top: 0,
							left: 0,
						}}
					>
						<LoginPage />
					</motion.div>

					{/* Main */}
					<motion.div
						key="Main"
						initial={{ opacity: 0, x: 0 }}
						animate={
							isLogined
								? { opacity: 1, x: 0, zIndex: 2, pointerEvents: "auto" }
								: { opacity: 0, x: 0, zIndex: 1, pointerEvents: "none" }
						}
						transition={{ duration: 0.4, ease: "easeInOut" }}
						style={{
							position: "absolute",
							width: "100%",
							height: "100%",
							top: 0,
							left: 0,
						}}
					>
						<Main />
					</motion.div>
				</AnimatePresence>

				<ModalGeneric />
			</div>

		</>
	)
})

export default App

