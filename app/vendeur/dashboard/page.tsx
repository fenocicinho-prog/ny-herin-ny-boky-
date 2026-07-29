"use client";

import { useLanguage } from "@/lib/LanguageContext";

interface VendorDashboardContentProps {
  bookCount: number;
  bookLimit: number;
  books: Array<{
    id: string;
    title: string;
    category: string;
    buyPrice: number;
    rentPrice: number | null;
    imageUrl: string | null;
  }>;
  subscriptionValid: boolean;
  daysRemaining: number | null;
}

export function VendorDashboardContent({
  bookCount,
  bookLimit,
  books,
  subscriptionValid,
  daysRemaining,
}: VendorDashboardContentProps) {
  const { t } = useLanguage();

  return (
    <div className="p-8">
      {!subscriptionValid ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {t("vendorDashboard.subscriptionExpired")}.{" "}
          <a href="/vendeur/dashboard/abonnement" className="font-semibold text-red-900 underline">
            {t("vendorDashboard.updateSubscription")}
          </a>
        </div>
      ) : daysRemaining !== null && daysRemaining <= 2 ? (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          {t("vendorDashboard.daysRemaining")}: {daysRemaining} {t("profile.daysLeft")}
        </div>
      ) : null}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("vendorDashboard.books")} {bookCount}/{bookLimit}
        </h1>
        
        {bookCount < bookLimit && (
          <a 
            href="/vendeur/dashboard/nouveau-livre"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            + {t("vendorDashboard.addBook")}
          </a>
        )}
      </div>

      {bookCount === 0 ? (
        <p className="text-gray-500">{t("clientDashboard.noBooks")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-2 gap-2">
            {books.map(book => (
              <div key={book.id} className="bg-white border-gray-200 rounded-xl shadow-sm hover:shadow-md transition p-3 flex-col">
                <img
                  src={book.imageUrl || "/placeholder-book.png"}
                  alt={book.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-bold text-gray-800 line-clamp-1">{book.title}</h3>
                <p className="text-sm text-gray-500 mb-2">{book.category}</p>

                <div className="space-y-1 text-sm mb-3">
                  <p className="font-bold text-amber-700">{t("bookCard.buyPrice")} {book.buyPrice} Ar</p>
                  {book.rentPrice && (
                    <p className="font-semibold text-green-700">{t("bookCard.rentPrice")} {book.rentPrice} Ar</p>
                  )}
                </div>

                <div className="flex gap-2 mt-auto">
                  <a
                    href={`/vendeur/dashboard/modifier/${book.id}`}
                    className="flex-1 text-center px-2 py-2 border border-amber-600 text-amber-600 rounded-lg text-sm font-semibold hover:bg-amber-50 transition"
                  >
                    {t("book.edit")}
                  </a>
                  <button className="flex-1 text-center px-2 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition">
                    {t("book.delete")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
