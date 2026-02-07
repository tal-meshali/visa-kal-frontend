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

  // Check browser language
  const browserLang = navigator.language.split("-")[0];
  if (browserLang === "he") {
    return "he";
  }

  return "en";
};

const CONTRAST_STORAGE_KEY = "visa-vibe-contrast";

const initializeTheme = (): void => {
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  const theme = savedTheme || "light";
  document.documentElement.setAttribute("data-theme", theme);
};

const FONT_SIZE_STORAGE_KEY = "visa-vibe-font-size";
const REDUCE_MOTION_STORAGE_KEY = "visa-vibe-reduce-motion";
const MONOCHROME_STORAGE_KEY = "visa-vibe-monochrome";

const initializeContrast = (): void => {
  try {
    const stored = localStorage.getItem(CONTRAST_STORAGE_KEY);
    const html = document.documentElement;
    if (stored === "high" || stored === "low") {
      html.setAttribute("data-contrast", stored);
    } else {
      const legacy = localStorage.getItem("visa-vibe-accessible");
      if (legacy === "true") html.setAttribute("data-contrast", "high");
      else html.removeAttribute("data-contrast");
    }
  } catch {
    document.documentElement.removeAttribute("data-contrast");
  }
};

const initializeFontSize = (): void => {
  try {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    const value = ["100", "110", "125", "150"].includes(stored ?? "")
      ? stored!
      : "100";
    document.documentElement.setAttribute("data-font-size", value);
  } catch {
    document.documentElement.setAttribute("data-font-size", "100");
  }
};

const initializeReduceMotion = (): void => {
  try {
    const stored = localStorage.getItem(REDUCE_MOTION_STORAGE_KEY);
    const html = document.documentElement;
    if (stored === "true") {
      html.setAttribute("data-reduce-motion", "true");
    } else {
      html.removeAttribute("data-reduce-motion");
    }
  } catch {
    document.documentElement.removeAttribute("data-reduce-motion");
  }
};

const initializeMonochrome = (): void => {
  try {
    const stored = localStorage.getItem(MONOCHROME_STORAGE_KEY);
    const html = document.documentElement;
    if (stored === "true") {
      html.setAttribute("data-monochrome", "true");
    } else {
      html.removeAttribute("data-monochrome");
    }
  } catch {
    document.documentElement.removeAttribute("data-monochrome");
  }
};

initializeTheme();
initializeContrast();
initializeFontSize();
initializeReduceMotion();
initializeMonochrome();

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
