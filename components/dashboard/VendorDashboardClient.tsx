// app/vendeur/dashboard/VendorDashboardClient.tsx
"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, Pencil } from "lucide-react";

import type { SessionUser } from "@/lib/auth";
import { deleteBookAction } from "@/app/actions/books";
import { useLanguage } from "@/lib/LanguageContext";
import { DeleteButton } from "@/components/button/DeleteButton";

interface VendorDashboardClientProps {
  bookCount: number;
  bookLimit: number;
  books: Array<{
    id: string;
    title: string;
    category: string;
    buyPrice: number | null;
    rentPrice: number | null;
    imageUrl: string | null;
  }>;
  subscriptionValid: boolean;
  daysRemaining: number | null;
  user: SessionUser;
}

function formatPrice(price: number | null) {
  if (price === null) return null;

  return `${new Intl.NumberFormat("fr-FR").format(price)} Ar`;
}

export function VendorDashboardClient({
  bookCount,
  bookLimit,
  books,
  subscriptionValid,
  daysRemaining,
  user,
}: VendorDashboardClientProps) {
  const { t } = useLanguage();
  const isCommission = user.sellerPlanType === "COMMISSION";

  return (
    <div className="min-h-screen overflow-x-hidden bg-stone-50 px-3 py-4 text-stone-900 sm:px-5 sm:py-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl">
        {!subscriptionValid && !isCommission ? (
          <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-800 sm:mb-6">
            <span>{t("vendorDashboard.subscriptionExpired")}</span>{" "}
            <Link
              href="/vendeur/dashboard/abonnement"
              className="font-bold text-red-900 underline underline-offset-2 hover:text-red-700"
            >
              {t("vendorDashboard.updateSubscription")}
            </Link>
          </div>
        ) : daysRemaining !== null && daysRemaining <= 2 ? (
          <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900 sm:mb-6">
            {t("vendorDashboard.daysRemaining")}: {daysRemaining}{" "}
            {t("profile.daysLeft")}
          </div>
        ) : null}

        <section className="mb-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:mb-6 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <BookOpen className="h-5 w-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-bold tracking-tight text-stone-950 sm:text-2xl">
                  {t("vendorDashboard.books") || "Mes livres"}
                </h1>
                <p className="text-sm text-stone-500">
                  {bookCount} / {bookLimit} livres utilisés
                </p>
              </div>
            </div>

            {bookCount < bookLimit && (
              <Link
                href="/vendeur/dashboard/nouveau-livre"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:w-auto"
              >
                + {t("vendorDashboard.addBook") || "Ajouter un livre"}
              </Link>
            )}
          </div>
        </section>

        {bookCount === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-12 text-center shadow-sm">
            <BookOpen className="mx-auto h-10 w-10 text-stone-300" aria-hidden="true" />
            <p className="mt-3 text-sm text-stone-500">
              {t("clientDashboard.noBooks") || "Aucun livre pour le moment."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {books.map((book) => {
              const buyPrice = formatPrice(book.buyPrice);
              const rentPrice = formatPrice(book.rentPrice);

              return (
                <article
                  key={book.id}
                  className="group flex min-w-0 flex-row overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:flex-col"
                >
                  <div className="relative h-auto min-h-36 w-28 shrink-0 bg-stone-100 sm:h-52 sm:w-full sm:min-h-0">
                    <img
                      src={book.imageUrl || "/placeholder-book.png"}
                      alt={book.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold uppercase tracking-wide text-amber-700">
                        {book.category}
                      </p>
                      <h2 className="mt-1 line-clamp-2 text-base font-bold leading-6 text-stone-900 sm:text-lg">
                        {book.title}
                      </h2>
                    </div>

                    <div className="mt-3 space-y-1.5 text-sm">
                      {buyPrice ? (
                        <p className="font-bold text-amber-700">
                          {t("bookCard.buyPrice") || "Achat"}: {buyPrice}
                        </p>
                      ) : null}
                      {rentPrice ? (
                        <p className="font-semibold text-emerald-700">
                          {t("bookCard.rentPrice") || "Location"}: {rentPrice}
                        </p>
                      ) : null}
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2 sm:mt-auto sm:pt-5">
                      <Link
                        href={`/vendeur/dashboard/modifier/${book.id}`}
                        className="inline-flex min-h-10 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-600 px-2 py-2 text-center text-xs font-bold text-amber-700 transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:text-sm"
                      >
                        <Pencil className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                        <span className="truncate">{t("book.edit") || "Modifier"}</span>
                      </Link>

                      <div className="flex min-h-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 px-2">
                        <DeleteButton
                          bookId={book.id}
                          action={deleteBookAction}
                        />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Link
          href="/vendeur"
          aria-label={t("common.back") || "Retour à l'espace vendeur"}
          title={t("common.back") || "Retour à l'espace vendeur"}
          className="fixed bottom-4 right-4 z-20 inline-flex min-h-11 items-center gap-2 rounded-full bg-amber-700 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 sm:bottom-6 sm:right-6"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">{t("common.back") || "Retour"}</span>
        </Link>
      </div>
    </div>
  );
}
