// app/a-propos/page.tsx
"use client";

import { Header } from "@/components/layout/Header";

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header />
          <div className="prose prose-stone max-w-none">
            <h1>Tsy ambaratelo</h1>
            <h2>Azo atokisana fa tsy misy fuite ve ny donné ?</h2>
            <p><strong>Eny tompoko</strong></p>
          </div>
    </div>
  );
}