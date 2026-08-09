"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { auth } from "@/auth";
import { slugify } from "@/lib/slug";
import { storage, validateImageFile } from "@/lib/storage";

const productSchema = z.object({
  name: z.string().min(3, "Le nom est trop court."),
  categoryId: z.string().min(1, "Choisissez une catégorie."),
  description: z.string().min(10, "La description est trop courte."),
  priceHTG: z.coerce.number().int().positive("Le prix doit être positif."),
  oldPriceHTG: z.coerce.number().int().positive().optional(),
  priceUSD: z.coerce.number().positive().optional(),
  stock: z.coerce.number().int().min(0, "Le stock ne peut pas être négatif."),
});

export type ProductFormResult = { error: string } | { error?: undefined };

async function requireApprovedSeller() {
  const session = await auth();
  if (!session || session.user.role !== "SELLER") {
    throw new Error("Accès réservé aux vendeurs.");
  }
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!sellerProfile || sellerProfile.status !== "APPROUVE") {
    throw new Error("Votre boutique doit être approuvée pour gérer des produits.");
  }
  return sellerProfile;
}

async function uniqueProductSlug(base: string): Promise<string> {
  const baseSlug = slugify(base) || "produit";
  let slug = baseSlug;
  let i = 1;
  while (await prisma.product.findUnique({ where: { slug } })) {
    i += 1;
    slug = `${baseSlug}-${i}`;
  }
  return slug;
}

function parseSpecs(formData: FormData): Record<string, string> {
  const keys = formData.getAll("specKey") as string[];
  const values = formData.getAll("specValue") as string[];
  const specs: Record<string, string> = {};
  keys.forEach((key, i) => {
    const trimmedKey = key.trim();
    const value = values[i]?.trim();
    if (trimmedKey && value) specs[trimmedKey] = value;
  });
  return specs;
}

async function uploadImages(formData: FormData): Promise<string[]> {
  const files = formData.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  const urls: string[] = [];
  for (const file of files) {
    const error = validateImageFile(file);
    if (error) throw new Error(error);
    urls.push(await storage.save(file, "produits"));
  }
  return urls;
}

export async function createProduct(formData: FormData): Promise<ProductFormResult> {
  const sellerProfile = await requireApprovedSeller();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    priceHTG: formData.get("priceHTG"),
    oldPriceHTG: formData.get("oldPriceHTG") || undefined,
    priceUSD: formData.get("priceUSD") || undefined,
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  let images: string[];
  try {
    images = await uploadImages(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Échec de l'envoi des images." };
  }

  const specs = parseSpecs(formData);
  const slug = await uniqueProductSlug(parsed.data.name);

  const product = await prisma.product.create({
    data: {
      ...parsed.data,
      slug,
      sellerId: sellerProfile.id,
      images,
      specs,
      status: "ACTIF",
    },
  });

  revalidatePath("/vendeur/produits");
  redirect(`/vendeur/produits/${product.id}`);
}

export async function updateProduct(
  productId: string,
  formData: FormData
): Promise<ProductFormResult> {
  const sellerProfile = await requireApprovedSeller();

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.sellerId !== sellerProfile.id) {
    return { error: "Produit introuvable." };
  }

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    priceHTG: formData.get("priceHTG"),
    oldPriceHTG: formData.get("oldPriceHTG") || undefined,
    priceUSD: formData.get("priceUSD") || undefined,
    stock: formData.get("stock"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Données invalides." };
  }

  let newImages: string[];
  try {
    newImages = await uploadImages(formData);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Échec de l'envoi des images." };
  }

  const keptImages = (formData.getAll("keptImages") as string[]) ?? [];
  const removedImages = product.images.filter((url) => !keptImages.includes(url));
  await Promise.all(removedImages.map((url) => storage.delete(url)));

  const specs = parseSpecs(formData);

  await prisma.product.update({
    where: { id: productId },
    data: {
      ...parsed.data,
      images: [...keptImages, ...newImages],
      specs,
    },
  });

  revalidatePath("/vendeur/produits");
  revalidatePath(`/vendeur/produits/${productId}`);
  return {};
}

export async function deleteProduct(productId: string) {
  const sellerProfile = await requireApprovedSeller();

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { _count: { select: { orderItems: true } } },
  });
  if (!product || product.sellerId !== sellerProfile.id) {
    throw new Error("Produit introuvable.");
  }
  if (product._count.orderItems > 0) {
    throw new Error(
      "Ce produit a déjà été commandé et ne peut pas être supprimé. Passez-le en inactif à la place."
    );
  }

  await Promise.all(product.images.map((url) => storage.delete(url)));
  await prisma.product.delete({ where: { id: productId } });

  revalidatePath("/vendeur/produits");
  redirect("/vendeur/produits");
}

export async function setProductStatus(
  productId: string,
  status: "ACTIF" | "INACTIF" | "EN_RUPTURE"
) {
  const sellerProfile = await requireApprovedSeller();
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || product.sellerId !== sellerProfile.id) {
    throw new Error("Produit introuvable.");
  }
  await prisma.product.update({ where: { id: productId }, data: { status } });
  revalidatePath("/vendeur/produits");
}
