"use client";
import { User } from "@prisma/client";
import { deleteBookAction } from '@/app/actions/books'
import { useLanguage } from "@/lib/LanguageContext";
import { DeleteButton } from '@/components/button/DeleteButton';
import { LogOut } from 'lucide-react';
import Link from 'next/link';

interface VendorDashboardClientProps {
  bookCount: number;
  bookLimit: number;
  books: Array<{
    id: string;
    title: string;
    category: string; // ou BookCategory si vous utilisez l'enum
    buyPrice: number | null; // <--- AJOUTEZ "| null" ici
    rentPrice: number | null;
    imageUrl: string | null;
  }>;
  subscriptionValid: boolean;
  daysRemaining: number | null;
  user: User; // Adaptez le type selon votre modèle User; // Ajoutez cette prop pour l'action de suppression
}

export function VendorDashboardClient({ 
  bookCount, 
  bookLimit, 
  books, 
  subscriptionValid, 
  daysRemaining,
  user
}: VendorDashboardClientProps) {
  // ✅ C'est ici que useLanguage fonctionne
  const {t} = useLanguage(); 
  const isCommission = user.sellerPlanType === "COMMISSION";
  return (
    <div className="p-8">
      {!subscriptionValid && !isCommission ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {t("vendorDashboard.subscriptionExpired")}.{" "}
          <Link href="/vendeur/dashboard/abonnement" className="font-semibold text-red-900 underline">
            {t("vendorDashboard.updateSubscription")}
          </Link>
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
          <Link
            href="/vendeur/dashboard/nouveau-livre"
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
          >
            + {t("vendorDashboard.addBook")}
          </Link>
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
                  <Link
                    href={`/vendeur/dashboard/modifier/${book.id}`}
                    className="flex-1 text-center px-2 py-2 border border-amber-600 text-amber-600 rounded-lg text-sm font-semibold hover:bg-amber-50 transition"
                  >
                    {t("book.edit")}
                  </Link>
                  <DeleteButton bookId={book.id} action={deleteBookAction} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <br />
       <Link 
          href="/vendeur"
          className='fixed bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700'
          >
            <LogOut className='h-4 w-4' />  
        </Link>
    </div>
  );
}   