"use client";

import { useState, useMemo } from "react";
import { useLanguage } from "@/lib/LanguageContext";
import { SubmitMvolaProofForm } from "@/components/forms/submit-form";
import {
  Smartphone, Send, Hash, Wallet, Lock, MessageSquare,
  ShieldCheck, Copy, Check, CheckCircle, Clock, PhoneCall,
} from "lucide-react";
import { detectOperator, buildUssdLink, operatorLabel, operatorTheme } from "@/lib/mobile-operator";

interface OrderLineItem {
  title: string;
  quantity: number;
  price: number;
}

interface MvolaPaymentContentProps {
  orderId: string;
  bookTitle?: string;
  items?: OrderLineItem[];
  amount: number;
  sellerMvolaNumber: string;
  clientPhoneNumber?: string;
}

export function MvolaPaymentContent({
  orderId,
  bookTitle,
  items,
  amount,
  sellerMvolaNumber,
  clientPhoneNumber,
}: MvolaPaymentContentProps) {
  const { t } = useLanguage();
  const [copiedField, setCopiedField] = useState<"amount" | "number" | null>(null);

  const safeAmount = Number(amount) || 0;

  const lineItems: OrderLineItem[] = items?.length
    ? items
    : [{ title: bookTitle ?? "Commande", quantity: 1, price: safeAmount }];

  const operator = useMemo(
    () => (clientPhoneNumber ? detectOperator(clientPhoneNumber) : "UNKNOWN"),
    [clientPhoneNumber]
  );
  const theme = operatorTheme(operator);
  const ussdLink = clientPhoneNumber ? buildUssdLink(operator, sellerMvolaNumber, safeAmount) : null;

  async function handleCopy(value: string, field: "amount" | "number") {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // presse-papiers indisponible — on ignore silencieusement
    }
  }

  const steps = [
    { icon: Smartphone, content: t("payment.mvolaStep1") },
    { icon: Send, content: t("payment.mvolaStep2") },
    { icon: Hash, content: t("payment.mvolaStep3") },
    {
      icon: Wallet,
      content: (
        <>
          {t("payment.mvolaStep4")}:{" "}
          <strong className="font-semibold text-stone-900">
            {safeAmount.toLocaleString("fr-FR")} Ar
          </strong>
        </>
      ),
    },
    { icon: Lock, content: t("payment.mvolaStep5") },
    { icon: MessageSquare, content: t("payment.mvolaStep6") },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50 px-4 py-10 sm:py-14">
      <div className="mx-auto max-w-md">

        {/* Indicateur de progression */}
        <div className="mb-6 flex items-center justify-center gap-2 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-emerald-600">
            <CheckCircle className="h-3.5 w-3.5" />
            {t("payment.mvolaStepOrder")}
          </span>
          <span className="h-px w-6 bg-stone-300" />
          <span className="flex items-center gap-1.5 text-amber-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full motion-safe:animate-ping rounded-full bg-amber-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
            </span>
            {t("payment.mvolaStepPay")}
          </span>
          <span className="h-px w-6 bg-stone-300" />
          <span className="flex items-center gap-1.5 text-stone-400">
            <Clock className="h-3.5 w-3.5" />
            {t("payment.mvolaStepVerify")}
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-amber-100 bg-white shadow-xl shadow-amber-900/5">

          {/* Bandeau montant */}
          <div className="relative overflow-hidden bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 px-6 py-9 text-center text-white">
            <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-10 -left-10 h-36 w-36 rounded-full bg-white/5" />

            <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/10">
              <Smartphone className="h-5 w-5" />
            </div>

            <p className="relative text-xs font-medium uppercase tracking-widest text-amber-100">
              {t("payment.mvolaAmount")}
            </p>

            <div className="relative mt-1 flex items-center justify-center gap-2">
              <p className="text-4xl font-extrabold tracking-tight">
                {safeAmount.toLocaleString("fr-FR")}{" "}
                <span className="text-lg font-semibold text-amber-100">Ar</span>
              </p>
              <button
                onClick={() => handleCopy(String(safeAmount), "amount")}
                aria-label="Copier le montant"
                className="rounded-full bg-white/10 p-1.5 transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                {copiedField === "amount" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <div className="relative mt-2 space-y-0.5">
              {lineItems.map((li, i) => (
                <p key={i} className="truncate text-sm text-amber-100/90">
                  {li.quantity > 1 ? `${li.quantity}× ` : ""}{li.title}
                </p>
              ))}
            </div>
          </div>

          {/* Numéro destinataire — chip copiable */}
          <div className="border-b border-stone-100 px-6 py-5">
            <button
              onClick={() => handleCopy(sellerMvolaNumber, "number")}
              className="group flex w-full items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-left transition hover:border-amber-300 hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                  {t("payment.mvolaNumber")}
                </p>
                <p className="font-mono text-base font-bold text-stone-900">{sellerMvolaNumber}</p>
              </div>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-stone-400 shadow-sm transition group-hover:text-amber-700">
                {copiedField === "number" ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </span>
            </button>
          </div>

          {/* Bouton d'appel automatique — détecte l'opérateur du client */}
          {ussdLink && (
            <div className="px-6 pt-5">
              <a
                href={ussdLink}
                className={`flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r ${theme.from} ${theme.to} px-4 py-3.5 text-sm font-semibold text-white shadow-md transition active:scale-[0.98]`}
              >
                <PhoneCall className="h-4 w-4" />
                Payer maintenant avec {operatorLabel(operator)}
              </a>
              {operator === "UNKNOWN" && (
                <p className="mt-2 text-center text-xs text-stone-400">
                  Opérateur non reconnu — compose le code manuellement ci-dessous.
                </p>
              )}
            </div>
          )}

          {/* Instructions manuelles */}
          <div className="px-6 py-6">
            <h2 className="mb-4 text-sm font-semibold text-stone-800">
              {t("payment.mvolaInstructions")}
            </h2>
            <div className="relative space-y-5">
              <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-amber-200 via-amber-200 to-transparent" />
              {steps.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div key={i} className="relative flex gap-4">
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-200 bg-white text-amber-700 shadow-sm">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 pt-2.5 text-sm text-stone-600">{step.content}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2.5 border-t border-stone-100 bg-stone-50/80 px-6 py-4">
            <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs text-stone-500">{t("payment.mvolaTrustNote")}</p>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border-2 border-dashed border-amber-300 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <CheckCircle className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-stone-900">{t("payment.mvolaFinalStep")}</h2>
          </div>
          <SubmitMvolaProofForm orderId={orderId} />
        </div>
      </div>
    </div>
  );
}

export default MvolaPaymentContent;