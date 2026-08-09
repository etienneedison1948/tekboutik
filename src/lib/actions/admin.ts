"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs.");
  }
}

export async function setSellerStatus(
  sellerId: string,
  status: "APPROUVE" | "SUSPENDU" | "EN_ATTENTE"
) {
  await requireAdmin();
  await prisma.sellerProfile.update({ where: { id: sellerId }, data: { status } });
  revalidatePath("/admin/vendeurs");
}

export type PlatformSettingsResult = { error: string } | { error?: undefined };

export async function updatePlatformSettings(formData: FormData): Promise<PlatformSettingsResult> {
  await requireAdmin();

  const commissionRatePercent = Number(formData.get("commissionRatePercent"));
  if (Number.isNaN(commissionRatePercent) || commissionRatePercent < 0 || commissionRatePercent > 100) {
    return { error: "Le taux de commission doit être compris entre 0 et 100." };
  }

  await prisma.platformSettings.upsert({
    where: { id: 1 },
    update: {
      commissionRatePercent,
      moncashNumber: (formData.get("moncashNumber") as string) || null,
      natcashNumber: (formData.get("natcashNumber") as string) || null,
    },
    create: {
      id: 1,
      commissionRatePercent,
      moncashNumber: (formData.get("moncashNumber") as string) || null,
      natcashNumber: (formData.get("natcashNumber") as string) || null,
    },
  });

  revalidatePath("/admin/parametres");
  return {};
}

export async function confirmOrderPayment(orderId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs.");
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { orderId },
      data: { status: "CONFIRME", confirmedById: session.user.id, confirmedAt: new Date() },
    }),
    prisma.order.update({ where: { id: orderId }, data: { status: "PAYE" } }),
  ]);

  revalidatePath("/admin/paiements");
  revalidatePath(`/compte/commandes/${orderId}`);
}

export async function setProductStatusAsAdmin(
  productId: string,
  status: "ACTIF" | "INACTIF"
) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/admin/produits");
}

export async function rejectOrderPayment(orderId: string) {
  await requireAdmin();

  await prisma.payment.update({ where: { orderId }, data: { status: "REJETE" } });

  revalidatePath("/admin/paiements");
  revalidatePath(`/compte/commandes/${orderId}`);
}
