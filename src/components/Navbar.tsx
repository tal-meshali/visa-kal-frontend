import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/useLanguage";
import { getCurrentUser } from "../services/authService";
import "./Navbar.css";

interface NavbarProps {
  language: "en" | "he";
  theme: "light" | "dark";
  onLanguageToggle: () => void;
  onThemeToggle: () => void;
}

export const Navbar = ({
  language,
  theme,
  onLanguageToggle,
  onThemeToggle,
}: NavbarProps) => {
  const { t } = useLanguage();
  const { user, isLoaded } = useUser();
  const { data: userData } = useQuery({
    queryFn: getCurrentUser,
    queryKey: ["user"],
    enabled: isLoaded,
  });
  const [showAgentUrlModal, setShowAgentUrlModal] = useState(false);

  const handleExportAgentUrl = (): void => {
    if (!user) return;
    getCurrentUser()
      .then((currentUser) => {
        const agentId = currentUser.id;
        const baseUrl = window.location.origin;
        const agentUrl = `${baseUrl}/?agent=${agentId}`;

        // Copy to clipboard
        navigator.clipboard.writeText(agentUrl).then(() => {
          setShowAgentUrlModal(true);
          setTimeout(() => setShowAgentUrlModal(false), 3000);
        });
      })
      .catch(() => {
        // Failed to get user info
      });
  };

  const isAgent = userData?.role === "agent";

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-text">Visa-Kal</span>
          </Link>
        </div>
        <div className="nav-links">
          <a href="#home" className="nav-link">
            {t.nav.home}
          </a>
          <a href="#countries" className="nav-link">
            {t.nav.countries}
          </a>
          <a href="#about" className="nav-link">
            {t.nav.about}
          </a>
          <SignedIn>
            <Link to="/applications" className="nav-link">
              {t.nav.myApplications}
            </Link>
            {isAgent && (
              <button
                className="nav-link agent-url-btn"
                onClick={handleExportAgentUrl}
                title={t.nav.exportAgentUrl}
              >
                {t.nav.exportAgentUrl}
              </button>
            )}
            {showAgentUrlModal && (
              <div className="agent-url-modal">{t.nav.agentUrlCopied}</div>
            )}
          </SignedIn>
          <button
            className="theme-toggle"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            className="lang-toggle"
            onClick={onLanguageToggle}
            aria-label="Toggle language"
          >
            {language === "en" ? t.common.hebrew : t.common.english}
          </button>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="nav-button">{t.nav.signIn}</button>
            </SignInButton>
          </SignedOut>
        </div>
      </div>
    </nav>
  );
};
