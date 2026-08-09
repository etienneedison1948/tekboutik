"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  clampQuantity,
  computeCartCount,
  computeCartTotal,
  groupCartBySeller,
} from "./cart-calculations";

export type CartItem = {
  productId: string;
  name: string;
  slug: string;
  priceHTG: number;
  image: string | null;
  categorySlug: string;
  sellerId: string;
  sellerName: string;
  sellerSlug: string;
  quantity: number;
  maxStock: number;
};

export type CartProductInput = {
  id: string;
  name: string;
  slug: string;
  priceHTG: number;
  images: string[];
  stock: number;
  category: { slug: string };
  seller: { id: string; shopName: string; slug: string };
};

type CartContextValue = {
  items: CartItem[];
  loaded: boolean;
  addItem: (product: CartProductInput, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  groupedBySeller: { sellerId: string; sellerName: string; sellerSlug: string; items: CartItem[]; subtotal: number }[];
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "tekboutik_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Lu uniquement après le premier rendu client pour éviter un mismatch
    // d'hydratation (le serveur ne connaît pas le contenu du localStorage).
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // stockage corrompu, on repart d'un panier vide
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  function addItem(product: CartProductInput, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        const nextQuantity = clampQuantity(existing.quantity + quantity, product.stock);
        return prev.map((i) =>
          i.productId === product.id ? { ...i, quantity: nextQuantity } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          slug: product.slug,
          priceHTG: product.priceHTG,
          image: product.images[0] ?? null,
          categorySlug: product.category.slug,
          sellerId: product.seller.id,
          sellerName: product.seller.shopName,
          sellerSlug: product.seller.slug,
          quantity: clampQuantity(quantity, product.stock),
          maxStock: product.stock,
        },
      ];
    });
  }

  function removeItem(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }

  function updateQuantity(productId: string, quantity: number) {
    if (quantity < 1) return removeItem(productId);
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId ? { ...i, quantity: clampQuantity(quantity, i.maxStock) } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const groupedBySeller = useMemo(() => groupCartBySeller(items), [items]);
  const total = useMemo(() => computeCartTotal(items), [items]);
  const count = useMemo(() => computeCartCount(items), [items]);

  const value: CartContextValue = {
    items,
    loaded,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    groupedBySeller,
    total,
    count,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart doit être utilisé à l'intérieur de <CartProvider>");
  return ctx;
}
