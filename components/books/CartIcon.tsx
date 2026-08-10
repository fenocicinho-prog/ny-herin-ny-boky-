'use client';

import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '@/lib/CartContext';

export function CartIcon() {
  const { getItemCount } = useCart();
  const count = getItemCount();

  return (
    <Link
      href="/client/panier"
      className="relative flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-50"
      title="Panier"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
          {count}
        </span>
      )}
    </Link>
  );
}
