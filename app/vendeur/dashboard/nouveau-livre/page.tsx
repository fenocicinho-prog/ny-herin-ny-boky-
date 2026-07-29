"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AddBookForm } from "@/components/forms/AddBookForm";
import { useLanguage } from "@/lib/LanguageContext";

export default function VendorBooksPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          {t("vendorDashboard.addBook")}
        </h1>
        <p className="mb-8 text-center text-stone-500">
          {t("book.submit")}
        </p>

        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <AddBookForm />
        </div>

        <p className="mt-6 text-center">
          <Link
            href="/vendeur/dashboard"
            className="text-sm text-amber-700 hover:underline"
          >
            {t("payment.pendingDashboard")} →
          </Link>
        </p>
      </main>
    </div>
  );
}
