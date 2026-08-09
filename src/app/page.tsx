import Link from "next/link";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/db";
import { ProductCard } from "@/components/product/product-card";

// Régénère la page toutes les 60s : sans ça, Next.js la fige au contenu du
// build (aucun produit) et les nouveaux produits/vendeurs n'apparaîtraient
// jamais sans redéploiement complet.
export const revalidate = 60;

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

export default async function Home() {
  const [categories, featured, promotions] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.product.findMany({
      where: { status: "ACTIF" },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: productSelect,
    }),
    prisma.product.findMany({
      where: { status: "ACTIF", oldPriceHTG: { not: null } },
      orderBy: { createdAt: "desc" },
      take: 4,
      select: productSelect,
    }),
  ]);

  return (
    <div>
      <section className="bg-foreground py-20 text-background">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <p className="font-mono text-sm uppercase tracking-widest text-primary">
            Marketplace multi-vendeurs — Haïti
          </p>
          <h1 className="mt-3 font-heading text-3xl font-bold sm:text-4xl">
            Le matériel électronique de plusieurs vendeurs, un seul panier
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-background/80">
            Téléphones, ordinateurs, audio, gaming et plus — payez avec MonCash ou NatCash.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/catalogue">Voir le catalogue</Link>}
            />
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="border-background/30 text-background hover:bg-background/10"
              render={<Link href="/inscription">Créer un compte</Link>}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/catalogue?categorie=${cat.slug}`}
              className="rounded-full border border-border bg-card px-4 py-1.5 text-sm font-medium hover:border-primary hover:text-primary"
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </section>

      {promotions.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-8">
          <h2 className="mb-4 font-heading text-xl font-bold">Promotions</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {promotions.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-heading text-xl font-bold">Produits en vedette</h2>
          <Link href="/catalogue" className="text-sm text-primary hover:underline">
            Voir tout →
          </Link>
        </div>
        {featured.length === 0 ? (
          <p className="text-muted-foreground">Aucun produit disponible pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
