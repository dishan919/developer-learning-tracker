import { BrowserRouter } from 'react-router-dom'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from './context/ThemeContext'
import { restoreSpaRoute } from './utils/spaRouting'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'
restoreSpaRoute(import.meta.env.BASE_URL)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider><BrowserRouter basename={basename}><App /></BrowserRouter></ThemeProvider>
  </StrictMode>,
)
