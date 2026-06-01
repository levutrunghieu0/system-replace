import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ja from './locales/ja'
import en from './locales/en'
import vi from './locales/vi'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ja: { translation: ja },
      en: { translation: en },
      vi: { translation: vi },
    },
    lng: 'ja',
    fallbackLng: 'ja',
    supportedLngs: ['ja', 'en', 'vi'],
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
