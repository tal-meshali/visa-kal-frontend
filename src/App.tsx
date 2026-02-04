import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./App.css";
import { AboutSection } from "./components/AboutSection";
import { Alert } from "./components/Alert";
import { CountriesSection } from "./components/CountriesSection";
import { CTASection } from "./components/CTASection";
import { FeaturesSection } from "./components/FeaturesSection";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { RequestsMonitor } from "./components/RequestsMonitor";
import { useLanguage } from "./contexts/useLanguage";
import { fetchCountries } from "./services/countryService";

type Theme = "light" | "dark";

const App = () => {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Fetch countries using React Query
  const {
    data: countriesData,
    error: countriesError,
  } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const availableCountries = countriesData?.available || [];
  const upcomingCountries = countriesData?.coming_soon || [];

  // Error message state
  const [errorAlert, setErrorAlert] = useState<{
    type: "error" | "success" | "info";
    message: string;
    isOpen: boolean;
  }>({
    type: "error",
    message: "",
    isOpen: false,
  });

  // Show error alert when countries fetch fails
  useEffect(() => {
    if (countriesError) {
      const errorMessage =
        countriesError instanceof Error
          ? countriesError.message
          : "Failed to load countries. Please try again later.";
      // Defer state update to avoid cascading renders
      setTimeout(() => {
        setErrorAlert({
          type: "error",
          message: errorMessage,
          isOpen: true,
        });
      }, 0);
    }
  }, [countriesError]);

  const toggleTheme = (): void => {
    const newTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
  };

  const toggleLanguage = (): void => {
    const newLang = language === "en" ? "he" : "en";
    setLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // Handle agent identifier in URL
  useEffect(() => {
    const agentId = searchParams.get("agent");
    if (agentId) {
      // Save agent_id to localStorage
      localStorage.setItem("agent_id", agentId);
      // Remove agent parameter from URL and redirect to clean home page
      searchParams.delete("agent");
      setSearchParams(searchParams, { replace: true });
      navigate("/", { replace: true });
    }
  }, [searchParams, setSearchParams, navigate]);

  return (
    <div className={`app ${theme}`}>
      <Alert
        type={errorAlert.type}
        message={errorAlert.message}
        isOpen={errorAlert.isOpen}
        onClose={() => setErrorAlert({ ...errorAlert, isOpen: false })}
        duration={0}
      />
      <Navbar
        language={language}
        theme={theme}
        onLanguageToggle={toggleLanguage}
        onThemeToggle={toggleTheme}
      />
      <Hero />
      <AboutSection />
      <CountriesSection
        language={language}
        translations={t}
        availableCountries={availableCountries}
        upcomingCountries={upcomingCountries}
      />
      <FeaturesSection />
      <RequestsMonitor />
      <CTASection />
      <Footer />
    </div>
  );
};

export default App;
