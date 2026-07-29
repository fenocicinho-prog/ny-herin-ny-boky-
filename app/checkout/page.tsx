"use client"
import { useState } from "react"

export default function CheckoutPage() {
  const [step, setStep] = useState("RECAP")
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  const handlePayment = async () => {
    const res = await fetch("/api/order/create", { method: "POST", body: JSON.stringify({ cart, total }) })
    const data = await res.json()
    setPaymentInfo(data)
    setStep("PAYER_MVOLA")
  }

  if(step === "PAYER_MVOLA") {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Finaliser le paiement</h1>
        <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-500">
          <p className="mb-2">Envoyez <span className="font-bold">{paymentInfo.total} Ar</span> par MVola</p>
          <p className="mb-2">Numéro: <span className="font-bold">038 40 636 53</span></p>
          <p>Motif/Référence: <span className="font-bold text-lg">{paymentInfo.clientTrxRef}</span></p>
        </div>
        <p className="text-sm mt-4">Une fois le paiement fait, notre équipe va vérifier et vous envoyer un SMS.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1>Récapitulatif</h1>
      {/* ... ton récap panier ... */}
      <button onClick={handlePayment} className="bg-orange-500 text-white p-3 rounded w-full">
        Payer par MVola
      </button>
    </div>
  )
}