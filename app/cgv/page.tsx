// app/cgv/page.tsx
"use client";

import {
  CheckCircle2,
  CreditCard,
  Mail,
  RotateCcw,
  ShieldCheck,
  Store,
  Truck,
  WalletCards,
} from "lucide-react";

import { Header } from "@/components/layout/Header";

const commissionPlans = [
  { price: "≤ 50 000 Ar", rate: "8%", tone: "bg-amber-50 border-amber-200" },
  { price: "50 001 – 90 000 Ar", rate: "7%", tone: "bg-stone-50 border-stone-200" },
  { price: "> 90 000 Ar", rate: "5%", tone: "bg-emerald-50 border-emerald-200" },
];

const paymentMethods = ["MVola", "Orange Money", "Airtel Money", "Vola mivantana ho an'ny baiko eto Antananarivo"];

export default function CGVPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 text-stone-900">
      <Header />

      <main>
        <section className="bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8 lg:py-20">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/25 bg-amber-400/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Fepetra mazava ho an'ny rehetra
              </div>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Fepetra ankapobeny momba ny varotra
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-300 sm:text-lg">
                Ireo fepetra ireo dia manazava ny fomba fiasan&apos;ny marketplace, ny fandoavana,
                ny fandefasana ary ny fifandraisana eo amin&apos;ny mpividy sy ny mpivarotra.
              </p>
              <p className="mt-5 text-sm font-medium text-amber-200">Nohavaozina farany: Janoary 2025</p>
            </div>

            <div className="flex h-28 w-28 items-center justify-center rounded-[2rem] border border-white/10 bg-white/10 text-amber-300 shadow-2xl backdrop-blur sm:h-36 sm:w-36">
              <Store className="h-14 w-14 sm:h-16 sm:w-16" strokeWidth={1.5} aria-hidden="true" />
            </div>
          </div>
        </section>

        <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          <div className="grid gap-5 lg:grid-cols-2">
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Store className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-amber-700">01</p>
                  <h2 className="mt-1 text-xl font-black text-stone-950 sm:text-2xl">Ny serivisy</h2>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-stone-600">
                Ny <strong className="text-amber-800">Ny Herin&apos;ny Boky</strong> dia marketplace
                mampifandray mpividy sy mpivarotra boky eto Madagasikara. Afaka mividy boky amidinay
                mivantana ianao na boky atolotry ny mpivarotra mpiara-miasa.
              </p>
              <p className="mt-3 text-sm leading-7 text-stone-600">
                Ho an&apos;ny boky an&apos;ny mpivarotra hafa, ny famaritana, ny vidiny ary ny fepetra
                manokana dia tokony hojerena tsara alohan&apos;ny hametrahana baiko.
              </p>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                  <WalletCards className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-blue-700">02</p>
                  <h2 className="mt-1 text-xl font-black text-stone-950 sm:text-2xl">Fividianana sy fandoavana</h2>
                </div>
              </div>
              <p className="mt-6 text-sm leading-7 text-stone-600">
                Rehefa mametraka baiko ianao, dia tokony hanome vaovao marina momba ny anaranao,
                ny fifandraisana ary ny adiresy fanaterana. Ny baiko dia karakaraina rehefa voamarina
                ny fandoavana.
              </p>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                {paymentMethods.map((method) => (
                  <div key={method} className="flex items-start gap-2 rounded-xl bg-stone-50 p-3 text-sm leading-6 text-stone-700 ring-1 ring-inset ring-stone-200">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{method}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="mt-5 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <CreditCard className="h-5 w-5" aria-hidden="true" />
                </div>
                <p className="mt-5 text-sm font-bold text-amber-700">03</p>
                <h2 className="mt-1 text-xl font-black text-stone-950 sm:text-2xl">Komisiona ho an&apos;ny mpivarotra</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">
                  Ny tahan&apos;ny komisiona dia miankina amin&apos;ny vidin&apos;ny boky. Izy io dia mandray
                  anjara amin&apos;ny fitantanana ny sehatra sy ny fanatsarana ny serivisy ho an&apos;ny mpividy
                  sy mpivarotra.
                </p>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-3 lg:max-w-2xl">
                {commissionPlans.map((plan) => (
                  <div key={plan.price} className={`rounded-2xl border p-4 ${plan.tone}`}>
                    <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Vidin&apos;ny boky</p>
                    <p className="mt-2 text-sm font-bold text-stone-900">{plan.price}</p>
                    <div className="mt-4 border-t border-stone-200/80 pt-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Komisiona</p>
                      <p className="mt-1 text-2xl font-black text-stone-950">{plan.rate}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-orange-700">
                  <Truck className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-700">04</p>
                  <h2 className="mt-1 text-xl font-black text-stone-950 sm:text-2xl">Fandefasana</h2>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm leading-7 text-stone-600">
                {[
                  "Ny fotoana fanaterana dia matetika 24 hatramin'ny 72 ora, arakaraka ny toerana.",
                  "Mifandray amin'ny mpividy ny ekipanay alohan'ny fandefasana mba hanamafisana ny baiko.",
                  "Ny fandefasana dia atao any amin'ireo tanàna lehibe ao amin'ny faritany enina, Hell-Ville (Nosy Be) ary Sainte-Marie.",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-8">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <RotateCcw className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm font-bold text-emerald-700">05</p>
                  <h2 className="mt-1 text-xl font-black text-stone-950 sm:text-2xl">Olana, garantie ary famerenana</h2>
                </div>
              </div>
              <div className="mt-6 space-y-4 text-sm leading-7 text-stone-600">
                <p>
                  Ho an&apos;ny boky amidin&apos;ny Ny Herin&apos;ny Boky mivantana, manana <strong className="text-stone-900">21 andro</strong> ianao hamerenana azy raha miova hevitra.
                </p>
                <p>
                  Raha misy pejy tsy ampy, olana amin&apos;ny fanontana na fahasimbana, mifandraisa aminay haingana. Aorian&apos;ny fanamarinana dia azo dinihina ny fanoloana na ny famerenam-bola.
                </p>
                <p className="rounded-xl bg-amber-50 p-4 text-stone-700 ring-1 ring-inset ring-amber-200">
                  Ho an&apos;ny boky amidin&apos;ny mpivarotra mpiara-miasa, mifandraisa mivantana amin&apos;ilay mpivarotra mba hahafantarana ny fepetra manokana momba ny famerenana.
                </p>
              </div>
            </section>
          </div>

          <section className="mt-5 rounded-3xl bg-stone-900 p-6 text-white sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-stone-950">
                  <Mail className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h2 className="text-xl font-black">Mila fanazavana fanampiny?</h2>
                  <p className="mt-2 text-sm leading-7 text-stone-300">Mifandraisa aminay raha manana fanontaniana momba ny baiko, ny fandoavana na ireo fepetra ireo ianao.</p>
                </div>
              </div>
              <a href="mailto:madabookstore2002@gmail.com" className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-stone-900">
                Hifandray aminay
              </a>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
