import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionUser } from '@/lib/auth'
import bcrypt from 'bcryptjs'

// ✅ SECURISÉ : Cet endpoint nécessite une session et interdit les comptes ADMIN.
// Les mots de passe sont toujours hashés avec bcrypt.

export async function POST(request: Request) {
  try {
    // 1. Vérification d'authentification obligatoire
    const sessionUser = await getSessionUser()
    if (!sessionUser) {
      return NextResponse.json({ error: "Vous devez être connecté" }, { status: 401 })
    }

    const body = await request.json()
    const { email, password, firstName, lastName, role } = body

    // 2. Validation des données
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: "Tous les champs sont requis" }, { status: 400 })
    }

    // 3. Interdire la création de comptes ADMIN via l'API
    if (role === 'ADMIN') {
      return NextResponse.json({ 
        error: "La création de comptes administrateur n'est pas autorisée via cette API. Contactez le support." 
      }, { status: 403 })
    }

    // 4. Vérifier que l'email n'est pas déjà utilisé
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Cet email est déjà utilisé" }, { status: 409 })
    }

    // 5. Toujours hasher le mot de passe avec bcrypt
    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || 'CLIENT',
      },
    })

    // Ne pas retourner le mot de passe
    const { password: _pwd, ...userWithoutPassword } = user
    return NextResponse.json(userWithoutPassword, { status: 201 })
  } catch (error) {
    console.error("Erreur création utilisateur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
