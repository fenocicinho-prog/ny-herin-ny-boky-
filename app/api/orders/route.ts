import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const userId = body.userId || body.buyerId // Accepte les 2 noms
  const bookId = body.bookId || body.items?.[0]?.bookId // Accepte les 2 formats

  if (!userId ||!bookId) {
    return NextResponse.json({ error: 'userId et bookId requis' }, { status: 400 })
  }

  const book = await prisma.book.findUnique({ where: { id: bookId } })
  if (!book) return NextResponse.json({ error: 'Book not found' }, { status: 404 })
  if (book.buyPrice == null) return NextResponse.json({ error: 'Book not for sale' }, { status: 400 })

  const order = await prisma.order.create({
    data: { 
      userId, 
      bookId, 
      type: 'BUY',
      paymentMethod: 'STRIPE',
      paymentStatus: 'COMPLETED', 
      amount: book.buyPrice,
    },
    include: { book: true, user: true }
  })
  return NextResponse.json(order, { status: 201 })
}