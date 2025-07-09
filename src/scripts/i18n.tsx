import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './translations/ru.tsx' 
import en from './translations/en.tsx' 

const settedLang  = localStorage.getItem('lng') || 'en'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru }
    },
    lng: settedLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: false, // Можно включить при необходимости
    saveMissing: true, // Включает событие "missingKey"
    missingKeyHandler: function (lng, ns, key, fallbackValue) {
      console.warn(`[i18n] Missing translation for key: "${key}" in language: "${lng}"`);
    },
  });
