import { createContext, useContext, useEffect, useState } from "react";
import translationsData from "../data/translations.json";

type Language = "en" | "he";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translationsData.en;
}

export type Translations = LanguageContextType["t"];

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

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

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
