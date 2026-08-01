"use server";

import { requireAuth, getSessionUser, isSubscriptionValid } from "@/lib/auth";
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
  category: z.enum(["Fiction", "NonFiction", "PoésieThéatre", "LivrespourlaJeunesse", "Référence", "Autre"]),
  imageUrl: z.string().optional(),
});

export async function addBookAction(formData: FormData) {
    const user = await getSessionUser();
    
  if (!user || user.role !== "VENDOR") {
    throw new Error("Midira aloha.");
  }

  // 1. Vérification explicite du mode
  const isCommission = user.sellerPlanType === "COMMISSION";

  // 2. Si COMMISSION, on définit une limite très haute immédiatement et on sort de la logique d'abonnement
  let maxBooks = 99999; // Illimité pour commission

  if (!isCommission) {
    // 3. Logique UNIQUEMENT pour les abonnés (SUBSCRIPTION)
    if (!isSubscriptionValid(user)) {
      redirect("/vendeur/dashboard/abonnement");
    }

    // Définir la limite selon le plan payé
    if (user.subscriptionPlan === "UNLIMITED") {
      maxBooks = 99999;
    } else if (user.subscriptionPlan === "TWENTY_BOOKS") {
      maxBooks = 20;
    } else if (user.subscriptionPlan === "FREE") {
      maxBooks = 1;
    } else {
      // Cas par défaut si le plan est inconnu (souvent la cause du bug "reste à 1")
      maxBooks = 0; 
    }
  }

  // 4. Vérification finale
  const bookCount = await prisma.book.count({ where: { vendorId: user.id } });
  const parsed = bookSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    buyPrice: formData.get("buyPrice") || undefined,
    rentPrice: formData.get("rentPrice") || undefined,
    category: formData.get("category"),
    imageUrl: formData.get("imageUrl") || undefined,
  });
  // Si on est en commission, maxBooks est 99999, donc cette condition sera toujours fausse.
  if (bookCount >= maxBooks) {
    redirect("/vendeur/dashboard/abonnement");
  };// 5. Création du livre

  if (!parsed.success) {
  throw new Error("Données invalides");
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
  });
  
  revalidatePath('/');
  revalidatePath('/vendeur');
  revalidatePath('/vendeur/dashboard');
  
  redirect("/vendeur/dashboard");
}   
export async function createSubscriptionCheckoutAction(plan: "TWENTY_BOOKS" | "UNLIMITED"): Promise<void> {
  const user = await requireAuth("VENDOR");

  // 🔒 SÉCURITÉ : Vérifier que l'utilisateur est bien en mode ABONNEMENT
  // Si l'utilisateur est en mode COMMISSION, il ne devrait pas accéder à ce paiement.
  if (user.sellerPlanType === "COMMISSION") {
    throw new Error("Accès refusé : Cette option est réservée aux vendeurs avec abonnement.");
  }

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
              name: `Abonnement ${planInfo.nameKey} - NY HERIN'NY BOKY`,
              description: planInfo.descriptionKey,
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
        // On s'assure que le plan type est bien noté
        sellerPlanType: "ABONNEMENT", 
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/vendeur/dashboard?cancelled=true`,
    });

    if (!session.url) {
      throw new Error("Impossible de créer la session de paiement");
    }

    // Redirection vers Stripe
    redirect(session.url);

  } catch (error) {
    console.error("Erreur Stripe Checkout:", error);
    
    // ⚠️ CORRECTION CRITIQUE :
    // On NE DOIT PAS mettre à jour la DB ici.
    // Si on fait ça, une simple erreur de réseau activerait l'abonnement gratuitement.
    // La mise à jour (subscriptionActive: true) doit se faire UNIQUEMENT dans le Webhook
    // qui reçoit la confirmation "checkout.session.completed" de Stripe.
    
    throw new Error("Erreur lors de la connexion à Stripe. Veuillez réessayer.");
  }
}   
export async function skipSubscriptionForDevAction(plan: "FREE" | "TWENTY_BOOKS" | "UNLIMITED") {
  const user = await requireAuth("VENDOR");
  
  await prisma.user.update({
    where: { id: user.id },
    data: { 
      subscriptionPlan: plan, 
      subscriptionActive: true, 
      subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      // ✅ COHÉRENCE : On force le mode ABONNEMENT
      sellerPlanType: "ABONNEMENT", 
    },
  });
  redirect("/vendeur/dashboard/nouveau-livre");
}

export async function activateFreeSubscriptionAction() {
  const user = await requireAuth("VENDOR");

  await prisma.user.update({
    where: { id: user.id },
    data: {
      subscriptionPlan: "FREE",
      subscriptionActive: true,
      subscriptionEndsAt: null,
      // ✅ COHÉRENCE : On force le mode ABONNEMENT
      sellerPlanType: "ABONNEMENT", 
    },
  });
  redirect("/vendeur/dashboard");
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

const updateBookSchema = z.object({
  title: z.string().min(2, "Titre requis"),
  buyPrice: z.coerce.number().min(0).optional(),
  rentPrice: z.coerce.number().min(0).optional(),
  description: z.string().optional(),
  category: z.enum(["Fiction", "NonFiction", "PoésieThéatre", "LivrespourlaJeunesse", "Référence", "Autre"]),
  imageUrl: z.string().optional(),
});

export async function updateBookAction(
  prevState: { error?: string; success?: boolean }, 
  formData: FormData
): Promise<{ error?: string; success?: boolean }> {
  
  const bookId = formData.get('bookId') as string
  const user = await getSessionUser()

  // 1. Gestion de l'authentification
  if (!user) {
    // Évitez throw, retournez l'erreur pour l'afficher
    return { error: 'Non connecté' }
  }

  // 2. Validation
  const parsed = updateBookSchema.safeParse({
    title: formData.get('title'),
    buyPrice: formData.get('buyPrice'),
    rentPrice: formData.get('rentPrice'),
    description: formData.get('description'),
    category: formData.get('category'),
    imageUrl: formData.get('imageUrl'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" }
  }

  // 3. Mise à jour DB
  try {
    await prisma.book.update({
      where: { id: bookId, vendorId: user.id }, // Sécurité: vérifie que le livre appartient au vendeur
      data: {
        title: parsed.data.title,
        buyPrice: parsed.data.buyPrice,
        rentPrice: parsed.data.rentPrice,
        description: parsed.data.description,
        category: parsed.data.category as BookCategory, // Adaptez le type si nécessaire
        imageUrl: parsed.data.imageUrl || null,
      }
    })

    // 4. Revalidation du cache
    revalidatePath('/vendeur/dashboard')
    
    // ✅ SUCCÈS : Retournez un état, ne faites PAS de redirect ici
    return { success: true, error: undefined }
    
  } catch (err) {
    console.error(err)
    return { error: "Erreur lors de la mise à jour" }
  }
}