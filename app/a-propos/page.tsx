// app/a-propos/page.tsx
"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  CreditCard,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Store,
  Truck,
  Users,
} from "lucide-react";

import { Header } from "@/components/layout/Header";

const deliveryCities = [
  "Antananarivo",
  "Toamasina",
  "Fianarantsoa",
  "Mahajanga",
  "Toliara",
  "Antsiranana",
  "Hell-Ville — Nosy Be",
  "Sainte-Marie",
];

const trustPoints = [
  {
    icon: Truck,
    title: "Fandefasana voalamina",
    text: "Mifandray aminao izahay alohan'ny fandefasana mba hanamafisana ny baiko sy hanamorana ny fandraisana azy.",
  },
  {
    icon: CreditCard,
    title: "Fandoavana mora",
    text: "MVola, Orange Money, Airtel Money ary fandoavana vola mivantana eto Antananarivo.",
  },
  {
    icon: ShieldCheck,
    title: "Fanohanana akaiky",
    text: "Mijoro miaraka aminao ny ekipanay raha manana fanontaniana momba ny boky na ny baiko ianao.",
  },
];

export default function AProposPage() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 text-stone-900">
      <Header />

      <main>
        <section className="relative isolate overflow-hidden bg-gradient-to-br from-amber-950 via-stone-900 to-stone-950">
          <div className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full bg-amber-600/20 blur-3xl" />
          <div className="absolute -bottom-28 -left-16 -z-10 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />

          <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_.9fr] lg:items-center lg:px-8 lg:py-24">
            <div className="max-w-2xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                Marketplace boky eto Madagasikara
              </div>
              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
                Momba an&apos;i Ny Herin&apos;ny Boky
              </h1>
              <p className="mt-6 max-w-xl text-base leading-8 text-stone-300 sm:text-lg">
                Tongasoa eto amin&apos;ny sehatra mampifandray ireo mpamaky sy mpivarotra boky.
                Ny tanjonay dia ny hanamora ny fahazoana boky tsara, na aiza na aiza misy anao
                eto Madagasikara.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-stone-950"
                >
                  Hijery ireo boky
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/vendeur"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-stone-950"
                >
                  Ho lasa mpivarotra
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="col-span-2 rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur sm:p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-stone-950">
                    <Users className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white">Sehatra ho an&apos;ny rehetra</p>
                    <p className="mt-1 text-sm leading-6 text-stone-300">
                      Ho an&apos;ny olon-tsotra, librairie ary mpandraharaha te hampita ny bokiny.
                    </p>
                  </div>
                </div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:p-5">
                <Truck className="h-6 w-6 text-amber-300" aria-hidden="true" />
                <p className="mt-4 text-2xl font-black text-white">24–72 h</p>
                <p className="mt-1 text-xs leading-5 text-stone-300">Fotoana fanaterana matetika</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur sm:p-5">
                <MapPin className="h-6 w-6 text-amber-300" aria-hidden="true" />
                <p className="mt-4 text-2xl font-black text-white">6</p>
                <p className="mt-1 text-xs leading-5 text-stone-300">Faritany lehibe voarakotra</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">Ny antony hisafidianana anay</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-stone-950 sm:text-4xl">
              Namboarina mba hahatonga ny fividianana boky ho mora sy milamina
            </h2>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {trustPoints.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-lg font-bold text-stone-950">{title}</h3>
                <p className="mt-2 text-sm leading-7 text-stone-600">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="border-y border-stone-200 bg-white">
          <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[.8fr_1.2fr] lg:px-8">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-900 text-amber-300">
                <Store className="h-6 w-6" aria-hidden="true" />
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-stone-950">Ahoana ny fiasan&apos;ny marketplace?</h2>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                Ny Herin&apos;ny Boky dia mampivondrona boky avy amin&apos;ny sehatra samihafa. Afaka mividy
                aminay mivantana ianao na misafidy boky atolotry ny mpivarotra mpiara-miasa.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["01", "Mitady", "Safidio ao amin'ny sehatra ny boky mifanaraka amin'ny filanao."],
                ["02", "Manafatra", "Fenoy ny baiko ary fidio ny fomba fandoavana mety aminao."],
                ["03", "Mandray", "Hifandray aminao izahay hanamafisana ny fandefasana."],
              ].map(([number, title, text]) => (
                <div key={number} className="rounded-2xl bg-stone-50 p-5 ring-1 ring-inset ring-stone-200">
                  <span className="text-sm font-black text-amber-700">{number}</span>
                  <h3 className="mt-3 font-bold text-stone-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.1fr_.9fr] lg:px-8">
          <div className="rounded-3xl bg-amber-50 p-6 ring-1 ring-inset ring-amber-200 sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-700">Fandefasana</p>
            <h2 className="mt-2 text-2xl font-black text-stone-950">Manakaiky ireo mpamaky manerana an&apos;i Madagasikara</h2>
            <p className="mt-3 text-sm leading-7 text-stone-600">
              Manatitra any amin&apos;ireo tanàna lehibe ao amin&apos;ny faritany enina izahay, ary koa any Hell-Ville
              (Nosy Be) sy Sainte-Marie. Ny fotoana fanaterana dia matetika 24 hatramin&apos;ny 72 ora,
              arakaraka ny toerana misy anao.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {deliveryCities.map((city) => (
                <div key={city} className="flex items-center gap-2 text-sm text-stone-700">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-700" aria-hidden="true" />
                  <span>{city}</span>
                </div>
              ))}
            </div>
          </div>

          <div id="contact" className="rounded-3xl bg-stone-900 p-6 text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-300">Mifandraisa aminay</p>
            <h2 className="mt-2 text-2xl font-black">Eto izahay hanampy anao</h2>
            <p className="mt-3 text-sm leading-7 text-stone-300">Manana fanontaniana momba ny boky, baiko na fandefasana ve ianao? Antsoy na soraty izahay.</p>
            <div className="mt-6 space-y-3 text-sm">
              <a href="tel:+261384126644" className="flex items-center gap-3 text-stone-100 transition hover:text-amber-300">
                <Phone className="h-4 w-4 text-amber-300" aria-hidden="true" />
                038 41 266 44
              </a>
              <a href="https://wa.me/261342174639" target="_blank" rel="noreferrer" className="flex items-center gap-3 text-stone-100 transition hover:text-amber-300">
                <MessageCircle className="h-4 w-4 text-amber-300" aria-hidden="true" />
                WhatsApp: +261 34 21 746 39
              </a>
              <a href="mailto:madabookstore2002@gmail.com" className="flex items-center gap-3 break-all text-stone-100 transition hover:text-amber-300">
                <Mail className="h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                madabookstore2002@gmail.com
              </a>
              <p className="flex items-start gap-3 pt-2 text-stone-300">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden="true" />
                Andranomena, akaikin&apos;ny terminus 194, Antananarivo
              </p>
            </div>
          </div>
        </section>

        <section className="bg-stone-900 px-4 py-12 text-center sm:px-6 sm:py-16">
          <h2 className="text-3xl font-black text-white">Manana boky tianao hamidy?</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-stone-300">Mamoròna kaonty mpivarotra ary ampahafantaro ireo mpamaky manerana an&apos;i Madagasikara ny bokinao.</p>
          <Link href="/vendeur" className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-amber-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2 focus:ring-offset-stone-900">
            Hanomboka hivarotra
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      </main>
    </div>
  );
}
