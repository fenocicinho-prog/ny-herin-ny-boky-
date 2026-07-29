import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { SubmitMvolaProofForm } from "@/components/forms/submit-form";

// 1. CORRECTION : Le type doit utiliser 'orderId' car le dossier s'appelle [orderId]
interface PageProps {
  params: Promise<{ orderId: string }>;
}

export default async function MvolaPaymentPage({ params }: PageProps) {
  const user = await requireAuth("CLIENT");
  
  // 2. CORRECTION : Déstructurer 'orderId' au lieu de 'id'
  const { orderId } = await params;

  // 3. CORRECTION : Utiliser 'orderId' dans la requête Prisma
  const order = await prisma.order.findUnique({
    where: { id: orderId }, 
    include: { 
      items: { 
        include: { book: true } 
      } 
    }
  });

  if (!order || order.userId !== user.id) {
    return notFound();
  }

  if (order.paymentStatus === "COMPLETED") {
    redirect("/client?success=true");
  }

  const bookTitle = order.items[0]?.book.title || "Votre commande";
  const amount = order.amount;

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Paiement MVola Manuel</h1>
      
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <p className="font-semibold">Résumé de la commande :</p>
        <p>Livre : {bookTitle}</p>
        <p>Montant à payer : <strong>{amount} Ar</strong></p>
        <p>Numéro destinataire : <strong>{process.env.NEXT_PUBLIC_MVOLA_NUMBER || "038 40 636 53"}</strong></p>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">Instructions :</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>Ouvrez l'application MVola sur votre téléphone.</li>
          <li>Allez dans "Envoyer de l'argent".</li>
          <li>Entrez le numéro destinataire ci-dessus.</li>
          <li>Entrez le montant exact : <strong>{amount} Ar</strong>.</li>
          <li>Validez avec votre code secret.</li>
          <li>Vous recevrez un SMS avec une <strong>Référence de transaction</strong>.</li>
        </ol>
      </div>

      <SubmitMvolaProofForm orderId={order.id} />
    </div>
  );
}   