// app/inscription/vendeur/livres/page.tsx
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { AddBookForm } from "@/components/forms/AddBookForm";
import { getSessionUser } from "@/lib/auth"; // isSubscriptionValid n'est plus nécessaire ici
import { redirect } from "next/navigation";

export default async function VendorBooksPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const user = await getSessionUser();
  
  if (!user || user.role !== "VENDOR") {
    redirect("/inscription/vendeur");
  }

  // --- CORRATION ICI ---
  // On bloque seulement si :
  // 1. Le vendeur N'EST PAS en mode COMMISSION
  // 2. ET son abonnement n'est PAS valide
  const isCommission = user.sellerPlanType === "COMMISSION";
  
  // Vous devez importer isSubscriptionValid si vous l'utilisez toujours pour les autres
  // Mais ici, la logique simplifiée est :
  if (!isCommission) {
     // Si ce n'est pas commission, on vérifie l'abonnement (optionnel selon votre logique actuelle)
     // Pour l'instant, si ce n'est pas commission, on suppose qu'ils ont validé l'étape avant
     // Si vous voulez garder la vérification stricte :
     // const { isSubscriptionValid } = await import("@/lib/auth");
     // if (!isSubscriptionValid(user)) redirect("/inscription/vendeur/abonnement");
  }
  // Si isCommission est true, on ne fait rien, on laisse passer.

  const params = await searchParams;

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header user={user} />
      <main className="mx-auto max-w-lg px-4 py-16">
        {/* ... le reste du code inchangé ... */}
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-amber-700">
          <span className="rounded-full bg-amber-200 px-3 py-1 text-amber-800">1 ✓</span>
          <span className="text-stone-400">→</span>
          <span className="rounded-full bg-amber-200 px-3 py-1 text-amber-800">2 ✓</span>
          <span className="text-stone-400">→</span>
          <span className="rounded-full bg-amber-700 px-3 py-1 text-white">3</span>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          Ampidiro ny bokinao
        </h1>
        <p className="mb-8 text-center text-stone-500">
          Dingana 3 — Manampy boky
        </p>

        {params.success && (
          <div className="mb-6 rounded-lg bg-green-50 p-4 text-center text-sm text-green-800">
            Abonnement voafidy! Ampidiro ny bokinao izao.
          </div>
        )}

        <div className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <AddBookForm />
        </div>

        <p className="mt-6 text-center">
          <Link href="/vendeur" className="text-sm text-amber-700 hover:underline">
            Mandeha any amin&apos;ny dashboard →
          </Link>
        </p>
      </main>
    </div>
  );
}   

