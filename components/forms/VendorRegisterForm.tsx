"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerVendorStep1Action } from "@/app/actions/auth";

export function VendorRegisterForm() {
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
          Anaran&apos;ny orinasa
        </label>
        <input
          name="companyName"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">Email</label>
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700">
          Tenimiafina
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
          Toerana
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
          Kaody paositra
        </label>
        <input
          name="postalCode"
          required
          className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none"
        />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50"
      >
        {pending ? "Miandry..." : "Manaraka → Abonnement"}
      </button>

      <p className="text-center text-sm text-stone-500">
        Efa manana kaonty?{" "}
        <Link href="/connexion" className="text-amber-700 hover:underline">
          Hiditra
        </Link>
      </p>
    </form>
  );
}
