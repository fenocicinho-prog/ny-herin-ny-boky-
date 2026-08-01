"use client"
import { useState, useEffect } from "react"

export default function CheckoutPage() {
  const [step, setStep] = useState("RECAP")
  const [paymentInfo, setPaymentInfo] = useState<any>(null)
  const [cart, setCart] = useState<any[]>([])
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    if (typeof window === "undefined") return
    const raw = localStorage.getItem("cart")
    if (raw) {
      try {
        setCart(JSON.parse(raw))
      } catch (e) {
        setCart([])
      }
    }
  }, [])

  useEffect(() => {
    const sum = cart.reduce((s, it) => {
      const price = (it.price ?? it.buyPrice ?? it.amount) || 0
      const qty = it.qty ?? it.quantity ?? 1
      return s + price * qty
    }, 0)
    setTotal(sum)
  }, [cart])

  const handlePayment = async () => {
    let deliveryLocation: string | null = null;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      try {
        const pos: GeolocationPosition = await new Promise((resolve, reject) =>
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        deliveryLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
      } catch (e) {
        console.debug("Géoloc non disponible", e);
      }
    }

    const res = await fetch("/api/orders/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cart, deliveryLocation }),
    })
    const data = await res.json()
    setPaymentInfo(data)
    setStep("PAYER_MVOLA")
  }

  if(step === "PAYER_MVOLA") {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Finaliser le paiement</h1>
        <div className="bg-orange-50 p-6 rounded-lg border-2 border-orange-500">
          <p className="mb-2">Envoyez <span className="font-bold">{paymentInfo?.amount ?? total} Ar</span> par MVola</p>
          <p className="mb-2">Numéro: <span className="font-bold">{paymentInfo?.sellerMvolaNumber ?? "038 40 636 53"}</span></p>
          <p>Motif/Référence: <span className="font-bold text-lg">{paymentInfo?.clientTrxRef}</span></p>
        </div>
        <p className="text-sm mt-4">Une fois le paiement fait, notre équipe va vérifier et vous envoyer un SMS.</p>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1>Récapitulatif</h1>
      {/* Récapitulatif du panier */}
      <div className="mb-4">
        {cart.length === 0 ? (
          <p>Votre panier est vide.</p>
        ) : (
          <ul>
            {cart.map((it, idx) => (
              <li key={idx} className="py-1">{it.title || it.name || it.bookId} — {((it.price ?? it.buyPrice ?? it.amount) || 0) * (it.qty ?? it.quantity ?? 1)} Ar</li>
            ))}
          </ul>
        )}
        <p className="mt-2 font-bold">Total: {total} Ar</p>
      </div>
      <button onClick={handlePayment} className="bg-orange-500 text-white p-3 rounded w-full">
        Payer par MVola
      </button>
    </div>
  )
}