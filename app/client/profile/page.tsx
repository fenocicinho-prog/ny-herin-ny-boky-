import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ClientProfileContent from "./ClientProfileContent";

export default async function ClientProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/connexion");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: {
        include: {
          book: { select: { id: true, title: true, imageUrl: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return <ClientProfileContent user={user} orders={orders} />;
}