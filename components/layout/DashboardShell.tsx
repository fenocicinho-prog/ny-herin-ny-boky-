// components/layout/DashboardShell.tsx
"use client";

import { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import type { SessionUser } from "@/lib/auth";

export function DashboardShell({ 
  user, 
  children 
}: { 
  user: SessionUser | null;
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