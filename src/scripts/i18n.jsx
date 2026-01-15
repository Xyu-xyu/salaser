import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './translations/ru.jsx'
import en from './translations/en.jsx'
import zh from './translations/zh.jsx';
import constants from '../store/constants.jsx';

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

			
			if (!key) {
				console.group("❌ Empty i18n key detected")
				console.log({ lng, ns, fallbackValue })
				console.trace()   // 🔥 ВАЖНО
				console.groupEnd()
				return
			}
						

			key = key.replace(/"/gm, '`')
			key = key.replace(/'/gm, '`')

			if (import.meta.env.DEV && key.length) {
				fetch(`${constants.SERVER_URL}/api/translate?phrase=${encodeURIComponent(key)}`)
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
			}
		},
	});
