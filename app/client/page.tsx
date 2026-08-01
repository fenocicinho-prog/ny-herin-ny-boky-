import { Header } from "@/components/layout/Header";
import { ClientProfile } from "@/components/layout/ClientProfile";
import { SiteMenu } from "@/components/layout/SiteMenu";
import { SearchBarWrapper } from "@/components/layout/SearchBarWrapper";
import { CategoryFilter } from "@/components/books/CategoryFilter";
import { BookGrid } from "@/components/books/BookGrid";
import { DeliveryAlerts } from "@/components/orders/DeliveryAlerts";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function ClientDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; success?: string; payment?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "ALL";

  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
    ];
  }
  if (category !== "ALL") {
    where.category = category;
  }

  const booksRaw = await prisma.book.findMany({
    where,
    include: {
      vendor: { select: { companyName: true, location: true } },
      orderItems: {
        include: {
          order: {
            select: {
              id: true,
              paymentStatus: true,
              deliveryStatus: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const books = booksRaw.map((book) => ({
    ...book,
    orderItems: book.orderItems.filter(
      (item) => item.order?.paymentStatus === "COMPLETED"
    ),
  }));

  const ordersInTransit = await prisma.order.findMany({
    where: { userId: user.id, paymentStatus: "COMPLETED", deliveryStatus: "IN_TRANSIT" },
    include: { items: { include: { book: { select: { id: true, title: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={user} />
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <ClientProfile user={user} />

        <main className="min-w-0 flex-1 space-y-6">
          {params.success && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              Fandoavana nahomby! Misaotra.
            </div>
          )}
          {params.payment === "confirmed" && (
            <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
              Mobile Money voafidy! Ny kaomandinao efa voarakitra.
            </div>
          )}

          <SearchBarWrapper defaultValue={query} />
          {ordersInTransit.length > 0 && (
            <div className="mb-4">
              <DeliveryAlerts orders={ordersInTransit} />
            </div>
          )}
          <CategoryFilter
            activeCategory={category}
            basePath="/client"
            searchQuery={query}
          />
          <BookGrid books={books} showActions />
        </main>

        <SiteMenu />
      </div>
    </div>
  );
}
