import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './translations/ru.tsx'
import en from './translations/en.tsx'
import zh from './translations/zh.tsx';
import constants from '../store/constants.tsx';

const settedLang = localStorage.getItem('lng') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
      zh: { translation: zh }
    },
    lng: settedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: false, // Можно включить при необходимости
    saveMissing: true, // Включает событие "missingKey"
    missingKeyHandler: function (lng, ns, key, fallbackValue) {
      console.warn(`[i18n] Missing translation for key: "${key}" ${ns} in language: "${lng}"${fallbackValue}`);
      fetch(`http://${constants.SERVER_URL}/api/translate?phrase=${encodeURIComponent(key)}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Ошибка при запросе перевода: ${response.statusText}`);
          }
          return response.json();
        })
        .then((data) => {
          console.log("[i18n] Автоматически добавлен перевод:", data);
        })
        .catch((err) => {
          console.error("[i18n] Ошибка при автопереводе:", err);
        });
    },
  });
