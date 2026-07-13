import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import type { Role } from "@prisma/client";

const SESSION_COOKIE = "marketbook_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, userId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      companyName: true,
      location: true,
      postalCode: true,
      subscriptionPlan: true,
      subscriptionActive: true,
      subscriptionEndsAt: true,
      createdAt: true,
    },
  });

  if (
    user &&
    user.subscriptionActive &&
    user.subscriptionEndsAt &&
    user.subscriptionEndsAt.getTime() <= Date.now()
  ) {
    await prisma.user.update({
      where: { id: user.id },
      data: { subscriptionActive: false },
    });
    return { ...user, subscriptionActive: false };
  }

  return user;
}

export function isSubscriptionValid(user: { subscriptionActive: boolean; subscriptionEndsAt: Date | null } | null) {
  if (!user || !user.subscriptionActive) return false;
  if (!user.subscriptionEndsAt) return true;
  return user.subscriptionEndsAt.getTime() > Date.now();
}

export function getSubscriptionDaysRemaining(user: { subscriptionEndsAt: Date | null } | null) {
  if (!user?.subscriptionEndsAt) return null;
  const diff = user.subscriptionEndsAt.getTime() - Date.now();
  return diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export async function requireAuth(role?: Role) {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Non authentifié");
  }
  if (role && user.role !== role) {
    throw new Error("Accès non autorisé");
  }
  return user;
}

export type SessionUser = NonNullable<Awaited<ReturnType<typeof getSessionUser>>>;

export const getSession = getSessionUser;
