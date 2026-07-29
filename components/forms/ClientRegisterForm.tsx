"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerClientAction } from "@/app/actions/auth";
import { REASON_OPTIONS, BOOK_TYPE_OPTIONS } from "@/lib/constants";
import { useLanguage } from "@/lib/LanguageContext";

export function ClientRegisterForm() {
  const { t } = useLanguage();
  const [state, formAction, pending] = useActionState(
    async (_prev: { error?: string } | null, formData: FormData) => {
      return (await registerClientAction(formData)) ?? null;
    },
    null
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-stone-700">
            {t("registerClient.firstName")}
          </label>
          <input
            name="firstName"
            required
            className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700">
            {t("registerClient.lastName")}
          </label>
          <input
            name="lastName"
            required
            className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-stone-700">
          {t("registerClient.email")}
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
          {t("registerClient.password")}
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
          {t("registerClient.location")}
        </label>
        <input
          name="location"
          required
          placeholder="Antananarivo, Fianarantsoa..."
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      <fieldset className="rounded-lg border border-amber-100 p-4">
        <legend className="px-2 text-sm font-semibold text-amber-800">
          {t("registerClient.reason")}
        </legend>
        <div className="mt-2 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700">
              {t("registerClient.reason")}
            </label>
            <select
              name="reasonForJoining"
              required
              className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
            >
              <option value="">Misafidiana...</option>
              {REASON_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700">
              {t("registerClient.bookTypes")}
            </label>
            <select
              name="bookTypesSought"
              required
              className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
            >
              <option value="">Misafidiana...</option>
              {BOOK_TYPE_OPTIONS.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </fieldset>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? t("registerClient.loading") : t("registerClient.submit")}
      </button>

      <p className="text-center text-sm text-stone-500">
        {t("registerClient.hasAccount")}{" "}
        <Link href="/connexion" className="text-amber-700 hover:underline">
          {t("registerClient.login")}
        </Link>
      </p>
    </form>
  );
}
