"use server";

import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getStripe, SUBSCRIPTION_PLANS } from "@/lib/stripe-server";
import { prisma } from "@/lib/prisma";

export async function selectSubscriptionPlan(formData: FormData) {
  const planId = formData.get("planId") as "TWENTY_BOOKS" | "UNLIMITED";
  const user = await requireAuth("VENDOR");
  const plan = SUBSCRIPTION_PLANS[planId];

  if (!plan) return { error: "Plan diso." };

  try {
     const session = await getStripe().checkout.sessions.create({
       mode: "payment",
       payment_method_types: ["card"],
       line_items: [
         {
           price_data: {
             currency: "eur",
             product_data: {
               name: `Abonnement ${plan.nameKey} - NY HERIN'NY BOKY`,
               description: plan.descriptionKey,
             },
             unit_amount: plan.price,
           },
           quantity: 1,
         },
       ],
       metadata: {
         type: "subscription",
         plan: planId,
         userId: user.id,
       },
       success_url: `${process.env.NEXT_PUBLIC_APP_URL}/inscription/vendeur/livres?success=true`,
       cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/inscription/vendeur/abonnement?cancelled=true`,
     });

     if (session.url) {
       redirect(session.url);
    }
    return { error: "Tsy afaka namorona ny fandoavana." };
  } catch {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionPlan: planId, subscriptionActive: true },
    });
    redirect("/inscription/vendeur/livres");
  }
}
