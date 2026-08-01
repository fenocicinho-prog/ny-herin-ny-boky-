"use client";

import { createContext, useContext, useCallback, type ReactNode } from "react";
import { useSyncExternalStore } from "react"; // Hook spécialisé pour les stores externes
import { translations, type Lang } from "./translations";
import { translationsFr } from "./translations-fr";

const STORAGE_KEY = "nyherinnyboky_lang";

// --- Logique du Store Externe (LocalStorage) ---

// Fonction pour s'abonner aux changements (écoute l'événement 'storage')
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  // Nettoyage : on écoute aussi les changements faits manuellement dans le même onglet via un événement personnalisé
  const handleCustomChange = () => callback();
  window.addEventListener("nyherinnyboky_lang_change", handleCustomChange);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("nyherinnyboky_lang_change", handleCustomChange);
  };
}

// Fonction pour lire la valeur actuelle (Snapshot)
function getSnapshot(): Lang {
  if (typeof window === "undefined") return "mg"; // Valeur par défaut serveur
  const stored = localStorage.getItem(STORAGE_KEY);
  return (stored === "fr" || stored === "mg") ? stored : "mg";
}

// --- Contexte ---

type LanguageContextType = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: keyof typeof translations) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 1. Utiliser useSyncExternalStore pour lire la langue
  // Cela remplace useState + useEffect et élimine l'avertissement
  const lang = useSyncExternalStore(subscribe, getSnapshot, () => "mg");

  // 2. Fonction pour mettre à jour la langue
  const setLang = useCallback((newLang: Lang) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, newLang);
      // Déclencher un événement pour notifier le store (car 'storage' ne se déclenche pas sur le même onglet)
      window.dispatchEvent(new Event("nyherinnyboky_lang_change"));
    }
  }, []);

  // 3. Fonction de traduction (inchangée)
  const t = useCallback(
    (key: keyof typeof translations): string => {
      if (lang === "fr") {
        return translationsFr[key] || translations[key] || key;
      }
      return translations[key] || key;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage doit être utilisé dans un LanguageProvider");
  }
  return context;
}   