import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { hasCookieRefused } from "../constants/cookieConsent";
import { useLanguage } from "../contexts/useLanguage";
import { getCurrentUser } from "../services/authService";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "./AuthComponents";
import type { ContrastMode } from "../types/accessibility";
import { LanguageSwitch } from "./LanguageSwitch";
import "./Navbar.css";

interface NavbarProps {
  theme: "light" | "dark";
  contrastMode?: ContrastMode;
  onThemeToggle: () => void;
  onAccessibleClick?: () => void;
}

export const Navbar = ({
  theme,
  contrastMode = "standard",
  onThemeToggle,
  onAccessibleClick = () => {},
}: NavbarProps) => {
  const { t } = useLanguage();

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
            <NavbarSignedIn />
          </SignedIn>
          <button
            type="button"
            className={`accessible-toggle ${
              contrastMode === "high" ? "accessible-toggle-on" : ""
            }`}
            onClick={onAccessibleClick}
            aria-label={t.nav.accessibleMode}
            aria-haspopup="dialog"
            title={t.nav.accessibleMode}
          >
            <span className="accessible-toggle-icon" aria-hidden>
              <img
                src="/accessible.png"
                alt={t.nav.accessibleMode}
                width={24}
                height={18}
                className="accessible-toggle-img"
              />
            </span>
          </button>
          <button
            className="theme-toggle"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <LanguageSwitch />
          <SignedIn>
            <UserButton />
          </SignedIn>
          {!hasCookieRefused() && (
            <SignedOut>
              <SignInButton>
                <button className="nav-button">{t.nav.signIn}</button>
              </SignInButton>
            </SignedOut>
          )}
        </div>
      </div>
    </nav>
  );
};

const NavbarSignedIn = () => {
  const { t } = useLanguage();
  const { data: userData } = useQuery({
    queryFn: getCurrentUser,
    queryKey: ["user"],
  });
  const [showAgentUrlModal, setShowAgentUrlModal] = useState(false);

  const handleExportAgentUrl = (): void => {
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
  const isAdmin = userData?.role === "admin";

  return (
    <>
      {isAgent && (
        <button
          className="nav-link agent-url-btn"
          onClick={handleExportAgentUrl}
          title={t.nav.exportAgentUrl}
        >
          {t.nav.exportAgentUrl}
        </button>
      )}
      {isAdmin && (
        <Link to="/admin/pricing" className="nav-link">
          {t.nav.adminPricing}
        </Link>
      )}
      {showAgentUrlModal && (
        <div className="agent-url-modal">{t.nav.agentUrlCopied}</div>
      )}
    </>
  );
};
