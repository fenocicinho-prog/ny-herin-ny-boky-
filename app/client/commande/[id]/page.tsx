"use client";

import Link from "next/link";
import { useLanguage } from "@/lib/LanguageContext";

interface OrderContentProps {
  orderId: string;
  bookTitle: string;
  amount: number;
  mobileMoneyPhone: string;
  reference: string;
  paymentStatus: string;
}

export function OrderConfirmationContent({
  orderId,
  bookTitle,
  amount,
  mobileMoneyPhone,
  reference,
  paymentStatus,
}: OrderContentProps) {
  const { t } = useLanguage();

  // Si la commande est déjà payée
  if (paymentStatus === "COMPLETED") {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-stone-900">{t("order.paymentConfirmed")}</h1>
          <p className="mt-2 text-sm text-stone-500">{bookTitle}</p>
          <p className="mt-4 text-sm text-green-700">{t("order.paymentVerified")}</p>
          <Link href="/client" className="mt-6 block text-center text-sm text-amber-700 hover:underline">
            {t("order.backDashboard")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-stone-900">{t("order.title")}</h1>
        <p className="mt-2 text-sm text-stone-500">{bookTitle}</p>

        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">{t("order.mvola")}</p>
          <p className="mt-2">{t("order.sendTo")}: <strong>{mobileMoneyPhone}</strong></p>
          <p className="mt-1">{t("order.amount")}: <strong>{amount.toLocaleString("fr-FR")} Ar</strong></p>
          <p className="mt-1">{t("order.reference")}: <strong>{reference}</strong></p>
        </div>

        <p className="mt-4 text-xs text-stone-500">
          {t("order.enterRef")}
          <br />
          {t("order.adminWillVerify")}
        </p>

        <Link 
          href={`/client/paiement-mvola/${orderId}`}
          className="mt-6 block w-full text-center rounded-xl bg-amber-700 py-3 font-medium text-white hover:bg-amber-800"
        >
          {t("order.enterMvolaRef")}
        </Link>

        <Link href="/client" className="mt-4 block text-center text-sm text-amber-700 hover:underline">
          {t("order.backDashboard")}
        </Link>
      </div>
    </div>
  );
}
