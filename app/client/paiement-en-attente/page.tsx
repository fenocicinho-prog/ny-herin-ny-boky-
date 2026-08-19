import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PaymentPendingClient } from "./PaymentPendingClient";

export default async function PaymentPendingPage({
  searchParams,
}: {
  searchParams: Promise<{ commandeId?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawOrderId = params.commandeId;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;

  if (!orderId) notFound();

  const user = await requireAuth("CLIENT");
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId: user.id,
    },
    include: {
      items: {
        include: {
          book: { select: { title: true } },
        },
      },
    },
  });

  if (!order) notFound();

  return (
    <PaymentPendingClient
      orderId={order.id}
      amount={Number(order.amount)}
      clientTrxRef={order.clientTrxRef}
      mvolaStatus={order.mvolaStatus}
      paymentStatus={order.paymentStatus}
      items={order.items.map((item) => ({
        id: item.id,
        title: item.book.title,
        quantity: item.quantity,
        price: Number(item.price),
      }))}
    />
  );
}
