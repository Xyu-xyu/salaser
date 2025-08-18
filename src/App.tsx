import './../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Main from './components/main.js'
import { observer } from "mobx-react-lite";
import viewStore from './store/viewStore.js';
/* import IosToggle0 from './components/toggles/iosToggle0.js';
import IosToggle1 from './components/toggles/iosToggle1.js';
import IosToggle2 from './components/toggles/iosToggle2.js';
import IosToggle3 from './components/toggles/iosToggle3.tsx'; */
import { ToastContainer } from 'react-toastify';
import SvgDefs from './components/svgDef.tsx';
import ModalGeneric from "./components/modalGeneric.js";
import './scripts/i18n.tsx'; 


const App = observer(() => {

 	const handleContextMenu = (e: React.MouseEvent) => {
		e.preventDefault(); 
	};

	return (
		<>
			<div
				id="App"
				className={"d-flex flex-column min-vh-100 "+ viewStore.theme}
				onContextMenu={handleContextMenu}
			>
				<div className=''>
				{/* <IosToggle0 />
					<IosToggle1 /> 
					<IosToggle2 />
					<IosToggle3 />*/}
				</div>
				<SvgDefs />
				<ToastContainer toastStyle={{
					minWidth: '450px',
					minHeight: '150px',
					fontSize: '20px'
				}}/> 
				<Main />
				<ModalGeneric />
			</div>

		</>
	)
})

export default App