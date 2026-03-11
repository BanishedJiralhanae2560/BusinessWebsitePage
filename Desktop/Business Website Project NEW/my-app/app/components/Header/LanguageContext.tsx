'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

/* ============================================================
   LanguageContext
   Shared language + translation state across all pages.
   Wrap your layout.tsx with <LanguageProvider> so every page
   (Header, ProductCatalog, CircuitBoards, etc.) reads from
   the same source of truth.
   ============================================================ */

interface LanguageContextValue {
  lang: string;
  setLang: (code: string) => void;
  t: Record<string, string>;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  t: {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState('en');
  const [t,    setT]    = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`http://localhost:5000/api/translations/${lang}`)
      .then(res => res.json())
      .then(data => setT(data.translations ?? {}))
      .catch(() => {});
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Use this hook in any component to get translations and set language */
export function useLanguage() {
  return useContext(LanguageContext);
}