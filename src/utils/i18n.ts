import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

// ✅ Import translations directly from the public folder
import enTranslation from '~/locales/en.json';
import laTranslation from '~/locales/la.json';
import { localStorageData } from '~/server/cache';

// 🚀 Safely get language (Avoid `localStorage` in SSR)
const getLanguage = () =>
  typeof window !== 'undefined'
    ? localStorageData('language').getLocalStrage() || 'en'
    : 'en';

// ✅ Define resources
const resources = {
  en: { translation: enTranslation },
  la: { translation: laTranslation },
};

// 🌐 Initialize i18next
i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: getLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18next;
