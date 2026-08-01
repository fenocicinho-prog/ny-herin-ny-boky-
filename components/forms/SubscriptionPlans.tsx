"use client";

import { Check } from "lucide-react";
import {
  activateFreeSubscriptionAction,
  createSubscriptionCheckoutAction,
} from "@/app/actions/books";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe-server";
import { formatPrice } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

interface Props { 
  showFreePlan?: boolean
}

export function SubscriptionPlans({ showFreePlan = true }: Props) {
  const { t } = useLanguage();

  // Construction du tableau de plans en mélangeant config et clés de traduction
  const plans = [
    ...(showFreePlan ? [{ key: "FREE" as const, ...SUBSCRIPTION_PLANS.FREE }] : []),
    { key: "TWENTY_BOOKS" as const, ...SUBSCRIPTION_PLANS.TWENTY_BOOKS },
    { key: "UNLIMITED" as const, ...SUBSCRIPTION_PLANS.UNLIMITED },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.key}
          className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm flex flex-col"
        >
          {/* Nom du plan traduit */}
          <h3 className="text-xl font-bold text-stone-900">
            {t(plan.nameKey as any)}
          </h3>

          {/* Prix */}
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {formatPrice(plan.price)}
            <span className="text-sm font-normal text-stone-500">
              /{t("subscription.month")}
            </span>
          </p>

          {/* Description traduite */}
          <p className="mt-3 text-sm text-stone-600">
            {t(plan.descriptionKey as any)}
          </p>

          <ul className="mt-4 space-y-2 text-sm text-stone-600 flex-1">
            {/* Badge du plan */}
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-amber-600" />
              {plan.key === 'FREE' && (
                <div className="w-fit rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                  {t("subscription.free")}
                </div>
              )}
              {plan.key === 'TWENTY_BOOKS' && (
                <div className="w-fit rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white">
                  {t("subscription.twentyBooks")}
                </div>
              )}
              {plan.key === 'UNLIMITED' && (
                <div className="w-fit rounded-full bg-red-800 px-2 py-1 text-xs font-bold text-white">
                  {t("subscription.unlimited")}
                </div>
              )}
            </li>
            
            {/* Feature générique traduite */}
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-amber-600" />
              {t("vendorDashboard.subscription")}
            </li>
          </ul>

          <div className="mt-6 space-y-2">
            {plan.key === "FREE" ? (
              <form action={activateFreeSubscriptionAction}>
                <button 
                  type="submit" 
                  className="w-full rounded-lg border border-stone-200 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50"
                >
                  {t("subscription.freeBtn")}
                </button>
              </form>
            ) : (
              <form action={createSubscriptionCheckoutAction.bind(null, plan.key)}>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 transition-colors"
                >
                  {t("subscription.subscribe")}
                </button>
              </form>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}   