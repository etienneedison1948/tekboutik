import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { updateProduct } from "@/lib/actions/products";
import { ProductForm } from "../product-form";
import { DeleteProductButton } from "./delete-button";

export const metadata = { title: "Modifier le produit — TekBoutik" };

export default async function ModifierProduitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!sellerProfile || sellerProfile.status !== "APPROUVE") {
    redirect("/vendeur");
  }

  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  if (!product || product.sellerId !== sellerProfile.id) notFound();

  const updateProductWithId = updateProduct.bind(null, product.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">{product.name}</h1>
        <DeleteProductButton productId={product.id} />
      </div>
      <div className="mt-6">
        <ProductForm
          categories={categories}
          product={product}
          action={updateProductWithId}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
