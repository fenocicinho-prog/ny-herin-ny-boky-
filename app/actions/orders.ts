"use server";

import { sendSaleEmail } from "@/lib/send-sale-email";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getStripe, MOBILE_MONEY_PHONE } from "@/lib/stripe-server";

// ✅ CORRECTION : Ajouter ON_SITE au schéma de validation pour le PaymentModal
const orderSchema = z.object({
  bookId: z.string(),
  type: z.enum(["BUY", "BORROW"]),
  paymentMethod: z.enum(["STRIPE", "MOBILE_MONEY", "ON_SITE"]),
  phoneNumber: z.string().optional(),
});

// ✅ Harmonisation : Utiliser la même fonction de commission partout
function calculerCommission(prix: number): number {
  if (prix <= 50000) return Math.round(prix * 0.08)
  if (prix <= 90000) return Math.round(prix * 0.07)
  return Math.round(prix * 0.05)
}

export async function createOrderAction(formData: FormData) {
  const user = await requireAuth("CLIENT");

  const parsed = orderSchema.safeParse({
    bookId: formData.get("bookId"),
    type: formData.get("type"),
    paymentMethod: formData.get("paymentMethod"),
    phoneNumber: formData.get("phoneNumber") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || "Données invalides" };
  }

  const book = await prisma.book.findUnique({
    where: { id: parsed.data.bookId },
  });

  if (!book) {
    return { error: "Livre introuvable" };
  }

  // 1. Calcul sécurisé du montant (Achat ou Location)
  const amount = parsed.data.type === "BUY" ? (book.buyPrice ?? 0) : (book.rentPrice ?? 0);

  if (amount <= 0) {
    return { error: "Prix non disponible pour cette option" };
  }

  // ✅ CORRECTION : Utiliser la même fonction de commission (harmonisation)
  const platformFee = calculerCommission(amount);
  const vendorPaymentAmount = amount - platformFee;

  // ✅ CORRECTION : Gérer ON_SITE comme un flux MVola manuel (en attente de vérification admin)
  if (parsed.data.paymentMethod === "MOBILE_MONEY" || parsed.data.paymentMethod === "ON_SITE") {
    if (!parsed.data.phoneNumber) {
      return { error: "Numéro de téléphone requis pour Mobile Money" };
    }

    const clientTrxRef = `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const order = await prisma.order.create({
      data: {
        type: parsed.data.type,
        paymentMethod: "MOBILE_MONEY",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        amount,
        phoneNumber: parsed.data.phoneNumber,
        userId: user.id,
        paidToVendor: false,
        mvolaStatus: "EN_ATTENTE_CLIENT",
        clientTrxRef,
        platformFee,
        vendorPaymentAmount,
        items: {
          create: {
            bookId: book.id,
            sellerId: book.vendorId,
            quantity: 1,
            price: amount,
          }
        }
      },
      include: {
        user: true,
        items: { 
          include: { 
            book: true, 
            seller: true
          } 
        }
      }
    });

    const item = order.items[0];
    
    // 3. Envoi de l'email (Protégé contre les erreurs)
    if (item && item.seller && item.seller.email) {
      try {
        await sendSaleEmail({
          vendorEmail: item.seller.email,
          bookTitle: item.book.title,
          buyerName: order.user.firstName || order.user.email,
          price: order.amount,
          commission: order.platformFee,
          gain: order.vendorPaymentAmount
        });
      } catch (emailError) {
        console.error("Échec envoi email:", emailError);
      }
    }

    redirect(`/client/paiement-mvola/${order.id}`);
  }

  // Stripe checkout
  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: book.title },
            unit_amount: Math.round(amount * 100), // ✅ CORRECTION : Stripe attend des centimes
          },
          quantity: 1,
        },
      ],
      metadata: {
        type: "order",
        orderType: parsed.data.type,
        bookId: book.id,
        userId: user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/client?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/client?cancelled=true`,
    });

    const clientTrxRef = `STR-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    await prisma.order.create({
      data: {
        type: parsed.data.type,
        paymentMethod: "STRIPE",
        paymentStatus: "PENDING",
        deliveryStatus: "PENDING",
        amount,
        stripeSessionId: session.id,
        userId: user.id,
        clientTrxRef,
        mvolaStatus: "EN_ATTENTE_CLIENT",
        paidToVendor: false,
        platformFee,
        vendorPaymentAmount,
        items: {
          create: {
            bookId: book.id,
            sellerId: book.vendorId,
            quantity: 1,
            price: amount,
          },
        },
      },
    });

    if (session.url) {
      redirect(session.url);
    }
    return { error: "Impossible de créer la session de paiement" };
  } catch (e) {
    console.error(e);
    return {
      error: `Stripe non configuré. Utilisez Mobile Money au ${MOBILE_MONEY_PHONE}`,
    };
  }
}   

// ✅ CORRECTION CRITIQUE : Supprimer la fonction qui permettait au client de marquer
// lui-même sa commande comme payée. Le client doit maintenant passer par le flux
// de soumission de preuve MVola (submitMvolaProof) qui envoie la commande
// en "EN_ATTENTE_VERIFICATION" pour que l'admin la valide.

// Remplacée par une fonction qui redirige uniquement vers la page de soumission de preuve
export async function goToMvolaProof(orderId: string) {
  const user = await requireAuth("CLIENT");

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: user.id, paymentMethod: "MOBILE_MONEY" },
  });

  if (!order) {
    return { error: "Commande introuvable" };
  }

  if (order.paymentStatus === "COMPLETED") {
    redirect("/client?success=true");
  }

  redirect(`/client/paiement-mvola/${order.id}`);
}

export async function confirmMobilePaymentFormAction(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  // ✅ Cette fonction est maintenant un simple redirect vers la preuve MVola
  goToMvolaProof(orderId);
}

export async function searchBooksAction(query: string, category?: string) {
  const where: Record<string, unknown> = {};

  if (query) {
    where.OR = [
      { title: { contains: query } },
      { description: { contains: query } },
    ];
  }

  if (category && category !== "ALL") {
    where.category = category;
  }

  return prisma.book.findMany({
    where,
    include: {
      vendor: {
        select: { companyName: true, location: true },
      },
      items: {
        include: {
          order: {
            select: { paymentStatus: true }
          }
        }
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getTopBooks() {
  const books = await prisma.book.findMany({
    include: {
      vendor: {
        select: {
          companyName: true
        }
      },
      items: {
        include: {
          order: {
            select: {
              paymentStatus: true
            }
          }
        }
      }
    }
  });   
  return books.map((book) => {
    const completedItems = book.items.filter(
      (item) => item.order.paymentStatus === "COMPLETED"
    );

    return {
      ...book,
      items: completedItems,
      totalSales: completedItems.length, 
    };
  }).filter(book => book.items.length > 0);
}

export async function getVendors() {
  return prisma.user.findMany({
    where: { role: "VENDOR", subscriptionActive: true },
    select: {
      id: true,
      companyName: true,
      location: true,
      books: { select: { id: true } },
    },
  });
}

export async function getVendorStats(vendorId: string) {
  const [sold, borrowed, bookCount] = await Promise.all([
    prisma.order.count({
      where: {
        items: {
          some: {
            book: { vendorId },
          },
        },
        type: "BUY",
        paymentStatus: "COMPLETED",
      },
    }),
    prisma.order.count({
      where: {
        items: {
          some: {
            book: { vendorId },
          },
        },
        type: "BORROW",
        paymentStatus: "COMPLETED",
      },
    }),
    prisma.book.count({
      where: { vendorId },
    }),
  ]);

  return { sold, borrowed, bookCount };
}   

export async function submitMvolaProof(formData: FormData) {
  const orderId = formData.get("orderId") as string;
  const clientTrxRef = formData.get("clientTrxRef") as string;

  const cleanRef = clientTrxRef.trim().toUpperCase();

  if (!cleanRef || cleanRef.length < 5) {
    return { error: "La référence de transaction semble invalide." };
  }

  try {
    const existingOrder = await prisma.order.findFirst({
      where: {
        clientTrxRef: cleanRef,
        id: { not: orderId },
      },
    });

    if (existingOrder) {
      return { 
        error: "Cette référence de transaction a déjà été utilisée." 
      };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        clientTrxRef: cleanRef,
        mvolaStatus: "EN_ATTENTE_VERIFICATION",
        paymentStatus: "PENDING", 
      },
    });

    return { success: true, orderId };
    
  } catch (error) {
    console.error("Erreur lors de la validation MVola :", error);
    return { error: "Une erreur technique est survenue. Veuillez réessayer." };
  }
}
