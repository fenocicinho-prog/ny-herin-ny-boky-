import { notFound } from "next/navigation";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderConfirmationClient } from "./OrderConfirmationClient";

export default async function OrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireAuth("CLIENT");

  const order = await prisma.order.findFirst({
    where: {
      id,
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
    <OrderConfirmationClient
      orderId={order.id}
      amount={Number(order.amount)}
      reference={order.clientTrxRef}
      paymentStatus={order.paymentStatus}
      paymentMethod={order.paymentMethod}
      deliveryStatus={order.deliveryStatus}
      items={order.items.map((item) => ({
        id: item.id,
        title: item.book.title,
        quantity: item.quantity,
        price: Number(item.price),
      }))}
    />
  );
}
