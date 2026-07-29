import { PrismaClient } from '@prisma/client'
import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'

const prisma = new PrismaClient()

export async function GET() {
  const sessionUser = await getSessionUser()
  if (!sessionUser || sessionUser.role !== "ADMIN") {
  console.log("❌ Accès refusé. Session:", !!sessionUser, "Role:", sessionUser?.role)
  return NextResponse.json({ error: "Non autorisé" }, { status: 403 }) // ✅ 403 pour "Interdit"
  }   

  const orders = await prisma.order.findMany({
    where: { mvolaStatus: "EN_ATTENTE_VERIFICATION" },
    orderBy: { createdAt: 'desc' },
    include: { // <- C'EST ÇA QUI MANQUE
      user: { // l'acheteur
        select: { firstName: true, lastName: true, email: true }
      },
      items: { // les articles de la commande
        include: {
          book: { select: { title: true} },
          seller: {
                select: { firstName: true, lastName: true, mvolaNumber: true }
          }
        }
      }
    }
  })
  
  return NextResponse.json(orders);
}