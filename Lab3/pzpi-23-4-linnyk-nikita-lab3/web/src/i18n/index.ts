import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import uk from './uk.json';
import en from './en.json';

const savedLang = localStorage.getItem('lb_lang') || 'uk';

i18n.use(initReactI18next).init({
  resources: {
    uk: { translation: uk },
    en: { translation: en },
  },
  lng: savedLang,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

export function setLanguage(lang: 'uk' | 'en') {
  i18n.changeLanguage(lang);
  localStorage.setItem('lb_lang', lang);
}

export default i18n;
