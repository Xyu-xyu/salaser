import { useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

function toggleLaserOff(visible: boolean) {
  const paths = document.querySelectorAll<SVGPathElement>(
    '.sgn_main_els > g > path.laserOff'
  );

  paths.forEach((p) => {
    p.style.visibility = visible ? 'visible' : 'hidden';
  });
}

const ToggleViewSheet = () => {
  // локальное состояние (по умолчанию true = показываем)
  const [checked, setChecked] = useState(true);

  const handleToggle = () => {
    const newState = !checked;
    setChecked(newState);       // обновляем состояние
    toggleLaserOff(newState);   // меняем видимость
  };

  return (
    <button
      onClick={handleToggle} // ✅ исправлено
      className="violet_button navbar_button small_button40"
    >
      <div className="d-flex align-items-center justify-content-center">
        <Icon
          icon={checked ? 'fa-regular:eye' : 'fa-regular:eye-slash'} // 👁 переключаем иконку
          width="36"
          height="36"
          style={{ color: 'white' }}
        />
      </div>
    </button>
  );
};

export default ToggleViewSheet;

