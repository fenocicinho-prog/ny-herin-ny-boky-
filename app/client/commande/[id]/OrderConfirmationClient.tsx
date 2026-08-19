"use client";

import Link from "next/link";
import { CheckCircle2, Clock3, PackageCheck } from "lucide-react";
import { useLanguage } from "@/lib/LanguageContext";

type OrderItem = {
  id: string;
  title: string;
  quantity: number;
  price: number;
};

interface OrderConfirmationClientProps {
  orderId: string;
  amount: number;
  reference: string;
  paymentStatus: string;
  paymentMethod: string;
  deliveryStatus: string;
  items: OrderItem[];
}

export function OrderConfirmationClient({
  orderId,
  amount,
  reference,
  paymentStatus,
  paymentMethod,
  deliveryStatus,
  items,
}: OrderConfirmationClientProps) {
  const { t } = useLanguage();
  const isCompleted = paymentStatus === "COMPLETED";
  const isMobileMoney = paymentMethod === "MOBILE_MONEY" || paymentMethod === "MVOLA";

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
          <div className="flex flex-col gap-4 border-b border-stone-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                {isCompleted ? <CheckCircle2 className="h-6 w-6" aria-hidden="true" /> : <Clock3 className="h-6 w-6" aria-hidden="true" />}
              </div>
              <div>
                <h1 className="text-xl font-black text-stone-950 sm:text-2xl">
                  {isCompleted ? t("order.paymentConfirmed") : t("order.title")}
                </h1>
                <p className="mt-1 text-sm text-stone-500">Commande #{orderId}</p>
              </div>
            </div>
            <span className={`inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-bold ${isCompleted ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"}`}>
              {paymentStatus}
            </span>
          </div>

          <section className="mt-6">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-amber-700" aria-hidden="true" />
              <h2 className="font-bold text-stone-900">Livres de la commande</h2>
            </div>
            <div className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200">
              {items.length === 0 ? (
                <p className="p-4 text-sm text-stone-500">Aucun livre associé à cette commande.</p>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 p-4">
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

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Total</p>
              <p className="mt-1 text-lg font-black text-stone-950">{amount.toLocaleString("fr-FR")} Ar</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Référence</p>
              <p className="mt-1 break-all font-mono text-sm font-bold text-stone-950">{reference}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Livraison</p>
              <p className="mt-1 text-sm font-bold text-stone-950">{deliveryStatus}</p>
            </div>
          </div>

          {!isCompleted && isMobileMoney ? (
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              Votre paiement Mobile Money est en attente de vérification par l&apos;administrateur.
              <Link href={`/client/paiement-mvola/${orderId}`} className="mt-2 block font-bold underline underline-offset-2">
                Ajouter ou vérifier la référence de transaction
              </Link>
            </div>
          ) : null}

          <Link href="/client" className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-amber-800 sm:w-auto">
            {t("order.backDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
