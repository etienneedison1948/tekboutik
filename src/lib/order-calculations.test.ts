import { describe, it, expect } from "vitest";
import { buildOrderItems, OrderBuildError, type ProductForOrder } from "./order-calculations";

function product(overrides: Partial<ProductForOrder> = {}): ProductForOrder {
  return {
    id: "p1",
    name: "Produit test",
    priceHTG: 1000,
    sellerId: "s1",
    status: "ACTIF",
    stock: 10,
    ...overrides,
  };
}

describe("buildOrderItems", () => {
  it("calcule le total correct pour une commande valide multi-vendeurs", () => {
    const products = [
      product({ id: "a", priceHTG: 1000, sellerId: "s1", stock: 5 }),
      product({ id: "b", priceHTG: 2500, sellerId: "s2", stock: 5 }),
    ];
    const { orderItemsData, total } = buildOrderItems(
      [
        { productId: "a", quantity: 2 },
        { productId: "b", quantity: 1 },
      ],
      products
    );

    expect(total).toBe(1000 * 2 + 2500 * 1);
    expect(orderItemsData).toHaveLength(2);
    expect(orderItemsData.find((i) => i.productId === "a")?.sellerId).toBe("s1");
    expect(orderItemsData.find((i) => i.productId === "b")?.sellerId).toBe("s2");
  });

  it("snapshote le prix au moment de la commande (unitPrice = priceHTG actuel)", () => {
    const products = [product({ id: "a", priceHTG: 4321 })];
    const { orderItemsData } = buildOrderItems([{ productId: "a", quantity: 1 }], products);
    expect(orderItemsData[0].unitPrice).toBe(4321);
  });

  it("rejette un produit introuvable", () => {
    expect(() => buildOrderItems([{ productId: "inconnu", quantity: 1 }], [])).toThrow(
      OrderBuildError
    );
  });

  it("rejette un produit inactif (suspendu par l'admin)", () => {
    const products = [product({ id: "a", status: "INACTIF" })];
    expect(() => buildOrderItems([{ productId: "a", quantity: 1 }], products)).toThrow(
      OrderBuildError
    );
  });

  it("rejette une quantité supérieure au stock disponible", () => {
    const products = [product({ id: "a", stock: 2 })];
    expect(() => buildOrderItems([{ productId: "a", quantity: 3 }], products)).toThrow(
      /Stock insuffisant/
    );
  });

  it("accepte une commande qui épuise exactement le stock restant", () => {
    const products = [product({ id: "a", stock: 2 })];
    const { orderItemsData } = buildOrderItems([{ productId: "a", quantity: 2 }], products);
    expect(orderItemsData[0].quantity).toBe(2);
  });
});
