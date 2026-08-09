"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { buildOrderItems, OrderBuildError } from "@/lib/order-calculations";
import { createOrderSchema, type CreateOrderInput } from "./orders.schema";

export type { CreateOrderInput };
export type CreateOrderResult = { error: string } | { orderId: string };

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const session = await auth();
  if (!session) return { error: "Vous devez être connecté pour commander." };

  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données de commande invalides." };
  }
  const { addressId, newAddress, items } = parsed.data;

  // Résout l'adresse de livraison (existante ou nouvelle, snapshotée en JSON).
  let shippingAddress: { label: string; fullName: string; street: string; city: string; phone: string };

  if (addressId) {
    const address = await prisma.address.findUnique({ where: { id: addressId } });
    if (!address || address.userId !== session.user.id) {
      return { error: "Adresse de livraison introuvable." };
    }
    shippingAddress = {
      label: address.label,
      fullName: address.fullName,
      street: address.street,
      city: address.city,
      phone: address.phone,
    };
  } else if (newAddress) {
    const existingCount = await prisma.address.count({ where: { userId: session.user.id } });
    await prisma.address.create({
      data: { ...newAddress, userId: session.user.id, isDefault: existingCount === 0 },
    });
    shippingAddress = newAddress;
  } else {
    return { error: "Choisissez ou saisissez une adresse de livraison." };
  }

  try {
    const orderId = await prisma.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: items.map((i) => i.productId) } },
      });

      // Valide la disponibilité et calcule le total (logique pure, testée
      // dans order-calculations.test.ts).
      const { orderItemsData, total } = buildOrderItems(items, products);

      // Décrémente le stock de façon atomique : si un autre achat a eu lieu
      // entre-temps, la condition `stock >= quantity` échoue et on annule.
      for (const item of orderItemsData) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });
        if (updated.count === 0) {
          const product = products.find((p) => p.id === item.productId);
          throw new OrderBuildError(`Stock insuffisant pour "${product?.name ?? "un produit"}".`);
        }
      }

      const order = await tx.order.create({
        data: {
          buyerId: session.user.id,
          status: "EN_ATTENTE_PAIEMENT",
          shippingAddress,
          total,
          items: { create: orderItemsData },
        },
      });

      return order.id;
    });

    return { orderId };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Échec de la création de la commande." };
  }
}
