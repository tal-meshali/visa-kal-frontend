import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/useLanguage";
import { useCookieConsentStore } from "../stores/cookieConsentStore";
import "./CookieConsent.css";

export const CookieConsent = () => {
  const { t } = useLanguage();
  const { hasChoiceMade, setAccepted, setRefused } = useCookieConsentStore();
  const [show, setShow] = useState(() => !hasChoiceMade());

  const handleAccept = () => {
    setAccepted();
    setShow(false);
  };

  const handleRefuse = () => {
    setRefused();
    setShow(false);
  };

  if (!show) {
    return null;
  }

  return (
    <div
      className="cookie-consent-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="cookie-consent-modal">
        <h2 id="cookie-consent-title" className="cookie-consent-title">
          {t.cookieConsent.title}
        </h2>
        <p className="cookie-consent-message">{t.cookieConsent.message}</p>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="cookie-consent-accept"
            onClick={handleAccept}
          >
            {t.cookieConsent.accept}
          </button>
          <button
            type="button"
            className="cookie-consent-refuse"
            onClick={handleRefuse}
          >
            {t.cookieConsent.refuse}
          </button>
          <Link to="/privacy-policy" className="cookie-consent-link">
            {t.cookieConsent.privacyPolicyLink}
          </Link>
        </div>
      </div>
    </div>
  );
};
