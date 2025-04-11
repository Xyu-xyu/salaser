import { useState } from 'react';
import './IosToggle.css';

const IosToggle = () => {
  const [checked, setChecked] = useState(true);

  return (
    <div id="toggles" className='mx-4'>
      <input
        type="checkbox"
        id="checkbox1"
        className="ios-toggle"
        checked={checked}
        onChange={() => setChecked(!checked)}
      />
      <label
        htmlFor="checkbox1"
        className="checkbox-label"
        data-off=""
        data-on=""
      />
    </div>
  );
};

export default IosToggle;
