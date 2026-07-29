import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSessionUser } from "@/lib/auth" 
import { v4 as uuidv4 } from 'uuid'

type CartItem = {
  bookId: string
  qty: number
  // On supprime price et sellerId du front. Trop dangereux
}

// Barème commission "ny herin'ny boky"
function calculerCommission(prix: number): number {
  if (prix <= 50000) return Math.round(prix * 0.08)
  if (prix <= 90000) return Math.round(prix * 0.07)
  return Math.round(prix * 0.05)
}

export async function POST(req: NextRequest) {
  try {
    // 1. AUTH
    const user = await getSessionUser()
    if(!user) return NextResponse.json({ error: "Non connecté" }, { status: 401 })

    // 2. VALIDATION INPUT
    const { cart }: { cart: CartItem[] } = await req.json()
    if (!cart || cart.length === 0) {
      return NextResponse.json({ error: "Panier vide" }, { status: 400 })
    }

    // 3. FETCH BDD + SÉCURITÉ
    const bookIds = [...new Set(cart.map(i => i.bookId))] // enleve doublons
    const booksFromDB = await prisma.book.findMany({ 
      where: { id: { in: bookIds }},
      select: { id: true, price: true, stock: true, sellerId: true, title: true }
    })

    if (booksFromDB.length !== bookIds.length) {
      return NextResponse.json({ error: "Un des livres n'existe plus" }, { status: 404 })
    }

    // 4. RECALCUL TOTAL + COMMISSIONS + VÉRIF STOCK
    let realTotal = 0
    let totalPlatformFee = 0
    const orderItemsData = []

    for (const item of cart) {
      const book = booksFromDB.find(b => b.id === item.bookId)
      if (!book) continue // sécurité

      if (book.stock < item.qty) {
        return NextResponse.json({ error: `Stock insuffisant: ${book.title}` }, { status: 400 })
      }

      const itemSubtotal = book.price * item.qty
      const itemCommission = calculerCommission(itemSubtotal)

      realTotal += itemSubtotal
      totalPlatformFee += itemCommission

      orderItemsData.push({
        bookId: book.id,
        sellerId: book.sellerId, // <- ON PREND DE LA BDD, PAS DU FRONT
        quantity: item.qty,
        price: book.price, // <- PRIX OFFICIEL BDD
      })
    }

    const vendorPaymentAmount = realTotal - totalPlatformFee

    // 5. CRÉATION COMMANDE
    const clientTrxRef = `MB-${uuidv4().slice(0, 8).toUpperCase()}`
    
    const order = await prisma.order.create({
      data: {
        userId: user.id,
        clientTrxRef,
        amount: realTotal, // <- CORRIGÉ
        paymentMethod: "MVOLA",
        paymentStatus: "PENDING",
        mvolaStatus: "EN_ATTENTE_CLIENT",
        deliveryStatus: "PENDING",
        paidToVendor: false,
        platformFee: totalPlatformFee, // <- CORRIGÉ
        vendorPaymentAmount: vendorPaymentAmount, // <- CORRIGÉ
        type: "BOOK",
        items: {
          create: orderItemsData // <- DONNÉES SÉCURISÉES
        }
      },
      include: { items: { include: { book: true } } }
    })

    // 6. RETOUR FRONT
    // Numéro MVola marchand principal - à mettre dans .env
    const sellerMvolaNumber = process.env.MVOLA_MERCHANT_NUMBER || "0320000000"

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      amount: order.amount, // <- CORRIGÉ
      clientTrxRef: order.clientTrxRef,
      sellerMvolaNumber
    }, { status: 201 })
    
  } catch (error: unknown) {
    console.error("ORDER_CREATE_ERROR", error)
    const errorMessage = error instanceof Error ? error.message : "Erreur serveur"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}