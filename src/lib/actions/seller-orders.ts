"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

async function requireApprovedSeller() {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    throw new Error("Accès réservé aux vendeurs.");
  }
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!sellerProfile || sellerProfile.status !== "APPROUVE") {
    throw new Error("Boutique non approuvée.");
  }
  return sellerProfile;
}

export async function setOrderItemStatus(
  orderItemId: string,
  status: "EN_PREPARATION" | "EXPEDIE" | "LIVRE"
) {
  const sellerProfile = await requireApprovedSeller();

  const orderItem = await prisma.orderItem.findUnique({
    where: { id: orderItemId },
    include: { order: true },
  });
  if (!orderItem || orderItem.sellerId !== sellerProfile.id) {
    throw new Error("Article de commande introuvable.");
  }
  if (orderItem.order.status === "EN_ATTENTE_PAIEMENT" || orderItem.order.status === "ANNULE") {
    throw new Error("Cette commande n'est pas encore payée.");
  }

  await prisma.orderItem.update({ where: { id: orderItemId }, data: { status } });

  revalidatePath("/vendeur/commandes");
}
