"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { slugify } from "@/lib/slug";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Accès réservé aux administrateurs.");
  }
}

const categorySchema = z.object({
  name: z.string().min(2, "Le nom est trop court."),
  parentId: z.string().optional(),
});

export type CategoryResult = { error: string } | { error?: undefined };

async function uniqueCategorySlug(base: string, excludeId?: string): Promise<string> {
  const baseSlug = slugify(base) || "categorie";
  let slug = baseSlug;
  let i = 1;
  while (
    await prisma.category.findFirst({ where: { slug, id: excludeId ? { not: excludeId } : undefined } })
  ) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
  return slug;
}

export async function createCategory(formData: FormData): Promise<CategoryResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  const slug = await uniqueCategorySlug(parsed.data.name);
  await prisma.category.create({
    data: { name: parsed.data.name, slug, parentId: parsed.data.parentId || null },
  });

  revalidatePath("/admin/categories");
  return {};
}

export async function updateCategory(categoryId: string, formData: FormData): Promise<CategoryResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    parentId: formData.get("parentId") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }
  if (parsed.data.parentId === categoryId) {
    return { error: "Une catégorie ne peut pas être sa propre catégorie parente." };
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { name: parsed.data.name, parentId: parsed.data.parentId || null },
  });

  revalidatePath("/admin/categories");
  return {};
}

export async function deleteCategory(categoryId: string): Promise<CategoryResult> {
  await requireAdmin();

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { _count: { select: { products: true, children: true } } },
  });
  if (!category) return { error: "Catégorie introuvable." };
  if (category._count.products > 0) {
    return { error: "Impossible de supprimer : des produits utilisent encore cette catégorie." };
  }
  if (category._count.children > 0) {
    return { error: "Impossible de supprimer : cette catégorie a des sous-catégories." };
  }

  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/categories");
  return {};
}
