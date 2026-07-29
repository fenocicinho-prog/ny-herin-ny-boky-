"use client";

import { submitMvolaProof } from "@/app/actions/orders";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/lib/LanguageContext";

export function SubmitMvolaProofForm({ orderId }: { orderId: string }) {
  const { t } = useLanguage();
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
      router.push(`/client/paiement-en-attente?commandeId=${result.orderId}`);
    } else {
      setIsSubmitting(false);
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
          {t("payment.mvolaRef")}
        </label>
        <input
          type="text"
          name="clientTrxRef"
          id="clientTrxRef"
          required
          pattern="[0-9A-Z]+"
          placeholder={t("payment.mvolaRefPlaceholder")}
          disabled={isSubmitting}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? t("payment.mvolaValidating") : t("payment.mvolaValidate")}
      </button>
    </form>
  );
}
