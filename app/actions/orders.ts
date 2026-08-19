"use server";

import { sendSaleEmail } from "@/lib/send-sale-email";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getStripe, MOBILE_MONEY_PHONE } from "@/lib/stripe-server";

const orderSchema = z.object({
  bookId: z.string(),
  type: z.enum(["BUY", "BORROW"]),
  paymentMethod: z.enum(["STRIPE", "MOBILE_MONEY", "ON_SITE"]),
  phoneNumber: z.string().optional(),
});

function calculerCommission(prix: number): number {
  if (prix <= 50000) return Math.round(prix * 0.08);
  if (prix <= 90000) return Math.round(prix * 0.07);
  return Math.round(prix * 0.05);
}

export async function createOrderAction(formData: FormData): Promise<{ error?: string; message?: string }> {
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

  const book = await prisma.book.findUnique({ where: { id: parsed.data.bookId } });
  if (!book) return { error: "Livre introuvable" };

  const amount = parsed.data.type === "BUY" ? (book.buyPrice ?? 0) : (book.rentPrice ?? 0);
  if (amount <= 0) return { error: "Prix non disponible pour cette option" };

  const platformFee = calculerCommission(amount);
  const vendorPaymentAmount = amount - platformFee;

  if (parsed.data.paymentMethod === "MOBILE_MONEY" || parsed.data.paymentMethod === "ON_SITE") {
    if (!parsed.data.phoneNumber) {
      return { error: "Numéro de téléphone requis pour Mobile Money" };
    }

    const clientTrxRef = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const deliveryLocation = formData.get("deliveryLocation") as string | null;

    const order = await prisma.order.create({
      data: {
        type: parsed.data.type,
        paymentMethod: "MOBILE_MONEY",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        amount,
        deliveryLocation: deliveryLocation || null,
        phoneNumber: parsed.data.phoneNumber,
        userId: user.id,
        paidToVendor: false,
        mvolaStatus: "EN_ATTENTE_CLIENT",
        clientTrxRef,
        platformFee,
        vendorPaymentAmount,
        items: {
          create: { bookId: book.id, sellerId: book.vendorId, quantity: 1, price: amount },
        },
      },
      include: { user: true, items: { include: { book: true, seller: true } } },
    });

    const item = order.items[0];
    if (item && item.seller && item.seller.email) {
      try {
        await sendSaleEmail({
          vendorEmail: item.seller.email,
          bookTitle: item.book.title,
          buyerName: order.user.firstName || order.user.email,
          price: order.amount,
          commission: order.platformFee,
          gain: order.vendorPaymentAmount,
          buyerPhone: order.phoneNumber || order.user.phoneNumber || null,
          deliveryLocation: order.deliveryLocation || order.user.location || null,
        });
      } catch (emailError) {
        console.error("Échec envoi email:", emailError);
      }
    }

    redirect(`/client/paiement-mvola/${order.id}`);
  }

  // Stripe checkout
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: book.title },
            unit_amount: Math.round(amount * 100),
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

    const clientTrxRef = `STR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    await prisma.order.create({
      data: {
        type: parsed.data.type,
        paymentMethod: "STRIPE",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        amount,
        stripeSessionId: session.id,
        userId: user.id,
        clientTrxRef,
        mvolaStatus: "EN_ATTENTE_CLIENT",
        paidToVendor: false,
        platformFee,
        vendorPaymentAmount,
        deliveryLocation: formData.get("deliveryLocation") as string | null,
        items: {
          create: { bookId: book.id, sellerId: book.vendorId, quantity: 1, price: amount },
        },
      },
    });

    if (session.url) redirect(session.url);
    return { error: "Impossible de créer la session de paiement" };
  } catch (e) {
    console.error(e);
    return { error: `Stripe non configuré. Utilisez Mobile Money au ${MOBILE_MONEY_PHONE}` };
  }
}

// ── Panier multi-articles / multi-vendeurs ──────────────────────────────

const cartItemSchema = z.object({
  bookId: z.string(),
  type: z.enum(["BUY", "BORROW"]),
  quantity: z.number().int().positive(),
});
const cartItemsSchema = z.array(cartItemSchema).min(1);

export async function createCartOrderAction(formData: FormData): Promise<{ error?: string }> {
  const user = await requireAuth("CLIENT");

  let rawItems: unknown;
  try {
    rawItems = JSON.parse(String(formData.get("items") || "[]"));
  } catch {
    return { error: "Panier invalide" };
  }

  const parsedItems = cartItemsSchema.safeParse(rawItems);
  if (!parsedItems.success) return { error: "Panier invalide" };

  const paymentParsed = z.enum(["STRIPE", "MOBILE_MONEY"]).safeParse(formData.get("paymentMethod"));
  if (!paymentParsed.success) return { error: "Méthode de paiement invalide" };

  const phoneNumber = (formData.get("phoneNumber") as string) || undefined;
  const deliveryLocation = (formData.get("deliveryLocation") as string) || null;

  const bookIds = [...new Set(parsedItems.data.map((i) => i.bookId))];
  const books = await prisma.book.findMany({ where: { id: { in: bookIds } } });
  const bookMap = new Map(books.map((b) => [b.id, b]));

  let amount = 0;
  const orderItemsData: { bookId: string; sellerId: string; quantity: number; price: number }[] = [];

  for (const it of parsedItems.data) {
    const book = bookMap.get(it.bookId);
    if (!book) return { error: "Un livre du panier est introuvable" };
    const unitPrice = it.type === "BUY" ? book.buyPrice : book.rentPrice;
    if (!unitPrice || unitPrice <= 0) return { error: `Prix indisponible pour "${book.title}"` };
    amount += unitPrice * it.quantity;
    orderItemsData.push({ bookId: book.id, sellerId: book.vendorId, quantity: it.quantity, price: unitPrice });
  }
  if (amount <= 0) return { error: "Montant invalide" };

  const platformFee = calculerCommission(amount);
  const vendorPaymentAmount = amount - platformFee;
  const orderType = parsedItems.data[0].type; // Order n'a qu'un seul type — voir note plus bas

  if (paymentParsed.data === "MOBILE_MONEY") {
    if (!phoneNumber) return { error: "Numéro de téléphone requis pour Mobile Money" };

    const clientTrxRef = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const order = await prisma.order.create({
      data: {
        type: orderType,
        paymentMethod: "MOBILE_MONEY",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        amount,
        deliveryLocation,
        phoneNumber,
        userId: user.id,
        paidToVendor: false,
        mvolaStatus: "EN_ATTENTE_CLIENT",
        clientTrxRef,
        platformFee,
        vendorPaymentAmount,
        items: { create: orderItemsData },
      },
      include: { user: true, items: { include: { book: true, seller: true } } },
    });

    const bySeller = new Map<string, typeof order.items>();
    for (const item of order.items) {
      bySeller.set(item.sellerId, [...(bySeller.get(item.sellerId) ?? []), item]);
    }
    for (const sellerItems of bySeller.values()) {
      const seller = sellerItems[0].seller;
      if (!seller?.email) continue;
      const subtotal = sellerItems.reduce((s, i) => s + i.price * i.quantity, 0);
      const subtotalFee = calculerCommission(subtotal);
      try {
        await sendSaleEmail({
          vendorEmail: seller.email,
          bookTitle: sellerItems.map((i) => `${i.book.title}${i.quantity > 1 ? ` (x${i.quantity})` : ""}`).join(", "),
          buyerName: order.user.firstName || order.user.email,
          price: subtotal,
          commission: subtotalFee,
          gain: subtotal - subtotalFee,
          buyerPhone: order.phoneNumber || order.user.phoneNumber || null,
          deliveryLocation: order.deliveryLocation || order.user.location || null,
        });
      } catch (e) {
        console.error("Échec envoi email vendeur:", e);
      }
    }

    redirect(`/client/paiement-mvola/${order.id}`);
  }

  // Stripe
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: parsedItems.data.map((it) => {
        const book = bookMap.get(it.bookId)!;
        const unitPrice = it.type === "BUY" ? book.buyPrice! : book.rentPrice!;
        return {
          price_data: { currency: "eur", product_data: { name: book.title }, unit_amount: Math.round(unitPrice * 100) },
          quantity: it.quantity,
        };
      }),
      metadata: { type: "cart_order", userId: user.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client?cancelled=true`,
    });

    const clientTrxRef = `STR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    await prisma.order.create({
      data: {
        type: orderType,
        paymentMethod: "STRIPE",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        amount,
        stripeSessionId: session.id,
        userId: user.id,
        clientTrxRef,
        mvolaStatus: "EN_ATTENTE_CLIENT",
        paidToVendor: false,
        platformFee,
        vendorPaymentAmount,
        deliveryLocation,
        items: { create: orderItemsData },
      },
    });

    if (session.url) redirect(session.url);
    return { error: "Impossible de créer la session de paiement" };
  } catch (e) {
    console.error(e);
    return { error: `Stripe non configuré. Utilisez Mobile Money au ${MOBILE_MONEY_PHONE}` };
  }
}

// ── Reste du fichier (inchangé) ──────────────────────────────────────────

export async function goToMvolaProof(orderId: string) {
  const user = await requireAuth("CLIENT");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id, paymentMethod: "MOBILE_MONEY" },
  });

  if (!order) return { error: "Commande introuvable" };
  if (order.paymentStatus === "COMPLETED") redirect("/client?success=true");
  redirect(`/client/paiement-mvola/${order.id}`);
}

export async function confirmMobilePaymentFormAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  goToMvolaProof(orderId);
}

export async function searchBooksAction(query: string, category?: string) {
  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [{ title: { contains: query } }, { description: { contains: query } }];
  }
  if (category && category !== "ALL") where.category = category;

  return prisma.book.findMany({
    where,
    include: {
      vendor: { select: { id: true, companyName: true, location: true } },
      orderItems: { include: { order: { select: { paymentStatus: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTopBooks() {
  const books = await prisma.book.findMany({
    include: {
      vendor: { select: { companyName: true } },
      orderItems: { include: { order: { select: { paymentStatus: true } } } },
    },
  });
  return books
    .map((book) => {
      const completedItems = book.orderItems.filter((item) => item.order.paymentStatus === "COMPLETED");
      return { ...book, orderItems: completedItems, totalSales: completedItems.length };
    })
    .filter((book) => book.orderItems.length > 0);
}

export async function getVendors() {
  return prisma.user.findMany({
    where: {
      role: "VENDOR",
      OR: [{ subscriptionActive: true }, { sellerPlanType: "COMMISSION" }],
    },
    select: { id: true, companyName: true, location: true, books: { select: { id: true } } },
  });
}

export async function getVendorStats(vendorId: string) {
  const [sold, borrowed, bookCount] = await Promise.all([
    prisma.order.count({
      where: { items: { some: { book: { vendorId } } }, type: "BUY", paymentStatus: "COMPLETED" },
    }),
    prisma.order.count({
      where: { items: { some: { book: { vendorId } } }, type: "BORROW", paymentStatus: "COMPLETED" },
    }),
    prisma.book.count({ where: { vendorId } }),
  ]);
  return { sold, borrowed, bookCount };
}

export async function submitMvolaProof(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const clientTrxRef = formData.get("clientTrxRef") as string;
  const cleanRef = clientTrxRef.trim().toUpperCase();

  if (!cleanRef || cleanRef.length < 5) {
    return { error: "La référence de transaction semble invalide." };
  }

  try {
    const existingOrder = await prisma.order.findFirst({
      where: { clientTrxRef: cleanRef, id: { not: orderId } },
    });
    if (existingOrder) return { error: "Cette référence de transaction a déjà été utilisée." };

    await prisma.order.update({
      where: { id: orderId },
      data: { clientTrxRef: cleanRef, mvolaStatus: "EN_ATTENTE_VERIFICATION", paymentStatus: "PENDING" },
    });

    return { success: true, orderId };
  } catch (error) {
    console.error("Erreur lors de la validation MVola :", error);
    return { error: "Une erreur technique est survenue. Veuillez réessayer." };
  }
}