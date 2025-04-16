import './../node_modules/bootstrap/dist/js/bootstrap.bundle.min.js';
import Main from './components/main'
import Main1 from './components/main1'
import { observer } from "mobx-react-lite";
import IosToggle from './components/iosToggle.js';
import viewStore from './store/viewStore.js';


const App = observer(() => {

  let { mode } = viewStore;

  return (
    <>
      <div id="App" className='themeLight'>
        <IosToggle></IosToggle>
        {mode === 'main' ? <Main /> : <Main1 />}
      </div>

    </>
  )
})

export default App
