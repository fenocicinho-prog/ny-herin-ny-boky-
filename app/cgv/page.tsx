// app/cgv/page.tsx
"use client";
import { Header } from "@/components/layout/Header";

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-10">

        <section>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">
            Fepetra Ankapobeny (CGV)
          </h1>
          <div className="h-1 w-16 bg-amber-700 rounded mb-4" />
          <p className="text-stone-500 text-sm">Farandro farany niova : Janoary 2025</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">1. Ny serivisy</h2>
          <p className="text-stone-600 leading-relaxed">
            Ny <strong className="text-amber-800">Ny Herin'ny Boky</strong> dia tranonkaly
            mampifandray mpamidy boky sy mpividy any Madagasikara. Izahay tsy mpamidy
            mivantana — sehatra fampifandraisana ihany no ataonay.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">2. Fividianana sy Fampindramana</h2>
          <ul className="space-y-3 text-stone-600">
            <li><strong>Fividianana :</strong> ny mpividy dia mandoa ny vidiny feno. Rehefa voamarina ny fandoavana, ny boky dia alefa amin'ny adiresy nomena.</li>
            <li><strong>Fampindramana :</strong> misy fetra andro voafarana. Ny boky ampisamborina raha tsy averina amin'ny fotoana voafarana.</li>
            <li><strong>Fandoavana :</strong> amin'ny alalan'ny MVola na Stripe ihany.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">3. Komasiona sy Sarany</h2>
          <div className="overflow-hidden rounded-xl border border-stone-200">
            <table className="w-full text-sm text-stone-600">
              <thead className="bg-amber-50 text-stone-800">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Vidiny</th>
                  <th className="px-4 py-3 text-left font-semibold">Komasiona</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                <tr><td className="px-4 py-3">≤ 50 000 Ar</td><td className="px-4 py-3">8%</td></tr>
                <tr><td className="px-4 py-3">50 001 – 90 000 Ar</td><td className="px-4 py-3">7%</td></tr>
                <tr><td className="px-4 py-3">&gt; 90 000 Ar</td><td className="px-4 py-3">5%</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-stone-500 text-sm mt-2">
            Ny komasiona dia alamina ho an'ny fitantanana ny tranonkaly sy ny fiarovana ny mpividy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">4. Fandefasana</h2>
          <ul className="space-y-2 text-stone-600 list-disc list-inside">
            <li>Ny fandefasana dia ataon'ny mpamidy mivantana</li>
            <li>Ny fotoana fandefasana dia miankina amin'ny mpamidy sy ny toerana</li>
            <li>Izahay tsy tompon'andraikitra amin'ny fahatarany raha tsy vokatry ny fahadisoana anay</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">5. Fanerena sy Famerenana</h2>
          <p className="text-stone-600 leading-relaxed">
            Raha misy olana amin'ny boky voaray (very, simba, tsy mifanaraka amin'ny
            famaritana), mifandraisa aminay ao anatin'ny <strong>48 ora</strong> aorian'ny
            fahazoana. Ny famerenana vola dia atao aorian'ny fanadihadiana.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">6. Mifandraisa aminay</h2>
          <p className="text-stone-600">
            Ho an'ny fanontaniana rehetra momba ireto fepetra ireto :{" "}
            <a href="mailto:contact@nyherinyboky.mg" className="text-amber-700 hover:underline font-medium">
              contact@nyherinyboky.mg
            </a>
          </p>
        </section>

      </main>
    </div>
  );
}