import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { hasCookieAccepted } from "../constants/cookieConsent";
import { useLanguage } from "../contexts/useLanguage";
import { getCurrentUser } from "../services/authService";
import type { ContrastMode } from "../types/accessibility";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "./AuthComponents";
import { LanguageSwitch } from "./LanguageSwitch";
import "./Navbar.css";
import { SignInIcon } from "./SignInIcon";

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
          <a href="/#home" className="nav-link">
            {t.nav.home}
          </a>
          <a href="/#countries" className="nav-link">
            {t.nav.countries}
          </a>
          <a href="/#about" className="nav-link">
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
            className={`nav-icon-btn accessible-toggle ${
              contrastMode === "high" ? "accessible-toggle-on" : ""
            }`}
            onClick={onAccessibleClick}
            aria-label={t.nav.accessibleMode}
            aria-haspopup="dialog"
            title={t.nav.accessibleMode}
          >
            <span className="accessible-toggle-icon" aria-hidden>
              <img
                src="/accessible.svg"
                alt={t.nav.accessibleMode}
                width={18}
                height={18}
                className="accessible-toggle-img"
              />
            </span>
          </button>
          <button
            type="button"
            className="nav-icon-btn theme-toggle"
            onClick={onThemeToggle}
            aria-label="Toggle theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <LanguageSwitch />
          <SignedIn>
            <UserButton />
          </SignedIn>
          {hasCookieAccepted() && (
            <SignedOut>
              <SignInButton>
                <button
                  type="button"
                  className="nav-icon-btn nav-sign-in-btn"
                  aria-label={t.nav.signIn}
                  title={t.nav.signIn}
                >
                  <span className="nav-sign-in-text">{t.nav.signIn}</span>
                  <span className="nav-sign-in-icon">
                    <SignInIcon />
                  </span>
                </button>
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

  const handleExportAgentUrl = async () => {
    const currentUser = await getCurrentUser();
    const agentId = currentUser.id;
    const baseUrl = window.location.origin;
    const agentUrl = `${baseUrl}/?agent=${agentId}`;

    // Copy to clipboard
    await navigator.clipboard.writeText(agentUrl);
    setShowAgentUrlModal(true);
    setTimeout(() => setShowAgentUrlModal(false), 3000);
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
