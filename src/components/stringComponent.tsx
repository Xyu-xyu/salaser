import { observer } from 'mobx-react-lite';
import viewStore from '../store/viewStore';
import { useState } from 'react';
import utils from '../scripts/util';

interface StringComponentInt {
  param: string;
  keyParam: string;
}

type ResultItem = {
  name: string;
  'focus, mm'?: number;
  'height, mm'?: number;
  'pressure, bar'?: number;
  'power, kWt'?: number;
  enabled: boolean;
  power: number;
  power_W_s: number;
  delay_s: number;
};

const StringComponent: React.FC<StringComponentInt> = observer(({ param, keyParam }) => {
  const [error, setError] = useState(false);
  const { selectedPiercingMacro, selectedModulationMacro/* , cut_settings */ } = viewStore;

  // Берём значение напрямую из стора
  const value = viewStore.getTecnologyValue(param, keyParam);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    if (param === 'thickness') {
      const numericValue = Number(newValue);
      const minimum = utils.deepFind(false, ['material', param, 'minimum']) || 0.1;
      const maximum = utils.deepFind(false, ['material', param, 'maximum']) || 60;

      if (isNaN(numericValue) || numericValue < minimum || numericValue > maximum) {
        setError(true);
        return;
      }

      setError(false);
      viewStore.setValString(param, numericValue, keyParam); // сохраняем число
    } else {
      if (newValue.length < 1 || newValue.length > 32) {
        setError(true);
        return;
      }

      setError(false);
      viewStore.setValString(param, newValue, keyParam);
    }
  };

  // Расчёт времени для piercingMacros
  const stageTime: number[] = [];
  const data: ResultItem[] = utils.getChartData(selectedPiercingMacro);
  data.forEach(a => stageTime.push(a.power_W_s / a.power || 0));

  const totalTime = data.reduce((acc, item) => {
    if (!item.enabled) return acc;
    return acc + item.delay_s + (item.power_W_s / item.power || 0);
  }, 0);

  return (
    <>
      {keyParam === 'modulationMacros' && (
        <div className="text-center">
          <p className="modulatiomNacroName">
            {viewStore.getTecnologyValue('name', 'modulationMacros', selectedModulationMacro)}:&nbsp;
            {viewStore.getTecnologyValue('pulseFill_percent', 'modulationMacros', selectedModulationMacro)}%,&nbsp;
            {viewStore.getTecnologyValue('pulseFrequency_Hz', 'modulationMacros', selectedModulationMacro)}Hz
          </p>
        </div>
      )}

      {keyParam === 'piercingMacros' && (
        <div className="text-center">
          <p className="modulatiomNacroName">
            {viewStore.getTecnologyValue('name', 'piercingMacros', selectedPiercingMacro)}:&nbsp;
            {viewStore.getTecnologyValue('initial_modulationFrequency_Hz', 'piercingMacros', selectedPiercingMacro)}&nbsp;Hz,&nbsp;
            {viewStore.getTecnologyValue('stages', 'piercingMacros', selectedPiercingMacro).length}&nbsp;stages,&nbsp;
            {totalTime.toFixed(1)}&nbsp;seconds
          </p>
        </div>
      )}

      <div className="stringComponentContainer px-2">
        <div className="stringComponentLabel mx-2">{keyParam === 'preset' ? param : 'Name'}</div>
        <input
          type={param === 'thickness' ? 'number' : 'text'}
          value={value} 
          onChange={handleChange}
          {...(param === 'thickness' ? { step: 0.1 } : {})}
          className={`form-control stringComponent ${error ? 'is-invalid' : ''}`}
        />
      </div>
    </>
  );
});

export default StringComponent;
