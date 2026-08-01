"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { SubscriptionStatus } from "@prisma/client";
import {
  createSession,
  destroySession,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
    
const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
});

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });

  if (!user || !(await verifyPassword(parsed.data.password, user.password))) {
    return { error: "Email ou mot de passe incorrect" };
  }

  await createSession(user.id);

  if (user.role === "VENDOR") {
    redirect("/vendeur");
  }
  redirect("/client");
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

const clientRegisterSchema = z.object({
  firstName: z.string().min(2, "Prénom requis"),
  lastName: z.string().min(2, "Nom requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
  reasonForJoining: z.string().min(1, "Raison requise"),
  bookTypesSought: z.string().min(1, "Types de livres requis"),
  location: z.string().min(2, "Localisation requise"),
});

export async function registerClientAction(formData: FormData) {
  const parsed = clientRegisterSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    reasonForJoining: formData.get("reasonForJoining"),
    bookTypesSought: formData.get("bookTypesSought"),
    location: formData.get("location"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Cet email est déjà utilisé" };
  }

  const hashed = await hashPassword(parsed.data.password);
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: hashed,
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      role: "CLIENT",
      reasonForJoining: parsed.data.reasonForJoining,
      bookTypesSought: parsed.data.bookTypesSought,
      location: parsed.data.location,
    },
  });

  await createSession(user.id);
  redirect("/client");
}

const vendorStep1Schema = z.object({
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe minimum 6 caractères"),
  location: z.string().min(2, "Localisation requise"),
  postalCode: z.string().min(3, "Code postal requis"),
});

// app/actions/auth.ts
// app/actions/auth.ts
// app/actions/auth.ts
export async function registerVendorStep1Action(formData: FormData) {
  // 1. Récupération
  const sellerPlanType = formData.get("sellerPlanType") as "COMMISSION" | "ABONNEMENT";
  const mvolaNumber = formData.get("mvolaNumber") as string;

  console.log("🔍 VALEUR REÇUE :", sellerPlanType); // Vérifiez ce log dans le terminal

  // 2. Validation (inchangé)
  const parsed = vendorStep1Schema.safeParse({
    companyName: formData.get("companyName"),
    email: formData.get("email"),
    password: formData.get("password"),
    location: formData.get("location"),
    postalCode: formData.get("postalCode"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "Cet email est déjà utilisé" };
  }

  const hashed = await hashPassword(parsed.data.password);
  
  // 3. Création utilisateur avec le plan
  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      password: hashed,
      companyName: parsed.data.companyName || undefined,
      location: parsed.data.location || undefined,
      postalCode: parsed.data.postalCode || undefined,
      mvolaNumber: mvolaNumber || undefined,
      role: "VENDOR",
      sellerPlanType: sellerPlanType || "COMMISSION",
      // Astuce : Si c'est un abonnement, on peut marquer un statut "PENDING" en attendant Stripe
      subscriptionStatus: sellerPlanType === "ABONNEMENT" 
      ? SubscriptionStatus.PENDING 
      : SubscriptionStatus.ACTIVE,
    },
  });

  await createSession(user.id);
  
  // 4. Redirection conditionnelle
  if (sellerPlanType === "ABONNEMENT") {
    // Comme Stripe n'est pas prêt, on redirige aussi vers les livres pour l'instant
    // Mais vous pourrez changer cette ligne plus tard vers "/inscription/vendeur/abonnement"
    console.log("➡️ Choix Abonnement (Stripe en attente) - Redirection vers Livres");
    redirect("/inscription/vendeur/livres");
  } else {
    // Choix Commission
    console.log("➡️ Choix Commission - Redirection vers Livres");
    redirect("/inscription/vendeur/livres");
  }
}   