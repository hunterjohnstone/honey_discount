'use client';

import { useLanguage } from '@/context/LanguageContext';
import enTranslations from '@/lib/locales/en.json';
import esTranslations from '@/lib/locales/es.json';

type SupportedLanguage = 'en' | 'es';

type Translations = {
  [key in SupportedLanguage]: typeof enTranslations;
};

const translations: Translations = {
  en: enTranslations,
  es: esTranslations
};

export function useTranslation() {
  const { language } = useLanguage();
  
  return (key: keyof typeof enTranslations) => {
    const lang = language as SupportedLanguage;
    return translations[lang][key] || key;
  };
}