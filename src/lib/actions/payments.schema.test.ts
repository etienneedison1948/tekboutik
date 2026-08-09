import { describe, it, expect } from "vitest";
import { submitPaymentSchema } from "./payments.schema";

describe("submitPaymentSchema", () => {
  it("accepte une référence MonCash valide", () => {
    const result = submitPaymentSchema.safeParse({
      orderId: "order_1",
      method: "MONCASH",
      reference: "MC-12345",
    });
    expect(result.success).toBe(true);
  });

  it("accepte une référence NatCash valide", () => {
    const result = submitPaymentSchema.safeParse({
      orderId: "order_1",
      method: "NATCASH",
      reference: "NC-98765",
    });
    expect(result.success).toBe(true);
  });

  it("rejette une méthode de paiement inconnue", () => {
    const result = submitPaymentSchema.safeParse({
      orderId: "order_1",
      method: "CARTE_BANCAIRE",
      reference: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une référence trop courte (probable erreur de collage)", () => {
    const result = submitPaymentSchema.safeParse({
      orderId: "order_1",
      method: "MONCASH",
      reference: "ab",
    });
    expect(result.success).toBe(false);
  });

  it("rejette une référence manquante", () => {
    const result = submitPaymentSchema.safeParse({
      orderId: "order_1",
      method: "MONCASH",
    });
    expect(result.success).toBe(false);
  });
});
