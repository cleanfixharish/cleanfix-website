import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, getDirection } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations.en;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('cleanfix-lang');
    return (saved === 'he' || saved === 'en') ? saved : 'en';
  });

  useEffect(() => {
    localStorage.setItem('cleanfix-lang', lang);
    document.documentElement.setAttribute('dir', getDirection(lang));
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const value: LanguageContextType = {
    lang,
    setLang,
    t: translations[lang],
    dir: getDirection(lang),
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};