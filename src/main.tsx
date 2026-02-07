import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./accessible-mode.css";
import App from "./App.tsx";
import { CookieConsent } from "./components/CookieConsent.tsx";
import { EmailVerification } from "./components/EmailVerification.tsx";
import { EmailVerificationPrompt } from "./components/EmailVerificationPrompt.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageProvider";
import "./index.css";
import AdminPricing from "./pages/AdminPricing.tsx";
import ApplicationForm from "./pages/ApplicationForm.tsx";
import ApplicationsHistory from "./pages/ApplicationsHistory.tsx";
import CountryPage from "./pages/CountryPage.tsx";
import NotFound from "./pages/NotFound.tsx";
import Payment from "./pages/Payment.tsx";
import PricingSelection from "./pages/PricingSelection.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import { syncAccessibilityToDomFromStore } from "./stores/accessibilityStore";
import { syncThemeToDomFromStore } from "./stores/themeStore";

// Create a client for react-query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Validate Firebase config
const requiredEnvVars = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
];

const missingVars = requiredEnvVars.filter(
  (varName) => !import.meta.env[varName],
);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(", ")}`,
  );
}

// Get language from URL params or browser preference
const getInitialLanguage = (): "en" | "he" => {
  const urlParams = new URLSearchParams(window.location.search);
  const langParam = urlParams.get("lang");
  if (langParam === "he" || langParam === "en") {
    return langParam;
  }

  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "he") {
    return "he";
  }

  return "en";
};

syncThemeToDomFromStore();
syncAccessibilityToDomFromStore();

if (import.meta.env.DEV) {
  // Dev-time accessibility audits (WCAG/IS-5568) using axe-core
  import("@axe-core/react").then(({ default: axe }) => {
    import("react-dom").then((ReactDOM) => {
      axe(React, ReactDOM, 1000);
    });
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <LanguageProvider defaultLanguage={getInitialLanguage()}>
          <BrowserRouter>
            <CookieConsent />
            <EmailVerificationPrompt />
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/country/:countryId" element={<CountryPage />} />
              <Route path="/apply/:countryId" element={<ApplicationForm />} />
              <Route
                path="/pricing/:countryId"
                element={<PricingSelection />}
              />
              <Route path="/payment/:countryId" element={<Payment />} />
              <Route path="/applications" element={<ApplicationsHistory />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPricing />
                  </ProtectedRoute>
                }
              />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>,
);
