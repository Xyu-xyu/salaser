import './../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Main from './components/main'
import SidePanel from './components/sidePanel.js'
import { observer } from "mobx-react-lite";
import viewStore from './store/viewStore.js';
import IosToggle0 from './components/iosToggle0.js';
import IosToggle1 from './components/iosToggle1';
import IosToggle2 from './components/iosToggle2';


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
				{mode === 'main' ? <Main /> : <SidePanel />}
			</div>

		</>
	)
})

export default App