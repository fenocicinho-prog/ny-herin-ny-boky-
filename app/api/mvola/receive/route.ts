// app/api/mvola/receive/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSaleEmail } from "@/lib/send-sale-email";

// SECRET pour sécuriser. Mets la même valeur dans l'app Android
const WEBHOOK_SECRET = process.env.MVOLA_WEBHOOK_SECRET || "nyherinnyboky2026"

export async function POST(req: Request) {
  try {
    const { clientTrxRef, adminTrxRef, secret } = await req.json()
    
    // 1. Sécurité basique
    if (secret !== WEBHOOK_SECRET) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // 2. On cherche la commande avec la ref du client
    const order = await prisma.order.findUnique({
      where: { clientTrxRef: clientTrxRef }
    })

    if (!order) {
      return NextResponse.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // 3. On met à jour le statut
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        adminTrxRef,
        mvolaStatus: "PAYE",
        paymentStatus: "COMPLETED",
        deliveryStatus: "IN_TRANSIT"
      },
      include: {
        items: { include: { book: true, seller: true } },
        user: true,
      }
    })

    // 4. Notification par email
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
      console.error("Erreur notification email MVola:", emailErr);
    }

    return NextResponse.json({ 
      success: true, 
      message: "Paiement confirmé",
      orderId: updatedOrder.id 
    })
    
  } catch (error: unknown) {
    console.error("ERREUR WEBHOOK MVOLA:", error)
    const errorMessage = error instanceof Error
      ? error.message
      : "Erreur inconnue"
    
    return NextResponse.json({
      error: errorMessage,
      details: String(error)
    }, { status: 500 })
  }
}
