// app/vendeur/VendorDashboardContent.tsx
"use client";

import type { BookCategory } from "@prisma/client";
import Link from "next/link";
import { LayoutDashboard, Plus } from "lucide-react";

import { useLanguage } from "@/lib/LanguageContext";
import { getSessionUser } from "@/lib/auth";
import { getVendorStats } from "@/app/actions/orders";
import { Header } from "@/components/layout/Header";
import { VendorProfile } from "@/components/layout/VendorProfile";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SearchBarWrapper } from "@/components/layout/SearchBarWrapper";
import { CategoryFilter } from "@/components/books/CategoryFilter";
import { BookGrid } from "@/components/books/BookGrid";

type UserType = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
type StatsType = Awaited<ReturnType<typeof getVendorStats>>;

interface BookWithVendor {
  id: string;
  title: string;
  description: string | null;
  category: BookCategory;
  buyPrice: number | null;
  rentPrice: number | null;
  imageUrl: string | null;
  vendorId: string;
  createdAt: Date;
  updatedAt: Date;
  vendor: {
    id: string;
    companyName: string | null;
    location: string | null;
  };
  orderItems: Array<{
    order: {
      id: string;
      paymentStatus: string;
    };
    id: string;
    createdAt: Date;
    orderId: string;
    bookId: string;
    sellerId: string;
    quantity: number;
    price: number;
  }>;
}

interface VendorDashboardContentProps {
  user: UserType;
  stats: StatsType;
  books: BookWithVendor[];
  query: string;
  category: string;
}

export default function VendorDashboardContent({
  user,
  stats,
  books,
  query,
  category,
}: VendorDashboardContentProps) {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 text-stone-900">
      <Header user={user} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-3 py-4 sm:gap-6 sm:px-5 sm:py-6 lg:flex-row lg:items-start lg:px-8 lg:py-8">
        <aside className="w-full shrink-0 lg:sticky lg:top-6 lg:w-72 xl:w-80">
          <VendorProfile user={user} stats={stats} />
        </aside>

        <main className="min-w-0 flex-1 space-y-5 sm:space-y-6">
          <section className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">
                  {t("vendorDashboard.overview") || "Espace vendeur"}
                </p>
                <h1 className="mt-1 text-xl font-bold tracking-tight text-stone-950 sm:text-2xl">
                  {t("vendorDashboard.myBooks") || "Mes livres"}
                </h1>
                <p className="mt-1 text-sm text-stone-500">
                  {books.length} {books.length === 1 ? "livre" : "livres"} affiché{books.length > 1 ? "s" : ""}
                </p>
              </div>

              <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:justify-end">
                <Link
                  href="/vendeur/dashboard"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-stone-100 px-3 py-2 text-center text-sm font-semibold text-stone-700 transition hover:bg-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:px-4"
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t("common.dashboard") || "Dashboard"}</span>
                </Link>

                <Link
                  href="/vendeur/dashboard/nouveau-livre"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-amber-700 px-3 py-2 text-center text-sm font-semibold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:px-4"
                >
                  <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{t("vendorDashboard.addBook") || "Ajouter un livre"}</span>
                </Link>
              </div>
            </div>
          </section>

          <section className="space-y-3 rounded-2xl border border-stone-200 bg-white p-3 shadow-sm sm:p-4">
            <SearchBarWrapper defaultValue={query} />
            <div className="overflow-x-auto pb-1">
              <CategoryFilter
                activeCategory={category}
                basePath="/vendeur"
                searchQuery={query}
              />
            </div>
          </section>

          <section aria-label={t("vendorDashboard.myBooks") || "Mes livres"}>
            <BookGrid books={books} />
          </section>
        </main>

        <div className="w-full shrink-0 lg:w-56 xl:w-64">
          <SiteMenu />
        </div>
      </div>
    </div>
  );
}

export type { BookWithVendor, VendorDashboardContentProps };
