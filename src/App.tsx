import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "./App.css";
import { CountriesSection } from "./components/CountriesSection";
import { CTASection } from "./components/CTASection";
import { FeaturesSection } from "./components/FeaturesSection";
import { Footer } from "./components/Footer";
import { Hero } from "./components/Hero";
import { Navbar } from "./components/Navbar";
import { RequestsMonitor } from "./components/RequestsMonitor";
import { useLanguage } from "./contexts/LanguageContext";
import { countries } from "./data/countries";

type Theme = "light" | "dark";

const App = () => {
  const { language, setLanguage, t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  const availableCountries = countries.filter((c) => c.available);
  const upcomingCountries = countries.filter((c) => !c.available);

  return (
    <div className={`app ${theme}`}>
      <Navbar
        language={language}
        theme={theme}
        onLanguageToggle={toggleLanguage}
        onThemeToggle={toggleTheme}
      />
      <Hero language={language} translations={t} />
      <CountriesSection
        language={language}
        translations={t}
        availableCountries={availableCountries}
        upcomingCountries={upcomingCountries}
      />
      <FeaturesSection />
      <RequestsMonitor />
      <CTASection translations={t} />
      <Footer />
    </div>
  );
};

export default App;
