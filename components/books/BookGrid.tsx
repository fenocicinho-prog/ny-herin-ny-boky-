"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import type { BookCategory } from "@prisma/client";
import { formatPrice } from "@/lib/constants";
import { BookActions } from "./BookActions";
import { useLanguage } from "@/lib/LanguageContext";

export interface BookWithVendor {
  id: string;
  title: string;
  description: string | null;
  buyPrice: number | null;
  rentPrice: number | null;
  imageUrl: string | null;
  category: BookCategory;
  vendorId: string;
  vendor: {
    id: string;
    companyName: string | null;
    location?: string | null;
  };
  orders?: { id: string }[];
}

interface BookGridProps {
  books: BookWithVendor[];
  showActions?: boolean;
}

export function BookGrid({ books, showActions = false }: BookGridProps) {
  const { t } = useLanguage();

  if (books.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 py-16 text-center">
        <BookOpen className="mx-auto mb-3 h-12 w-12 text-amber-300" />
        <p className="text-stone-500">Tsy misy boky hita</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <article
          key={book.id}
          className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-amber-50 to-stone-100">
            {book.imageUrl ? (
              <Image
                src={book.imageUrl}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-12 w-12 text-amber-200 sm:h-16 sm:w-16" />
              </div>
            )}
            <span className="absolute left-2 top-2 max-w-[calc(100%-1rem)] truncate rounded-full bg-white/90 px-2 py-1 text-[10px] font-medium text-amber-800 backdrop-blur-sm sm:left-3 sm:top-3 sm:px-2.5 sm:text-xs">
              {t(`categories.${book.category}`)}
            </span>
          </div>

          <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
            <h3 className="line-clamp-2 text-sm font-semibold text-stone-900 sm:text-base" translate="no">
              {book.title}
            </h3>

            <p className="mt-1 truncate text-xs text-stone-500 sm:text-sm" translate="no">
              {book.vendor.companyName}
              {book.vendor.location && ` · ${book.vendor.location}`}
            </p>

            {book.description && (
              <p className="mt-2 line-clamp-2 text-xs text-stone-600 sm:text-sm" translate="no">
                {book.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5 text-xs sm:gap-2 sm:text-sm">
              {book.buyPrice != null && book.buyPrice > 0 && (
                <span className="rounded-lg bg-amber-100 px-2 py-1 font-medium text-amber-800">
                  {t("bookCard.buy")}: {formatPrice(book.buyPrice)}
                </span>
              )}
              {book.rentPrice != null && book.rentPrice > 0 && (
                <span className="rounded-lg bg-stone-100 px-2 py-1 font-medium text-stone-700">
                  {t("bookCard.borrow")}: {formatPrice(book.rentPrice)}
                </span>
              )}
            </div>

            {showActions && (
              <div className="mt-auto pt-3">
                <BookActions book={book} />
              </div>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}