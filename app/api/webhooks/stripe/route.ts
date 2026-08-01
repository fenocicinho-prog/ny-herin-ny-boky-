import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";
import { sendSaleEmail } from "@/lib/send-sale-email";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const headerList = await headers();
  const signature = headerList.get("stripe-signature") as string;
  
  let event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error";
    console.error("Webhook Error:", errorMessage); 
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // 1. CAS PAIEMENT D'UN LIVRE
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    
    // Si orderId est fourni, on met à jour la commande existante
    if (session.metadata?.orderId) {
      const { orderId } = session.metadata;
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (!order) {
        console.error("Commande introuvable pour orderId webhook:", orderId);
      } else {
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: "COMPLETED",
            deliveryStatus: "IN_TRANSIT",
            stripeSessionId: session.id,
            mvolaStatus: "PAYE",
          },
          include: {
            items: { include: { book: true, seller: true } },
            user: true,
          },
        });
        console.log("Commande mise à jour par webhook (COMPLETED, IN_TRANSIT):", orderId);

        // Envoyer l'email aux vendeurs
        try {
          if (updatedOrder.items) {
            for (const item of updatedOrder.items) {
              const seller = item.seller;
              if (seller && seller.email) {
                await sendSaleEmail({
                  vendorEmail: seller.email,
                  bookTitle: item.book?.title || 'Votre livre',
                  buyerName: updatedOrder.user?.firstName || updatedOrder.user?.email || 'Acheteur',
                  price: updatedOrder.amount,
                  commission: updatedOrder.platformFee,
                  gain: updatedOrder.vendorPaymentAmount,
                  buyerPhone: updatedOrder.phoneNumber || updatedOrder.user?.phoneNumber || null,
                  deliveryLocation: updatedOrder.deliveryLocation || updatedOrder.user?.location || null,
                });
              }
            }
          }
        } catch (emailErr) {
          console.error("Erreur envoi email webhook Stripe:", emailErr);
        }
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
