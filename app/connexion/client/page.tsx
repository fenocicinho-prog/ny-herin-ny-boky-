'use client'
import Link from "next/link";
import { loginAction } from "@/app/actions/auth";
import { Header } from "@/components/ui/Header";
import { APP_NAME } from "@/lib/constants";


export default function ClientLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <div className="mx-auto max-w-md px-4 py-16">
        <div className="rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-stone-900">Hiditra — Client</h1>
          <p className="mt-2 text-sm text-stone-500">{APP_NAME}</p>

          <form action={loginAction} className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Email</label>
              <input
                name="email"
                type="email"
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Tenimiafina</label>
              <input
                name="password"
                type="password"
                required
                className="mt-1 w-full rounded-lg border border-stone-200 px-4 py-2.5 focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-amber-700 py-3 font-medium text-white hover:bg-amber-800 transition-colors"
            >
              Hiditra
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Tsy manana kaonty?{" "}
            <Link href="/inscription/client" className="font-medium text-amber-700 hover:underline">
              Hisoratra eto
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
