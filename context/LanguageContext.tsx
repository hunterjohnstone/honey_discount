'use client';
import { createContext, useContext, useState } from 'react';

type LanguageContextType = {
  language: string;
  setLanguage: (lang: 'en' | 'es') => void;
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'es',
  setLanguage: () => {}
});

export function LanguageProvider({
  children,
  initialLanguage
}: {
  children: React.ReactNode;
  initialLanguage: string;
}) {
  const [language, setLanguage] = useState<'en' | 'es'>(initialLanguage as 'en' | 'es');

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);