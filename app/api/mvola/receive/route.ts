// app/api/mvola/receive/route.ts
import { prisma } from '@/lib/prisma'

// SECRET pour sécuriser. Mets la même valeur dans l'app Android
const WEBHOOK_SECRET = process.env.MVOLA_WEBHOOK_SECRET || "nyherinnyboky2026"

export async function POST(req: Request) {
  try {
    const { clientTrxRef, adminTrxRef, secret } = await req.json()
    
    // 1. Sécurité basique
    if(secret !== WEBHOOK_SECRET) {
      return Response.json({ error: "Non autorisé" }, { status: 401 })
    }

    // 2. On cherche la commande avec la ref du client
    const order = await prisma.order.findUnique({
      where: { clientTrxRef }
    })

    if(!order) {
      return Response.json({ error: "Commande non trouvée" }, { status: 404 })
    }

    // 3. On met à jour le statut
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        adminTrxRef, // La ref TRX que MVola renvoie à toi
        mvolaStatus: "PAYE",
        paymentStatus: "COMPLETED"
      }
    })

    return Response.json({ 
      success: true, 
      message: "Paiement confirmé",
      orderId: updatedOrder.id 
    })
    
  } catch (error: unknown) {
    console.error("ERREUR WEBHOOK MVOLA:", error)
    const errormessage = error instanceof Error
    ? error.message
    : JSON.stringify(error)
    
    return Response.json({
      error: errormessage,
      details: String(error)
    }, { status: 500 })
  }
}