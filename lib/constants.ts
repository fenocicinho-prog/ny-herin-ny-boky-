import type { BookCategory } from "@prisma/client";

export const CATEGORY_LABELS: Record<BookCategory, string> = {
  SCIENCE: "Siansa",
  MALAGASY: "Malagasy",
  LITTERATURE: "Literatiora",
  HISTOIRE: "Tantara",
  AUTRE: "Hafa",
};

export const CATEGORY_LIST: BookCategory[] = [
  "SCIENCE",
  "MALAGASY",
  "LITTERATURE",
  "HISTOIRE",
  "AUTRE",
];

export const SITE_NAME = "Ny herin'ny boky";

export const APP_NAME = SITE_NAME;
export const ALL_CATEGORIES = CATEGORY_LIST;

export const MOBILE_MONEY_PHONE =
  process.env.NEXT_PUBLIC_MOBILE_MONEY_PHONE ||
  process.env.MOBILE_MONEY_PHONE ||
  "+261 34 00 000 00";

export const REASON_OPTIONS = [
  "Mianatra sy mihajam-boky",
  "Mitady boky malagasy",
  "Mamaky amin'ny fialamboly",
  "Fianarana sy fikarohana",
  "Hafa",
];

export const BOOK_TYPE_OPTIONS = [
  "Siansa",
  "Malagasy",
  "Literatiora",
  "Tantara",
  "Ankehitriny",
  "An-tSarimihetsika",
];

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("fr-MG", {
    style: "currency",
    currency: "MGA",
    minimumFractionDigits: 0,
  }).format(price);
