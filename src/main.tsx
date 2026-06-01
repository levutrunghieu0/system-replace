import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import AppProviders from './app/AppProviders'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders />
  </StrictMode>,
)
