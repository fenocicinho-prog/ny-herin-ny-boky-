import { prisma } from "@/lib/prisma";
import { calculerCommission } from "@/lib/commission";
import { sendSaleEmail } from "@/lib/send-sale-email";

export async function notifyOrderVendors(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: true,
      items: {
        include: {
          book: true,
          seller: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error(`Commande introuvable pour notification: ${orderId}`);
  }

  const bySeller = new Map<string, typeof order.items>();

  for (const item of order.items) {
    const sellerItems = bySeller.get(item.sellerId) ?? [];
    sellerItems.push(item);
    bySeller.set(item.sellerId, sellerItems);
  }

  const results = await Promise.all(
    [...bySeller.entries()].map(async ([sellerId, sellerItems]) => {
      const seller = sellerItems[0]?.seller;

      if (!seller?.email) {
        return {
          sellerId,
          success: false,
          reason: "Le vendeur n'a pas d'adresse e-mail.",
        };
      }

      const subtotal = sellerItems.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      );
      const commission = Math.round(calculerCommission(subtotal));
      const emailResult = await sendSaleEmail({
        vendorEmail: seller.email,
        bookTitle: sellerItems
          .map((item) => `${item.book.title}${item.quantity > 1 ? ` (x${item.quantity})` : ""}`)
          .join(", "),
        buyerName: order.user.firstName || order.user.email,
        price: subtotal,
        commission,
        gain: subtotal - commission,
        buyerPhone: order.phoneNumber || order.user.phoneNumber || null,
        deliveryLocation: order.deliveryLocation || order.user.location || null,
      });

      if (!emailResult.success) {
        throw emailResult.error instanceof Error
          ? emailResult.error
          : new Error("Le service e-mail a refusé la notification.");
      }

      return { sellerId, success: true };
    }),
  );

  return { orderId, results };
}
