'use client'
import { useEffect, useState, useCallback } from 'react'

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
      firstName: string | null
      lastName: string | null
      mvolaNumber: string | null
    }
  }[]
}

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ✅ CORRECTION : Utiliser useCallback et dépendance vide pour éviter la boucle de refetch
  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/orders');
      if (res.status === 403) {
        console.error("Accès refusé : Vous n'êtes pas admin ou pas connecté");
        return;
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error("L'API n'a pas renvoyé un tableau:", data);
        setOrders([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement:", err);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]); // ✅ Dépendance stable, pas de boucle

  const totalCommission = orders.reduce((sum, o) => sum + (o.platformFee || 0), 0);
  const totalAverser = orders.reduce((sum, o) => sum + (o.vendorPaymentAmount || 0), 0);

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
        const data = await res.json();
        // Mettre à jour l'état local
        if (data.order) {
          setOrders(prevOrders =>
            prevOrders.map(o => 
              o.id === orderId 
                ? { ...o, mvolaStatus: 'TERMINE', paymentStatus: 'COMPLETED' }
                : o
            )
          );
        } else {
          // Fallback : retirer de la liste
          setOrders(prevOrders => prevOrders.filter(o => o.id !== orderId));
        }
        alert("Paiement validé !");
      } else {
        const errorData = await res.json().catch(() => ({}));
        alert(`Erreur: ${errorData.error || "Échec de la validation"}`);
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
      <h1 className="text-3xl font-bold mb-6">Dashboard Ny Herin&apos;ny Boky</h1>
      
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-100 p-4 rounded">
          <p className="text-sm">Ventes en attente</p>
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

      <button 
        onClick={fetchOrders}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 text-sm"
      >
        {isLoading ? "Chargement..." : "Actualiser"}
      </button>

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
                  disabled={loadingId === o.id || o.mvolaStatus === "TERMINE" || o.mvolaStatus === "PAYE"}
                  className={`px-4 py-2 rounded text-white text-xs font-bold transition-colors shadow-sm ${
                    loadingId === o.id 
                      ? "bg-gray-400 cursor-wait" 
                      : o.mvolaStatus === "TERMINE" || o.mvolaStatus === "PAYE"
                        ? "bg-green-600 cursor-default opacity-75"
                        : "bg-blue-600 hover:bg-blue-700 hover:shadow"
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
          {orders.length === 0 && !isLoading && (
            <tr>
              <td colSpan={7} className="p-4 text-center text-gray-500">
                Aucune commande en attente de vérification.
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  )
}
