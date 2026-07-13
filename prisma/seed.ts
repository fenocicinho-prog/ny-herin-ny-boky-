import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("password123", 12);

  const vendor1 = await prisma.user.upsert({
    where: { email: "librairie@marketbook.mg" },
    update: {},
    create: {
      email: "librairie@marketbook.mg",
      password,
      role: "VENDOR",
      companyName: "Librairie Antananarivo",
      location: "Antananarivo",
      postalCode: "101",
      subscriptionPlan: "UNLIMITED",
      subscriptionActive: true,
    },
  });

  const vendor2 = await prisma.user.upsert({
    where: { email: "boky.fianara@marketbook.mg" },
    update: {},
    create: {
      email: "boky.fianara@marketbook.mg",
      password,
      role: "VENDOR",
      companyName: "Editions Fianarantsoa",
      location: "Fianarantsoa",
      postalCode: "301",
      subscriptionPlan: "TWENTY_BOOKS",
      subscriptionActive: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "client@marketbook.mg" },
    update: {},
    create: {
      email: "client@marketbook.mg",
      password,
      role: "CLIENT",
      firstName: "Rabe",
      lastName: "Jean",
      location: "Antananarivo",
      reasonForJoining: "Mianatra sy mihajam-boky",
      bookTypesSought: "Malagasy",
    },
  });

  const books = [
    {
      title: "Ny Fiainantsika",
      description: "Boky momba ny fiainana andavanandro eto Madagasikara",
      buyPrice: 15000,
      rentPrice: 3000,
      category: "MALAGASY" as const,
      vendorId: vendor1.id,
    },
    {
      title: "Siansa Ahoana no Izy",
      description: "Fampianarana siansa ho an'ny ankizy sy tanora",
      buyPrice: 22000,
      rentPrice: 5000,
      category: "SCIENCE" as const,
      vendorId: vendor1.id,
    },
    {
      title: "Tantaran'i Madagasikara",
      description: "Tantara fohy momba ny tantaran'ny Nosy",
      buyPrice: 18000,
      rentPrice: 4000,
      category: "HISTOIRE" as const,
      vendorId: vendor2.id,
    },
    {
      title: "Ny Alain Reners",
      description: "Roman malagasy klasika",
      buyPrice: 12000,
      rentPrice: 2500,
      category: "LITTERATURE" as const,
      vendorId: vendor2.id,
    },
    {
      title: "Fomba amam-panao Malagasy",
      description: "Fampianarana ny fomba amam-panao eto amintsika",
      buyPrice: 14000,
      rentPrice: 3500,
      category: "MALAGASY" as const,
      vendorId: vendor1.id,
    },
    {
      title: "Biologie Terminale",
      description: "Boky fianarana biologie ho an'ny terminale",
      buyPrice: 35000,
      rentPrice: 8000,
      category: "SCIENCE" as const,
      vendorId: vendor2.id,
    },
  ];

  for (const book of books) {
    const existing = await prisma.book.findFirst({
      where: { title: book.title, vendorId: book.vendorId },
    });
    if (!existing) {
      await prisma.book.create({ data: book });
    }
  }

  console.log("Seed completed!");
  console.log("Demo accounts (password: password123):");
  console.log("  Client: client@marketbook.mg");
  console.log("  Vendor 1: librairie@marketbook.mg");
  console.log("  Vendor 2: boky.fianara@marketbook.mg");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
