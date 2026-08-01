"use client";

import { useLanguage } from "@/lib/LanguageContext";
import { SubmitMvolaProofForm } from "@/components/forms/submit-form";

interface MvolaPaymentContentProps {
  orderId: string;
  bookTitle: string;
  amount: number;
  sellerMvolaNumber: string;
}

export function MvolaPaymentContent({ 
  orderId, 
  bookTitle, 
  amount, 
  sellerMvolaNumber 
}: MvolaPaymentContentProps) {
  const { t } = useLanguage();

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">{t("payment.mvolaTitle")}</h1>
      
      <div className="bg-blue-50 p-4 rounded border border-blue-200">
        <p className="font-semibold">{t("payment.mvolaSummary")} :</p>
        <p>{t("payment.mvolaBook")} : {bookTitle}</p>
        <p>{t("payment.mvolaAmount")} : <strong>{amount} Ar</strong></p>
        <p>{t("payment.mvolaNumber")} : <strong>{sellerMvolaNumber}</strong></p>
      </div>

      <div className="space-y-2">
        <h2 className="font-semibold">{t("payment.mvolaInstructions")} :</h2>
        <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
          <li>{t("payment.mvolaStep1")}</li>
          <li>{t("payment.mvolaStep2")}</li>
          <li>{t("payment.mvolaStep3")}</li>
          <li>{t("payment.mvolaStep4")}: <strong>{amount} Ar</strong>.</li>
          <li>{t("payment.mvolaStep5")}</li>
          <li>{t("payment.mvolaStep6")}</li>
        </ol>
      </div>

      <SubmitMvolaProofForm orderId={orderId} />
    </div>
  );
}
export default MvolaPaymentContent;
