"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

const reviewSchema = z.object({
  productId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export type ReviewResult = { error: string } | { error?: undefined };

async function recomputeProductRating(productId: string) {
  const agg = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.product.update({
    where: { id: productId },
    data: {
      avgRating: agg._avg.rating ?? 0,
      reviewCount: agg._count.rating,
    },
  });
}

export async function replyToReview(reviewId: string, reply: string): Promise<ReviewResult> {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    return { error: "Accès réservé aux vendeurs." };
  }

  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!sellerProfile) return { error: "Profil vendeur introuvable." };

  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: { product: true },
  });
  if (!review || review.product.sellerId !== sellerProfile.id) {
    return { error: "Avis introuvable." };
  }

  await prisma.review.update({ where: { id: reviewId }, data: { sellerReply: reply.trim() } });

  revalidatePath("/vendeur/avis");
  revalidatePath(`/produits/${review.product.slug}`);
  return {};
}

export async function deleteReviewAsAdmin(reviewId: string) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs.");
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error("Avis introuvable.");

  await prisma.review.delete({ where: { id: reviewId } });
  await recomputeProductRating(review.productId);

  revalidatePath("/admin/avis");
}

export async function submitReview(input: z.infer<typeof reviewSchema>): Promise<ReviewResult> {
  const session = await auth();
  if (!session) return { error: "Vous devez être connecté." };

  const parsed = reviewSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  const { productId, rating, comment } = parsed.data;

  const purchase = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        buyerId: session.user.id,
        status: { notIn: ["EN_ATTENTE_PAIEMENT", "ANNULE"] },
      },
    },
  });
  if (!purchase) {
    return { error: "Vous ne pouvez laisser un avis que sur un produit acheté et payé." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { error: "Produit introuvable." };

  await prisma.review.upsert({
    where: { productId_buyerId: { productId, buyerId: session.user.id } },
    update: { rating, comment },
    create: { productId, buyerId: session.user.id, rating, comment },
  });

  await recomputeProductRating(productId);

  revalidatePath(`/produits/${product.slug}`);
  return {};
}
