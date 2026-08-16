// app/a-propos/page.tsx
"use client";

import { Header } from "@/components/layout/Header";

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
          <div className="prose prose-stone max-w-none">
            <h1>Momba Anay</h1>
            <h2>💛 Iza izahay ?</h2>
            <p>Tongasoa eto amin'ny <strong>Ny herin'ny boky</strong></p>
          </div>
    </div>
  );
}