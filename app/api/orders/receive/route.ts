import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 });

    const body = await request.json();
    const { orderId } = body;
    if (!orderId) return NextResponse.json({ error: "orderId requis" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });

    // Vérifier que la commande appartient à l'utilisateur
    if (order.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    // ✅ CORRECTION : Ne permettre la réception que si le paiement est COMPLETED
    if (order.paymentStatus !== "COMPLETED") {
      return NextResponse.json({ 
        error: "Le paiement n'a pas encore été validé. Attendez la confirmation de l'administrateur." 
      }, { status: 400 });
    }

    // Marquer comme reçu et libérer les fonds au vendeur
    await prisma.order.update({
      where: { id: orderId },
      data: { deliveryStatus: "RECEIVED", paidToVendor: true },
    });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export const runtime = 'nodejs';
