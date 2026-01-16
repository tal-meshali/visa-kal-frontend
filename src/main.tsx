import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import App from "./App.tsx";
import { EmailVerificationPrompt } from "./components/EmailVerificationPrompt.tsx";
import { FirebaseTokenSync } from "./components/FirebaseTokenSync.tsx";
import { AuthProvider } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageProvider";
import "./index.css";
import ApplicationForm from "./pages/ApplicationForm.tsx";
import ApplicationsHistory from "./pages/ApplicationsHistory.tsx";
import Payment from "./pages/Payment.tsx";
import PricingSelection from "./pages/PricingSelection.tsx";
import AdminPricing from "./pages/AdminPricing.tsx";
import { EmailVerification } from "./components/EmailVerification.tsx";
import { ProtectedRoute } from "./components/ProtectedRoute.tsx";

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
  (varName) => !import.meta.env[varName]
);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(", ")}`
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

// Initialize theme - ensures data-theme is always set, even on routes where App.tsx is not rendered
const initializeTheme = (): void => {
  const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
  const theme = savedTheme || "light";
  document.documentElement.setAttribute("data-theme", theme);
};

// Initialize theme before rendering
initializeTheme();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <FirebaseTokenSync />
        <LanguageProvider defaultLanguage={getInitialLanguage()}>
          <BrowserRouter>
            <EmailVerificationPrompt />
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/apply/:countryId" element={<ApplicationForm />} />
              <Route path="/pricing/:countryId" element={<PricingSelection />} />
              <Route path="/payment/:countryId" element={<Payment />} />
              <Route path="/applications" element={<ApplicationsHistory />} />
              <Route
                path="/admin/pricing"
                element={
                  <ProtectedRoute requireAdmin>
                    <AdminPricing />
                  </ProtectedRoute>
                }
              />
              <Route path="/verify-email" element={<EmailVerification />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </QueryClientProvider>
    </AuthProvider>
  </StrictMode>
);
