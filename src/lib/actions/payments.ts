"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { getPaymentProvider } from "@/lib/payments";
import { submitPaymentSchema, type SubmitPaymentInput } from "./payments.schema";

export type SubmitPaymentResult = { error: string } | { error?: undefined };

export async function submitPaymentReference(
  input: SubmitPaymentInput
): Promise<SubmitPaymentResult> {
  const session = await auth();
  if (!session) return { error: "Vous devez être connecté." };

  const parsed = submitPaymentSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const { orderId, method, reference } = parsed.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.buyerId !== session.user.id) {
    return { error: "Commande introuvable." };
  }
  if (order.status !== "EN_ATTENTE_PAIEMENT") {
    return { error: "Cette commande n'est plus en attente de paiement." };
  }

  await getPaymentProvider(method).confirmPayment(orderId, reference.trim());

  revalidatePath(`/compte/commandes/${orderId}`);
  return {};
}

export async function getPaymentInstructions(orderId: string, method: "MONCASH" | "NATCASH") {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Commande introuvable.");
  return getPaymentProvider(method).initiatePayment(orderId, order.total);
}
