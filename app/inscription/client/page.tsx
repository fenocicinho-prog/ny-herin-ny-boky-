"use client";

import { Header } from "@/components/layout/Header";
import { ClientRegisterForm } from "@/components/forms/ClientRegisterForm";
import { useLanguage } from "@/lib/LanguageContext";

export default function ClientRegisterPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-lg px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          {t("registerClient.title")}
        </h1>
        <p className="mb-8 text-center text-stone-500">
          {t("registerClient.subtitle")}
        </p>
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <ClientRegisterForm />
        </div>
      </main>
    </div>
  );
}
