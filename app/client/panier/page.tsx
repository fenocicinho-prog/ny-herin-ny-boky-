'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Plus, Minus, ShoppingBag, Smartphone, CreditCard } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { useCart } from '@/lib/CartContext';
import { useLanguage } from '@/lib/LanguageContext';
import { formatPrice, MOBILE_MONEY_PHONE } from '@/lib/constants';
import { useSessionUser } from '@/lib/useSessionUser';
import { redirectTo } from '@/lib/redirect';

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice, getGroupedByVendor } =
    useCart();
  const { t } = useLanguage();
  const { user, isLoading: sessionLoading } = useSessionUser();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'MOBILE_MONEY' | 'STRIPE'>('MOBILE_MONEY');
  const [phoneNumber, setPhoneNumber] = useState('');

  const total = getTotalPrice();
  const groupedByVendor = getGroupedByVendor();
  const vendorCount = Object.keys(groupedByVendor).length;

  const handleCheckout = async () => {
    if (!user?.id) {
      router.push('/connexion');
      return;
    }

    if (items.length === 0) return;

    if (paymentMethod === 'MOBILE_MONEY' && !phoneNumber) {
      alert(t('cart_error_phone_required'));
      return;
    }

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
          paymentMethod,
          ...(paymentMethod === 'MOBILE_MONEY' && { phoneNumber }),
        }),
      });

      const data = await response.json();

      if (data.error) {
        alert(t('cart_error_prefix') + data.error);
        setIsLoading(false);
        return;
      }

      if (data.stripeUrl) {
        redirectTo(data.stripeUrl);
      } else if (data.mvolaUrl) {
        redirectTo(data.mvolaUrl);
      } else {
        alert(t('cart_error_checkout'));
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Erreur checkout:', error);
      alert(t('cart_error_payment'));
      setIsLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50">
        <Header user={user} />
        <div className="mx-auto max-w-4xl px-4 py-12">
          <div className="rounded-xl border-2 border-dashed border-amber-200 bg-amber-50 py-12 text-center">
            <ShoppingBag className="mx-auto h-16 w-16 text-amber-300" />
            <h1 className="mt-4 text-2xl font-bold text-stone-900">{t('cart_empty_title')}</h1>
            <p className="mt-2 text-stone-600">{t('cart_empty_subtitle')}</p>
            <Link
              href="/client"
              className="mt-6 inline-block rounded-lg bg-amber-700 px-6 py-3 font-medium text-white hover:bg-amber-800"
            >
              {t('cart_continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <Header user={user} />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="mb-8 text-3xl font-bold text-stone-900">{t('cart_title')}</h1>

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
                            {item.type === 'BUY' ? t('cart_type_buy') : t('cart_type_rent')}
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
                    <span className="text-stone-600">{t('cart_seller_subtotal')}</span>
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
            <h2 className="mb-6 text-lg font-semibold text-stone-900">{t('cart_summary')}</h2>

            <div className="space-y-3 border-b border-stone-200 pb-4 mb-4">
              <div className="flex justify-between text-sm text-stone-600">
                <span>{items.length} {t('cart_items_label')}</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-sm text-stone-600">
                <span>{vendorCount} {t('cart_sellers_label')}</span>
              </div>
            </div>

            <div className="mb-6 flex justify-between">
              <span className="text-lg font-semibold text-stone-900">{t('cart_total')}</span>
              <span className="text-2xl font-bold text-amber-700">{formatPrice(total)}</span>
            </div>

            {/* Choix du mode de paiement */}
            <div className="mb-6">
              <label className="text-sm font-medium text-stone-700">
                {t('payment.mobileMoney')}
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('MOBILE_MONEY')}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm ${
                    paymentMethod === 'MOBILE_MONEY'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <Smartphone className="h-4 w-4" />
                  {t('payment.mobileMoney')}
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('STRIPE')}
                  className={`flex items-center justify-center gap-2 rounded-lg border p-3 text-sm ${
                    paymentMethod === 'STRIPE'
                      ? 'border-amber-500 bg-amber-50 text-amber-900'
                      : 'border-stone-200 text-stone-600'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  {t('payment.online')}
                </button>
              </div>

              {paymentMethod === 'MOBILE_MONEY' && (
                <div className="mt-3 space-y-2">
                  <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                    {t('order.sendTo')}: <strong>{MOBILE_MONEY_PHONE}</strong>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+261 34 XX XXX XX"
                    className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:border-amber-400 focus:outline-none"
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={isLoading || sessionLoading || items.length === 0}
              className="w-full rounded-lg bg-amber-700 px-4 py-3 font-medium text-white hover:bg-amber-800 disabled:opacity-50 transition"
            >
              {isLoading ? t('cart_checkout_processing') : t('cart_checkout_btn')}
            </button>

            <button
              onClick={clearCart}
              className="mt-3 w-full rounded-lg border border-stone-300 px-4 py-2 font-medium text-stone-700 hover:bg-stone-50 transition"
            >
              {t('cart_clear_btn')}
            </button>

            <Link
              href="/client"
              className="mt-4 block text-center text-sm text-amber-700 hover:text-amber-800 underline"
            >
              {t('cart_continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}