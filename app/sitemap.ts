import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const baseUrl = "https://ny-erin-ny-boky.com"; // ⚠️ à corriger selon confirmation

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const books = await prisma.book.findMany({
    select: { id: true, updatedAt: true },
  });

  const vendors = await prisma.user.findMany({
    where: { role: "VENDOR", subscriptionActive: true },
    select: { id: true },
  });

  return [
    { url: baseUrl, lastModified: new Date(), priority: 1 },
    ...books.map((book) => ({
      url: `${baseUrl}/livre/${book.id}`,
      lastModified: book.updatedAt,
      priority: 0.8,
    })),
    ...vendors.map((vendor) => ({
      url: `${baseUrl}/vendeur/${vendor.id}`,
      lastModified: new Date(),
      priority: 0.6,
    })),
  ];
}