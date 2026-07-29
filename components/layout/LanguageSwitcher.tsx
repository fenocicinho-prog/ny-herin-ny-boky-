"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === "mg" ? "fr" : "mg")}
      className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm hover:bg-stone-50 hover:border-amber-300 transition-colors"
      title={lang === "mg" ? "Switch to French" : "Basculer en Malagasy"}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{lang === "mg" ? "FR" : "MG"}</span>
    </button>
  );
}
