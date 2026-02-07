import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { Navbar } from "../components/Navbar";
import { useLanguage } from "../contexts/useLanguage";
import { useThemeStore } from "../stores/themeStore";
import "./PrivacyPolicy.css";

const PrivacyPolicy = (): React.JSX.Element => {
  const { t } = useLanguage();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className="privacy-policy-page">
      <Navbar theme={theme} onThemeToggle={toggleTheme} />
      <div className="privacy-policy-container">
        <Link to="/" className="privacy-policy-back">
          ← {(t.privacy as { backToHome: string }).backToHome}
        </Link>
        <h1 className="privacy-policy-title">
          {(t.privacy as { title: string }).title}
        </h1>
        <div className="privacy-policy-content">
          <div className="privacy-policy-placeholder">TBA</div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
