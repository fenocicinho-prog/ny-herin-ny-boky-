import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

export async function GET() {
  const books = await prisma.book.findMany({
    include: { vendor: { select: { firstName: true, lastName: true } } }
  })
  return Response.json(books)
}

// ✅ CORRECTION : Sécuriser la création de livres avec authentification et bcrypt
export async function POST(request: Request) {
  try {
    const user = await getSessionUser()
    if (!user || user.role !== "VENDOR") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
    }

    const body = await request.json()
    
    // Utiliser l'ID de l'utilisateur connecté comme vendeur
    const book = await prisma.book.create({
      data: {
        title: body.title,
        buyPrice: body.buyPrice,
        rentPrice: body.rentPrice,
        condition: body.condition || 'GOOD',
        category: body.category || 'MALAGASY',
        description: body.description || '',
        vendorId: user.id
      }
    })
    return NextResponse.json(book, { status: 201 })
  } catch (error) {
    console.error("Erreur création livre:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
