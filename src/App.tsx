import './../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Main from './components/main'
import SidePanel from './components/sidePanel.js'
import { observer } from "mobx-react-lite";
import viewStore from './store/viewStore.js';
import IosToggle0 from './components/toggles/iosToggle0.js';
import IosToggle1 from './components/toggles/iosToggle1.js';
import IosToggle2 from './components/toggles/iosToggle2.js';
import IosToggle3 from './components/toggles/iosToggle3.tsx';
import { ToastContainer } from 'react-toastify';
import ModalGeneric from "./components/modalGeneric.js";
import './scripts/i18n.tsx'; 


const App = observer(() => {

	let { mode } = viewStore;
	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault(); 
	};

	return (
		<>
			<div
				id="App"
				className={viewStore.theme}
				onContextMenu={handleContextMenu}
			>
				<IosToggle0 />
				<IosToggle1 />
				<IosToggle2 />
				<IosToggle3 />
				<ToastContainer toastStyle={{
					minWidth: '450px',
					minHeight: '150px',
					fontSize: '20px'
				}}/> 
				{mode === 'main' ? <Main /> : <SidePanel />}
				<ModalGeneric />
			</div>

		</>
	)
})

export default App