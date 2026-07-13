import Link from "next/link";
import { CheckCircle } from "lucide-react"; // ou une autre icône
import { getStripe } from "@/lib/stripe-server";

interface Props {
  searchParams: Promise<{ session_id?: string }>
}

export default async function SuccessPage( { searchParams }: Props) {
  const params = await searchParams;
  const sessionId = params.session_id;
  if (!sessionId) return <p>Paiement non trouve</p>
  const session = await getStripe().checkout.sessions.retrieve(sessionId)

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Paiement réussi !
        </h1>
        <p>Ref: {sessionId}</p>
        <p>Montant: {session.amount_total ? (session.amount_total / 100).toFixed(2) : null} {session.currency}</p>

        <p className="text-gray-600 mb-6">
          Merci pour votre achat. Vous allez recevoir un email de confirmation.
        </p>

        {sessionId && (
          <p className="text-xs text-gray-400 mb-6">
            Réf: {sessionId}
          </p>
        )}

        <Link 
          href="/client"
          className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Retour à l'accueil
        </Link>
      </div>
    </div>
  );
}