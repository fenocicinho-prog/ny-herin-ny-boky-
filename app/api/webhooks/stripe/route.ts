import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { getStripe } from "@/lib/stripe-server";
import { notifyOrderVendors } from "@/lib/notify-order-vendors";
import { prisma } from "@/lib/prisma";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature");

  if (!webhookSecret || !signature) {
    console.error("Webhook Stripe mal configuré: signature ou secret manquant");
    return NextResponse.json({ error: "Webhook Stripe non configuré" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signature invalide";
    console.error("Webhook Stripe Error:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const metadata = session.metadata ?? {};

    const orderIds = [
      metadata.orderId,
      ...(metadata.orders ? metadata.orders.split(",") : []),
    ].filter((value): value is string => Boolean(value));

    for (const orderId of [...new Set(orderIds)]) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });

      if (!order) {
        console.error("Commande introuvable pour le webhook Stripe:", orderId);
        continue;
      }

      const wasAlreadyCompleted = order.paymentStatus === "COMPLETED";

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "COMPLETED",
          deliveryStatus: "IN_TRANSIT",
          stripeSessionId: session.id,
          mvolaStatus: "PAYE",
        },
      });

      if (!wasAlreadyCompleted) {
        try {
          await notifyOrderVendors(orderId);
        } catch (error) {
          console.error("Erreur notification vendeur après paiement Stripe:", error);
        }
      }
    }

    // Mise à jour d'un abonnement vendeur, si la session en concerne un.
    if (metadata.planId && metadata.userId) {
      const validPlans = ["FREE", "TWENTY_BOOKS", "UNLIMITED"] as const;
      type PlanType = (typeof validPlans)[number];
      const planId = metadata.planId as PlanType;
      const planToSave: PlanType = validPlans.includes(planId) ? planId : "FREE";

      await prisma.user.update({
        where: { id: metadata.userId },
        data: {
          subscriptionPlan: planToSave,
          subscriptionActive: true,
          subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          stripeCustomerId: typeof session.customer === "string" ? session.customer : null,
          stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : null,
        },
      });
    }
  }

  return NextResponse.json({ received: true });
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
