import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Initialize i18n before rendering
import '@/i18n/config'

import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { setupGlobalErrorHandlers } from '@/lib/services/error-reporting'

setupGlobalErrorHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)
