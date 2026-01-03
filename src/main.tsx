import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LanguageProvider } from './contexts/LanguageContext'
import { useClerkTokenSync } from './utils/tokenManager'
import './index.css'
import App from './App.tsx'
import ApplicationForm from './pages/ApplicationForm.tsx'
import ApplicationsHistory from './pages/ApplicationsHistory.tsx'
import Payment from './pages/Payment.tsx'

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

// Component to sync Clerk token to localStorage
const ClerkTokenSync = (): null => {
  useClerkTokenSync()
  return null
}

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error('Missing Clerk Publishable Key')
}

// Get language from URL params or browser preference
const getInitialLanguage = (): 'en' | 'he' => {
  const urlParams = new URLSearchParams(window.location.search)
  const langParam = urlParams.get('lang')
  if (langParam === 'he' || langParam === 'en') {
    return langParam
  }
  
  // Check browser language
  const browserLang = navigator.language.split('-')[0]
  if (browserLang === 'he') {
    return 'he'
  }
  
  return 'en'
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <QueryClientProvider client={queryClient}>
        <ClerkTokenSync />
        <LanguageProvider defaultLanguage={getInitialLanguage()}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/apply/:countryId" element={<ApplicationForm />} />
              <Route path="/payment/:countryId" element={<Payment />} />
              <Route path="/applications" element={<ApplicationsHistory />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </QueryClientProvider>
    </ClerkProvider>
  </StrictMode>,
)
