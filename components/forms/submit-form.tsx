"use client";

import { submitMvolaProof } from "@/app/actions/orders";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SubmitMvolaProofForm({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);

    if (!formData.get("orderId")) {
      formData.append("orderId", orderId);
    }

    const result = await submitMvolaProof(formData);

    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    } else if (result?.success) {
      // ✅ CORRECTION : Rediriger avec l'ID dans l'URL
      router.push(`/client/paiement-en-attente?commandeId=${result.orderId}`);
    } else {
      setIsSubmitting(false); // Fallback si la réponse est inattendue
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4 border-t pt-4">
      {error && (
        <div className="bg-red-50 text-red-700 p-3 rounded text-sm border border-red-200">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="clientTrxRef" className="block text-sm font-medium text-gray-700">
          Référence de transaction (reçue par SMS)
        </label>
        <input
          type="text"
          name="clientTrxRef"
          id="clientTrxRef"
          required
          pattern="[0-9A-Z]+"
          placeholder="Ex: 85236941"
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Vérification en cours..." : "Valider mon paiement"}
      </button>
    </form>
  );
}   