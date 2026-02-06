import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import "./App.css";
import { AboutSection } from "./components/AboutSection";
import { AccessibilityOptionsPanel, type FontSizeValue } from "./components/AccessibilityOptionsPanel";
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
import type { ContrastMode } from "./types/accessibility";

type Theme = "light" | "dark";

const CONTRAST_STORAGE_KEY = "visa-vibe-contrast";
const FONT_SIZE_STORAGE_KEY = "visa-vibe-font-size";
const REDUCE_MOTION_STORAGE_KEY = "visa-vibe-reduce-motion";

const getInitialContrast = (): ContrastMode => {
  try {
    const stored = localStorage.getItem(CONTRAST_STORAGE_KEY);
    if (stored === "high" || stored === "low") return stored;
    const legacy = localStorage.getItem("visa-vibe-accessible");
    if (legacy === "true") return "high";
    return "standard";
  } catch {
    return "standard";
  }
};

const getInitialFontSize = (): FontSizeValue => {
  try {
    const stored = localStorage.getItem(FONT_SIZE_STORAGE_KEY);
    return ["100", "110", "125", "150"].includes(stored ?? "")
      ? (stored as FontSizeValue)
      : "100";
  } catch {
    return "100";
  }
};

const getInitialReduceMotion = (): boolean => {
  try {
    return localStorage.getItem(REDUCE_MOTION_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const App = () => {
  const { language, t } = useLanguage();
  const [theme, setTheme] = useState<Theme>("light");
  const [contrastMode, setContrastMode] = useState<ContrastMode>(getInitialContrast);
  const [fontSize, setFontSize] = useState<FontSizeValue>(getInitialFontSize);
  const [reduceMotion, setReduceMotion] = useState<boolean>(getInitialReduceMotion);
  const [a11yPanelOpen, setA11yPanelOpen] = useState(false);
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
  };

  const handleContrastChange = (value: ContrastMode): void => {
    setContrastMode(value);
    try {
      localStorage.setItem(CONTRAST_STORAGE_KEY, value);
    } catch {
      // ignore
    }
  };

  const handleFontSizeChange = (value: FontSizeValue): void => {
    setFontSize(value);
    try {
      localStorage.setItem(FONT_SIZE_STORAGE_KEY, value);
    } catch {
      // ignore
    }
  };

  const handleReduceMotionChange = (value: boolean): void => {
    setReduceMotion(value);
    try {
      localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, String(value));
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const html = document.documentElement;
    if (contrastMode === "standard") {
      html.removeAttribute("data-contrast");
    } else {
      html.setAttribute("data-contrast", contrastMode);
    }
  }, [contrastMode]);

  useEffect(() => {
    document.documentElement.setAttribute("data-font-size", fontSize);
  }, [fontSize]);

  useEffect(() => {
    const html = document.documentElement;
    if (reduceMotion) {
      html.setAttribute("data-reduce-motion", "true");
    } else {
      html.removeAttribute("data-reduce-motion");
    }
  }, [reduceMotion]);

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
      <a href="#home" className="skip-link">
        {t.a11y.skipToContent}
      </a>
      <Alert
        type={errorAlert.type}
        message={errorAlert.message}
        isOpen={errorAlert.isOpen}
        onClose={() => setErrorAlert({ ...errorAlert, isOpen: false })}
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
        onContrastChange={handleContrastChange}
        fontSize={fontSize}
        onFontSizeChange={handleFontSizeChange}
        reduceMotion={reduceMotion}
        onReduceMotionChange={handleReduceMotionChange}
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
