// app/api/admin/validate-payment/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId } = body;

  try {
    // 1. Récupérer la commande avec ses items pour recalculer si nécessaire
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // 2. (Optionnel) Recalculer le montant à reverser si votre logique dépend des items
    // Si votre champ vendorPaymentAmount est déjà correct dans la DB, sautez cette étape.
    // Sinon, calculez-le ici :
    const calculatedVendorAmount = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0) - order.platformFee;
    
    // 3. Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        mvolaStatus: "TERMINE",
        paymentStatus: "COMPLETED",
        // Si vous devez forcer la mise à jour du montant, décommentez ceci :
        vendorPaymentAmount: calculatedVendorAmount, 
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Erreur validation:", error);
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }
}   