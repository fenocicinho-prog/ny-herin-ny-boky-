// components/layout/Header.tsx
"use client";

import Link from "next/link";
import { LogIn, UserPlus, LogOut, UserCircle } from "lucide-react";
import Image from "next/image";
import { logoutAction } from "@/app/actions/auth";
import type { SessionUser } from "@/lib/auth";
import { useLanguage } from "@/lib/LanguageContext";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { CartIcon } from "@/components/books/CartIcon";
// Importez la clé ou la fonction de traduction, pas la constante texte
// Si SITE_NAME est maintenant une clé dans vos traductions, utilisez-la via t()

interface HeaderProps {
  user?: SessionUser | null;
}

export function Header({ user }: HeaderProps) {
  const { t } = useLanguage();
 

  return (
    <header className="sticky top-0 z-50 border-b border-amber-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        {/* Logo & Nom du site */}
        <Link href="/" className="flex items-center gap-2">
          <div className="relative h-10 w-10 overflow-hidden rounded-lg">
            <Image
              src="/logo-ny-herin-ny-boky.png"
              alt="NY HERIN'NY BOKY"
              fill
              className="object-cover"
              sizes="40px"
            />
          </div>
          <span className="hidden text-xl font-bold text-amber-900 sm:inline-block" translate="no">
            Ny herin'ny boky
          </span>
        </Link>

        <nav className="flex items-center gap-3">
          <LanguageSwitcher />
          {user?.role === "CLIENT" && <CartIcon />}
          {user ? (
            <>
              <Link
                href={user.role === "VENDOR" ? "/vendeur" : "/client"}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
              >
                {user.role === "VENDOR" ? (
                  // Affichage Vendeur
                  <span className="flex items-center gap-1">
                    <UserCircle className="h-4 w-4" />
                    {user.companyName || t("nav.vendor")}
                  </span>
                ) : (
                  // Affichage Client
                  <span className="flex items-center gap-1">
                    <UserCircle className="h-4 w-4" />
                    {/* Correction : Affiche Prénom + Nom ou "Profil" */}
                    {user.firstName || user.email.split('@')[0]} 
                  </span>
                )}
              </Link>
              
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="flex items-center gap-1 rounded-lg border border-amber-200 px-4 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
                  title={t("nav.logout")}
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">{t("nav.logout")}</span>
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
                <span className="hidden sm:inline">{t("nav.login")}</span>
              </Link>
              <Link
                href="/inscription/client"
                className="flex items-center gap-1 rounded-lg bg-amber-700 px-4 py-2 text-sm font-medium text-white hover:bg-amber-800"
              >
                <UserPlus className="h-4 w-4" />
                <span className="hidden sm:inline">{t("nav.register")}</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}   