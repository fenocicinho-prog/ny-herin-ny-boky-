// components/layout/DashboardShell.tsx
"use client";

import { ReactNode } from "react";
import { Header } from "@/components/layout/Header"; // Votre header existant
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher"; // Votre bouton de langue
import { User } from "@prisma/client";

export function DashboardShell({ 
  user, 
  children 
}: { 
  user: User, // Remplacez 'any' par le type réel de votre utilisateur
  children: ReactNode 
}) {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col">
      {/* Le Header affiche maintenant l'utilisateur passé en props */}
      <Header user={user} />
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  );
}   