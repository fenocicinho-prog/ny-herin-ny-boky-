import { notFound } from "next/navigation";
import Image from "next/image";
import type { Metadata } from "next";
import { BookOpen, MapPin } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/constants";
import { Header } from "@/components/layout/Header";
import { BookActions } from "@/components/books/BookActions";
import { getSessionUser } from "@/lib/auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getBook(id: string) {
  return prisma.book.findUnique({
    where: { id },
    include: {
      vendor: {
        select: { id: true, companyName: true, location: true },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const book = await getBook(id);

  if (!book) {
    return { title: "Livre introuvable" };
  }

  const description =
    book.description?.slice(0, 160) ||
    `${book.title}, disponible sur Ny Herin'ny Boky — ${book.vendor.companyName || "vendeur"}.`;

  return {
    title: book.title,
    description,
    openGraph: {
      title: book.title,
      description,
      images: book.imageUrl ? [book.imageUrl] : undefined,
      type: "website",
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [book, user] = await Promise.all([getBook(id), getSessionUser()]);

  if (!book) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.title,
    description: book.description || undefined,
    image: book.imageUrl || undefined,
    offers: {
      "@type": "Offer",
      price: book.buyPrice ?? book.rentPrice ?? undefined,
      priceCurrency: "MGA",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: book.vendor.companyName || "Vendeur",
      },
    },
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header user={user} />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-stone-100">
            {book.imageUrl ? (
              <Image
                src={book.imageUrl}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <BookOpen className="h-24 w-24 text-amber-200" />
              </div>
            )}
          </div>

          <div>
            <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-800">
              {book.category}
            </span>

            <h1 className="mt-3 text-3xl font-bold text-stone-900" translate="no">
              {book.title}
            </h1>

            <p className="mt-2 flex items-center gap-1 text-stone-500" translate="no">
              {book.vendor.companyName}
              {book.vendor.location && (
                <>
                  <MapPin className="ml-2 h-4 w-4" />
                  {book.vendor.location}
                </>
              )}
            </p>

            {book.description && (
              <p className="mt-4 text-stone-700 leading-relaxed" translate="no">
                {book.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-3 text-sm">
              {book.buyPrice != null && book.buyPrice > 0 && (
                <span className="rounded-lg bg-amber-100 px-3 py-1.5 font-medium text-amber-800">
                  Achat: {formatPrice(book.buyPrice)}
                </span>
              )}
              {book.rentPrice != null && book.rentPrice > 0 && (
                <span className="rounded-lg bg-stone-100 px-3 py-1.5 font-medium text-stone-700">
                  Location: {formatPrice(book.rentPrice)}
                </span>
              )}
            </div>

            <div className="mt-6">
              <BookActions book={book} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}