"use client";

import { Header } from "@/components/layout/Header";
import { SubscriptionPlans } from "@/components/forms/SubscriptionPlans";
import { useLanguage } from "@/lib/LanguageContext";

export default function VendorSubscriptionPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          {t("subscription.title")}
        </h1>
        <p className="mb-8 text-center text-stone-500">
          {t("subscription.subtitle")}
        </p>
        <SubscriptionPlans showFreePlan={false} />
      </main>
    </div>
  );
}
