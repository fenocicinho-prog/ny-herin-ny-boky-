// app/confidentialite/page.tsx
"use client";
import { Header } from "@/components/layout/Header";

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-16 space-y-10">

        <section>
          <h1 className="text-3xl font-bold text-stone-900 mb-2">Tsy Ambaratelo</h1>
          <div className="h-1 w-16 bg-amber-700 rounded mb-4" />
          <p className="text-stone-500 text-sm">Farandro farany niova : Janoary 2025</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">🔒 Ny angona angonina</h2>
          <p className="text-stone-600 leading-relaxed mb-3">
            Manangona angona maromaro izahay mba ahafahana mampiasa ny serivisy :
          </p>
          <ul className="space-y-2 text-stone-600 list-disc list-inside">
            <li>Anarana sy fanampiny</li>
            <li>Adiresy email</li>
            <li>Laharana MVola (ho an'ny fandoavana)</li>
            <li>Toerana (mba hamahana ny fandefasana)</li>
            <li>Tantaran'ny baiko sy fividianana</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">🎯 Nahoana no angonina ?</h2>
          <ul className="space-y-2 text-stone-600 list-disc list-inside">
            <li>Hanatanterahana ny baiko sy ny fandoavana</li>
            <li>Hampitaina ny vaovao momba ny bokiny</li>
            <li>Hanamafisana ny fiarovana ny kaonty</li>
            <li>Hanatsarana ny traikefan'ny mpampiasa</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">🚫 Tsy amidy ny angona</h2>
          <p className="text-stone-600 leading-relaxed">
            Ny angona anao dia <strong>tsy amidy, tsy zaraina amin'ny orinasa fahatelo</strong>
            {" "}raha tsy ilaina amin'ny fandefasana (ohatra : mpanefa entana). Tsy mahazo
            miditra amin'ny angona anao ny mpamidy hafa amin'ny tranonkala.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">🍪 Cookies</h2>
          <p className="text-stone-600 leading-relaxed">
            Mampiasa cookie fiarovana izahay (session cookie) mba hitazonana ny
            fidiranao ao amin'ny kaontinao. Tsy misy cookie fanarahamaso (tracking)
            na fampidirana daty personaly ampiasaina amin'ny dokambarotra.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-semibold text-stone-800 mb-3">✋ Ny zony anao</h2>
          <ul className="space-y-2 text-stone-600 list-disc list-inside">
            <li>Mangataka ny angona voarakitry ny anao</li>
            <li>Hangataka ny fanovana na fafana ny angona</li>
            <li>Hanafoana ny kaonty amin'ny fotoana rehetra</li>
          </ul>
          <p className="text-stone-600 mt-3">
            Mifandraisa aminay amin'ny{" "}
            <a href="mailto:contact@nyherinyboky.mg" className="text-amber-700 hover:underline font-medium">
              contact@nyherinyboky.mg
            </a>{" "}
            mba hampiharana ireo zo ireo.
          </p>
        </section>

      </main>
    </div>
  );
}