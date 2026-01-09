import { useEffect, useState } from "react";
import translationsData from "../data/translations.json";
import type { Language } from "../types/formTypes";
import { LanguageContext } from "./useLanguage";

interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider = ({
  children,
  defaultLanguage = "en",
}: LanguageProviderProps) => {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    document.documentElement.setAttribute(
      "dir",
      language === "he" ? "rtl" : "ltr"
    );
  }, [language]);

  const t = translationsData[language] as typeof translationsData.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
