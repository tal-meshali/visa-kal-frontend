import { useLanguage } from "../contexts/useLanguage";
import type { Language } from "../types/formTypes";
import "./LanguageSwitch.css";

export const LanguageSwitch = (): JSX.Element => {
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = (lang: Language): void => {
    if (lang !== language) {
      setLanguage(lang);
    }
  };

  return (
    <div
      className="language-switch"
      role="group"
      aria-label={`${t.common.english} / ${t.common.hebrew}`}
    >
      <button
        type="button"
        className={`language-switch-option ${language === "en" ? "active" : ""}`}
        onClick={() => handleSelect("en")}
        aria-pressed={language === "en"}
        aria-label={t.common.english}
      >
        {t.common.english}
      </button>
      <button
        type="button"
        className={`language-switch-option ${language === "he" ? "active" : ""}`}
        onClick={() => handleSelect("he")}
        aria-pressed={language === "he"}
        aria-label={t.common.hebrew}
      >
        {t.common.hebrew}
      </button>
    </div>
  );
};
