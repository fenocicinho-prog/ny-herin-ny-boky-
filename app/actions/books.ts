"use server";

import { requireAuth, getSessionUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { BookCategory } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getStripe, SUBSCRIPTION_PLANS } from "@/lib/stripe-server";

const bookSchema = z.object({
  title: z.string().min(2, "Nom du livre requis"),
  description: z.string().optional(),
  buyPrice: z.coerce.number().min(0).optional(),
  rentPrice: z.coerce.number().min(0).optional(),
  category: z.enum(["SCIENCE", "MALAGASY", "LITTERATURE", "HISTOIRE", "AUTRE"]),
  imageUrl: z.string().optional(),
});

export async function addBookAction(formData: FormData) {
  const user = await getSessionUser();
  if (!user || user.role!== "VENDOR") {
    throw new Error("Midira aloha."); // <- throw au lieu de return
  }

  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    buyPrice: formData.get("buyPrice") || undefined,
    rentPrice: formData.get("rentPrice") || undefined,
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl") || undefined,
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message || "Données invalides"); // <- throw
  }

  const bookCount = await prisma.book.count({ where: { vendorId: user.id } });
  const maxBooks =
    user.subscriptionPlan === "UNLIMITED"
     ? Infinity
      : user.subscriptionPlan === "TWENTY_BOOKS"
       ? 20
        : user.subscriptionPlan === "FREE"
       ? 1
        : 0;

  if (bookCount >= maxBooks) {
    redirect("/vendeur/dashboard/abonnement"); // <- redirect direct si limite
  }

  await prisma.book.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description,
      buyPrice: parsed.data.buyPrice,
      rentPrice: parsed.data.rentPrice,
      category: parsed.data.category as BookCategory,
      imageUrl: parsed.data.imageUrl,
      vendorId: user.id,
    },
  })
  
  revalidatePath('/')
  revalidatePath('/vendeur')
  revalidatePath('/vendeur/dashboard')
  
  redirect("/vendeur/dashboard"); // <- redirect à la fin
}

export async function createSubscriptionCheckoutAction(plan: "TWENTY_BOOKS" | "UNLIMITED"): Promise<void> { // <- Promise<void>
  const user = await requireAuth("VENDOR");
  const planInfo = SUBSCRIPTION_PLANS[plan];

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: `Abonnement ${planInfo.name} - NY HERIN'NY BOKY`,
              description: planInfo.description,
            },
            unit_amount: planInfo.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "subscription",
        planId: plan,
        userId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/vendeur/dashboard?cancelled=true`,
    });

    if (!session.url) throw new Error("Impossible de créer la session de paiement");
    redirect(session.url);
  } catch (e) {
    console.error(e);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        subscriptionPlan: plan,
        subscriptionActive: true,
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    redirect("/vendeur/dashboard/nouveau-livre");
  }
}

export async function skipSubscriptionForDevAction(plan: "FREE" | "TWENTY_BOOKS" | "UNLIMITED"): Promise<void> {
  const user = await requireAuth("VENDOR");
  await prisma.user.update({
    where: { id: user.id },
    data: { subscriptionPlan: plan, subscriptionActive: true, subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)},
  });
  redirect("/vendeur/dashboard/nouveau-livre");
}

export async function activateFreeSubscriptionAction(): Promise<void> { // <- Promise<void>
  const user = await requireAuth("VENDOR");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionPlan: "FREE",
      subscriptionActive: true,
      subscriptionEndsAt: null
    },
  });
  redirect("/vendeur/dashboard"); // <- AJOUTÉ le redirect qui manquait
}

export async function deleteBookAction(bookId: string): Promise<void> {
  const user = await getSessionUser()
  if (!user) throw new Error('Non connecte') // <- throw
  await prisma.book.delete({
    where: { id: bookId, vendorId: user.id }
  })
  revalidatePath('/')
  revalidatePath('/vendeur')
  revalidatePath('/vendeur/dashboard')
  redirect('/vendeur/dashboard') // <- redirect pour refresh
}

export async function updateBookAction(prevState: unknown, formData: FormData ): Promise<void> {
  const bookId = formData.get('bookId') as string
  const user = await getSessionUser()
  if (!user) throw new Error('Non connecte') // <- throw

  await prisma.book.update({
    where: { id: bookId, vendorId: user.id },
    data: {
      title: formData.get('title') as string,
      buyPrice: parseFloat(formData.get('buyPrice') as string),
      rentPrice: parseFloat(formData.get('rentPrice') as string),
      description: formData.get('description') as string,
      category: formData.get('category') as BookCategory,
      imageUrl: formData.get('imageUrl') as string,
    }
  })
  revalidatePath('/')
  revalidatePath('/vendeur')
  revalidatePath('/vendeur/dashboard')
  redirect('/vendeur/dashboard')
}