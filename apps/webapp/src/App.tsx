import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { localeDirection, type Locale } from '@/i18n/config'
import { Router } from '@/app/Router'
import { useSessionRecovery } from '@/hooks/useSessionRecovery'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error) => {
        const status = (error as { status?: number })?.status
        if (status === 401 || status === 403) return false
        return failureCount < 2
      },
      refetchOnWindowFocus: true,
    },
  },
})

function AppInner() {
  const { i18n } = useTranslation()
  const locale = (i18n.language || 'he') as Locale
  const dir = localeDirection[locale] || 'rtl'

  useSessionRecovery()

  useEffect(() => {
    document.documentElement.dir = dir
    document.documentElement.lang = locale
  }, [dir, locale])

  return (
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  )
}

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  )
}

export default App
