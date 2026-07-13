import { prisma } from '@/lib/prisma'

export async function GET() {
  const books = await prisma.book.findMany({
    include: { vendor: { select: { firstName: true, lastName: true } } } // On prend juste le nom
  })
  return Response.json(books)
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // 1. On crée un vendeur test si pas déjà là
  const vendor = await prisma.user.upsert({
    where: { email: 'test@vendeur.mg' },
    update: {},
    create: {
      email: 'test@vendeur.mg',
      firstName: 'Feno',
      lastName: 'test',
      role: 'VENDOR',
      password: 'hash123' // On fera le vrai hash après
    }
  })

  // 2. On crée le livre avec son ID
  const book = await prisma.book.create({
    data: {
      title: body.title,
      buyPrice: body.buyPrice,
      rentPrice: body.rentPrice,
      condition: body.condition || 'GOOD',
      category: body.category || 'MALAGASY',
      description: body.description || '',
      vendorId: vendor.id
    }
  })
  return Response.json(book, { status: 201 })
}