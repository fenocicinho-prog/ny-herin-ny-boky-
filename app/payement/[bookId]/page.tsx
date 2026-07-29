"use client"
import { useState } from "react"

// 1. FUNCTION COMMISSION
function calculerCommission(prix: number) {
  const pourcentage = prix <= 50000 ? 0.08 : ( prix <= 90000 ? 0.07 : 0.05 )
  const commission = Math.round(prix * pourcentage)
  return { commission, aPayerVendeur: prix - commission, pourcentage }
}


export default function PaymentPage({ params }: { params: { bookId: string } }) {
  const [step, setStep] = useState(1)
  const [trxRef, setTrxRef] = useState("")
  
  // SIMULATION - A remplacer par vrai data depuis DB
  const book = { title: "Le Petit Prince", price: 120000, sellerPhone: "034123456" }
  const calcul = calculerCommission(book.price)
  const total = book.price + 500 // +500 frais MVola

  const handleSubmitRef = async () => {
    if(!trxRef.startsWith("TRX")) return alert("Référence invalide")
    
    await fetch("/api/order/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" }, 
      body: JSON.stringify({ bookId: params.bookId, clientTrxRef: trxRef, amount: total, userId: "temp-user-id" })
    })
    setStep(3)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Paiement: {book.title}</h1>
      
      {/* RÉCAP */}
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p>Prix livre: {book.price} MGA</p>
        <p>Commission {calcul.pourcentage*100}%: {calcul.commission} MGA</p>
        <p>Frais MVola: 500 MGA</p>
        <p className="text-xl font-bold">Total: {total} MGA</p>
      </div>

      {step === 1 && (
        <div>
          <p className="mb-2">1. Composez: <code>*150*1*034XXXXXX*{total}#</code></p>
          <button onClick={() => setStep(2)} className="bg-blue-600 text-white px-4 py-2 rounded w-full">
            j'ai payé
          </button>
        </div>
      )}

      {step === 2 && (
        <div>
          <p>2. Copiez la référence de votre SMS MVola</p>
          <input value={trxRef} onChange={e => setTrxRef(e.target.value)} placeholder="TRX987654" className="border p-2 w-full mb-2"/>
          <button onClick={handleSubmitRef} className="bg-green-600 text-white px-4 py-2 rounded w-full">
            Confirmer
          </button>
        </div>
      )}

      {step === 3 && <p className="text-green-600">En attente de vérification...</p>}
    </div>
  )
}