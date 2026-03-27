import { useTranslation } from 'react-i18next'
import { localeDirection, type Locale } from '@/i18n/config'

export function useDirection() {
  const { i18n } = useTranslation()
  const locale = i18n.language as Locale
  const dir = localeDirection[locale] || 'rtl'
  const isRTL = dir === 'rtl'

  return { dir, isRTL, locale }
}
