import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { HelmetProvider } from 'react-helmet-async'
import { BrowserRouter } from 'react-router-dom'
import { AppErrorBoundary } from './components/ErrorBoundary.jsx'

// Service worker is registered in index.html to avoid duplicate registration
// This prevents "Registration failed - push service error"

createRoot(document.getElementById('root')).render(
  <AppErrorBoundary>
    <HelmetProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </AppErrorBoundary>,
)