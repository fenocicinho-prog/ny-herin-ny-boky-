import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";
import { OrderType } from "@prisma/client";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string; // <- "stripe-signature" en minuscule
  
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error? err.message : "Unknown error";
    console.error("Webhook Error:", errorMessage); 
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // 1. CAS PAIEMENT D'UN LIVRE
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Si c'est un livre, on met à jour la commande existante (créée avant le checkout)
    if (session.metadata?.orderId) {
      const { orderId } = session.metadata;
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        console.error("Commande introuvable pour orderId webhook:", orderId);
      } else {
        await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "COMPLETED",
            deliveryStatus: "IN_TRANSIT",
            stripeSessionId: session.id,
          },
        });
        console.log("Commande mise à jour par webhook (COMPLETED, IN_TRANSIT):", orderId);
      }
    } else if (session.metadata?.bookId) {
      // Fallback: si orderId manquant, créer une commande (ancienne logique)
      const { bookId, type, userId } = session.metadata;
      const book = await prisma.book.findUnique({ where: { id: bookId } });
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!book || !user) {
        console.error("Livre ou utilisateur non trouvé:", { bookId, userId });
      } else {
        await prisma.order.create({
          data: {
            bookId,
            userId,
            type: type as OrderType,
            amount: session.amount_total! / 100,
            paymentMethod: "STRIPE",
            paymentStatus: "COMPLETED",
            deliveryStatus: "IN_TRANSIT",
            stripeSessionId: session.id,
          },
        });
        console.log("Commande livre créée (fallback):", bookId);
      }
    }

    // 2. CAS ABONNEMENT VENDEUR
    if (session.metadata?.planId && session.metadata?.userId) {
      const { userId, planId } = session.metadata;

      const validPlans = ["FREE", "TWENTY_BOOKS", "UNLIMITED"] as const;
      type PlanType = typeof validPlans[number];
      const planToSave: PlanType = validPlans.includes(planId as PlanType) ? (planId as PlanType) : "FREE";

      await prisma.user.update({
        where: { id: userId },
        data: {
          subscriptionPlan: planToSave,
          subscriptionActive: true,
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeCustomerId: session.customer as string,
          stripeSubscriptionId: session.subscription as string,
        },
      });
      console.log("Abonnement mis à jour:", userId);
    }
  }

  return NextResponse.json({ received: true });
}

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';