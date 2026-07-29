import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'

// ✅ CORRECTION : Cette route est maintenant sécurisée.
// Elle nécessite une session utilisateur valide et ne permet PAS
// de forcer le statut COMPLETED sans passer par le flux de paiement réel.

export async function POST(request: Request) {
  try {
    // 1. Vérification d'authentification obligatoire
    const user = await getSessionUser()
    if (!user) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    const body = await request.json()
    const bookId = body.bookId || body.items?.[0]?.bookId

    if (!bookId) {
      return NextResponse.json({ error: 'bookId requis' }, { status: 400 })
    }

    const book = await prisma.book.findUnique({ where: { id: bookId } })
    if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
    if (book.buyPrice == null) return NextResponse.json({ error: 'Book not for sale' }, { status: 400 })

    // ✅ CORRECTION : Ne jamais créer une commande COMPLETED depuis cet endpoint
    // La commande doit passer par le flux de paiement (Stripe ou MVola)
    const order = await prisma.order.create({
      data: { 
        userId: user.id, // Utiliser l'ID de la session, pas celui du body
        type: 'BUY',
        paymentMethod: 'MOBILE_MONEY',
        paymentStatus: 'PENDING', // ✅ PENDING au lieu de COMPLETED
        deliveryStatus: 'PENDING',
        amount: book.buyPrice,
        paidToVendor: false,
        clientTrxRef: `TRX-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
        mvolaStatus: 'EN_ATTENTE_CLIENT',
        platformFee: book.buyPrice * 0.10,
        vendorPaymentAmount: book.buyPrice * 0.90,
      },
      include: { book: true, user: true }
    })
    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error("Erreur création commande:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
