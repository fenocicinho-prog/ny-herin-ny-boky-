"use client";

import Link from "next/link";
import { Store, UserPlus, LogIn } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { SearchBarWrapper } from "@/components/layout/SearchBarWrapper";
import { BookGrid } from "@/components/books/BookGrid";
import { VendorCard } from "@/components/vendors/VendorCard";
import { useLanguage } from "@/lib/LanguageContext";
import { SITE_NAME } from "@/lib/constants";

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-20 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/60 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-amber-900 sm:text-6xl" translate="no">
            {SITE_NAME}
          </h1>
          <p className="mt-4 text-lg text-stone-600 sm:text-xl">
            {t("home.hero.subtitle")}
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBarWrapper placeholder={t("header.searchPlaceholder")} />
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/connexion"
              className="flex items-center gap-2 rounded-xl bg-amber-700 px-6 py-3 font-medium text-white shadow-lg shadow-amber-200 hover:bg-amber-800"
            >
              <LogIn className="h-5 w-5" />
              {t("nav.login")}
            </Link>
            <Link
              href="/inscription/client"
              className="flex items-center gap-2 rounded-xl border-2 border-amber-700 px-6 py-3 font-medium text-amber-800 hover:bg-amber-50"
            >
              <UserPlus className="h-5 w-5" />
              {t("login.registerClient")}
            </Link>
            <Link
              href="/inscription/vendeur"
              className="flex items-center gap-2 rounded-xl border-2 border-stone-300 px-6 py-3 font-medium text-stone-700 hover:bg-stone-50"
            >
              <Store className="h-5 w-5" />
              {t("login.registerVendor")}
            </Link>
          </div>
        </div>
      </section>

      {/* Top books */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-stone-900">
          {t("home.section.books")}
        </h2>
        <BookGrid books={[]} />
      </section>

      {/* Vendors */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-stone-900">
          {t("home.section.vendors")}
        </h2>
        <p className="text-stone-500">{t("home.section.vendors")} — miandry...</p>
      </section>

      <footer className="border-t border-amber-100 bg-white py-8 text-center text-sm text-stone-500">
        © 2026 <span translate="no">{SITE_NAME}</span> — {t("home.footer.description")}
      </footer>
    </div>
  );
}
