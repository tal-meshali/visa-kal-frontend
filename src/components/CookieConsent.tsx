import { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/useLanguage";
import {
  hasCookieChoiceMade,
  setCookieConsent,
  setCookieRefused,
} from "../constants/cookieConsent";
import "./CookieConsent.css";

export const CookieConsent = (): React.JSX.Element | null => {
  const { t } = useLanguage();
  const [show, setShow] = useState(() => !hasCookieChoiceMade());

  const handleAccept = (): void => {
    setCookieConsent();
    setShow(false);
  };

  const handleRefuse = (): void => {
    setCookieRefused();
    setShow(false);
  };

  if (!show) {
    return null;
  }

  const consent = t.cookieConsent as {
    title: string;
    message: string;
    accept: string;
    refuse: string;
    privacyPolicyLink: string;
  };

  return (
    <div
      className="cookie-consent-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
    >
      <div className="cookie-consent-modal">
        <h2 id="cookie-consent-title" className="cookie-consent-title">
          {consent.title}
        </h2>
        <p className="cookie-consent-message">{consent.message}</p>
        <div className="cookie-consent-actions">
          <button
            type="button"
            className="cookie-consent-accept"
            onClick={handleAccept}
          >
            {consent.accept}
          </button>
          <button
            type="button"
            className="cookie-consent-refuse"
            onClick={handleRefuse}
          >
            {consent.refuse}
          </button>
          <Link to="/privacy-policy" className="cookie-consent-link">
            {consent.privacyPolicyLink}
          </Link>
        </div>
      </div>
    </div>
  );
};
