"use client";

import { Header } from "@/components/layout/Header";
import { VendorRegisterForm } from "@/components/forms/VendorRegisterForm";
import { useLanguage } from "@/lib/LanguageContext";

export default function VendorRegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-16">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-amber-700">
          <span className="rounded-full bg-amber-700 px-3 py-1 text-white">
            1
          </span>
          <span className="text-stone-400">→</span>
          <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-500">
            2
          </span>
          <span className="text-stone-400">→</span>
          <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-500">
            3
          </span>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          {t("registerVendor.title")}
        </h1>
        <p className="mb-8 text-center text-stone-500">
          {t("registerVendor.subtitle")}
        </p>
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <VendorRegisterForm />
        </div>
      </main>
    </div>
  );
}
