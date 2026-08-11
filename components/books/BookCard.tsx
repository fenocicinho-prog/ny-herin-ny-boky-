"use client";

import type { BookCategory } from "@prisma/client";
import { BookOpen, Store } from "lucide-react";
import { PaymentModal } from "./PaymentModal";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

interface BookCardProps {
  book: {
    id: string;
    title: string;
    description: string | null;
    buyPrice: number;
    rentPrice: number;
    imageUrl: string | null;
    category: BookCategory;
    purchaseCount: number;
    vendor?: { companyName: string | null } | null;
  };
  showActions?: boolean;
}

export function BookCard({ book, showActions = false }: BookCardProps) {
  const { t } = useLanguage();
  const [modalOpen, setModalOpen] = useState(false);
  const [orderType, setOrderType] = useState<"BUY" | "BORROW">("BUY");

  function openModal(type: "BUY" | "BORROW") {
    console.log("BOOK", book);
    setOrderType(type);
    setModalOpen(true);
  }

  return (
    <>
      <article className="group flex flex-col overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition-all hover:shadow-md hover:border-amber-200">
        <div className="relative aspect-[3/4] bg-gradient-to-br from-amber-50 to-stone-100">
          {book.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={book.imageUrl}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-16 w-16 text-amber-300" />
            </div>
          )}
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-amber-800 backdrop-blur-sm">
          {t(`categories.${book.category}`)}
        </span>
        </div>

        <div className="flex flex-1 flex-col p-4" translate="no">
          <h3 className="font-semibold text-stone-900 line-clamp-2">{book.title}</h3>

          {book.vendor?.companyName && (
            <p className="mt-1 flex items-center gap-1 text-xs text-stone-500">
              <Store className="h-3 w-3" />
              {book.vendor.companyName}
            </p>
          )}

          {book.description && (
            <p className="mt-2 text-sm text-stone-500 line-clamp-2">
              {book.description}
            </p>
          )}

          <div className="mt-auto pt-4">
            <div className="flex items-baseline justify-between text-sm">
              <span className="font-bold text-amber-800">
                {book.buyPrice.toLocaleString("fr-FR")} Ar
              </span>
              <span className="text-stone-500">
                {t("bookCard.rentPrice")} {book.rentPrice.toLocaleString("fr-FR")} Ar
              </span>
            </div>

            {showActions && (
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => openModal("BUY")}
                  className="flex-1 rounded-lg bg-amber-700 px-3 py-2 text-xs font-medium text-white hover:bg-amber-800 transition-colors"
                >
                  {t("bookCard.buy")}
                </button>
                <button
                  onClick={() => openModal("BORROW")}
                  className="flex-1 rounded-lg border border-amber-700 px-3 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors"
                >
                  {t("bookCard.borrow")}
                </button>
              </div>
            )}
          </div>
        </div>
      </article>

      {modalOpen && book && (
        <PaymentModal
          book={book}
          orderType={orderType}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
