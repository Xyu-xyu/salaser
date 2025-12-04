import './IosToggle.css';
import { observer } from 'mobx-react-lite';
import React, { useId } from 'react';
import IosToggleForm from './iosToggleForm';
import { useTranslation } from 'react-i18next';


const IosToggleGeneric = observer(({
  title,
  checked,
  onChange,
  isVertical = false,
  hideLabels = false, // 🔹 По умолчанию показываем подписи
}) => {

  const { t } = useTranslation();

  return (
    <div className='IosToggleGeneric w-100 h-100 d-flex align-items-center justify-content-center flex-column'>
      <div className='col-12 h-100 d-flex align-items-center justify-content-center'>
        <svg
          id={useId()}
          className="svgChart"
          version="1.1"
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          overflow="hidden"
        >
          {!hideLabels && (t(title)).split(', ')[0].split(' ').map((a, i) => (
            <text
              key={i}
              x={isVertical ? "5" : "-28"}
              y={isVertical ? (-15 + i * 12) : (15 + i * 12)}
              className="moderat"
              fill="var(--knobMainText)"
              fontSize={isVertical ? 10 : 12}
            >
              {a}
            </text>
          ))}
        </svg>

        <IosToggleForm
          id={useId()}
          checked={checked}
          onChange={onChange}
          dataOff={hideLabels ? "" : t("Off")} // 🔹 если hideLabels = true — не передаём подписи
          dataOn={hideLabels ? "" : t("On")}
        />
      </div>
    </div>
  );
});

export default IosToggleGeneric;
