// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const SESSION_COOKIE = "marketbook_session"; 
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    // Validation basique de l'input
    if (!email || !password || typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

    // ✅ CORRECTION : Toujours utiliser bcrypt.compare, jamais de comparaison en clair
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) return NextResponse.json({ error: "Identifiants invalides" }, { status: 401 });

    // Stocker uniquement l'ID (string) avec le bon nom de cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: SESSION_MAX_AGE,
      path: '/',
      sameSite: 'lax'
    });

    return NextResponse.json({ success: true, role: user.role, isAdmin: user.isAdmin });
  } catch (error) {
    console.error("Erreur Login:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
