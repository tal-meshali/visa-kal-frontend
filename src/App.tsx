import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import "./App.css";
import { AboutSection } from "./components/AboutSection";
import { AccessibilityOptionsPanel } from "./components/AccessibilityOptionsPanel";
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
import { useAccessibilityStore } from "./stores/accessibilityStore";
import { useAgentStore } from "./stores/agentStore";
import { useThemeStore } from "./stores/themeStore";

const App = () => {
  const { language, t } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();
  const {
    contrastMode,
    fontSize,
    reduceMotion,
    monochrome,
    setContrastMode,
    setFontSize,
    setReduceMotion,
    setMonochrome,
  } = useAccessibilityStore();
  const { setAgentId } = useAgentStore();
  const [a11yPanelOpen, setA11yPanelOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { data: countriesData, error: countriesError } = useQuery({
    queryKey: ["countries"],
    queryFn: fetchCountries,
    staleTime: 5 * 60 * 1000,
  });

  const availableCountries = countriesData?.available || [];
  const upcomingCountries = countriesData?.coming_soon || [];

  const [errorAlert, setErrorAlert] = useState<{
    type: "error" | "success" | "info";
    message: string;
    isOpen: boolean;
  }>({
    type: "error",
    message: "",
    isOpen: false,
  });

  useEffect(() => {
    if (countriesError) {
      const errorMessage =
        countriesError instanceof Error
          ? countriesError.message
          : "Failed to load countries. Please try again later.";
      setTimeout(() => {
        setErrorAlert({
          type: "error",
          message: errorMessage,
          isOpen: true,
        });
      }, 0);
    }
  }, [countriesError]);

  useEffect(() => {
    const agentId = searchParams.get("agent");
    if (agentId) {
      setAgentId(agentId);
      searchParams.delete("agent");
      setSearchParams(searchParams, { replace: true });
      navigate("/", { replace: true });
    }
  }, [searchParams, setSearchParams, navigate, setAgentId]);

  return (
    <div className={`app ${theme}`}>
      <a href="#home" className="skip-link">
        {t.a11y.skipToContent}
      </a>
      <Alert
        type={errorAlert.type}
        message={errorAlert.message}
        isOpen={errorAlert.isOpen}
        onClose={() => setErrorAlert((prev) => ({ ...prev, isOpen: false }))}
        duration={0}
      />
      <Navbar
        theme={theme}
        contrastMode={contrastMode}
        onThemeToggle={toggleTheme}
        onAccessibleClick={() => setA11yPanelOpen(true)}
      />
      <AccessibilityOptionsPanel
        isOpen={a11yPanelOpen}
        onClose={() => setA11yPanelOpen(false)}
        contrastMode={contrastMode}
        onContrastChange={setContrastMode}
        fontSize={fontSize}
        onFontSizeChange={setFontSize}
        reduceMotion={reduceMotion}
        onReduceMotionChange={setReduceMotion}
        monochrome={monochrome}
        onMonochromeChange={setMonochrome}
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
