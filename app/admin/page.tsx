'use client'
import { useEffect, useState } from 'react'

// 1. CORRECTION DU TYPE : seller pointe directement vers User
type Order = {
  id: string
  clientTrxRef: string
  adminTrxRef: string | null
  amount: number
  platformFee: number
  vendorPaymentAmount: number
  mvolaStatus: string
  paymentStatus: string
  createdAt: string
  items: {
    id: string
    quantity: number
    price: number
    book: {
      title: string
    }
    seller: { 
      // Pas de .user ici, car seller EST déjà l'objet User dans votre schéma
      firstName: string | null
      lastName: string | null
      mvolaNumber: string | null
    }
  }[]
}

export default function AdminPage() {
  const [loadingId, setLoadingId] = useState<string | null>(null)

const [orders, setOrders] = useState<Order[]>([]); 

useEffect(() => {
  if (orders.length > 0) {
    console.log("Structure d'une commande :", orders[0]);
    // Développez l'objet dans la console pour voir si seller.mvolaNumber existe
  }
fetch('/api/admin/orders')
    .then(r => {
      if (r.status === 403) {
        console.error("Accès refusé : Vous n'êtes pas admin ou pas connecté")
        throw new Error("403")
      }
      return r.json()
    })
    .then((data) => {
      // 2. S'assurer que data est bien un tableau avant de setter
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("L'API n'a pas renvoyé un tableau:", data);
        setOrders([]); // Fallback sécurisé
      }
    })
    .catch(() => setOrders([]));
}, [orders]);

// 3. Sécuriser le calcul (au cas où orders serait encore indéfini au premier rendu)
const totalCommission = Array.isArray(orders) 
  ? orders.reduce((sum, o) => sum + (o.platformFee || 0), 0) 
  : 0;

const totalAverser = Array.isArray(orders) 
  ? orders.reduce((sum, o) => sum + (o.vendorPaymentAmount || 0), 0) 
  : 0;   
  // Fonction pour valider le paiement
// Dans app/admin/page.tsx

const handleValidatePayment = async (orderId: string) => {
  if (!confirm("Confirmez-vous avoir reçu l'argent ?")) return;

  setLoadingId(orderId);
  try {
    const res = await fetch('/api/admin/validate-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId }),
    });

    if (res.ok) {
      // ✅ CORRECTION : Mettre à jour l'état local instantanément
      setOrders(prevOrders => 
        prevOrders.filter(o => o.id !== orderId) // Option A : Retirer la commande de la liste (recommandé)
        // OU Option B : Mettre à jour le statut seulement
        // prevOrders.map(o => o.id === orderId ? { ...o, mvolaStatus: 'TERMINE', paymentStatus: 'COMPLETED' } : o)
      );
      
      alert("Paiement validé !");
    } else {
      alert("Erreur lors de la validation.");
    }
  } catch (e) {
    console.error(e);
    alert("Erreur réseau.");
  } finally {
    setLoadingId(null);
  }
};   
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard Ny Herin'ny Boky</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-sm">Ventes Totales</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <p className="text-sm">Commission à garder</p>
          <p className="text-2xl font-bold">{totalCommission.toLocaleString()} Ar</p>
        </div>
        <div className="bg-orange-100 p-4 rounded">
          <p className="text-sm">À reverser aux vendeurs</p>
          <p className="text-2xl font-bold">{totalAverser.toLocaleString()} Ar</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border text-sm">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Date</th>
              <th className="p-2 border">Ref Client TRX</th>
              <th className="p-2 border">Détails Vendeurs & Livres</th>
              <th className="p-2 border">Montant Total</th>
              <th className="p-2 border">Commission</th>
              <th className="p-2 border">Statut MVola</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
            <tr key={o.id} className="border-t hover:bg-gray-50">
              <td className="p-2 border">{new Date(o.createdAt).toLocaleDateString()}</td>
              <td className="p-2 border font-mono">{o.clientTrxRef}</td>
              
              <td className="p-2 border">
                {o.items.map((item) => (
                  <div key={item.id} className="mb-3 border-b pb-2 last:border-0 last:mb-0">
                    <p className="font-semibold text-gray-800">{item.book.title}</p>
                    <p className="text-xs text-gray-600">
                      Vendeur: {item.seller.firstName} {item.seller.lastName}
                    </p>
                    <p className="text-xs font-bold text-green-700">
                      MVola: {item.seller.mvolaNumber || "⚠️ Non renseigné"}
                    </p>
                    <p className="text-xs mt-1">À payer: {(item.price * item.quantity).toLocaleString()} Ar</p>
                  </div>
                ))}
              </td>
              
              <td className="p-2 border font-bold">{o.amount.toLocaleString()} Ar</td>
              <td className="p-2 border text-blue-600">+ {o.platformFee.toLocaleString()} Ar</td>
              <td className="p-2 border">
                <span className={`px-2 py-1 rounded text-xs font-bold ${
                  o.mvolaStatus === "TERMINE" || o.mvolaStatus === "PAYE" 
                    ? "bg-green-100 text-green-700" 
                    : "bg-yellow-100 text-yellow-700"
                }`}>
                  {o.mvolaStatus}
                </span>
              </td>
              
              <td className="p-2 border">
                <button 
                  onClick={() => handleValidatePayment(o.id)}
                  // Le bouton est désactivé si on est en train de charger OU si c'est déjà validé
                  disabled={loadingId === o.id || o.mvolaStatus === "TERMINE" || o.mvolaStatus === "PAYE"}
                  className={`px-4 py-2 rounded text-white text-xs font-bold transition-colors shadow-sm ${
                    loadingId === o.id 
                      ? "bg-gray-400 cursor-wait" 
                      : o.mvolaStatus === "TERMINE" || o.mvolaStatus === "PAYE"
                        ? "bg-green-600 cursor-default opacity-75" // Vert clair pour montrer que c'est fini
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow" // Bleu vif pour l'action
                  }`}
                >
                  {loadingId === o.id 
                    ? "..." 
                    : o.mvolaStatus === "TERMINE" || o.mvolaStatus === "PAYE" 
                      ? "✓ Validé" 
                      : "Confirmer"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  )
}   