import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import CustomIcon from '../../../icons/customIcon.jsx';
import svgStore from '../../../store/svgStore.jsx';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from 'react';
import { addToSheetLog } from '../../../scripts/addToSheetLog.jsx';

const MIN = 50;
const MAX = 3000;

const SheetPanel = observer(() => {
  const { t } = useTranslation();
  const { svgData } = svgStore;
  const initialValuesRef = useRef({
    width: svgData.width ?? '',
    height: svgData.height ?? '',
  });
  const initialSafetyRef = useRef({
    clearance: svgStore.getSheetSafetyClearance(),
    allowPartInPart: svgStore.isSheetPartInPartEnabled(),
  });

  // Локальное состояние для инпутов
  const [values, setValues] = useState({
    width: svgData.width ?? '',
    height: svgData.height ?? '',
  });
  const [clearanceInput, setClearanceInput] = useState(
    () => String(svgStore.getSheetSafetyClearance())
  );

  // Синхронизация если store изменился извне
  useEffect(() => {
    setValues({
      width: svgData.width ?? '',
      height: svgData.height ?? '',
    });
  }, [svgData.width, svgData.height]);

  useEffect(() => {
    setClearanceInput(String(svgStore.getSheetSafetyClearance()));
  }, [svgStore.sheetSafetySettings.clearance]);

  // Изменение поля (без агрессивной валидации)
  const handleChange = (key) => (e) => {
    const rawValue = e.target.value;

    // Разрешаем пустое значение (чтобы можно было стирать)
    if (rawValue === '') {
      setValues((prev) => ({ ...prev, [key]: '' }));
      return;
    }

    // Разрешаем только число с точкой
    if (!/^\d*\.?\d*$/.test(rawValue)) return;

    setValues((prev) => ({ ...prev, [key]: rawValue }));

    const num = parseFloat(rawValue);

    // В store пишем только если число валидно и в диапазоне
    if (!isNaN(num) && num >= MIN && num <= MAX) {
      svgStore.setVal('svgData', key, num);
    }
  };

  const handleFocus = (key) => () => {
    initialValuesRef.current[key] = svgData[key];
  };

  // Нормализация при выходе из поля
  const handleBlur = (key) => () => {
    let num = parseFloat(values[key]);

    if (isNaN(num)) {
      // Возвращаем значение из store
      setValues((prev) => ({
        ...prev,
        [key]: svgData[key] ?? '',
      }));
      return;
    }

    // Ограничение диапазона
    num = Math.min(Math.max(num, MIN), MAX);

    setValues((prev) => ({
      ...prev,
      [key]: num,
    }));

    svgStore.setVal('svgData', key, num);

    if (Number(initialValuesRef.current[key]) !== num) {
      addToSheetLog('Sheet size updated');
      initialValuesRef.current[key] = num;
    }
  };

  const handleClearanceChange = (e) => {
    const rawValue = e.target.value;

    if (rawValue === '') {
      setClearanceInput('');
      return;
    }

    if (!/^\d*\.?\d*$/.test(rawValue)) return;

    setClearanceInput(rawValue);

    const num = parseFloat(rawValue);
    if (!isNaN(num) && num >= 0) {
      svgStore.setSheetSafetyClearance(num);
    }
  };

  const handleClearanceFocus = () => {
    initialSafetyRef.current.clearance = svgStore.getSheetSafetyClearance();
  };

  const handleClearanceBlur = () => {
    const nextClearance = svgStore.setSheetSafetyClearance(clearanceInput);
    setClearanceInput(String(nextClearance));

    if (Number(initialSafetyRef.current.clearance) !== nextClearance) {
      addToSheetLog('Sheet clearance updated');
      initialSafetyRef.current.clearance = nextClearance;
    }
  };

  const handlePartInPartChange = (e) => {
    const nextValue = e.target.checked;
    const previousValue = svgStore.isSheetPartInPartEnabled();
    svgStore.setSheetPartInPart(nextValue);

    if (previousValue !== nextValue) {
      addToSheetLog('Part in part setting updated');
      initialSafetyRef.current.allowPartInPart = nextValue;
    }
  };

  const dangerPartCount = svgStore.getSheetSafetyDangerCount();
  const showDangersEnabled = svgStore.isShowDangersEnabled();
  const dangerPartCountLabel = showDangersEnabled ? dangerPartCount : '-';

  const handleShowDangersToggle = (e) => {
    svgStore.setShowDangers(e.target.checked);
  };

  const panelInfo = {
    id: "sheetPopup",
    fa: (
      <>
        <CustomIcon
          icon="sheet"
          width="20"
          height="20"
          color="black"
          fill="black"
          strokeWidth={10}
          className="m-2"
          viewBox="0 0 384 512"
        />
        <div>{t("Sheet data")}</div>
      </>
    ),
    content: (
      <div className="d-flex align-items-center btn_block flex-wrap">
        <table className="table sheet-table">
          <tbody>
            <tr>
              <td className="align-middle">
                <div>{t("width")}:</div>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min={MIN}
                  max={MAX}
                  value={values.height}
                  onChange={handleChange('height')}
                  onFocus={handleFocus('height')}
                  onBlur={handleBlur('height')}
                  className="form-control"
                />
              </td>
            </tr>
            <tr>



              <td className="align-middle">
                <div>{t("height")}:</div>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min={MIN}
                  max={MAX}
                  value={values.width}
                  onChange={handleChange('width')}
                  onFocus={handleFocus('width')}
                  onBlur={handleBlur('width')}
                  className="form-control"
                />
              </td>

            </tr>

            <tr>
              <td className="align-middle">
                <div>{t("Part intend")}:</div>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={clearanceInput}
                  onChange={handleClearanceChange}
                  onFocus={handleClearanceFocus}
                  onBlur={handleClearanceBlur}
                  className="form-control"
                />
              </td>
            </tr>
            <tr>
              <td className="align-middle">
                <div>{t("Parts collide")}:</div>
              </td>
              <td className="align-middle">
                <strong>{dangerPartCountLabel}</strong>
              </td>
            </tr>
            <tr>
              <td colSpan={4}>
                <div className="form-check ms-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sheetShowDangers"
                    checked={showDangersEnabled}
                    onChange={handleShowDangersToggle}
                  />
                  <label className="form-check-label" htmlFor="sheetShowDangers">
                    {t("Show collisions")}
                  </label>
                </div>
              </td>
            </tr>
            <tr>
              <td colSpan={4}>
                <div className="form-check ms-4">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="sheetPartInPart"
                    checked={svgStore.isSheetPartInPartEnabled()}
                    onChange={handlePartInPartChange}
                  />
                  <label className="form-check-label" htmlFor="sheetPartInPart">
                    {t("Part in part")}
                  </label>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ),
  };

  return <Panel key={'panel' + 20} element={panelInfo} index={20} />;
});

export default SheetPanel;
