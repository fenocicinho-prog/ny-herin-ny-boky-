// lib/constants.ts
import type { BookCategory } from "@prisma/client";

// 1. Liste brute des catégories (pour les boucles et la logique)
export const CATEGORY_LIST: BookCategory[] = [
  "BUSINESS_ENTREPRENEURIAT", "DEVELOPPEMENT_PERSONNEL", "PSYCHOLOGIE", "FINANCE_INVESTISSEMENT", "MARKETING_VENTE", "COMMUNICATION_LEADERSHIP", "BOKY_MALAGASY", "SCIENCE_TECHNOLOGIE", "ROMANS", "THRILLER_SUSPENSE", "AUTRE"
];

// 2. Clés de traduction pour les raisons (pas de texte en dur)
export const REASON_KEYS = [
  "reasons.study",
  "reasons.search_mg",
  "reasons.leisure",
  "reasons.research",
  "reasons.other"
] as const;

// 3. Clés de traduction pour les types de livres
export const BOOK_TYPE_KEYS = [
  "bookTypes.science",
  "bookTypes.malagasy",
  "bookTypes.literature",
  "bookTypes.history",
  "bookTypes.contemporary",
  "bookTypes.movie"
] as const;

// 4. Clé pour le nom du site
export const SITE_NAME = "Ny herin'ny boky";

// Nom de l'application — alias attendu par plusieurs composants
export const APP_NAME = SITE_NAME;

// 5. Constantes techniques (inchangées)
export const MOBILE_MONEY_PHONE =
  process.env.NEXT_PUBLIC_MOBILE_MONEY_PHONE ||
  process.env.MOBILE_MONEY_PHONE ||
  "+261 34 00 000 00";

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 0,
  }).format(price);   