"use client";

import type { BookCategory } from "@prisma/client";
import Link from "next/link";
import { CATEGORY_LIST } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

interface CategoryFilterProps {
  activeCategory?: string;
  basePath?: string;
  searchQuery?: string;
}

export function CategoryFilter({
  activeCategory = "ALL",
  basePath = "",
  searchQuery = "",
}: CategoryFilterProps) {
  const { t } = useLanguage();
  const buildHref = (category: string) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (category !== "ALL") params.set("category", category);
    const qs = params.toString();
    return `${basePath}${qs ? `?${qs}` : ""}`;
  };

// Supposons que CATEGORY_LIST contient les clés brutes : ["Fiction", "NonFiction", ...]
const categories: { value: string; label: string }[] = [
  { value: "ALL", label: t("search.all") },
  
  // Correction : Appel de t() directement ici
  ...CATEGORY_LIST.map((c: BookCategory) => ({
    value: c,
    // Construit la clé dynamique et la traduit immédiatement
    label: t(`categories.${c}`), 
  })),
];   

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((cat) => (
        <Link
          key={cat.value}
          href={buildHref(cat.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            activeCategory === cat.value
              ? "bg-amber-700 text-white"
              : "bg-white text-stone-600 ring-1 ring-amber-200 hover:bg-amber-50"
          }`}
        >
          {cat.label}
        </Link>
      ))}
    </div>
  );
}
