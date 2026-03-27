import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import en from './en.json'
import he from './he.json'

export const locales = ['he', 'en'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'he'

export const localeNames: Record<Locale, string> = {
  he: 'עברית',
  en: 'English',
}

export const localeDirection: Record<Locale, 'rtl' | 'ltr'> = {
  he: 'rtl',
  en: 'ltr',
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      he: { translation: he },
    },
    fallbackLng: defaultLocale,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n
