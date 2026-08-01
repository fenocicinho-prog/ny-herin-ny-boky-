// components/layout/DashboardWrapper.tsx
"use client"; // Indispensable

import { ReactNode } from "react";
import { Header } from "@/components/layout/Header"; // Votre header actuel
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

export function DashboardWrapper({ 
  user, 
  children 
}: { 
  user: any, // Remplacez 'any' par le type de votre User
  children: ReactNode 
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      {/* Le Header reçoit l'user en props et l'affiche */}
      <Header user={user} /> 
      
      {/* Barre de langue */}
      <div className="bg-white border-b px-4 py-2 flex justify-end">
        <LanguageSwitcher />
      </div>

      <main className="p-4">
        {children}
      </main>
    </div>
  );
}   