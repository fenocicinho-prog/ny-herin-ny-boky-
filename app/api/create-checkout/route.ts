import { getStripe } from "@/lib/stripe-server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// ✅ CORRECTION : Utilisation du singleton Prisma (pas de new PrismaClient)

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Récupérer l'utilisateur (sécurité)
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, type: orderType, price, title, deliveryLocation } = body;

    if (!bookId || !price) {
      return NextResponse.json({ error: "bookId et price sont requis" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
    }

    // Use server-side book title if client didn't provide one
    const productTitle = title ?? book.title;

    // Calcul des frais de commission (harmonisation)
    const platformFee = price <= 50000 ? Math.round(price * 0.08) 
                     : price <= 90000 ? Math.round(price * 0.07) 
                     : Math.round(price * 0.05);
    const vendorPaymentAmount = price - platformFee;

    const order = await prisma.order.create({
      data: {
        type: orderType || "BUY",
        paymentMethod: "STRIPE",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        amount: price,
        userId: user.id,
        paidToVendor: false,
        clientTrxRef: `STR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        mvolaStatus: "EN_ATTENTE_CLIENT",
        platformFee,
        vendorPaymentAmount,
        deliveryLocation: deliveryLocation || null,
        items: {
          create: {
            bookId: book.id,
            sellerId: book.vendorId,
            quantity: 1,
            price: price,
          },
        },
      },
      include: { items: { include: { book: true, seller: true } } }
    });

    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: productTitle },
            unit_amount: Math.round(price * 100), // ✅ Stripe attend des centimes
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client`,
      metadata: {
        orderId: order.id,
        bookId: book.id,
        type: orderType || "BUY",
        userId: user.id,
      },
    });

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
    console.error("STRIPE_CHECKOUT_ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
