"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { useLanguage } from "@/lib/LanguageContext";

export function LoginForm() {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await loginAction(formData)) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("login.email")}
        </label>
        <input
          name="email"
          type="email"
          required
          placeholder={t("login.emailPlaceholder")}
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("login.password")}
        </label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          placeholder={t("login.passwordPlaceholder")}
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
        />
      </div>
      {state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? t("login.loading") : t("login.submit")}
      </button>
      <p className="text-center text-sm text-stone-500">
        {t("login.noAccount")}{" "}
        <Link href="/inscription/client" className="text-amber-700 hover:underline">
          {t("login.registerClient")}
        </Link>
        {" · "}
        <Link href="/inscription/vendeur" className="text-amber-700 hover:underline">
          {t("login.registerVendor")}
        </Link>
      </p>
    </form>
  );
}
