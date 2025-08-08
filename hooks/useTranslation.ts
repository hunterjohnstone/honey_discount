'use client';

import { useLanguage } from '@/context/LanguageContext';
import enTranslations from '@/lib/locales/en.json';
import esTranslations from '@/lib/locales/es.json';

const translations = {
  en: enTranslations,
  es: esTranslations
};

export function useTranslation() {
  const { language } = useLanguage();  
  return (key: keyof typeof enTranslations) => translations[language][key] || key;
}