import Link from "next/link";
import { BookOpen, LogIn, UserPlus } from "lucide-react";
import { SITE_NAME } from "@/lib/constants";
import { logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";

interface HeaderProps {
  user?: SessionUser | null;
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <BookOpen className="h-8 w-8 text-amber-700" />
          <span className="text-xl font-bold text-amber-900">{SITE_NAME}</span>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <Link
                href={user.role === "VENDOR" ? "/vendeur" : "/client"}
                className="rounded-lg px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
              >
                {user.role === "VENDOR"
                  ? user.companyName || "Tableau de bord"
                  : `${user.firstName || "Mon"} espace`}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
                >
                  Miala
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="flex items-center gap-1 rounded-lg px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
              >
                <LogIn className="h-4 w-4" />
                Hiditra
              </Link>
              <Link
                href="/inscription/client"
                className="flex items-center gap-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                <UserPlus className="h-4 w-4" />
                Hisoratra
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
