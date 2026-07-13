import { Header } from "@/components/layout/Header";
import { SubscriptionPlans } from "@/components/forms/SubscriptionPlans";
import { getSessionUser, isSubscriptionValid } from "@/lib/auth";
import { redirect } from "next/navigation";


export default async function VendorSubscriptionPage() {
  const user = await getSessionUser();
  if (!user || user.role !== "VENDOR") redirect("/inscription/vendeur");
  if (isSubscriptionValid(user)) redirect("/vendeur/dashboard");

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <Header user={user} />
      <main className="mx-auto max-w-3xl px-4 py-16">
        
        <h1 className="mb-2 text-center text-2xl font-bold text-stone-900">
          Abonnement
        </h1>
        <p className="mb-8 text-center text-stone-500">
          Efa lany ny abonnement anao, misafidiana amin'ireto promotion mirary ireto
        </p>
        <SubscriptionPlans showFreePlan={false}/>
      </main>
    </div>
  );
}
