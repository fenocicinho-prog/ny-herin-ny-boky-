"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerVendorStep1Action } from "@/app/actions/auth";
import { useLanguage } from "@/lib/LanguageContext";

export function VendorRegisterForm() {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await registerVendorStep1Action(formData)) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("registerVendor.companyName")}
        </label>
        <input
          name="companyName"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("registerVendor.email")}
        </label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("registerVendor.password")}
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("registerVendor.location")}
        </label>
        <input
          name="location"
          required
          placeholder="Antananarivo..."
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("registerVendor.postalCode")}
        </label>
        <input
          name="postalCode"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>
       <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("registerVendor.number")}
        </label>
        <input
          name="mvolaNumber"
          type="tel"
          placeholder="034 xx xxx xx"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      {/* --- NOUVEAU : CHOIX DU MODÈLE ÉCONOMIQUE --- */}
      <div className="pt-4 border-t border-stone-200">
        <label className="block text-sm font-bold text-stone-800 mb-3">
          {t("registerVendor.payementMode")} :
        </label>
        <div className="space-y-3">
          {/* Option 1 : Commission (Par défaut) */}
          <label className="flex items-start p-3 border border-amber-200 rounded-lg bg-amber-50 cursor-pointer hover:bg-amber-100 transition">
            <input
              type="radio"
              name="sellerPlanType"
              value="COMMISSION"
              defaultChecked
              className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-amber-900">{t("registerVendor.commission")}</span>
              <span className="block text-xs text-amber-700">{t("registerVendor.comDesc")}</span>
            </div>
          </label>

          {/* Option 2 : Abonnement */}
          <label className="flex items-start p-3 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50 transition">
            <input
              type="radio"
              name="sellerPlanType"
              value="ABONNEMENT"
              className="mt-1 h-4 w-4 text-amber-600 focus:ring-amber-500"
            />
            <div className="ml-3">
              <span className="block text-sm font-bold text-stone-900">{t("registerVendor.abonnement")}</span>
              <span className="block text-xs text-stone-600">{t("registerVendor.abDesc")}</span>
            </div>
          </label>
        </div>
      </div>
      {/* --------------------------------------------- */}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? t("registerVendor.loading") : t("registerVendor.submit")}
      </button>

      <p className="text-center text-sm text-stone-500">
        {t("registerVendor.hasAccount")}{" "}
        <Link href="/connexion" className="text-amber-700 hover:underline">
          {t("registerVendor.login")}
        </Link>
      </p>
    </form>
  );
}
