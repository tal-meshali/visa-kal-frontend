import { createContext, useContext } from "react";
import translationsData from "../data/translations.json";
import type { Language } from "../types/formTypes";

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translationsData.en;
}

export type Translations = LanguageContextType["t"];

export const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
