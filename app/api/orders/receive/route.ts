import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { orderId } = body;
    if (!orderId) return NextResponse.json({ error: "orderId requis" }, { status: 400 });

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: "Commande introuvable" }, { status: 404 });
    if (order.userId !== user.id) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

    // Mark as received and release funds to vendor (simulate by setting paidToVendor=true)
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
