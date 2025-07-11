import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enTranslation from './en.json';
import heTranslation from './he.json';

// the translations
const resources = {
  en: {
    translation: enTranslation
  },
  he: {
    translation: heTranslation
  }
};

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safe from xss
    }
  });

export default i18n;
