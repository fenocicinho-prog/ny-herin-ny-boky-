'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { formatPrice } from '@/lib/constants';
import { useSession } from 'next-auth/react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getGroupedByVendor } =
    useCart();
  const { t } = useLanguage();
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const total = getTotalPrice();
  const groupedByVendor = getGroupedByVendor();
  const vendorCount = Object.keys(groupedByVendor).length;

  const handleCheckout = async () => {
    if (!session?.user?.id) {
      window.location.href = '/connexion';
      return;
    }

    if (items.length === 0) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout/create-multi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((item) => ({
            bookId: item.bookId,
            type: item.type,
            quantity: item.quantity,
            price: item.price,
            vendorId: item.vendorId,
          })),
          totalAmount: total,
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert('Erreur: ' + data.error);
        setIsLoading(false);
        return;
      }

      // Rediriger vers Stripe checkout ou page de paiement MVola
      if (data.stripeUrl) {
        window.location.href = data.stripeUrl;
      } else if (data.mvolaUrl) {
        window.location.href = data.mvolaUrl;
      } else {
        alert('Erreur checkout');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert('Erreur lors du paiement');
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header user={session?.user} />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 py-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-amber-300" />
            <h1 className="mt-4 text-2xl font-bold text-stone-900">Panier vide</h1>
            <p className="mt-2 text-stone-600">Découvrez notre sélection de livres</p>
            <Link
              href="/client"
              className="mt-6 inline-block rounded-lg bg-amber-700 px-6 py-3 font-medium text-white hover:bg-amber-800"
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={session?.user} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-stone-900">Panier d'achat</h1>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Produits */}
          <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedByVendor).map(([vendorId, vendorItems]) => {
              const vendorName = vendorItems[0]?.vendorName || 'Vendeur';
              const vendorTotal = vendorItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

              return (
                <div key={vendorId} className="rounded-lg border border-amber-200 bg-white p-6">
                  <h2 className="mb-4 text-lg font-semibold text-stone-900">{vendorName}</h2>

                  <div className="space-y-4 border-b border-stone-200 pb-4">
                    {vendorItems.map((item) => (
                      <div key={item.id} className="flex gap-4">
                        {item.imageUrl && (
                          <div className="relative h-24 w-20 overflow-hidden rounded-lg">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover"
                              sizes="80px"
                            />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-stone-900">{item.title}</h3>
                          <p className="text-sm text-stone-500">
                            {item.type === 'BUY' ? 'Achat' : 'Location'}
                          </p>
                          <p className="mt-2 font-semibold text-amber-700">
                            {formatPrice(item.price)}
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          {/* Contrôles quantité */}
                          <div className="flex items-center gap-1 rounded-lg border border-stone-200">
                            <button
                              onClick={() =>
                                updateQuantity(item.bookId, item.type, item.quantity - 1)
                              }
                              className="p-1 hover:bg-stone-100"
                              disabled={item.quantity === 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.bookId, item.type, item.quantity + 1)
                              }
                              className="p-1 hover:bg-stone-100"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Sous-total et suppression */}
                          <div className="text-right">
                            <p className="text-sm font-semibold text-stone-900">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>

                          <button
                            onClick={() => removeItem(item.bookId, item.type)}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex justify-between text-right">
                    <span className="text-stone-600">Sous-total vendeur:</span>
                    <span className="font-semibold text-stone-900">
                      {formatPrice(vendorTotal)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Résumé de commande */}
          <div className="h-fit rounded-lg border border-amber-200 bg-white p-6 sticky top-20">
            <h2 className="mb-6 text-lg font-semibold text-stone-900">Résumé</h2>

            <div className="space-y-3 border-b border-stone-200 pb-4 mb-4">
              <div className="flex justify-between text-sm text-stone-600">
                <span>{items.length} article(s)</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>{vendorCount} vendeur(s)</span>
              </div>
            </div>

            <div className="mb-6 flex justify-between">
              <span className="text-lg font-semibold text-stone-900">Total:</span>
              <span className="text-2xl font-bold text-amber-700">{formatPrice(total)}</span>
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading || items.length === 0}
              className="w-full rounded-lg bg-amber-700 px-4 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50 transition"
            >
              {isLoading ? 'Traitement...' : 'Procéder au paiement'}
            </button>

            <button
              onClick={clearCart}
              className="mt-3 w-full rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              Vider le panier
            </button>

            <Link
              href="/client"
              className="mt-4 block text-center text-sm text-amber-700 hover:text-amber-800 underline"
            >
              Continuer les achats
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
