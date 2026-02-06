import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/useLanguage";
import { getCurrentUser } from "../services/authService";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from "./AuthComponents";
import { LanguageSwitch } from "./LanguageSwitch";
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
          <SignedOut>
            <SignInButton>
              <button className="nav-button">{t.nav.signIn}</button>
            </SignInButton>
          </SignedOut>
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
