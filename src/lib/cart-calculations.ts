// Fonctions pures de calcul du panier — testées isolément (voir *.test.ts)
// et utilisées par le CartContext (src/lib/cart-context.tsx).

export type CartLineItem = {
  productId: string;
  priceHTG: number;
  quantity: number;
  sellerId: string;
  sellerName: string;
  sellerSlug: string;
};

export type SellerGroup<T extends CartLineItem> = {
  sellerId: string;
  sellerName: string;
  sellerSlug: string;
  items: T[];
  subtotal: number;
};

export function computeCartTotal(items: CartLineItem[]): number {
  return items.reduce((sum, i) => sum + i.priceHTG * i.quantity, 0);
}

export function computeCartCount(items: CartLineItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function groupCartBySeller<T extends CartLineItem>(items: T[]): SellerGroup<T>[] {
  const groups = new Map<string, SellerGroup<T>>();
  for (const item of items) {
    const group = groups.get(item.sellerId) ?? {
      sellerId: item.sellerId,
      sellerName: item.sellerName,
      sellerSlug: item.sellerSlug,
      items: [] as T[],
      subtotal: 0,
    };
    group.items.push(item);
    group.subtotal += item.priceHTG * item.quantity;
    groups.set(item.sellerId, group);
  }
  return Array.from(groups.values());
}

export function clampQuantity(quantity: number, maxStock: number): number {
  return Math.max(1, Math.min(quantity, maxStock));
}
