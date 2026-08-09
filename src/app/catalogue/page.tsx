import { prisma } from "@/lib/db";
import { searchProductIds } from "@/lib/search";
import { ProductCard, type ProductCardData } from "@/components/product/product-card";
import { CatalogueFilters } from "./catalogue-filters";
import type { Prisma } from "@/generated/prisma/client";

export const metadata = { title: "Catalogue — TekBoutik" };
export const dynamic = "force-dynamic";

const productSelect = {
  id: true,
  name: true,
  slug: true,
  priceHTG: true,
  oldPriceHTG: true,
  images: true,
  stock: true,
  avgRating: true,
  reviewCount: true,
  category: { select: { slug: true, name: true } },
  seller: { select: { id: true, shopName: true, slug: true } },
} as const;

type SearchParams = {
  q?: string;
  categorie?: string;
  prixMin?: string;
  prixMax?: string;
  noteMin?: string;
  vendeur?: string;
  disponible?: string;
  tri?: string;
};

export default async function CataloguePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const [categories, sellers] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.sellerProfile.findMany({
      where: { status: "APPROUVE" },
      select: { slug: true, shopName: true },
      orderBy: { shopName: "asc" },
    }),
  ]);

  const where: Prisma.ProductWhereInput = { status: "ACTIF" };
  if (params.categorie) where.category = { slug: params.categorie };
  if (params.vendeur) where.seller = { slug: params.vendeur };
  if (params.disponible === "1") where.stock = { gt: 0 };
  if (params.noteMin) where.avgRating = { gte: Number(params.noteMin) };
  if (params.prixMin || params.prixMax) {
    where.priceHTG = {
      ...(params.prixMin ? { gte: Number(params.prixMin) } : {}),
      ...(params.prixMax ? { lte: Number(params.prixMax) } : {}),
    };
  }

  let rankMap: Map<string, number> | null = null;
  if (params.q?.trim()) {
    rankMap = await searchProductIds(params.q.trim());
    where.id = { in: Array.from(rankMap.keys()) };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    params.tri === "prix-asc"
      ? { priceHTG: "asc" }
      : params.tri === "prix-desc"
        ? { priceHTG: "desc" }
        : params.tri === "note"
          ? { avgRating: "desc" }
          : { createdAt: "desc" };

  let products: ProductCardData[] =
    rankMap && rankMap.size === 0
      ? []
      : await prisma.product.findMany({ where, orderBy, take: 60, select: productSelect });

  if (rankMap && !params.tri) {
    products = [...products].sort((a, b) => (rankMap!.get(b.id) ?? 0) - (rankMap!.get(a.id) ?? 0));
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 font-heading text-2xl font-bold">
        {params.q ? `Résultats pour "${params.q}"` : "Catalogue"}
      </h1>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <CatalogueFilters categories={categories} sellers={sellers} params={params} />

        <div>
          <p className="mb-4 text-sm text-muted-foreground">
            {products.length} produit{products.length !== 1 ? "s" : ""}
          </p>
          {products.length === 0 ? (
            <p className="text-muted-foreground">Aucun produit ne correspond à ces critères.</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
