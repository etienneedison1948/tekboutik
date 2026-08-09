import { describe, it, expect } from "vitest";
import {
  computeCartTotal,
  computeCartCount,
  groupCartBySeller,
  clampQuantity,
  type CartLineItem,
} from "./cart-calculations";

function item(overrides: Partial<CartLineItem> = {}): CartLineItem {
  return {
    productId: "p1",
    priceHTG: 1000,
    quantity: 1,
    sellerId: "s1",
    sellerName: "Vendeur 1",
    sellerSlug: "vendeur-1",
    ...overrides,
  };
}

describe("computeCartTotal", () => {
  it("renvoie 0 pour un panier vide", () => {
    expect(computeCartTotal([])).toBe(0);
  });

  it("additionne prix × quantité pour chaque article", () => {
    const items = [
      item({ productId: "a", priceHTG: 1000, quantity: 2 }),
      item({ productId: "b", priceHTG: 500, quantity: 3 }),
    ];
    expect(computeCartTotal(items)).toBe(1000 * 2 + 500 * 3);
  });
});

describe("computeCartCount", () => {
  it("additionne les quantités, pas le nombre de lignes", () => {
    const items = [
      item({ productId: "a", quantity: 2 }),
      item({ productId: "b", quantity: 5 }),
    ];
    expect(computeCartCount(items)).toBe(7);
  });
});

describe("groupCartBySeller", () => {
  it("regroupe les articles de vendeurs différents dans des groupes séparés", () => {
    const items = [
      item({ productId: "a", sellerId: "s1", priceHTG: 1000, quantity: 1 }),
      item({ productId: "b", sellerId: "s2", priceHTG: 2000, quantity: 1 }),
      item({ productId: "c", sellerId: "s1", priceHTG: 500, quantity: 2 }),
    ];
    const groups = groupCartBySeller(items);

    expect(groups).toHaveLength(2);

    const s1 = groups.find((g) => g.sellerId === "s1")!;
    expect(s1.items).toHaveLength(2);
    expect(s1.subtotal).toBe(1000 + 500 * 2);

    const s2 = groups.find((g) => g.sellerId === "s2")!;
    expect(s2.items).toHaveLength(1);
    expect(s2.subtotal).toBe(2000);
  });

  it("la somme des sous-totaux égale le total global", () => {
    const items = [
      item({ productId: "a", sellerId: "s1", priceHTG: 1500, quantity: 2 }),
      item({ productId: "b", sellerId: "s2", priceHTG: 800, quantity: 1 }),
    ];
    const groups = groupCartBySeller(items);
    const sumOfSubtotals = groups.reduce((sum, g) => sum + g.subtotal, 0);
    expect(sumOfSubtotals).toBe(computeCartTotal(items));
  });
});

describe("clampQuantity", () => {
  it("ne descend jamais sous 1", () => {
    expect(clampQuantity(0, 10)).toBe(1);
    expect(clampQuantity(-5, 10)).toBe(1);
  });

  it("ne dépasse jamais le stock disponible", () => {
    expect(clampQuantity(99, 5)).toBe(5);
  });

  it("garde la valeur si elle est dans la plage", () => {
    expect(clampQuantity(3, 10)).toBe(3);
  });
});
