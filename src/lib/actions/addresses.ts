"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

const addressSchema = z.object({
  label: z.string().min(1, "Donnez un nom à cette adresse (ex: Maison)."),
  fullName: z.string().min(2, "Le nom complet est requis."),
  street: z.string().min(3, "L'adresse est requise."),
  city: z.string().min(2, "La ville est requise."),
  phone: z.string().min(8, "Numéro de téléphone invalide."),
});

export type AddressFormResult = { error: string } | { error?: undefined };

export async function createAddress(formData: FormData): Promise<AddressFormResult> {
  const session = await auth();
  if (!session) return { error: "Vous devez être connecté." };

  const parsed = addressSchema.safeParse({
    label: formData.get("label"),
    fullName: formData.get("fullName"),
    street: formData.get("street"),
    city: formData.get("city"),
    phone: formData.get("phone"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const existingCount = await prisma.address.count({ where: { userId: session.user.id } });

  await prisma.address.create({
    data: { ...parsed.data, userId: session.user.id, isDefault: existingCount === 0 },
  });

  revalidatePath("/compte/adresses");
  revalidatePath("/commande");
  return {};
}

export async function deleteAddress(addressId: string) {
  const session = await auth();
  if (!session) throw new Error("Vous devez être connecté.");

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) throw new Error("Adresse introuvable.");

  await prisma.address.delete({ where: { id: addressId } });

  if (address.isDefault) {
    const remaining = await prisma.address.findFirst({ where: { userId: session.user.id } });
    if (remaining) {
      await prisma.address.update({ where: { id: remaining.id }, data: { isDefault: true } });
    }
  }

  revalidatePath("/compte/adresses");
  revalidatePath("/commande");
}

export async function setDefaultAddress(addressId: string) {
  const session = await auth();
  if (!session) throw new Error("Vous devez être connecté.");

  const address = await prisma.address.findUnique({ where: { id: addressId } });
  if (!address || address.userId !== session.user.id) throw new Error("Adresse introuvable.");

  await prisma.$transaction([
    prisma.address.updateMany({ where: { userId: session.user.id }, data: { isDefault: false } }),
    prisma.address.update({ where: { id: addressId }, data: { isDefault: true } }),
  ]);

  revalidatePath("/compte/adresses");
  revalidatePath("/commande");
}
