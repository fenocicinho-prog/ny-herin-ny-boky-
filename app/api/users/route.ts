import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
    const body = await request.json()
    const { email, password, firstName, lastName, role } = body

    const user = await prisma.user.create({
        data: {
            email,
            password,
            firstName,
            lastName,
            role,

        },
    })

    return NextResponse.json(user, { status: 201})
}