import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

// Initialize i18n before rendering
import '@/i18n/config'

import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
