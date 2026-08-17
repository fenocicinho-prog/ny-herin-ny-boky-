// app/a-propos/page.tsx
"use client";
import { Header } from "@/components/layout/Header";

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-12">

        <section>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Momba Anay</h1>
          <div className="h-1 w-16 bg-amber-700 rounded mb-6" />
          <p className="text-stone-600 leading-relaxed">
            Tongasoa eto amin'ny <strong className="text-amber-800">Ny Herin'ny Boky</strong> —
            ny tsenan'ny boky voalohany any Madagasikara mampifandray mpamidy sy mpividy
            amin'ny fomba mora sy azo itokisana.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">💛 Iza izahay ?</h2>
          <p className="text-stone-600 leading-relaxed">
            Izahay dia ekipa tanora malagasy tia boky sy teknolojia. Noforonina tamin'ny
            2024, ny tanjonay dia ny mampifandray ireo mpamidy boky — na orinasa na
            olom-pirenena — amin'ireo mpamaky eran'ny nosy. Mino izahay fa ny boky dia
            fanalahidy amin'ny fahalalana sy fandrosoana.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">📚 Ny Iraka Anay</h2>
          <p className="text-stone-600 leading-relaxed">
            Ny tanjona lehibe anay dia ny mahatonga ny boky ho azo amin'ny olona rehetra —
            na amin'ny vidiny ambany, na amin'ny fampindramana. Izany no antony namoroanay
            rafitra fandoavana mora (MVola, Stripe) sy fandefasana haingana eran'i Madagasikara.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">🤝 Ahoana ny fiasanay ?</h2>
          <ul className="space-y-3 text-stone-600">
            <li className="flex gap-3">
              <span className="text-amber-700 font-bold">01</span>
              <span>Misoratra ho mpamidy — mametraka ny bokinao ao amin'ny tranonkala</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-700 font-bold">02</span>
              <span>Ny mpividy mitady sy mividy — amin'ny MVola na Stripe</span>
            </li>
            <li className="flex gap-3">
              <span className="text-amber-700 font-bold">03</span>
              <span>Isika mandoa komasiona kely ihany — ny sisan'ny vola dia mody any amin'ny mpamidy</span>
            </li>
          </ul>
        </section>

        <section className="rounded-2xl bg-amber-50 border border-amber-100 p-6">
          <h2 className="text-xl font-semibold text-stone-800 mb-3">📬 Mifandraisa aminay</h2>
          <p className="text-stone-600">
            Manana fanontaniana ? Aza mitebiteby — soratana anay amin'ny
            <a href="mailto:contact@nyherinyboky.mg" className="text-amber-700 hover:underline ml-1 font-medium">
              contact@nyherinyboky.mg
            </a>
          </p>
        </section>

      </main>
    </div>
  );
}