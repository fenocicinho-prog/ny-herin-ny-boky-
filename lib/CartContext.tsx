'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  id: string;
  bookId: string;
  title: string;
  price: number;
  type: 'BUY' | 'BORROW';
  vendorId: string;
  vendorName: string;
  quantity: number;
  imageUrl?: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'id'>) => void;
  removeItem: (bookId: string, type: 'BUY' | 'BORROW') => void;
  updateQuantity: (bookId: string, type: 'BUY' | 'BORROW', quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  getGroupedByVendor: () => Record<string, CartItem[]>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Charger le panier depuis localStorage au montage
  useEffect(() => {
    const savedCart = localStorage.getItem('marketbook-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (e) {
        console.error('Erreur lecture panier:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Sauvegarder le panier dans localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('marketbook-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<CartItem, 'id'>) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (i) => i.bookId === item.bookId && i.type === item.type
      );

      if (existingItem) {
        // Augmenter la quantité si l'article existe déjà
        return prev.map((i) =>
          i.bookId === item.bookId && i.type === item.type
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      // Ajouter un nouvel article
      return [...prev, { ...item, id: `${item.bookId}-${item.type}` }];
    });
  };

  const removeItem = (bookId: string, type: 'BUY' | 'BORROW') => {
    setItems((prev) => prev.filter((i) => !(i.bookId === bookId && i.type === type)));
  };

  const updateQuantity = (bookId: string, type: 'BUY' | 'BORROW', quantity: number) => {
    if (quantity <= 0) {
      removeItem(bookId, type);
      return;
    }

    setItems((prev) =>
      prev.map((i) =>
        i.bookId === bookId && i.type === type ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  const getGroupedByVendor = () => {
    return items.reduce((acc, item) => {
      if (!acc[item.vendorId]) {
        acc[item.vendorId] = [];
      }
      acc[item.vendorId].push(item);
      return acc;
    }, {} as Record<string, CartItem[]>);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalPrice,
        getItemCount,
        getGroupedByVendor,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé dans CartProvider');
  }
  return context;
}
