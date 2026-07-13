"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getStripe, MOBILE_MONEY_PHONE } from "@/lib/stripe-server";

//export const revalidate = 0;

const orderSchema = z.object({
  bookId: z.string(),
  type: z.enum(["BUY", "BORROW"]),
  paymentMethod: z.enum(["STRIPE", "MOBILE_MONEY"]),
  phoneNumber: z.string().optional(),
});
type CreateOrderInput = 
  | { error: string; message?: never }
  | { message: string; error?: never };

export async function createOrderAction(formData: FormData): Promise<CreateOrderInput> {
  const user = await requireAuth("CLIENT");

  const parsed = orderSchema.safeParse({
    bookId: formData.get("bookId"),
    type: formData.get("type"),
    paymentMethod: formData.get("paymentMethod"),
    phoneNumber: formData.get("phoneNumber") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const book = await prisma.book.findUnique({
    where: { id: parsed.data.bookId },
  });

  if (!book) {
    return { error: "Livre introuvable" };
  }

  const amount =
    parsed.data.type === "BUY" ? (book.buyPrice ?? 0) : (book.rentPrice ?? 0);

  if (amount <= 0) {
    return { error: "Prix non disponible pour cette option" };
  }

  if (parsed.data.paymentMethod === "MOBILE_MONEY") {
    if (!parsed.data.phoneNumber) {
      return { error: "Numéro de téléphone requis pour Mobile Money" };
    }

    const order = await prisma.order.create({
      data: {
        type: parsed.data.type,
        paymentMethod: "MOBILE_MONEY",
        paymentStatus: "PENDING",
          deliveryStatus: "PENDING",
        amount,
        phoneNumber: parsed.data.phoneNumber,
        bookId: book.id,
        userId: user.id,
      },
    });

    revalidatePath("/client");
    redirect(`/client/commande/${order.id}?mobile=true`);
  }

  // Stripe checkout
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "mg",
            product_data: {
              name: book.title,
              description:
                parsed.data.type === "BUY"
                  ? "Achat de livre"
                  : "Location de livre",
            },
            unit_amount: Math.round(amount),
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "order",
        orderType: parsed.data.type,
        bookId: book.id,
        userId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client?cancelled=true`,
    });

    await prisma.order.create({
      data: {
        type: parsed.data.type,
        paymentMethod: "STRIPE",
        paymentStatus: "PENDING",
          deliveryStatus: "PENDING",
        amount,
        stripeSessionId: session.id,
        bookId: book.id,
        userId: user.id,
      },
    });

    if (session.url) {
      redirect(session.url);
    }
    return { error: "Impossible de créer la session de paiement" };
  } catch {
    return {
      error: `Stripe non configuré. Utilisez Mobile Money au ${MOBILE_MONEY_PHONE}`,
    };
  }
}

export async function confirmMobilePaymentAction(orderId: string) {
  const user = await requireAuth("CLIENT");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id, paymentMethod: "MOBILE_MONEY" },
  });

  if (!order) {
    return { error: "Commande introuvable" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { paymentStatus: "COMPLETED" },
  });

  revalidatePath("/client");
  redirect("/client?payment=confirmed");
}

export async function confirmMobilePaymentFormAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  await confirmMobilePaymentAction(orderId);
}

export async function searchBooksAction(query: string, category?: string) {
  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
    ];
  }

  if (category && category !== "ALL") {
    where.category = category;
  }

  return prisma.book.findMany({
    where,
    include: {
      vendor: {
        select: { companyName: true, location: true },
      },
      orders: {
        where: { paymentStatus: "COMPLETED" },
        select: { id: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTopBooks() {
  const books = await prisma.book.findMany({
    include: {
      vendor: { select: { companyName: true } },
      orders: {
        where: { paymentStatus: "COMPLETED" },
        select: { id: true },
      },
    },
  });

  return books
    .sort((a, b) => b.orders.length - a.orders.length)
    .slice(0, 8);
}

export async function getVendors() {
  return prisma.user.findMany({
    where: { role: "VENDOR", subscriptionActive: true },
    select: {
      id: true,
      companyName: true,
      location: true,
      books: { select: { id: true } },
    },
  });
}

export async function getVendorStats(vendorId: string) {
  const [sold, borrowed, bookCount] = await Promise.all([
    prisma.order.count({
      where: {
        book: { vendorId },
        type: "BUY",
        paymentStatus: "COMPLETED",
      },
    }),
    prisma.order.count({
      where: {
        book: { vendorId },
        type: "BORROW",
        paymentStatus: "COMPLETED",
      },
    }),
    prisma.book.count({ where: { vendorId } }),
  ]);
  return { sold, borrowed, bookCount };
}
