import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Store, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { BookGrid } from "@/components/books/BookGrid";
import { getSessionUser } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getVendorWithBooks(id: string) {
  return prisma.user.findUnique({
    where: { id, role: "VENDOR" },
    select: {
      id: true,
      companyName: true,
      location: true,
      books: {
        include: {
          vendor: { select: { id: true, companyName: true, location: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const vendor = await getVendorWithBooks(id);

  if (!vendor) {
    return { title: "Vendeur introuvable" };
  }

  const name = vendor.companyName || "Vendeur";
  return {
    title: name,
    description: `Découvrez les livres proposés par ${name}${vendor.location ? ` à ${vendor.location}` : ""} sur Ny Herin'ny Boky.`,
  };
}

export default async function VendorProfilePage({ params }: PageProps) {
  const { id } = await params;
  const [vendor, user] = await Promise.all([getVendorWithBooks(id), getSessionUser()]);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={user} />

      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center gap-4 rounded-2xl border border-amber-100 bg-white p-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-amber-100">
            <Store className="h-8 w-8 text-amber-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900" translate="no">
              {vendor.companyName || "Vendeur"}
            </h1>
            {vendor.location && (
              <p className="mt-1 flex items-center gap-1 text-stone-500" translate="no">
                <MapPin className="h-4 w-4" />
                {vendor.location}
              </p>
            )}
            <p className="mt-1 text-sm text-amber-700">
              {vendor.books.length} livre(s) disponible(s)
            </p>
          </div>
        </div>

        <BookGrid books={vendor.books} showActions />
      </div>
    </div>
  );
}