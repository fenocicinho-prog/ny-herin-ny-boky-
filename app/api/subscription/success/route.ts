import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe-server";

export async function GET(req: Request) {
  const user = await requireAuth("VENDOR");
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("session_id");

  const baseUrl = new URL(req.url).origin;

  if (!sessionId) {
    return NextResponse.redirect(new URL("/vendeur/dashboard/abonnement?error=missing_session", baseUrl));
  }

  try {
    const session = await getStripe().checkout.sessions.retrieve(sessionId, {
      expand: ["customer"],
    });

    if (session.payment_status !== "paid") {
      return NextResponse.redirect(new URL("/vendeur/dashboard/abonnement?error=payment_failed", baseUrl));
    }

    const planId = session.metadata?.planId as
      | "FREE"
      | "TWENTY_BOOKS"
      | "UNLIMITED";
    const userId = session.metadata?.userId as string | undefined;

    // ✅ Sécurité : vérifier que l'userId du metadata correspond à l'utilisateur connecté
    if (!planId || !userId || user.id !== userId) {
      return NextResponse.redirect(new URL("/vendeur/dashboard/abonnement?error=invalid_session", baseUrl));
    }

    // ✅ Sécurité : vérifier que le planId est valide
    const validPlans = ["FREE", "TWENTY_BOOKS", "UNLIMITED"] as const;
    const planToSave = validPlans.includes(planId as typeof validPlans[number]) 
      ? planId 
      : "FREE";

    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: planToSave,
        subscriptionActive: true,
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: session.customer as string,
        stripeSubscriptionId: session.subscription as string,
      },
    });

    return NextResponse.redirect(new URL("/vendeur/dashboard/nouveau-livre?success=1", baseUrl));
  } catch (error) {
    console.error("Subscription success handler failed:", error);
    return NextResponse.redirect(new URL("/vendeur/dashboard/abonnement?error=subscription_update_failed", baseUrl));
  }
}
