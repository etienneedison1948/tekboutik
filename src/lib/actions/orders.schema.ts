// Schéma de validation isolé (aucune dépendance à Prisma/Auth) pour rester
// facilement testable — voir orders.schema.test.ts.
import { z } from "zod";

const newAddressSchema = z.object({
  label: z.string().min(1),
  fullName: z.string().min(2),
  street: z.string().min(3),
  city: z.string().min(2),
  phone: z.string().min(8),
});

export const createOrderSchema = z.object({
  addressId: z.string().optional(),
  newAddress: newAddressSchema.optional(),
  items: z
    .array(z.object({ productId: z.string(), quantity: z.number().int().positive() }))
    .min(1, "Le panier est vide."),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
