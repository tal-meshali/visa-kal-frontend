import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useLanguage } from "../contexts/useLanguage";
import "./PrivacyPolicy.css";

type Theme = "light" | "dark";

const getStoredTheme = (): Theme => {
  const stored = localStorage.getItem("theme") as Theme | null;
  return stored === "dark" || stored === "light" ? stored : "light";
};

const PrivacyPolicy = (): React.JSX.Element => {
  const { t } = useLanguage();
  const [theme, setTheme] = useState<Theme>(getStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const onThemeToggle = (): void => {
    const next: Theme = theme === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
  };

  return (
    <div className="privacy-policy-page">
      <Navbar theme={theme} onThemeToggle={onThemeToggle} />
      <div className="privacy-policy-container">
        <Link to="/" className="privacy-policy-back">
          ← {(t.privacy as { backToHome: string }).backToHome}
        </Link>
        <h1 className="privacy-policy-title">
          {(t.privacy as { title: string }).title}
        </h1>
        <div className="privacy-policy-content">
          {/* Add your privacy policy content here */}
          <div className="privacy-policy-placeholder">TBA</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
