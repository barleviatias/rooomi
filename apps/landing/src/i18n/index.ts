import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import { defaultLocale } from "@roomi/i18n"
import en from "@roomi/i18n/locales/en"
import he from "@roomi/i18n/locales/he"

const savedLang = typeof window !== "undefined" ? localStorage.getItem("roomi-lang") : null

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en.landing },
    he: { translation: he.landing },
  },
  lng: savedLang || defaultLocale,
  fallbackLng: defaultLocale,
  interpolation: { escapeValue: false },
})

export default i18n
