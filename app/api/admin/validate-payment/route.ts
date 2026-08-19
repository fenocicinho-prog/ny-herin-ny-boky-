// app/api/admin/validate-payment/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyOrderVendors } from "@/lib/notify-order-vendors";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await getSessionUser();

  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const { orderId } = body;

  if (!orderId) {
    return NextResponse.json({ error: "orderId requis" }, { status: 400 });
  }

  try {
    // 1. Récupérer la commande avec ses items pour recalculer si nécessaire
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { book: true, seller: true } }, user: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    }

    // ✅ CORRECTION : Vérifier que la commande n'est pas déjà validée (idempotence)
    if (order.mvolaStatus === "TERMINE" || order.paymentStatus === "COMPLETED") {
      return NextResponse.json({ 
        success: true, 
        message: "Cette commande est déjà validée",
        order 
      });
    }

    // 2. Recalculer le montant à reverser (harmonisation)
    const calculatedVendorAmount = order.items.reduce(
      (sum, item) => sum + (item.price * item.quantity), 0
    ) - order.platformFee;
    
    // 3. Mettre à jour la commande
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        mvolaStatus: "TERMINE",
        paymentStatus: "COMPLETED",
        deliveryStatus: "IN_TRANSIT",
        vendorPaymentAmount: calculatedVendorAmount, 
      },
    });

    // Après la validation, notifier chaque vendeur avec les livres concernés.
    try {
      await notifyOrderVendors(orderId);
    } catch (notifyError) {
      console.error("Erreur notification vendeur:", notifyError);
    }

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("Erreur validation:", error);
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }
}
