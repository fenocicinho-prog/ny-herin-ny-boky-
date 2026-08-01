import { Header } from "@/components/layout/Header";
import { SubscriptionPlans } from "@/components/forms/SubscriptionPlans";
import { getSessionUser, isSubscriptionValid } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VendorSubscriptionPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "VENDOR") redirect("/inscription/vendeur");
  if (isSubscriptionValid(user)) redirect("/vendeur/dashboard/nouveau-livre");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header user={user} />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-amber-700">
          <span className="rounded-full bg-amber-200 px-3 py-1 text-amber-800">
            1 ✓
          </span>
          <span className="text-stone-400">→</span>
          <span className="rounded-full bg-amber-700 px-3 py-1 text-white">
            2
          </span>
          <span className="text-stone-400">→</span>
          <span className="rounded-full bg-stone-200 px-3 py-1 text-stone-500">
            3
          </span>
        </div>
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          Abonnement
        </h1>
        <SubscriptionPlans />
      </main>
    </div>
  );
}
