"use client";

import { Store, MapPin, TrendingUp, BookMarked } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

interface VendorSidebarProps {
  companyName?: string | null;
  email: string;
  location?: string | null;
  sold: number;
  borrowed: number;
  bookCount: number;
}

export function VendorSidebar({
  companyName,
  email,
  location,
  sold,
  borrowed,
  bookCount,
}: VendorSidebarProps) {
  const { t } = useLanguage();

  return (
    <aside className="flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
          <Store className="h-7 w-7" />
        </div>
        <div>
          <h2 className="font-semibold text-stone-900">{companyName}</h2>
          <p className="text-sm text-stone-500">{email}</p>
        </div>
      </div>

      {location && (
        <div className="flex items-start gap-2 text-sm text-stone-600">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <span>{location}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3">
          <TrendingUp className="h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-2xl font-bold text-emerald-800">{sold}</p>
            <p className="text-xs text-emerald-600">{t("vendorDashboard.sold")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
          <BookMarked className="h-5 w-5 text-blue-600" />
          <div>
            <p className="text-2xl font-bold text-blue-800">{borrowed}</p>
            <p className="text-xs text-blue-600">{t("vendorDashboard.borrowed")}</p>
          </div>
        </div>
        <div className="rounded-lg bg-stone-50 p-3 text-center">
          <p className="text-lg font-semibold text-stone-800">{bookCount}</p>
          <p className="text-xs text-stone-500">{t("vendorProfile.books")}</p>
        </div>
      </div>
    </aside>
  );
}
