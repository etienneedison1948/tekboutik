"use server";

import { z } from "zod";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { slugify } from "@/lib/slug";

const applySchema = z.object({
  shopName: z.string().min(2, "Le nom de la boutique est trop court."),
  description: z.string().min(10, "Décrivez votre boutique en quelques mots (10 caractères min)."),
  moncashNumber: z.string().optional(),
  natcashNumber: z.string().optional(),
});

export type ApplySellerResult = { error: string } | { error?: undefined };

async function uniqueSlug(base: string): Promise<string> {
  const baseSlug = slugify(base) || "boutique";
  let slug = baseSlug;
  let i = 1;
  while (await prisma.sellerProfile.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
  return slug;
}

export async function applyAsSeller(formData: FormData): Promise<ApplySellerResult> {
  const session = await auth();
  if (!session) return { error: "Vous devez être connecté." };
  if (session.user.role !== "BUYER") {
    return { error: "Ce compte a déjà un profil vendeur ou administrateur." };
  }

  const parsed = applySchema.safeParse({
    shopName: formData.get("shopName"),
    description: formData.get("description"),
    moncashNumber: formData.get("moncashNumber") || undefined,
    natcashNumber: formData.get("natcashNumber") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const existing = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (existing) {
    return { error: "Vous avez déjà une candidature vendeur." };
  }

  const { shopName, description, moncashNumber, natcashNumber } = parsed.data;
  const slug = await uniqueSlug(shopName);

  await prisma.$transaction([
    prisma.sellerProfile.create({
      data: {
        userId: session.user.id,
        shopName,
        slug,
        description,
        moncashNumber,
        natcashNumber,
        status: "EN_ATTENTE",
      },
    }),
    prisma.user.update({
      where: { id: session.user.id },
      data: { role: "SELLER" },
    }),
  ]);

  return {};
}
