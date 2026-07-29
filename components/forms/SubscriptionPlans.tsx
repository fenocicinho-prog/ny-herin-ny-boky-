"use client";

import { Check } from "lucide-react";
import {
  activateFreeSubscriptionAction,
  createSubscriptionCheckoutAction,
  skipSubscriptionForDevAction,
} from "@/app/actions/books";
import { SUBSCRIPTION_PLANS } from "@/lib/stripe-server";
import { formatPrice } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

interface Props { 
  showFreePlan?: boolean
}

export function SubscriptionPlans({ showFreePlan = true }: Props) {
  const { t } = useLanguage();
  const plans = [ ...(showFreePlan ? [
    { key: "FREE" as const, ...SUBSCRIPTION_PLANS.FREE }] : []),
    { key: "TWENTY_BOOKS" as const, ...SUBSCRIPTION_PLANS.TWENTY_BOOKS },
    { key: "UNLIMITED" as const, ...SUBSCRIPTION_PLANS.UNLIMITED },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.key}
          className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm"
        >
          <h3 className="text-xl font-bold text-stone-900">{plan.name}</h3>
          <p className="mt-2 text-3xl font-bold text-amber-700">
            {formatPrice(plan.price)}
            <span className="text-sm font-normal text-stone-500">/volana</span>
          </p>
          <p className="mt-3 text-sm text-stone-600">{plan.description}</p>
          <ul className="mt-4 space-y-2 text-sm text-stone-600">
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-amber-600" />
              {plan.key === 'FREE' && (
                <div className="mb-2 w-fit rounded-full bg-green-100 px-2 py-1 text-xs font-bold text-green-800">
                  {t("subscription.free")}
                </div>
              )}
              {plan.key === 'TWENTY_BOOKS' && (
                <div className="mb-2 w-fit rounded-full bg-amber-500 px-2 py-1 text-xs font-bold text-white">
                  {t("subscription.twentyBooks")}
                </div>
              )}
              {plan.key === 'UNLIMITED' && (
                <div className="mb-2 w-fit rounded-full bg-red-800 px-2 py-1 text-xs font-bold text-white">
                  {t("subscription.unlimited")}
                </div>
              )}
            </li>
            <li className="flex items-center gap-2">
              <Check className="h-4 w-4 text-amber-600" />
              {t("vendorDashboard.subscription")}
            </li>
          </ul>
          <div className="mt-6 space-y-2">
            {plan.key === "FREE" ? (
              <form action={activateFreeSubscriptionAction}>
                <button type="submit" className="w-full rounded-lg border border-stone-200 py-2 text-sm text-stone-500 hover:bg-stone-50">
                  {t("subscription.freeBtn")}
                </button>
              </form>
            ) : (
              <>
              <form action={createSubscriptionCheckoutAction.bind(null, plan.key)}>
                <button
                  type="submit"
                  className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800"
                >
                  {t("subscription.subscribe")}
                </button>
              </form>
              <form action={skipSubscriptionForDevAction.bind(null, plan.key)}>
                <button
                  type="submit"
                  className="w-full rounded-lg border border-stone-200 py-2 text-sm text-stone-500 hover:bg-stone-50"
                >
                  (Dev) {t("subscription.payment")}
                </button>
              </form>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
