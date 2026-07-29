import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma' // ✅ Singleton Prisma
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const sessionUser = await getSessionUser()
  if (!sessionUser || sessionUser.role !== "ADMIN") {
    console.log("Accès refusé. Session:", !!sessionUser, "Role:", sessionUser?.role)
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 })
  }   

  const orders = await prisma.order.findMany({
    where: { mvolaStatus: "EN_ATTENTE_VERIFICATION" },
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: { firstName: true, lastName: true, email: true }
      },
      items: {
        include: {
          book: { select: { title: true } },
          seller: {
            select: { firstName: true, lastName: true, mvolaNumber: true }
          }
        }
      }
    }
  })
  
  return NextResponse.json(orders);
}
