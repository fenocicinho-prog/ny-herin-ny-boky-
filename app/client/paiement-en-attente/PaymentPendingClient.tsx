"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, Package } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type PendingOrderItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
};

interface PaymentPendingClientProps {
  orderId: string;
  amount: number;
  clientTrxRef: string;
  mvolaStatus: string;
  paymentStatus: string;
  items: PendingOrderItem[];
}

export function PaymentPendingClient({
  orderId,
  amount,
  clientTrxRef,
  mvolaStatus,
  paymentStatus,
  items,
}: PaymentPendingClientProps) {
  const { t } = useLanguage();
  const isCompleted = paymentStatus === "COMPLETED";
  const statusLabel = isCompleted
    ? t("payment.pendingConfirmed")
    : mvolaStatus === "EN_ATTENTE_VERIFICATION"
      ? t("payment.pendingVerification")
      : t("payment.pendingTitle");

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="text-center">
          <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {isCompleted ? <CheckCircle2 className="h-8 w-8" aria-hidden="true" /> : <Clock3 className="h-8 w-8" aria-hidden="true" />}
          </div>
          <h1 className="mt-5 text-2xl font-black text-stone-950">{statusLabel}</h1>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            {isCompleted
              ? "Votre paiement a été confirmé. Voici le contenu de votre commande."
              : "Votre référence a été reçue et votre paiement est en attente de vérification."}
          </p>
        </div>

        <section className="mt-8 rounded-2xl border border-stone-200">
          <div className="flex items-center gap-2 border-b border-stone-200 px-4 py-3">
            <Package className="h-5 w-5 text-amber-700" aria-hidden="true" />
            <h2 className="font-bold text-stone-900">Livres de la commande</h2>
          </div>
          <div className="divide-y divide-stone-100">
            {items.length === 0 ? (
              <p className="p-4 text-sm text-stone-500">Aucun livre associé à cette commande.</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 px-4 py-4">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-900">{item.title}</p>
                    <p className="mt-1 text-sm text-stone-500">Quantité: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-amber-700">
                    {(item.price * item.quantity).toLocaleString("fr-FR")} Ar
                  </p>
                </div>
              ))
            )}
          </div>
        </section>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Montant total</p>
            <p className="mt-1 text-lg font-black text-stone-950">{amount.toLocaleString("fr-FR")} Ar</p>
          </div>
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Référence</p>
            <p className="mt-1 break-all font-mono text-sm font-bold text-stone-950">{clientTrxRef}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/client/commande/${orderId}`}
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-stone-300 px-4 py-3 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
          >
            {t("payment.pendingOrderDetails")}
          </Link>
          <Link
            href="/client"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800"
          >
            {t("payment.pendingDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
