import { describe, it, expect } from "vitest";
import { createOrderSchema } from "./orders.schema";

describe("createOrderSchema", () => {
  it("accepte une commande valide avec une adresse existante", () => {
    const result = createOrderSchema.safeParse({
      addressId: "addr_1",
      items: [{ productId: "p1", quantity: 2 }],
    });
    expect(result.success).toBe(true);
  });

  it("accepte une commande valide avec une nouvelle adresse", () => {
    const result = createOrderSchema.safeParse({
      newAddress: {
        label: "Maison",
        fullName: "Jean Baptiste",
        street: "12 Rue Capois",
        city: "Port-au-Prince",
        phone: "+509 3712 4455",
      },
      items: [{ productId: "p1", quantity: 1 }],
    });
    expect(result.success).toBe(true);
  });

  it("rejette un panier vide", () => {
    const result = createOrderSchema.safeParse({ addressId: "addr_1", items: [] });
    expect(result.success).toBe(false);
  });

  it("rejette une quantité nulle ou négative", () => {
    const zero = createOrderSchema.safeParse({
      addressId: "addr_1",
      items: [{ productId: "p1", quantity: 0 }],
    });
    const negative = createOrderSchema.safeParse({
      addressId: "addr_1",
      items: [{ productId: "p1", quantity: -1 }],
    });
    expect(zero.success).toBe(false);
    expect(negative.success).toBe(false);
  });

  it("rejette une nouvelle adresse incomplète", () => {
    const result = createOrderSchema.safeParse({
      newAddress: { label: "Maison", fullName: "J", street: "", city: "PaP", phone: "123" },
      items: [{ productId: "p1", quantity: 1 }],
    });
    expect(result.success).toBe(false);
  });
});
