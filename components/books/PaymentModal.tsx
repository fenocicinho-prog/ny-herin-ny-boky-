"use client";

import { useState } from "react";
import { createOrderAction } from "@/app/actions/orders";
import { MOBILE_MONEY_PHONE } from "@/lib/constants";
import { X, CreditCard, Smartphone, MapPin } from "lucide-react";

type PaymentModalProps = {
  book: {
    id: string;
    title: string;
    buyPrice: number;
    rentPrice: number;
  };
  orderType: "BUY" | "BORROW";
  onClose: () => void;
}

export function PaymentModal({ book, orderType, onClose }: PaymentModalProps) {
  const [method, setMethod] = useState<"STRIPE" | "MOBILE_MONEY" | "ON_SITE">("STRIPE");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  const amount = orderType === "BUY" ? Number(book.buyPrice) : Number(book.rentPrice);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsPending(true);

    if (!amount || amount <= 0) {
      setError("Prix non disponible pour cette option");
      setIsPending(false);
      return;
    }

    try {
      let deliveryLocation: string | null = null;
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        try {
          const pos: GeolocationPosition = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          deliveryLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
        } catch (geoErr) {
          console.debug("Géoloc non autorisée ou indisponible", geoErr);
        }
      }

      if (method === "STRIPE") {
        // STRIPE = appel direct API JSON
        console.log("Envoi vers stripe:", { bookId: book.id, title: book.title, price: amount });
        
        const res = await fetch("/api/create-checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bookId: book.id,
            title: book.title,
            price: amount,
            type: orderType,
            deliveryLocation,
          }),
        });
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur Stripe");
        window.location.href = data.url;
        return;
      } 
      
      // MOBILE_MONEY et ON_SITE = Server Action (tous deux passent par le flux MVola manuel)
      const formData = new FormData();
      formData.set("bookId", book.id);
      formData.set("type", orderType);
      // ✅ CORRECTION : ON_SITE est maintenant géré comme MOBILE_MONEY dans le backend
      formData.set("paymentMethod", method === "ON_SITE" ? "MOBILE_MONEY" : "MOBILE_MONEY");
      if (phone) formData.set("phoneNumber", phone);
      if (deliveryLocation) formData.set("deliveryLocation", deliveryLocation);

      const result = await createOrderAction(formData);
      if (result?.error) throw new Error(result.error);
      else if (result?.message) setMessage(result.message);
      
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Une erreur inconnue est survenue");
      console.error(err);
    } finally {
      setIsPending(false);
    }
  }
   
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-stone-900">
              {orderType === "BUY" ? "Fividianana" : "Fanofana"}
            </h2>
            <p className="text-sm text-stone-500">{book.title}</p>
            <p className="mt-1 text-xl font-bold text-amber-800">
              {amount.toLocaleString("fr-FR")} Ar
            </p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-stone-400 hover:bg-stone-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {message ? (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-800">
            {message}
            {method === "MOBILE_MONEY" && (
              <div className="mt-3 rounded-lg bg-white p-3 text-stone-700">
                <p className="font-medium">Fandoavana Mobile Money:</p>
                <p className="mt-1">Laharana: <strong>{MOBILE_MONEY_PHONE}</strong></p>
                <p>Vola: <strong>{amount.toLocaleString("fr-FR")} Ar</strong></p>
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                <input type="radio" name="method" checked={method === "STRIPE"} onChange={() => setMethod("STRIPE")} />
                <CreditCard className="h-5 w-5" />
                <p className="font-medium">Fandoavana en ligne (Stripe)</p>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                <input type="radio" name="method" checked={method === "MOBILE_MONEY"} onChange={() => setMethod("MOBILE_MONEY")} />
                <Smartphone className="h-5 w-5" />
                <p className="font-medium">Mobile Money</p>
              </label>

              <label className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 has-[:checked]:border-amber-500 has-[:checked]:bg-amber-50">
                <input type="radio" name="method" checked={method === "ON_SITE"} onChange={() => setMethod("ON_SITE")} />
                <MapPin className="h-5 w-5" />
                <p className="font-medium">Fandoavana eo amin&apos;ny toerana</p>
              </label>
            </div>

            {(method === "MOBILE_MONEY" || method === "ON_SITE") && (
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Ny laharana finday anao"
                required
                className="w-full rounded-lg border px-4 py-2.5"
              />
            )}

            {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <button type="submit" disabled={isPending} className="w-full rounded-xl bg-amber-700 py-3 font-medium text-white disabled:opacity-50">
              {isPending ? "Miandry..." : "Manamarina"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
