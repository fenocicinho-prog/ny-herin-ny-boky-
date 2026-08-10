// app/vendeur/VendorDashboardContent.tsx
'use client';

// app/vendeur/VendorDashboardContent.tsx
import { BookCategory } from '@prisma/client';   
import { useLanguage } from "@/lib/LanguageContext";
import { getSessionUser } from "@/lib/auth";
import { getVendorStats } from "@/app/actions/orders";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { VendorProfile } from "@/components/layout/VendorProfile";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SearchBarWrapper } from "@/components/layout/SearchBarWrapper";
import { CategoryFilter } from "@/components/books/CategoryFilter";
import { BookGrid } from "@/components/books/BookGrid";
import { Plus, LayoutDashboard } from "lucide-react";

// 1. Types déduits automatiquement de vos fonctions existantes
type UserType = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;
type StatsType = Awaited<ReturnType<typeof getVendorStats>>;

// 2. Type Prisma exact pour les livres (incluant vendor et orderItems)
// app/vendeur/VendorDashboardContent.tsx

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

  // ✅ CORRECTION : Définissez uniquement les champs que vous avez demandés dans le 'select'
  vendor: {
    id: string;
    companyName: string | null;
    location: string | null;
  };

  orderItems: ({
    order: {
      id: string;
      paymentStatus: string;
    };
  } & {
    id: string;
    createdAt: Date;
    orderId: string;
    bookId: string;
    sellerId: string; // Note: Prisma utilise peut-être sellerId ici
    quantity: number;
    price: number;
  })[];
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
    <div className="min-h-screen bg-stone-50">
      <Header user={user} />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <VendorProfile user={user} stats={stats} />

        <main className="min-w-0 flex-1 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-stone-900">
              {t("vendorDashboard.myBooks") || "Ny bokiko"}
            </h2>
            
            <div className="flex gap-2">
              {/* BOUTON DASHBOARD : Corrigé vers /vendeur/dashboard */}
              <Link
                href="/vendeur/dashboard"
                className="flex items-center gap-1 rounded-lg bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-300"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {t("common.dashboard") || "Dashboard"}
                </span>
              </Link>

              {/* Bouton Ajouter */}
              <Link
                href="/vendeur/dashboard/nouveau-livre"
                className="flex items-center gap-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                <Plus className="h-4 w-4" />
                {t("vendorDashboard.addBook") || "Ampiana boky vaovao"}
              </Link>
            </div>
          </div>

          <SearchBarWrapper defaultValue={query} />
          <CategoryFilter
            activeCategory={category}
            basePath="/vendeur"
            searchQuery={query}
          />
          
          {/* BookGrid reçoit maintenant le type correct BookWithVendor[] */}
          <BookGrid books={books} />
        </main>

        <SiteMenu />
      </div>
    </div>
  );
}   