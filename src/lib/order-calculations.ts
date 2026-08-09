// Logique pure de construction d'une commande — testée isolément
// (voir order-calculations.test.ts) et utilisée par createOrder()
// (src/lib/actions/orders.ts), qui se charge ensuite du décrément de stock
// en base dans une transaction.

export type OrderInputItem = { productId: string; quantity: number };

export type ProductForOrder = {
  id: string;
  name: string;
  priceHTG: number;
  sellerId: string;
  status: string;
  stock: number;
};

export type OrderItemDraft = {
  productId: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
};

export class OrderBuildError extends Error {}

export function buildOrderItems(
  items: OrderInputItem[],
  products: ProductForOrder[]
): { orderItemsData: OrderItemDraft[]; total: number } {
  const orderItemsData: OrderItemDraft[] = [];
  let total = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.status !== "ACTIF") {
      throw new OrderBuildError("Un produit de votre panier n'est plus disponible.");
    }
    if (product.stock < item.quantity) {
      throw new OrderBuildError(`Stock insuffisant pour "${product.name}".`);
    }

    orderItemsData.push({
      productId: product.id,
      sellerId: product.sellerId,
      quantity: item.quantity,
      unitPrice: product.priceHTG,
    });
    total += product.priceHTG * item.quantity;
  }

  return { orderItemsData, total };
}
