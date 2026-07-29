// app/paiement-en-attente/page.tsx
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

interface PaymentPendingProps {
  searchParams: Promise<{ commandeId?: string }>;
}

export default async function PaymentPendingPage({ searchParams }: PaymentPendingProps) {
  // 1. Sécurité
  await requireAuth("CLIENT");

  // 2. Récupérer l'ID depuis l'URL
  const params = await searchParams;
  const orderId = params.commandeId;

  if (!orderId) {
    return <div>Erreur : Aucun ID de commande trouvé dans l'URL.</div>;
  }

  // 3. Récupérer les données avec la relation items
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          book: true,
          seller: true
        }
      },
      user: true
    }
  });

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-stone-500">Commande introuvable.</p>
      </div>
    );
  }

  // 4. Afficher le statut de la commande
  const statusLabel = order.mvolaStatus === "EN_ATTENTE_VERIFICATION" 
    ? "En attente de vérification par l'administrateur"
    : order.paymentStatus === "COMPLETED"
      ? "Paiement confirmé !"
      : "Paiement en cours";

  const statusColor = order.mvolaStatus === "EN_ATTENTE_VERIFICATION"
    ? "bg-yellow-100 text-yellow-800"
    : order.paymentStatus === "COMPLETED"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  const bookTitle = order.items[0]?.book?.title || "Votre commande";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${statusColor}`}>
          {order.paymentStatus === "COMPLETED" ? (
            <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{statusLabel}</h2>
        <p className="text-gray-600 mb-6">
          Livre : <strong>{bookTitle}</strong>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-left text-sm">
          <p className="text-blue-800">
            Montant: <strong>{order.amount} Ar</strong><br/>
            Référence: <strong>{order.clientTrxRef}</strong>
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
