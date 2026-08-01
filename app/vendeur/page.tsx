// app/vendeur/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';

import { getSessionUser } from "@/lib/auth";
import { getVendorStats } from "@/app/actions/orders";
import { prisma } from "@/lib/prisma";
import VendorDashboardContent from "./VendorDashboardContent";

export default async function VendorDashboard({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const user = await getSessionUser();
  if (!user) return null;

  const params = await searchParams;
  const query = params.q || "";
  const category = params.category || "ALL";

  const where: Record<string, unknown> = { vendorId: user.id };
  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
    ];
  }
  if (category !== "ALL") {
    where.category = category;
  }

  const [booksRaw, stats] = await Promise.all([
    prisma.book.findMany({
      where,
      include: {
        vendor: { select: { companyName: true, location: true } },
        orderItems: {
          include: {
            order: { select: { id: true, paymentStatus: true } }
          }
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    getVendorStats(user.id),
  ]);

  // Filtrage des items pour ne garder que les paiements validés
  const books = booksRaw.map((book) => ({
    ...book,
    orderItems: book.orderItems.filter((item) => 
      item.order?.paymentStatus === "COMPLETED"
    ),
  }));

  return (
    <VendorDashboardContent
      user={user}
      stats={stats}
      books={books}
      query={query}
      category={category}
    />
  );
}   