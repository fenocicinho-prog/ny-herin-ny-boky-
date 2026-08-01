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
  vendor: {
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
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {books.map((book) => (
        <article
          key={book.id}
          className="group overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition hover:shadow-md"
        >
          <div className="relative aspect-[3/4] bg-gradient-to-br from-amber-50 to-stone-100">
            {book.imageUrl ? (
              <Image
                src={book.imageUrl}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-16 w-16 text-amber-200" />
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-amber-800 backdrop-blur-sm">
             {t(`categories.${book.category}`)}
            </span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-stone-900 line-clamp-1">
              {book.title}
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              {book.vendor.companyName}
              {book.vendor.location && ` · ${book.vendor.location}`}
            </p>
            {book.description && (
              <p className="mt-2 text-sm text-stone-600 line-clamp-2">
                {book.description}s
              </p>
            )}
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
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
            {showActions && <BookActions book={book} />}
          </div>
        </article>
      ))}
    </div>
  );
}
