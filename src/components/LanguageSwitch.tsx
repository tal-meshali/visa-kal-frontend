import { useLanguage } from "../contexts/useLanguage";
import type { Language } from "../types/formTypes";
import "./LanguageSwitch.css";

export const LanguageSwitch = (): React.JSX.Element => {
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = (lang: Language): void => {
    if (lang !== language) {
      setLanguage(lang);
    }
  };

  return (
    <>
      <div
        className="language-switch language-switch-desktop"
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
      <button
        type="button"
        className="language-switch language-switch-mobile"
        onClick={() => handleSelect(language === "en" ? "he" : "en")}
        aria-label={
          language === "en"
            ? `${t.common.hebrew} (${t.common.english} selected)`
            : `${t.common.english} (${t.common.hebrew} selected)`
        }
        title={
          language === "en"
            ? `${t.common.hebrew} (${t.common.english} selected)`
            : `${t.common.english} (${t.common.hebrew} selected)`
        }
      >
        <img
          src={language === "en" ? "/flags/gb.svg" : "/flags/il.svg"}
          alt=""
          width={24}
          height={18}
        />
      </button>
    </>
  );
};
