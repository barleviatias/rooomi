import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { localeDirection, type Locale } from '@/i18n/config'
import { Router } from '@/app/Router'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
})

export function App() {
  const { i18n } = useTranslation()
  const locale = (i18n.language || 'he') as Locale
  const dir = localeDirection[locale] || 'rtl'

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
