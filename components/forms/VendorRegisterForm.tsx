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
       <div>
        <label className="block text-sm font-medium text-stone-700">
          Numero fandraisana vidim-boky
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
          Fomba fandoavana :
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
              <span className="block text-sm font-bold text-amber-900">Commission (Hazo isaky ny varotra)</span>
              <span className="block text-xs text-amber-700">Maimaim-poana ny fisoratana anarana. Misaraka kely isaky ny manana varotra.</span>
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
              <span className="block text-sm font-bold text-stone-900">Abonnement (Isam-bolana)</span>
              <span className="block text-xs text-stone-600">Mandoa vola isam-bolana. Tsy misy sarany isaky ny manana varotra.</span>
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
        {pending ? "Miandry..." : "Manaraka → "}
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
