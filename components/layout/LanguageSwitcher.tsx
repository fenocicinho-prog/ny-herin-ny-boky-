// components/layout/LanguageSwitcher.tsx
"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { Globe } from "lucide-react";
import { useSyncExternalStore } from "react";

// Fonction pour s'abonner aux changements (si votre contexte le supporte)
// Sinon, on utilise une astuce simple avec useState initialisé à une valeur par défaut sûre
// et un effet qui ne fait PAS de setState synchrone inutile.

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  
  // Astuce : Utiliser useSyncExternalStore pour lire une valeur qui peut changer
  // ou simplement accepter que le premier rendu soit basé sur la valeur par défaut du contexte
  // Le problème vient du fait que le serveur ne connaît pas le localStorage.
  
  // Solution la plus robuste sans effet "interdit" :
  // Rendre le composant uniquement côté client en utilisant un wrapper ou
  // accepter que le texte soit basé sur la valeur par défaut du contexte (qui est "mg").
  
  // Si votre contexte retourne "mg" par défaut sur le serveur ET le client (avant lecture localStorage),
  // il n'y a pas de mismatch. Le mismatch vient si le client lit "fr" du localStorage IMMÉDIATEMENT.
  
  // Pour éviter l'effet "interdit", on peut utiliser un état initialisé à la valeur du contexte
  // et laisser le contexte gérer la mise à jour asynchrone.
  
  // Si l'erreur persiste, c'est que le contexte lui-même change de valeur entre le rendu serveur et client.
  // La vraie solution est de ne PAS lire le localStorage dans le rendu initial du contexte,
  // mais dans un useEffect DU PROVIDER, pas du composant.
  
  // Voici le code simplifié qui devrait fonctionner sans avertissement si le Provider est bien fait :
  return (
    <button
      onClick={() => setLang(lang === "mg" ? "fr" : "mg")}
      className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 hover:bg-stone-50"
      title={lang === "mg" ? "Basculer en Malagasy" : "Switch to French"}
    >
      <Globe className="h-3.5 w-3.5" />
      <span>{lang === "mg" ? "FR" : "MG"}</span>
    </button>
  );
}   