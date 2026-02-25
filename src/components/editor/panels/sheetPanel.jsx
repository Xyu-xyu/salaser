import Panel from './panel.jsx';
import { observer } from 'mobx-react-lite';
import CustomIcon from '../../../icons/customIcon.jsx';
import svgStore from '../../../store/svgStore.jsx';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const MIN = 50;
const MAX = 3000;

const SheetPanel = observer(() => {
  const { t } = useTranslation();
  const { svgData } = svgStore;

  // Локальное состояние для инпутов
  const [values, setValues] = useState({
    width: svgData.width ?? '',
    height: svgData.height ?? '',
  });

  // Синхронизация если store изменился извне
  useEffect(() => {
    setValues({
      width: svgData.width ?? '',
      height: svgData.height ?? '',
    });
  }, [svgData.width, svgData.height]);

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
                  onBlur={handleBlur('height')}
                  className="form-control"
                />
              </td>

              <td className="align-middle">
                <div>{t("width")}:</div>
              </td>
              <td>
                <input
                  type="number"
                  step="0.01"
                  min={MIN}
                  max={MAX}
                  value={values.width}
                  onChange={handleChange('width')}
                  onBlur={handleBlur('width')}
                  className="form-control"
                />
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

{/* 
								<tr>
									<td>
										<div className="d-flex">
											<div><p>{t("Time for cut")}:</p></div>
											<div><p id="info_cutTime"></p></div>											
										</div>
									</td>									 
								</tr>
								
								<tr>
									<td>
										<div className="d-flex">
											<div><p>{t("thickness")}:</p></div>
											<div><p id="info_thickness"></p></div>
										</div>
									</td>
								</tr>


								<tr>
									<td>
										<p>{t("Material")}:</p>									 
										<p id="info_materialCode"></p>								 
										<p id="info_MaterialInfoLabel"></p>
									</td>
								</tr>
								<tr>
									<td>
										<div className="d-flex">
											<div><p>{t("Parts collide")}:</p></div>
											<div><p id="info_collision">0</p></div>
										</div>
									</td>
									<td>
										<div className="d-flex partIntendPanel">
											<div><p>{t("Part intend")}:</p></div>
											<div>
												<input 
													style={{width:"50px"}} 
													type="number" 
													min={5} placeholder={0} 
													id="partIntend" 
												/>
											</div>
										</div>
									</td>
									<td>
										<div className="form-check ms-2" id="partInPartPanel">
											<input 
												className="form-check-input" 
												type="checkbox" 
												value="" 
												id="partInPart" checked />
											<label className="form-check-label" htmlFor="partInPart">
												{t("Part in part")}
											</label>
										</div>
									</td>
								</tr>
								<tr>
									<td colSpan='3'>
										<div className="form-check ms-2 moveInnerPartsPanel">
											<input 
												className="form-check-input" 
												type="checkbox" 
												value="" 
												id="moveInnerParts" checked />
											<label className="form-check-label" htmlFor="moveInnerParts">
												{t("Move with inner part")}
											</label>
										</div>
										<button type="button" className="btn text-white mt-1 ms-2 btn_rotate_sheet" onMouseDown={ ()=>{}}>
											{t('Rotate sheet')} 180°
										</button>
									</td>
								</tr>
								<tr>
									<td colSpan="3" id="intednsPanel">
										<div><p>{t('Intends')}:</p></div>
										<div>
											<div className="d-flex justify-content-center align-items-center">
												<div>
													<input 
														style={{width:"50px"}} 
														className="inputIntend" 
														type="number" min={0} 
														placeholder={0} 
														id="intendBottom" 
														value={CONSTANTS.defaultIntend} 
													/>
												</div>
											</div>
											<div className="d-flex justify-content-center align-items-center">
												<div>
													<input 
														style={{width:"50px"}} 
														className="inputIntend" 
														type="number" 
														min={0} placeholder={0} 
														id="intendRight" 
														value={CONSTANTS.defaultIntend} />
												</div>
												<div id="sheetModel">
													<div id="intendModel">
													</div>
												</div>
												<div>
													<input 
														style={{width:"50px"}} 
														className="inputIntend" 
														type="number" min={0} 
														placeholder={0} id="intendLeft" 
														value={CONSTANTS.defaultIntend} 
													/>
												</div>
											</div>
											<div className="d-flex justify-content-center align-items-center">
												<div>
													<input 
														style={{width:"50px"}} 
														className="inputIntend" 
														type="number" min={0} 
														placeholder={0} 
														id="intendTop" 
														value={CONSTANTS.defaultIntend} 
													/>
												</div>
											</div>
										</div>
									</td>
								</tr> */}