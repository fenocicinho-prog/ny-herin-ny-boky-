import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { MOBILE_MONEY_PHONE, formatPrice } from "@/lib/constants";
import { redirect } from "next/navigation";

interface OrderPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const user = await getSessionUser();
  if (!user) redirect("/connexion/client");

  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, userId: user.id },
    include: { items: { include: { book: true } } },
  });

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Tsy hita ny kaomandy.</p>
      </div>
    );
  }

  const bookTitle = order.items[0]?.book?.title || "Votre commande";

  // Si la commande est déjà payée, afficher le statut
  if (order.paymentStatus === "COMPLETED") {
    return (
      <div className="min-h-screen bg-stone-50 px-4 py-16">
        <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-stone-900">Paiement confirmé</h1>
          <p className="mt-2 text-sm text-stone-500">{bookTitle}</p>
          <p className="mt-4 text-sm text-green-700">Votre paiement a été vérifié par l'administrateur.</p>
          <Link href="/client" className="mt-6 block text-center text-sm text-amber-700 hover:underline">
            Miverina amin&apos;ny dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 px-4 py-16">
      <div className="mx-auto max-w-md rounded-2xl border border-stone-200 bg-white p-8 shadow-lg">
        <h1 className="text-xl font-bold text-stone-900">Fanamarinana fandoavana</h1>
        <p className="mt-2 text-sm text-stone-500">{bookTitle}</p>

        <div className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">Mobile Money</p>
          <p className="mt-2">Alefaso ny vola amin&apos;ny: <strong>{MOBILE_MONEY_PHONE}</strong></p>
          <p className="mt-1">Vola: <strong>{formatPrice(order.amount)}</strong></p>
          <p className="mt-1">Reference: <strong>{order.id.slice(-8).toUpperCase()}</strong></p>
        </div>

        {/* ✅ CORRECTION : Le bouton "Nanome vola aho" redirige maintenant vers la page
            de soumission de preuve MVola au lieu de marquer directement comme payé.
            Seul l'administrateur peut valider le paiement après vérification. */}
        <p className="mt-4 text-xs text-stone-500">
          Rehefa vita ny fandefasana vola, tsindrio ny bokotra eto ambany mba hampiditra ny reference-ny.
          Ny kaomandy ho voamarina amin&apos;ny admin.
        </p>

        <Link 
          href={`/client/paiement-mvola/${order.id}`}
          className="mt-6 block w-full text-center rounded-xl bg-amber-700 py-3 font-medium text-white hover:bg-amber-800"
        >
          Hiditra ny reference MVola — Manamarina
        </Link>

        <Link href="/client" className="mt-4 block text-center text-sm text-amber-700 hover:underline">
          Miverina amin&apos;ny dashboard
        </Link>
      </div>
    </div>
  );
}
