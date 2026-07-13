import { getStripe } from "@/lib/stripe-server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth"; // <-- CORRIGÉ ICI
// OrderType import removed (unused)

// interface CheckoutRequest {
//   bookId: string;
//   type: "BUY" | "BORROW";
//   price: number;
//   title: string;
// }

export async function POST(request: Request): Promise<NextResponse> {
  try {
    // 1. Récupérer l'utilisateur
    const user = await getSessionUser(); // <-- CORRIGÉ ICI
    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 });
    }

    const body = await request.json();
    const { bookId, type: orderType, price, title } = body;

    console.log("1. BODY COMPLET:", body)
    console.log("2. TITLE EXTRAIT (client):", title)

    if (!bookId || !price) {
      return NextResponse.json({ error: "bookId et price sont requis" }, { status: 400 });
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Livre introuvable" }, { status: 404 });
    }
    if (!book.title || book.buyPrice === null || book.rentPrice === null) {
      return NextResponse.json({ error: "Prix non disponible pour cette option" }, { status: 400 });
    }

    // Use server-side book title if client didn't provide one
    const productTitle = title ?? book.title;
    console.log("3. TITLE UTILISÉ (server):", productTitle)

    const order = await prisma.order.create({
      data: {
        bookId,
        userId: user.id,
        type: orderType,
        amount: price,
        paymentMethod: "STRIPE",
        paymentStatus: "PENDING",
      }
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
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/client`,
      metadata: {
        orderId: order.id,
        bookId: book.id,
        type: orderType,
        userId: user.id, // <-- MAINTENANT C'EST BON
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: stripeSession.id },
    })

    return NextResponse.json({ url: stripeSession.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Une erreur inconnue est survenue";
    console.error("STRIPE_CHECKOUT_ERROR:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}