export const dynamic = "force-dynamic";
import { Header } from "@/components/layout/Header";
import { VendorCard } from "@/components/vendors/VendorCard";
import { getVendors } from "@/app/actions/orders";
import { SITE_NAME } from "@/lib/constants";

export default async function HomePage() {
  const vendors = await getVendors();

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header user={null} />
      {/* Vendors */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <h2 className="mb-6 text-2xl font-bold text-stone-900">
          Orinasa mpivarotra
        </h2>
        {vendors.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {vendors.map((v) => (
              <VendorCard
                key={v.id}
                id={v.id}
                companyName={v.companyName}
                location={v.location}
                bookCount={v.books.length}
              />
            ))}
          </div>
        ) : (
          <p className="text-stone-500">Tsy misy mpivarotra mbola</p>
        )}
      </section>

      <footer className="border-t border-amber-100 bg-white py-8 text-center text-sm text-stone-500">
        © 2026 <span translate="no">{SITE_NAME}</span> — Tsena boky Malagasy
      </footer>
    </div>
  );
}
