"use client";

import { useState } from "react";

interface OrderAlert {
  id: string;
  book: { id: string; title: string };
}

export function DeliveryAlerts({ orders }: { orders: OrderAlert[] }) {
  const [pending, setPending] = useState<string | null>(null);

  async function confirm(orderId: string) {
    setPending(orderId);
    try {
      const res = await fetch("/api/orders/receive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      // reload page
      window.location.reload();
    } catch (err) {
      alert((err as Error).message || "Erreur");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-lg bg-yellow-50 p-4 text-sm text-yellow-900">
      <p className="font-medium">Vous avez des commandes en cours de livraison :</p>
      <ul className="mt-2 space-y-2">
        {orders.map((o) => (
          <li key={o.id} className="flex items-center justify-between">
            <span>{o.book.title}</span>
            <button
              onClick={() => confirm(o.id)}
              disabled={pending === o.id}
              className="rounded-md bg-amber-700 px-3 py-1 text-white"
            >
              {pending === o.id ? "Envoi..." : "J'ai reçu"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
