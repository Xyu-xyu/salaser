import './../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Main from './components/main'
import Main1 from './components/main1'
import { observer } from "mobx-react-lite";
import IosToggle from './components/iosToggle';
import IosToggle1 from './components/iosToggle1';
import IosToggle2 from './components/iosToggle2';


import viewStore from './store/viewStore.js';



const App = observer(() => {

  let { mode } = viewStore;
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault(); // Блокируем стандартное контекстное меню
  };

  return (
    <>
      <div 
        id="App" 
        className= { viewStore.theme} 
        onContextMenu={handleContextMenu}
      >
        <IosToggle />
        <IosToggle1 />
        <IosToggle2 />
        {mode === 'main' ? <Main /> : <Main1 />}
      </div>

    </>
  )
})

export default App
