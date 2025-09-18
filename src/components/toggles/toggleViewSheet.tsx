import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@iconify/react/dist/iconify.js';

const STYLE_ID = 'toggle-laser-style';

/**
 * Убедиться, что в документе есть <style> с правилом для скрытия laserOff:
 * .sgn_main_els.laser-hidden > g > path.laserOff { visibility: hidden !important; }
 */
function ensureStyle() {
  if (typeof document === 'undefined') return;
  let style = document.getElementById(STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    // !important чтобы перебить inline-стили, если они где-то ещё ставятся
    style.textContent = `
      .sgn_main_els.laser-hidden > g > path.laserOff { visibility: hidden !important; }
    `;
    document.head.appendChild(style);
  }
}

const ToggleViewSheet: React.FC = () => {
  // локальное состояние: true = показываем лазеры
  const [checked, setChecked] = useState<boolean>(true);
  const observerRef = useRef<MutationObserver | null>(null);

  // Функция применяет текущее состояние checked к всем .sgn_main_els (добавляет/убирает класс)
  const applyStateToSvgs = (visible: boolean) => {
    document.querySelectorAll<HTMLElement>('.sgn_main_els').forEach((el) => {
      if (visible) el.classList.remove('laser-hidden');
      else el.classList.add('laser-hidden');
    });
  };

  // На монтирование: создаём стиль и ставим наблюдатель за DOM,
  // чтобы при появлении нового SVG автоматически применить состояние.
  useEffect(() => {
    ensureStyle();
    // применяем состояние к уже существующим SVG
    applyStateToSvgs(checked);

    // Наблюдаем за вставкой новых узлов — если появится .sgn_main_els, применяем состояние
    const observer = new MutationObserver((mutations) => {
      let needApply = false;
      for (const m of mutations) {
        for (const node of Array.from(m.addedNodes)) {
          if (!(node instanceof Element)) continue;
          if (node.matches('.sgn_main_els') || node.querySelector('.sgn_main_els')) {
            needApply = true;
            break;
          }
        }
        if (needApply) break;
      }
      if (needApply) applyStateToSvgs(checked);
    });

    observer.observe(document.body, { childList: true, subtree: true });
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
      // (опционально) можно удалить style при размонтировании:
      // const style = document.getElementById(STYLE_ID); style?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // только один раз на монтирование

  // При изменении checked — сразу применяем к существующим SVG
  useEffect(() => {
    applyStateToSvgs(checked);
  }, [checked]);

  const handleToggle = () => {
    setChecked((s) => !s);
    // applyStateToSvgs вызывается в useEffect, поэтому можно не вызывать прямо здесь
  };

  return (
    <button
      onClick={handleToggle}
      className="violet_button navbar_button small_button40"
      aria-pressed={!checked}
      title={checked ? 'Скрыть лазеры' : 'Показать лазеры'}
    >
      <div className="d-flex align-items-center justify-content-center">
        <Icon
          icon={checked ? 'fa-regular:eye' : 'fa-regular:eye-slash'}
          width={checked ? '24' : '36'}
          height={checked ? '24' : '36'}
          style={{ color: 'white' }}
        />
      </div>
    </button>
  );
};

export default ToggleViewSheet;

