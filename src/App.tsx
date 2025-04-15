import './../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Main from './components/main'
import { observer } from "mobx-react-lite";
import IosToggle from './components/iosToggle.js';
import viewStore from './store/viewStore.js';


const App = observer(() => {

  let { mode } = viewStore;

  return (
    <>
      <div id="App" className='themeLight'>
        <IosToggle></IosToggle>
        {mode === 'main' ? <Main /> : ''}
      </div>

    </>
  )
})

export default App
