// app/paiement-en-attente/page.tsx
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOrderWithBook } from "@/lib/order-utils"; // Votre fonction existante
import { redirect } from "next/navigation";
import Link from "next/link";

interface PaymentPendingProps {
  searchParams: Promise<{ commandeId?: string }>;
}

export default async function PaymentPendingPage({ searchParams }: PaymentPendingProps) {
  // 1. Sécurité
  await requireAuth("CLIENT");

  // 2. Récupérer l'ID depuis l'URL (?commandeId=...)
  const params = await searchParams;
  console.log("Params reçus :", params);
  const orderId = params.commandeId;

  if (!orderId) {
    return <div>Erreur : Aucun ID de commande trouvé dans l'URL.</div>;
    //redirect("/client"); // Rediriger si pas d'ID
  }

  // 3. Récupérer les données du livre et de la commande avec votre fonction existante
  const order = await getOrderWithBook(orderId, prisma);

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Commande introuvable.</p>
      </div>
    );
  }

  // 4. Affichage avec les données récupérées
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
          <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Paiement en cours</h2>
        <p className="text-gray-600 mb-6">
          Vous avez commandé : <strong>{order.book.title}</strong>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-left text-sm">
          <p className="text-blue-800">
            Reference: <strong>{order.id.slice(-8).toUpperCase()}</strong><br/>
            Montant: <strong>{order.amount} Ar</strong>
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href={`/client/commande/${order.id}`} 
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Voir le détail de la commande
          </Link>
          
          <Link 
            href="/client" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Retour au tableau de bord
          </Link>
        </div>
      </div>
    </div>
  );
}   