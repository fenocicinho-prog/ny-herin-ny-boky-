// app/api/mvola/receive/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
      where: { id: clientTrxRef }
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
        paymentStatus: "COMPLETED"
      }
    })

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
