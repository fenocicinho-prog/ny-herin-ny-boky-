export const revalidate = 0
export const dynamic = 'force-dynamic'

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { VendorProfile } from "@/components/layout/VendorProfile";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SearchBarWrapper } from "@/components/layout/SearchBarWrapper";
import { CategoryFilter } from "@/components/books/CategoryFilter";
import { BookGrid } from "@/components/books/BookGrid";
import { getSessionUser } from "@/lib/auth";
import { getVendorStats } from "@/app/actions/orders";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";

export default async function VendorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "ALL";

  const where: Record<string, unknown> = { vendorId: user.id };
  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
    ];
  }
  if (category !== "ALL") {
    where.category = category;
  }

  const [books, stats] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        vendor: { select: { companyName: true, location: true } },
        orders: { where: { paymentStatus: "COMPLETED" }, select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getVendorStats(user.id),
  ]);

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={user} />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <VendorProfile user={user} stats={stats} />

        <main className="min-w-0 flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">
              Ny bokiko
            </h2>
            <Link
              href="/vendeur/dashboard/nouveau-livre"
              className="flex items-center gap-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
            >
              <Plus className="h-4 w-4" />
              Boky vaovao
            </Link>
          </div>

          <SearchBarWrapper defaultValue={query} />
          <CategoryFilter
            activeCategory={category}
            basePath="/vendeur"
            searchQuery={query}
          />
          <BookGrid books={books} />
        </main>

        <SiteMenu />
      </div>
    </div>
  );
}
