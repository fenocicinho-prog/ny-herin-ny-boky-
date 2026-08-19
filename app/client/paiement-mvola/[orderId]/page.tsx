import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { MOBILE_MONEY_PHONE } from "@/lib/constants";
import { MvolaPaymentContent } from "@/components/mvola/MvolaPaymentContent";

export default async function PaiementMvolaPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const user = await requireAuth("CLIENT");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id },
    include: {
      items: { include: { book: true } },
    },
  });

  if (!order) notFound();

  if (order.paymentStatus === "COMPLETED") {
    redirect("/client?success=true");
  }

  // Conversion explicite Decimal -> number AVANT de passer au Client Component
  const amount = Number(order.amount);
  const items = order.items.map((it) => ({
    title: it.book.title,
    quantity: it.quantity,
    price: Number(it.price),
  }));

  return (
    <MvolaPaymentContent
      orderId={order.id}
      items={items}
      amount={amount}
      sellerMvolaNumber={MOBILE_MONEY_PHONE}
      clientPhoneNumber={order.phoneNumber ?? undefined}
    />
  );
}