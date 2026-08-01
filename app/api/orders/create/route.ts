import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth"

type CartItem = {
  bookId: string
  qty: number
}

// Barème commission "ny herin'ny boky" (harmonisé avec createOrderAction)
function calculerCommission(prix: number): number {
  if (prix <= 50000) return Math.round(prix * 0.08)
  if (prix <= 90000) return Math.round(prix * 0.07)
  return Math.round(prix * 0.05)
}

export async function POST(req: NextRequest) {
  try {
    // 1. AUTH
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 })

    // 2. VALIDATION INPUT
    const { cart, deliveryLocation }: { cart: CartItem[]; deliveryLocation?: string } = await req.json()
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    // 3. FETCH BDD + SÉCURITÉ
    const bookIds = [...new Set(cart.map(i => i.bookId))]
    const booksFromDB = await prisma.book.findMany({ 
      where: { id: { in: bookIds }},
      select: { id: true, buyPrice: true, vendorId: true, title: true }
    })

    if (booksFromDB.length !== bookIds.length) {
      return NextResponse.json({ error: "Un des livres n'existe plus" }, { status: 404 })
    }

    // 4. RECALCUL TOTAL + COMMISSIONS
    let realTotal = 0
    let totalPlatformFee = 0
    const orderItemsData = []

    for (const item of cart) {
      const book = booksFromDB.find(b => b.id === item.bookId)
      if (!book) continue

      const itemSubtotal = (book.buyPrice ?? 0) * item.qty
      const itemCommission = calculerCommission(itemSubtotal)

      realTotal += itemSubtotal
      totalPlatformFee += itemCommission

      orderItemsData.push({
        bookId: book.id,
        sellerId: book.vendorId,
        quantity: item.qty,
        price: book.buyPrice ?? 0,
      })
    }

    const vendorPaymentAmount = realTotal - totalPlatformFee

    // 5. CRÉATION COMMANDE
    const clientTrxRef = `MB-${Date.now()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        deliveryLocation: deliveryLocation || null,
        clientTrxRef,
        amount: realTotal,
        paymentMethod: "MOBILE_MONEY",
        paymentStatus: "PENDING",
        mvolaStatus: "EN_ATTENTE_CLIENT",
        deliveryStatus: "PENDING",
        paidToVendor: false,
        type: "BUY",
        platformFee: totalPlatformFee,
        vendorPaymentAmount: vendorPaymentAmount,
        items: {
          create: orderItemsData
        }
      },
      include: { items: { include: { book: true } } }
    })

    // 6. RETOUR FRONT
    const sellerMvolaNumber = process.env.MVOLA_MERCHANT_NUMBER || "0320000000"

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      amount: order.amount,
      clientTrxRef: order.clientTrxRef,
      sellerMvolaNumber
    }, { status: 201 })
    
  } catch (error: unknown) {
    console.error("ORDER_CREATE_ERROR", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
