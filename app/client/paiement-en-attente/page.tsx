"use client";

import { useLanguage } from "@/lib/LanguageContext";
import Link from "next/link";

interface PaymentPendingProps {
  orderId: string;
  amount: number;
  clientTrxRef: string;
  mvolaStatus: string;
  paymentStatus: string;
  bookTitle: string;
}

export function PaymentPendingContent({ 
  orderId, 
  amount, 
  clientTrxRef, 
  mvolaStatus, 
  paymentStatus, 
  bookTitle 
}: PaymentPendingProps) {
  const { t } = useLanguage();

  const statusLabel = mvolaStatus === "EN_ATTENTE_VERIFICATION" 
    ? t("payment.pendingVerification")
    : paymentStatus === "COMPLETED"
      ? t("payment.pendingConfirmed")
      : t("payment.pendingTitle");

  const statusColor = mvolaStatus === "EN_ATTENTE_VERIFICATION"
    ? "bg-yellow-100 text-yellow-800"
    : paymentStatus === "COMPLETED"
      ? "bg-green-100 text-green-800"
      : "bg-blue-100 text-blue-800";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-6 ${statusColor}`}>
          {paymentStatus === "COMPLETED" ? (
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
          {t("payment.mvolaBook")} : <strong>{bookTitle}</strong>
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6 text-left text-sm">
          <p className="text-blue-800">
            {t("payment.pendingAmount")}: <strong>{amount} Ar</strong><br/>
            {t("payment.pendingRef")}: <strong>{clientTrxRef}</strong>
          </p>
        </div>
        
        <div className="space-y-3">
          <Link 
            href={`/client/commande/${orderId}`} 
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            {t("payment.pendingOrderDetails")}
          </Link>
          
          <Link 
            href="/client" 
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            {t("payment.pendingDashboard")}
          </Link>
        </div>
      </div>
    </div>
  );
}
