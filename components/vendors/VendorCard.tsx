"use client";

import { MapPin, BookOpen } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface VendorCardProps {
  id: string;
  companyName: string | null;
  location: string | null;
  bookCount: number;
}

export function VendorCard({
  companyName,
  location,
  bookCount,
}: VendorCardProps) {
  const { t } = useLanguage();

  return (
    <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-amber-100">
        <BookOpen className="h-7 w-7 text-amber-700" />
      </div>
      <h3 className="font-semibold text-stone-900" translate="no">
        {companyName || t("nav.vendor")}
      </h3>
      {location && (
        <p className="mt-1 flex items-center gap-1 text-sm text-stone-500">
          <MapPin className="h-3.5 w-3.5" />
          {location}
        </p>
      )}
      <p className="mt-3 text-sm font-medium text-amber-700">
        {bookCount} {t("book.title")}
      </p>
    </div>
  );
}
