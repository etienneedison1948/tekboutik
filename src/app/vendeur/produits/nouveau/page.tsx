import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { createProduct } from "@/lib/actions/products";
import { ProductForm } from "../product-form";

export const metadata = { title: "Nouveau produit — TekBoutik" };

export default async function NouveauProduitPage() {
  const session = await auth();
  const sellerProfile = await prisma.sellerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!sellerProfile || sellerProfile.status !== "APPROUVE") {
    redirect("/vendeur");
  }

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="font-heading text-2xl font-bold">Nouveau produit</h1>
      <div className="mt-6">
        <ProductForm categories={categories} action={createProduct} submitLabel="Créer le produit" />
      </div>
    </div>
  );
}
