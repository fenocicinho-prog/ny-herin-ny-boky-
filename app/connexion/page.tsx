"use client";

import { Header } from "@/components/layout/Header";
import { LoginForm } from "@/components/forms/LoginForm";
import { useLanguage } from "@/lib/LanguageContext";

export default function LoginPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          {t("login.title")}
        </h1>
        <p className="mb-8 text-center text-stone-500">
          {t("login.subtitle")}
        </p>
        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <LoginForm />
        </div>
      </main>
    </div>
  );
}
